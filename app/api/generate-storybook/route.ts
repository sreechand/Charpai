import OpenAI from "openai";
import type {
  TranscriptionDiarized,
  TranscriptionDiarizedSegment
} from "openai/resources/audio/transcriptions";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import ffmpegStatic from "ffmpeg-static";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { access, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
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
import { buildStorybookImagePrompt } from "@/lib/storybook-image";
import { maxAudioBytes } from "@/lib/files";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const startedAt = Date.now();

  try {
    const authToken = readBearerToken(request.headers.get("authorization"));
    const { input, audio } = await readRequest(request, authToken);

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
    const generatedDraft = await generateDraft(openai, inferredIntake, transcript);
    const draft = normalizeDraft({ ...generatedDraft, transcript }, inferredIntake);
    let warning = "";

    try {
      const illustration = await generateStorybookIllustration(openai, draft, authToken);
      draft.illustrationStorageId = illustration.storageId;
      draft.illustrationUrl = illustration.url;
    } catch (error) {
      warning =
        error instanceof Error
          ? `The story was created, but its illustration could not be generated. ${error.message}`
          : "The story was created, but its illustration could not be generated.";
    }

    return NextResponse.json({
      intake: inferredIntake,
      draft,
      model: process.env.OPENAI_TEXT_MODEL || "gpt-5-mini",
      elapsedMs: Date.now() - startedAt,
      warning
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something failed while generating the storybook.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function generateStorybookIllustration(
  openai: OpenAI,
  draft: ReturnType<typeof normalizeDraft>,
  authToken: string | null
) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl || !authToken) {
    throw new Error("Sign in again to save the generated illustration.");
  }

  const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2.5-flare";
  const result = await openai.images.generate({
    model,
    prompt: buildStorybookImagePrompt(draft),
    size: "1024x1024",
    quality: "medium",
    background: "opaque",
    output_format: "webp",
    n: 1
  });
  const encodedImage = result.data?.[0]?.b64_json;
  if (!encodedImage) {
    throw new Error("The image model returned no artwork.");
  }

  const imageBytes = Buffer.from(encodedImage, "base64");
  const convex = new ConvexHttpClient(convexUrl);
  convex.setAuth(authToken);
  const uploadUrl = await convex.mutation(api.files.generateUploadUrl, {});
  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "image/webp" },
    body: imageBytes
  });

  if (!uploadResponse.ok) {
    throw new Error("The generated illustration could not be stored.");
  }

  const upload = (await uploadResponse.json()) as { storageId?: Id<"_storage"> };
  if (!upload.storageId) {
    throw new Error("Image storage did not return an id.");
  }

  await convex.mutation(api.files.recordStorybookImage, {
    storageId: upload.storageId,
    contentType: "image/webp",
    size: imageBytes.byteLength,
    model
  });
  const url = await convex.query(api.files.getStorybookImageUrl, {
    storageId: upload.storageId
  });
  if (!url) {
    throw new Error("The stored illustration could not be loaded.");
  }

  return { storageId: String(upload.storageId), url };
}

function readIntake(formData: FormData): IntakePayload {
  return normalizeIntake({
    buyerName: getText(formData, "buyerName"),
    email: getText(formData, "email"),
    elderName: getText(formData, "elderName"),
    relationship: getText(formData, "relationship"),
    originPlace: getText(formData, "originPlace"),
    languageMix: getText(formData, "languageMix"),
    preserveWords: getText(formData, "preserveWords"),
    dedication: getText(formData, "dedication"),
    notes: getText(formData, "notes")
  });
}

function getText(formData: FormData, key: keyof IntakePayload) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function readRequest(
  request: Request,
  authToken: string | null
): Promise<{ input: IntakePayload; audio: File | null }> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const payload = (await request.json()) as {
      input?: Partial<IntakePayload>;
      audioStorageId?: Id<"_storage">;
    };

    return {
      input: readJsonIntake(payload.input || {}),
      audio: payload.audioStorageId ? await readStoredAudio(payload.audioStorageId, authToken) : null
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

function readBearerToken(authorization: string | null) {
  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");
  return scheme?.toLowerCase() === "bearer" && token ? token : null;
}

async function readStoredAudio(storageId: Id<"_storage">, authToken: string | null) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("Convex is not configured for stored audio processing.");
  }

  if (!authToken) {
    throw new Error("Sign in again before generating the storybook.");
  }

  const convex = new ConvexHttpClient(convexUrl);
  convex.setAuth(authToken);
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
  const audioSegments = await prepareAudioForTranscription(audio);
  const transcripts = await Promise.all(
    audioSegments.map(async (segment, index) => {
      try {
        return await transcribeSegment(openai, segment, input);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        const status = error && typeof error === "object" && "status" in error ? error.status : null;
        if (status === 413 || message.includes("25 MB")) {
          throw new Error(
            `Audio segment ${index + 1} exceeded the transcription upload limit after preparation.`
          );
        }
        throw error;
      }
    })
  );

  return transcripts.filter(Boolean).join("\n\n");
}

