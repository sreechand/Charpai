import OpenAI from "openai";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import ffmpegStatic from "ffmpeg-static";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  buildIntakeExtractionPrompt,
  buildStoryPrompt,
  demoIntake,
  demoDraft,
  mergeIntakeWithExtraction,
  normalizeDraft,
  normalizeIntake,
  type IntakePayload
} from "@/lib/storybook";
import { maxAudioBytes } from "@/lib/files";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const startedAt = Date.now();

  try {
    const { input, audio } = await readRequest(request);

    if (!(audio instanceof File)) {
      return NextResponse.json(
        { error: "Upload one audio recording before generating the storybook." },
        { status: 400 }
      );
    }

    if (audio.size > maxAudioBytes) {
      return NextResponse.json(
        { error: "The recording is too large. Keep v1 recordings under 100 MB." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      const inferredIntake = demoIntake(input);
      const draft = demoDraft(inferredIntake);
      return NextResponse.json({
        intake: inferredIntake,
        draft,
        model: "demo-mode",
        elapsedMs: Date.now() - startedAt,
        warning: "OPENAI_API_KEY is missing, so this is a demo draft."
      });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const transcript = await transcribe(openai, audio, input);
    const inferredIntake = await extractIntake(openai, input, transcript);
    const draft = await generateDraft(openai, inferredIntake, transcript);

    return NextResponse.json({
      intake: inferredIntake,
      draft: normalizeDraft({ ...draft, transcript }, inferredIntake),
      model: process.env.OPENAI_TEXT_MODEL || "gpt-5-mini",
      elapsedMs: Date.now() - startedAt
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something failed while generating the storybook.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function readIntake(formData: FormData): IntakePayload {
  return normalizeIntake({
    accessKey: getText(formData, "accessKey"),
    buyerName: getText(formData, "buyerName"),
    email: getText(formData, "email"),
    elderName: getText(formData, "elderName"),
    relationship: getText(formData, "relationship"),
    originPlace: getText(formData, "originPlace"),
    languageMix: getText(formData, "languageMix"),
    preserveWords: getText(formData, "preserveWords"),
    dedication: getText(formData, "dedication"),
    paymentReference: getText(formData, "paymentReference"),
    notes: getText(formData, "notes")
  });
}

function getText(formData: FormData, key: keyof IntakePayload) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function readRequest(request: Request): Promise<{ input: IntakePayload; audio: File | null }> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const payload = (await request.json()) as {
      input?: Partial<IntakePayload>;
      audioStorageId?: Id<"_storage">;
    };

    return {
      input: readJsonIntake(payload.input || {}),
      audio: payload.audioStorageId ? await readStoredAudio(payload.audioStorageId) : null
    };
  }

  const formData = await request.formData();
  const audio = formData.get("audio");
  return {
    input: readIntake(formData),
    audio: audio instanceof File ? audio : null
  };
}

function readJsonIntake(input: Partial<IntakePayload>): IntakePayload {
  return normalizeIntake(input);
}

async function readStoredAudio(storageId: Id<"_storage">) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("Convex is not configured for stored audio processing.");
  }

  const convex = new ConvexHttpClient(convexUrl);
  const fileUrl = await convex.query(api.files.getUrl, { storageId });
  if (!fileUrl) {
    throw new Error("Uploaded audio could not be found.");
  }

  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error("Uploaded audio could not be loaded for transcription.");
  }

  const blob = await response.blob();
  return new File([blob], "interview-audio", {
    type: blob.type || response.headers.get("content-type") || "audio/mpeg"
  });
}

async function transcribe(openai: OpenAI, audio: File, input: IntakePayload) {
  const model = process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe";
  const compressedAudio = await compressAudioLosslessly(audio);
  const prompt = [
    `This is a family interview for a keepsake storybook.`,
    `Transcribe in the original spoken language and script where possible. Do not translate into English.`,
    `The speaker may use ${input.languageMix || "English, Hindi, Tamil, Telugu, or a mix"}.`,
    `Preserve these names and places exactly where possible: ${input.preserveWords || "none supplied"}.`
  ].join(" ");

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: compressedAudio,
      model,
      prompt
    });

    return transcription.text;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("25 MB") || message.includes("maximum") || message.includes("too large")) {
      throw new Error(
        "The recording uploaded, but the transcription model could not process it. Compress the audio to mp3/m4a or trim it to the strongest 10 minutes."
      );
    }
    throw error;
  }
}

