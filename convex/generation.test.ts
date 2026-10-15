/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import workflow from "@convex-dev/workflow/test";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";
import type { Id } from "./_generated/dataModel";

const modules = import.meta.glob("./**/*.ts");
const backendToken = "synthetic-generation-server-token";
beforeEach(() => { vi.useFakeTimers(); vi.stubEnv("CONVEX_CLOUD_URL", "https://test-backend.invalid"); vi.stubEnv("PAYMENT_BACKEND_TOKEN", backendToken); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });
async function setup() {
  const t = convexTest(schema, modules); workflow.register(t);
  const seed = await t.run(async ctx => {
    const owner = await ctx.db.insert("users", { email: "generation-owner@example.invalid" });
    const other = await ctx.db.insert("users", { email: "generation-other@example.invalid" });
    const audioStorageId = await ctx.storage.store(new Blob(["synthetic recording"], { type: "audio/wav" }));
    await ctx.db.insert("audioFiles", { userId: owner, storageId: audioStorageId, fileName: "recording.wav", size: 19, createdAt: Date.now() });
    for (let i = 0; i < 4; i++) await ctx.db.insert("paymentOrders", { userId: owner, orderId: `synthetic-credit-${i}`, status: "paid", amount: i ? 0 : 20000, currency: "INR", createdAt: Date.now() });
    return { owner, other, audioStorageId };
  });
  const user = t.withIdentity({ subject: `${seed.owner}|session` });
  const other = t.withIdentity({ subject: `${seed.other}|session` });
  const args = { generationId: "synthetic-generation", inputJson: JSON.stringify({ elderName: "Test Elder" }), audioStorageId: seed.audioStorageId, fileName: "recording.wav" };
  return { ...seed, t, user, other, args };
}
test("submit immediately saves a private draft and reserves exactly one credit under duplicate requests", async () => {
  const { t, user, args } = await setup();
  const id = await user.mutation(api.generation.submit, args);
  expect(await user.mutation(api.generation.submit, args)).toBe(id);
  expect(await user.query(api.payments.status, {})).toMatchObject({ credits: 3 });
  expect(await user.query(api.generation.getMine, { draftId: id })).toMatchObject({ status: "queued", fileName: "recording.wav", draftUrl: null });
  expect(await t.run(ctx => ctx.db.query("generationDrafts").take(10))).toHaveLength(1);
  await expect(user.mutation(api.generation.submit, { ...args, inputJson: "{}" })).rejects.toThrow(/different/);
});
test("drafts, recordings and server checkpoints are isolated by owner and backend authorization", async () => {
  const { t, user, other, args } = await setup();
  await expect(t.mutation(api.generation.submit, args)).rejects.toThrow(/Sign in/);
  await expect(other.mutation(api.generation.submit, args)).rejects.toThrow(/Upload/);
  const id = await user.mutation(api.generation.submit, args);
  expect(await other.query(api.generation.getMine, { draftId: id })).toBeNull();
  expect(await other.query(api.generation.listMine, {})).toEqual([]);
  await expect(other.mutation(api.generation.resume, { draftId: id })).rejects.toThrow(/Sign in/);
  await expect(other.mutation(api.generation.submit, args)).rejects.toThrow(/different/);
  await expect(t.query(api.generation.serverSnapshot, { backendToken: "wrong", draftId: id })).rejects.toThrow(/authorization/);
});
test("checkpoints survive a failed step and resume; first writes win and stale attempts cannot replace work", async () => {
  const { t, user, args } = await setup();
  const id = await user.mutation(api.generation.submit, args);
  const initial = await t.query(api.generation.serverSnapshot, { backendToken, draftId: id });
  const write = { backendToken, draftId: id, attemptId: initial.attemptId, key: "transcription.part.0", artifactJson: JSON.stringify("completed transcript") };
  await t.action(api.generation.serverWrite, write);
  await t.action(api.generation.serverWrite, { ...write, artifactJson: JSON.stringify("replacement") });
  expect(await t.action(api.generation.serverRead, { backendToken, draftId: id, key: write.key })).toBe(write.artifactJson);
  await t.mutation(internal.generation.fail, { draftId: id, attemptId: initial.attemptId, error: "SDK undici headersTimeout jargon" });
  expect((await user.query(api.generation.getMine, { draftId: id }))?.error).toMatch(/completed work are saved/);
  await user.mutation(api.generation.resume, { draftId: id });
  const resumed = await t.query(api.generation.serverSnapshot, { backendToken, draftId: id });
  expect(resumed.attemptId).not.toBe(initial.attemptId);
  await expect(t.action(api.generation.serverWrite, { ...write, key: "intake", artifactJson: "{}" })).rejects.toThrow(/no longer active/);
  await expect(t.mutation(api.generation.serverProgress, { backendToken, draftId: id, attemptId: initial.attemptId, stage: "writing" })).rejects.toThrow(/no longer active/);
  await t.mutation(internal.generation.fail, { draftId: id, attemptId: initial.attemptId, error: "stale failure" });
  expect((await user.query(api.generation.getMine, { draftId: id }))?.status).toBe("queued");
  expect(await t.action(api.generation.serverRead, { backendToken, draftId: id, key: write.key })).toBe(write.artifactJson);
  expect((await user.query(api.generation.getMine, { draftId: id }))?.completedSteps).toContain(write.key);
  expect(await user.query(api.payments.status, {})).toMatchObject({ credits: 3 });
  await user.mutation(api.generation.resume, { draftId: id });
  expect((await t.query(api.generation.serverSnapshot, { backendToken, draftId: id })).attemptId).toBe(resumed.attemptId);
});
test("completed saved result unlocks existing run publishing only for the matching owner and story", async () => {
  const { t, user, other, args } = await setup();
  const id = await user.mutation(api.generation.submit, args);
  const { attemptId } = await t.query(api.generation.serverSnapshot, { backendToken, draftId: id });
  const response = JSON.stringify({ draft: { title: "Saved memory" } });
  await t.action(api.generation.serverWrite, { backendToken, draftId: id, attemptId, key: "result", artifactJson: response });
  await t.action(api.generation.serverComplete, { backendToken, draftId: id, attemptId });
  const runId = await user.mutation(api.runs.createRun, { generationId: args.generationId, elderName: "Test", relationship: "Parent", originPlace: "Village", languageMix: "English", hasAudio: true, photoCount: 0, audioStorageId: args.audioStorageId });
  await expect(other.mutation(api.generation.markPublished, { draftId: id, runId })).rejects.toThrow(/Sign in/);
  await user.mutation(api.generation.markPublished, { draftId: id, runId });
  expect(await user.query(api.generation.getMine, { draftId: id })).toMatchObject({ status: "published", runId });
  expect((await user.query(api.payments.status, {})).credits).toBe(3);
});
test("workflow executes without a browser session and retains failures without automatic chargeable retries", async () => {
  const { t, user, args } = await setup();
  vi.stubEnv("GENERATION_WORKER_URL", "https://worker.example.invalid/api/generation-step");
  vi.stubEnv("GENERATION_BACKEND_URL", "https://backend.example.invalid");
  vi.stubEnv("EMAIL_ENABLED", "false");
  const fetchMock = vi.fn(async (_url: string, options: RequestInit) => {
    const request = JSON.parse(options.body as string) as { draftId: string; attemptId: string; operation: string; convexUrl: string };
    expect(options.headers).toMatchObject({ Authorization: `Bearer ${backendToken}` });
    expect(request.convexUrl).toBe("https://backend.example.invalid");
    expect(request).not.toHaveProperty("jwt");
    return new Response("synthetic provider failure", { status: 503 });
  });
  vi.stubGlobal("fetch", fetchMock);
  try {
    const id = await user.mutation(api.generation.submit, args);
    await t.finishAllScheduledFunctions(vi.runAllTimers);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(await user.query(api.generation.getMine, { draftId: id })).toMatchObject({ status: "failed" });
    expect(await user.query(api.payments.status, {})).toMatchObject({ credits: 3 });
    expect(await t.run(ctx => ctx.db.query("generationDrafts").take(10))).toHaveLength(1);
  } finally { vi.unstubAllGlobals(); }
});
test("family photos remain attached to recovered drafts and reject another owner's uploads or unsafe metadata", async () => {
  const { t, user, other, args } = await setup();
  const photoId = await t.run(async ctx => {
    const id = await ctx.storage.store(new Blob(["photo"], { type: "image/png" }));
    // convex-test omits MIME metadata on store(); seed the real upload metadata for this fixture.
    await ctx.db.patch(id as unknown as Id<"generationPhotos">, { contentType: "image/png" });
    return id;
  });
  const upload = { storageId: photoId, fileName: "family.png", contentType: "image/png", size: 5 };
  await expect(t.mutation(api.generation.recordPhotoUpload, upload)).rejects.toThrow(/Sign in/);
  await expect(user.mutation(api.generation.recordPhotoUpload, { ...upload, size: 4 })).rejects.toThrow(/supported/);
  await user.mutation(api.generation.recordPhotoUpload, upload);
  await expect(other.mutation(api.generation.recordPhotoUpload, upload)).rejects.toThrow(/another account/);
  await expect(other.mutation(api.generation.submit, { ...args, generationId: "different", photoStorageIds: [photoId] })).rejects.toThrow(/own family/);
  await expect(user.mutation(api.generation.submit, { ...args, photoStorageIds: [photoId, photoId] })).rejects.toThrow(/different family/);
  const id = await user.mutation(api.generation.submit, { ...args, photoStorageIds: [photoId] });
  const restored = await user.query(api.generation.getMine, { draftId: id });
  expect(restored?.photos).toMatchObject([{ storageId: photoId, fileName: "family.png" }]);
  expect(restored?.photos[0].url).toEqual(expect.any(String));
  expect(restored?.inputJson).toBe(args.inputJson);
  expect(await other.query(api.generation.getMine, { draftId: id })).toBeNull();
  const svgId = await t.run(async ctx => {
    const id = await ctx.storage.store(new Blob(["<svg/>"], { type: "image/svg+xml" }));
    await ctx.db.patch(id as unknown as Id<"generationPhotos">, { contentType: "image/svg+xml" });
    return id;
  });
  await expect(user.mutation(api.generation.recordPhotoUpload, { storageId: svgId, fileName: "unsafe.svg", contentType: "image/svg+xml", size: 6 })).rejects.toThrow(/supported/);
});
test("worker media access is restricted to the job's original audio and saved part references", async () => {
  const { t, user, args } = await setup();
  const id = await user.mutation(api.generation.submit, args);
  const { attemptId } = await t.query(api.generation.serverSnapshot, { backendToken, draftId: id });
  const part = await t.run(ctx => ctx.storage.store(new Blob(["part"], { type: "audio/wav" })));
  expect(await t.action(api.generation.serverMediaUrl, { backendToken, draftId: id, storageId: args.audioStorageId })).toEqual(expect.any(String));
  await expect(t.action(api.generation.serverMediaUrl, { backendToken, draftId: id, storageId: part })).rejects.toThrow(/does not belong/);
  await t.action(api.generation.serverWrite, { backendToken, draftId: id, attemptId, key: "audio.parts", artifactJson: JSON.stringify({ parts: [{ storageId: part, fileName: "part.wav" }], chunkSeconds: 300 }) });
  expect(await t.action(api.generation.serverMediaUrl, { backendToken, draftId: id, storageId: part })).toEqual(expect.any(String));
  await expect(t.action(api.generation.serverMediaUrl, { backendToken: "wrong", draftId: id, storageId: part })).rejects.toThrow(/authorization/);
});