async function transcribeSegment(openai: OpenAI, audio: File, input: IntakePayload) {
  // The current SDK response overload omits diarized_json even though its
  // runtime type is exported and the API supports it.
  const transcription = (await openai.audio.transcriptions.create({
    file: audio,
    model: "gpt-4o-transcribe-diarize",
    response_format: "diarized_json",
    chunking_strategy: "auto"
  })) as unknown as TranscriptionDiarized;

  const segments = transcription.segments.filter((segment) => segment.text.trim());
  const speakers = new Set(segments.map((segment) => segment.speaker));
  if (speakers.size < 2) {
    return await transcribeWithoutDiarization(openai, audio, input);
  }

  const intervieweeSpeaker = await identifyIntervieweeSpeaker(openai, segments, input);
  const intervieweeTranscript = segments
    .filter((segment) => segment.speaker === intervieweeSpeaker)
    .map((segment) => segment.text.trim())
    .filter(Boolean)
    .join("\n");

  if (!intervieweeTranscript) {
    throw new Error("The interviewee's speech could not be isolated from the recording.");
  }

  return intervieweeTranscript;
}

async function transcribeWithoutDiarization(
  openai: OpenAI,
  audio: File,
  input: IntakePayload
) {
  const configuredModel = process.env.OPENAI_TRANSCRIBE_MODEL;
  const model =
    configuredModel && configuredModel !== "gpt-4o-transcribe-diarize"
      ? configuredModel
      : "gpt-4o-mini-transcribe";
  const prompt = [
    "This is a family interview for a keepsake storybook.",
    "Transcribe in the original spoken language and script where possible. Do not translate into English.",
    `The speaker may use ${input.languageMix || "English, Hindi, Tamil, Telugu, or a mix"}.`,
    `Preserve these names and places exactly where possible: ${input.preserveWords || "none supplied"}.`
  ].join(" ");
  const transcription = await openai.audio.transcriptions.create({
    file: audio,
    model,
    prompt
  });
  const transcript = transcription.text.trim();

  if (!transcript) {
    throw new Error("The recording did not contain speech that could be transcribed.");
  }

  return transcript;
}

async function identifyIntervieweeSpeaker(
  openai: OpenAI,
  segments: TranscriptionDiarizedSegment[],
  input: IntakePayload
) {
  const speakers = Array.from(new Set(segments.map((segment) => segment.speaker)));
  const labeledTranscript = segments
    .map(
      (segment) =>
        `[${segment.speaker} ${formatTimestamp(segment.start)}-${formatTimestamp(segment.end)}] ${segment.text.trim()}`
    )
    .join("\n");
  const model = process.env.OPENAI_TEXT_MODEL || "gpt-5-mini";
  const response = await openai.responses.create({
    model,
    instructions: [
      "Identify the interviewee in a speaker-diarized family-history interview.",
      "The interviewee is the person answering questions and sharing their own memories; the interviewer asks or prompts.",
      "Return only JSON in the form {\"speaker\":\"A\"}, using exactly one speaker label present in the transcript.",
      "Do not select a speaker merely because they speak first."
    ].join(" "),
    input: [
      `Expected interviewee name or family title: ${input.elderName || "not provided"}`,
      `Expected relationship: ${input.relationship || "not provided"}`,
      `Available speaker labels: ${speakers.join(", ")}`,
      "Transcript:",
      labeledTranscript
    ].join("\n")
  });

  if (!response.output_text) {
    throw new Error("The interviewee could not be identified from the recording.");
  }

  const result = JSON.parse(extractJson(response.output_text)) as { speaker?: unknown };
  if (typeof result.speaker !== "string" || !speakers.includes(result.speaker)) {
    throw new Error("The interviewee could not be identified reliably from the recording.");
  }

  return result.speaker;
}

function formatTimestamp(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

async function prepareAudioForTranscription(audio: File) {
  const tempDir = await mkdtemp(path.join(tmpdir(), "storybook-audio-"));
  const inputPath = path.join(tempDir, `source-${randomUUID()}${extensionFor(audio)}`);
  const outputPattern = path.join(tempDir, "transcription-%03d.mp3");

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
      "-ac",
      "1",
      "-ar",
      "16000",
      "-c:a",
      "libmp3lame",
      "-b:a",
      "32k",
      "-f",
      "segment",
      "-segment_time",
      "2700",
      "-reset_timestamps",
      "1",
      outputPattern
    ]);

    const segmentNames = (await readdir(tempDir))
      .filter((name) => /^transcription-\d{3}\.mp3$/.test(name))
      .sort();
    if (!segmentNames.length) {
      throw new Error("Audio conversion produced no playable segments.");
    }

    return await Promise.all(
      segmentNames.map(async (segmentName, index) => {
        const segment = await readFile(path.join(tempDir, segmentName));
        if (segment.byteLength > 20 * 1000 * 1000) {
          throw new Error(`Prepared audio segment ${index + 1} is unexpectedly large.`);
        }
        return new File(
          [segment],
          `${path.parse(audio.name || "interview-audio").name}-part-${index + 1}.mp3`,
          { type: "audio/mpeg" }
        );
      })
    );
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown audio conversion failure.";
    throw new Error(`Audio preparation failed before transcription. ${detail}`);
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
      "You are a careful family-history editor. You turn interview transcripts into truthful, warm, short storybooks. The transcript is the source of truth for output language: an English transcript must produce an English story. Return only valid JSON.",
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
