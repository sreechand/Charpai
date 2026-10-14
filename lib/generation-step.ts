import { ConvexHttpClient } from "convex/browser";
import { createHash } from "node:crypto";
import type OpenAI from "openai";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { createGenerationOpenAI } from "./generation-openai";
import { prepareAudioForTranscription, transcribeSegment, extractIntake, generateDraft, generateStorybookIllustration } from "./storybook-generation-engine";
import { normalizeDraft, normalizeIntake, type IntakePayload, type StorybookDraft } from "./storybook";

export type GenerationStep = { convexUrl: string; draftId: Id<"generationDrafts">; attemptId: string; operation: "prepare" | "transcribe" | "extract" | "write" | "image" | "finalize"; partIndex?: number };
const allowedBackends = new Set(["https://qualified-bullfrog-386.convex.cloud", "https://elegant-mosquito-650.convex.cloud"]);
type Parts = { parts: { storageId: Id<"_storage">; fileName: string }[]; chunkSeconds: number };

export async function runGenerationStep(input: GenerationStep, backendToken: string) {
  if (!allowedBackends.has(input.convexUrl)) throw new Error("Unknown story backend.");
  const convex = new ConvexHttpClient(input.convexUrl);
  const base = { backendToken, draftId: input.draftId };
  const attempt = { ...base, attemptId: input.attemptId };
  const job = await convex.query(api.generation.serverSnapshot, attempt);
  if (!["queued", "running"].includes(job.status)) throw new Error("This attempt has finished.");
  const read = async <T>(key: string): Promise<T | null> => {
    const json = await convex.action(api.generation.serverRead, { ...base, key });
    return json === null ? null : JSON.parse(json) as T;
  };
  const write = async (key: string, value: unknown, model?: string, providerRequestId?: string) => {
    await convex.action(api.generation.serverWrite, { ...attempt, key, artifactJson: JSON.stringify(value), ...(model ? { model } : {}), ...(providerRequestId ? { providerRequestId } : {}) });
  };
  const required = async <T>(key: string) => { const value = await read<T>(key); if (value === null) throw new Error(`Saved ${key} is missing.`); return value; };
  const progress = async (stage: "preparing" | "transcribing" | "understanding" | "writing" | "illustrating", extra: {completedParts?: number; totalParts?: number; title?: string} = {}) => convex.mutation(api.generation.serverProgress, { ...attempt, stage, ...extra });
  const mediaUrl = async (storageId: Id<"_storage">) => { const url = await convex.action(api.generation.serverMediaUrl, { ...base, storageId }); if (!url) throw new Error("Saved media is unavailable."); return url; };
  const upload = async (bytes: Blob | Buffer, contentType: string) => {
    const url = await convex.mutation(api.generation.serverUploadUrl, attempt);
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": contentType }, body: bytes as BodyInit });
    if (!response.ok) throw new Error("The completed step could not be stored.");
    const data = await response.json() as {storageId?: Id<"_storage">};
    if (!data.storageId) throw new Error("The upload was incomplete.");
    return data.storageId;
  };
  // Save each provider response before parsing or starting another paid call.
  const openai = () => {
    const client = createGenerationOpenAI();
    const cacheMethod = (owner: object, name: string, category: string) => {
      const obj = owner as Record<string, (...args: unknown[]) => Promise<unknown>>;
      const original = obj[name].bind(owner);
      obj[name] = async (...args: unknown[]) => {
        const request = args[0] as Record<string, unknown>;
        const stable = JSON.stringify(request, (_key, value) => value instanceof File ? {name: value.name, size: value.size, type: value.type} : value);
        const key = `ai.${input.operation}.${input.partIndex ?? 0}.${category}.${createHash("sha256").update(stable).digest("hex")}`;
        const saved = await read<unknown>(key);
        if (saved !== null) return saved;
        const result = await original(...args) as {model?: string; _request_id?: string};
        await write(key, result, result.model, result._request_id);
        return result;
      };
    };
    cacheMethod(client.responses, "create", "text");
    cacheMethod(client.audio.transcriptions, "create", "transcription");
    return client as OpenAI;
  };
  const intake = normalizeIntake(JSON.parse(job.inputJson));
  if (input.operation === "prepare") {
    await progress("preparing");
    let parts = await read<Parts>("audio.parts");
    if (!parts) {
      if (!job.audioUrl) throw new Error("The original recording is unavailable.");
      const response = await fetch(job.audioUrl); if (!response.ok) throw new Error("The recording could not be loaded.");
      const source = new File([await response.arrayBuffer()], job.fileName, { type: response.headers.get("content-type") || "audio/mp4" });
      const segments = await prepareAudioForTranscription(source);
      parts = {parts: [], chunkSeconds: 300};
      for (const segment of segments) parts.parts.push({ storageId: await upload(segment, segment.type), fileName: segment.name });
      await write("audio.parts", parts);
    }
    let complete = 0;
    for (let i = 0; i < parts.parts.length; i++) if (await read(`transcription.part.${i}`) !== null) complete++;
    await progress("transcribing", { totalParts: parts.parts.length, completedParts: complete });
    return {ok: true, parts: parts.parts.length};
  }
  if (input.operation === "transcribe") {
    const parts = await required<Parts>("audio.parts"), index = input.partIndex;
    if (!Number.isInteger(index) || index! < 0 || index! >= parts.parts.length) throw new Error("Invalid recording part.");
    const key = `transcription.part.${index}`;
    if (await read<string>(key) === null) {
      const part = parts.parts[index!]; const response = await fetch(await mediaUrl(part.storageId));
      if (!response.ok) throw new Error("The recording part could not be loaded.");
      const file = new File([await response.arrayBuffer()], part.fileName, {type: "audio/mpeg"});
      await write(key, await transcribeSegment(openai(), file, intake), "gpt-4o-transcribe-diarize");
    }
    let complete = 0;
    for (let i = 0; i < parts.parts.length; i++) if (await read(`transcription.part.${i}`) !== null) complete++;
    await progress("transcribing", { completedParts: complete, totalParts: parts.parts.length });
    return {ok: true};
  }
  if (input.operation === "extract") {
    await progress("understanding");
    let transcript = await read<string>("transcript");
    if (transcript === null) {
      const parts = await required<Parts>("audio.parts"), texts = [];
      for (let i = 0; i < parts.parts.length; i++) texts.push(await required<string>(`transcription.part.${i}`));
      transcript = texts.join("\n\n"); await write("transcript", transcript);
    }
    if (await read("intake") === null) await write("intake", await extractIntake(openai(), intake, transcript));
    return {ok: true};
  }
  if (input.operation === "write") {
    await progress("writing");
    let draft = await read<StorybookDraft>("draft.text");
    if (!draft) {
      const extracted = await required<IntakePayload>("intake"), transcript = await required<string>("transcript");
      draft = normalizeDraft({...await generateDraft(openai(), extracted, transcript), transcript}, extracted);
      await write("draft.text", draft);
    }
    await progress("writing", {title: draft.title});
    return {ok: true, sections: draft.sections.length};
  }
  if (input.operation === "image") {
    await progress("illustrating");
    const draft = await required<StorybookDraft>("draft.text"), index = input.partIndex;
    if (!Number.isInteger(index) || index! < 0 || index! >= draft.sections.length) throw new Error("Invalid story section.");
    const key = `illustration.${index}`;
    if (await read(key) === null) {
      await generateStorybookIllustration(openai(), draft, null, draft.sections[index!], async (bytes, model) => {
        const storageId = await upload(bytes, "image/webp");
        await convex.mutation(api.generation.serverRegisterImage, {...attempt, storageId, contentType: "image/webp", size: bytes.byteLength, model});
        await write(key, {storageId}, model);
        return {storageId, url: await mediaUrl(storageId)};
      });
    }
    return {ok: true};
  }
  if (input.operation === "finalize") {
    if (await read("result") === null) {
      const draft = await required<StorybookDraft>("draft.text");
      for (let i = 0; i < draft.sections.length; i++) {
        const image = await required<{storageId: Id<"_storage">}>(`illustration.${i}`);
        draft.sections[i].illustrationStorageId = image.storageId;
        draft.sections[i].illustrationUrl = await mediaUrl(image.storageId);
      }
      draft.illustrationStorageId = draft.sections[0]?.illustrationStorageId || "";
      draft.illustrationUrl = draft.sections[0]?.illustrationUrl || "";
      await write("result", {intake: await required("intake"), draft, audioStorageId: job.audioStorageId, model: process.env.OPENAI_TEXT_MODEL || "gpt-5-mini", elapsedMs: Date.now() - job.createdAt, warning: ""});
    }
    await convex.action(api.generation.serverComplete, attempt);
    return {ok: true};
  }
  throw new Error("Unknown story step.");
}