async function compressAudioLosslessly(audio: File) {
  const tempDir = await mkdtemp(path.join(tmpdir(), "storybook-audio-"));
  const inputPath = path.join(tempDir, `source-${randomUUID()}${extensionFor(audio)}`);
  const outputPath = path.join(tempDir, "transcription.flac");

  try {
    await writeFile(inputPath, Buffer.from(await audio.arrayBuffer()));
    await runFfmpeg([
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      inputPath,
      "-map",
      "0:a:0",
      "-vn",
      "-c:a",
      "flac",
      "-compression_level",
      "12",
      outputPath
    ]);

    const compressed = await readFile(outputPath);
    return new File([compressed], replaceExtension(audio.name || "interview-audio", "flac"), {
      type: "audio/flac"
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown compression failure.";
    throw new Error(`Lossless audio compression failed before transcription. ${detail}`);
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
}

function extensionFor(file: File) {
  const extension = path.extname(file.name || "");
  if (extension && /^[a-z0-9.]+$/i.test(extension)) {
    return extension;
  }

  if (file.type.includes("wav")) {
    return ".wav";
  }
  if (file.type.includes("mpeg") || file.type.includes("mp3")) {
    return ".mp3";
  }
  if (file.type.includes("mp4")) {
    return ".mp4";
  }
  if (file.type.includes("webm")) {
    return ".webm";
  }
  if (file.type.includes("flac")) {
    return ".flac";
  }
  return ".audio";
}

function replaceExtension(fileName: string, nextExtension: string) {
  const parsed = path.parse(fileName);
  return `${parsed.name || "interview-audio"}.${nextExtension}`;
}

async function runFfmpeg(args: string[]) {
  const candidates = await getFfmpegCandidates();
  const failures: string[] = [];

  for (const executable of candidates) {
    const stderr: string[] = [];

    try {
      await new Promise<void>((resolve, reject) => {
        const child = spawn(/* turbopackIgnore: true */ executable, args, {
          stdio: ["ignore", "ignore", "pipe"]
        });

        child.stderr.setEncoding("utf8");
        child.stderr.on("data", (chunk: string) => stderr.push(chunk));
        child.on("error", reject);
        child.on("close", (code) => {
          if (code === 0) {
            resolve();
            return;
          }
          reject(new Error(stderr.join("").trim() || `ffmpeg exited with code ${code}.`));
        });
      });
      return;
    } catch (error) {
      failures.push(`${executable}: ${error instanceof Error ? error.message : "failed"}`);
    }
  }

  throw new Error(`No usable ffmpeg executable found. Tried ${failures.join(" | ")}.`);
}

async function getFfmpegCandidates() {
  const candidates = [
    process.env.FFMPEG_PATH,
    await existingExecutable(ffmpegStatic),
    "ffmpeg",
    "/usr/bin/ffmpeg",
    "/usr/local/bin/ffmpeg",
    "/opt/homebrew/bin/ffmpeg"
  ];

  return Array.from(new Set(candidates.filter((candidate): candidate is string => Boolean(candidate))));
}

async function existingExecutable(candidate: string | null) {
  if (!candidate) {
    return null;
  }

  try {
    await access(candidate);
    return candidate;
  } catch {
    return null;
  }
}

async function extractIntake(openai: OpenAI, input: IntakePayload, transcript: string) {
  const model = process.env.OPENAI_TEXT_MODEL || "gpt-5-mini";
  const response = await openai.responses.create({
    model,
    instructions:
      "You extract structured storybook intake fields from family-history transcripts. Return only valid JSON.",
    input: buildIntakeExtractionPrompt(input, transcript)
  });

  const text = response.output_text;
  if (!text) {
    return normalizeIntake(input);
  }

  return mergeIntakeWithExtraction(input, JSON.parse(extractJson(text)));
}

async function generateDraft(openai: OpenAI, input: IntakePayload, transcript: string) {
  const model = process.env.OPENAI_TEXT_MODEL || "gpt-5-mini";
  const response = await openai.responses.create({
    model,
    instructions:
      "You are a careful family-history editor. You turn interview transcripts into truthful, warm, short storybooks. Return only valid JSON.",
    input: buildStoryPrompt(input, transcript)
  });

  const text = response.output_text;
  if (!text) {
    throw new Error("The story model returned an empty result.");
  }

  return JSON.parse(extractJson(text));
}

function extractJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new Error("The story model did not return valid JSON.");
  }

  return trimmed.slice(first, last + 1);
}
