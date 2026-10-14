// @vitest-environment node
import {beforeEach, describe, expect, it, vi} from "vitest";
import type {Id} from "../convex/_generated/dataModel";
const state = vi.hoisted(() => ({checkpoints: new Map<string, string>(), paid: {audio: 0, text: 0, image: 0}, failText: false, failImage: false, complete: false}));
vi.mock("convex/browser", () => ({ConvexHttpClient: class {
  async query(_fn: unknown, args: Record<string, unknown>) {return {status: "running", inputJson: "{}", fileName: "fixture.mp3", audioStorageId: "audio", createdAt: Date.now(), ...args};}
  async mutation(_fn: unknown, args: Record<string, unknown>) {return "https://fixture/upload";}
  async action(_fn: unknown, args: Record<string, unknown>) {
    if ("artifactJson" in args) { if (!state.checkpoints.has(String(args.key))) state.checkpoints.set(String(args.key), String(args.artifactJson)); return null; }
    if ("key" in args) return state.checkpoints.get(String(args.key)) ?? null;
    if ("storageId" in args) return "https://fixture/media";
    state.complete = true; return null;
  }
}}));
vi.mock("./generation-openai", () => ({createGenerationOpenAI: () => ({
  responses: {create: async () => {state.paid.text++; if (state.failText) throw new Error("text provider unavailable"); return {output_text: "saved", model: "fixture"};}},
  audio: {transcriptions: {create: async () => {state.paid.audio++; return {segments: [{text: "A fixture memory", speaker: "A"}]};}}}
})}));
vi.mock("./storybook-generation-engine", () => ({
  prepareAudioForTranscription: vi.fn(),
  transcribeSegment: async (client: {audio: {transcriptions: {create: (args: object)=>Promise<unknown>}}; responses: {create: (args: object)=>Promise<unknown>}}, file: File) => {
    await client.audio.transcriptions.create({file}); await client.responses.create({input: "pick speaker"}); return "A fixture memory";
  },
  extractIntake: vi.fn(), generateDraft: vi.fn(),
  generateStorybookIllustration: async (_client: unknown, _draft: unknown, _auth: unknown, _section: unknown, store: (bytes: Buffer,model: string)=>Promise<unknown>) => {
    state.paid.image++; if (state.failImage) throw new Error("image unavailable"); return store(Buffer.from("fixture"), "fixture-image");
  }
}));
import {runGenerationStep} from "./generation-step";
const base = {convexUrl: "https://qualified-bullfrog-386.convex.cloud", draftId: "draft" as Id<"generationDrafts">, attemptId: "attempt"};
beforeEach(() => {
  state.checkpoints.clear(); state.paid = {audio: 0, text: 0, image: 0}; state.failText = false; state.failImage = false; state.complete = false;
  vi.stubGlobal("fetch", vi.fn(async (url: string) => url.endsWith("upload") ? new Response(JSON.stringify({storageId: "image"})) : new Response("audio")));
});
describe("saved generation steps", () => {
  it("keeps a paid transcription when speaker selection fails, then resumes only that missing call", async () => {
    state.checkpoints.set("audio.parts", JSON.stringify({parts: [{storageId: "part", fileName: "part-1.mp3"}], chunkSeconds: 300}));
    state.failText = true;
    await expect(runGenerationStep({...base,operation: "transcribe",partIndex: 0}, "private")).rejects.toThrow("text provider unavailable");
    expect(state.paid.audio).toBe(1); expect(state.checkpoints.has("transcription.part.0")).toBe(false);
    state.failText = false;
    await runGenerationStep({...base,operation: "transcribe",partIndex: 0}, "private");
    expect(state.paid).toEqual({audio: 1,text: 2,image: 0});
    await runGenerationStep({...base,operation: "transcribe",partIndex: 0}, "private");
    expect(state.paid).toEqual({audio: 1,text: 2,image: 0});
  });
  it("retains completed artwork when another image fails and finalizes from saved steps", async () => {
    state.checkpoints.set("draft.text", JSON.stringify({title: "Fixture", sections: [{id: "1"}, {id: "2"}]})); state.checkpoints.set("intake", "{}");
    await runGenerationStep({...base,operation: "image",partIndex: 0}, "private");
    state.failImage = true;
    await expect(runGenerationStep({...base,operation: "image",partIndex: 1}, "private")).rejects.toThrow("image unavailable");
    state.failImage = false;
    await runGenerationStep({...base,operation: "image",partIndex: 0}, "private");
    await runGenerationStep({...base,operation: "image",partIndex: 1}, "private");
    expect(state.paid.image).toBe(3);
    await runGenerationStep({...base,operation: "finalize"}, "private");
    expect(state.complete).toBe(true); expect(JSON.parse(state.checkpoints.get("result")!).draft.sections.every((s: {illustrationStorageId: string}) => s.illustrationStorageId === "image")).toBe(true);
  });
  it("refuses an arbitrary backend before contacting it", async () => {
    await expect(runGenerationStep({...base,convexUrl: "https://attacker.example",operation: "prepare"}, "private")).rejects.toThrow("Unknown story backend");
    expect(fetch).not.toHaveBeenCalled();
  });
});
