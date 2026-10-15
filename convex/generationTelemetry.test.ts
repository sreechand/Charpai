/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import workflow from "@convex-dev/workflow/test";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";
import { STEP_DEADLINE_MS } from "./generationTelemetry";

const modules = import.meta.glob("./**/*.ts");
beforeEach(() => { vi.useFakeTimers(); vi.stubEnv("CONVEX_CLOUD_URL", "https://test-backend.invalid"); vi.stubEnv("EMAIL_ENABLED", "false"); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
async function fixture() {
  const t = convexTest(schema, modules); workflow.register(t);
  const seeded = await t.run(async ctx => {
    const owner = await ctx.db.insert("users", {}), other = await ctx.db.insert("users", {});
    const audioStorageId = await ctx.storage.store(new Blob(["test"]));
    const credit = await ctx.db.insert("paymentOrders", { userId: owner, orderId: "test-credit", generationId: "test-generation", status: "paid", amount: 0, currency: "INR", createdAt: Date.now() });
    const draftId = await ctx.db.insert("generationDrafts", { userId: owner, generationId: "test-generation", paymentOrderId: credit, inputJson: "{}", audioStorageId, fileName: "test.wav", title: "Test", status: "running", stage: "transcribing", completedParts: 1, totalParts: 2, attemptId: "attempt-1", createdAt: Date.now(), updatedAt: Date.now() });
    const artifactStorageId = await ctx.storage.store(new Blob(['"finished part"']));
    await ctx.db.insert("generationCheckpoints", { draftId, key: "transcription.part.0", artifactStorageId, createdAt: Date.now() });
    return { owner, other, draftId, credit };
  });
  return { t, ...seeded, args: { draftId: seeded.draftId, attemptId: "attempt-1", operation: "transcribe" as const, partIndex: 1 } };
}

test("records a worker result with part/attempt identity, release and latency; owner-only reads", async () => {
  const { t, owner, other, draftId, args } = await fixture();
  vi.stubEnv("GENERATION_WORKER_URL", "https://worker.invalid"); vi.stubEnv("GENERATION_BACKEND_URL", "https://backend.invalid"); vi.stubEnv("PAYMENT_BACKEND_TOKEN", "test-only");
  vi.stubGlobal("fetch", vi.fn(async () => new Response('{"ok":true}', { headers: { "X-Charpai-Release": "test-release" } })));
  await t.action(internal.generationWorker.step, args);
  const records = await t.withIdentity({ subject: `${owner}|session` }).query(api.generationTelemetry.listMine, { draftId });
  expect(records).toHaveLength(1);
  expect(records[0]).toMatchObject({ generationId: "test-generation", attemptId: "attempt-1", operation: "transcribe", partIndex: 1, status: "succeeded", httpStatus: 200, appRelease: "test-release", elapsedMs: 0 });
  expect(await t.withIdentity({ subject: `${other}|session` }).query(api.generationTelemetry.listMine, { draftId })).toEqual([]);
  expect(await t.query(api.generationTelemetry.listMine, { draftId })).toEqual([]);
  await t.mutation(internal.generationTelemetry.expire, { stepId: records[0]._id });
  expect((await t.run(ctx => ctx.db.get(records[0]._id)))?.status).toBe("succeeded");
});

test.each([
  ["config", "configuration", "failed"],
  ["http", "worker_http", "failed"],
  ["network", "network", "failed"],
  ["timeout", "deadline_exceeded", "timed_out"],
  ["json", "invalid_response", "failed"],
  ["shape", "invalid_response", "failed"]
])("records %s failure without family text or automatic retry", async (kind, code, status) => {
  const { t, args } = await fixture();
  if (kind !== "config") {
    vi.stubEnv("GENERATION_WORKER_URL", "https://worker.invalid"); vi.stubEnv("GENERATION_BACKEND_URL", "https://backend.invalid"); vi.stubEnv("PAYMENT_BACKEND_TOKEN", "private-token");
  } else vi.stubEnv("GENERATION_WORKER_URL", "");
  const fetcher = vi.fn(async () => {
    if (kind === "network") throw new Error("private family text / private-token");
    if (kind === "timeout") throw new DOMException("private family text", "TimeoutError");
    if (kind === "http") return new Response("private family text", { status: 503 });
    return new Response(kind === "json" ? "not JSON" : '{"ok":false}');
  });
  vi.stubGlobal("fetch", fetcher);
  await expect(t.action(internal.generationWorker.step, args)).rejects.toThrow();
  const records = await t.run(ctx => ctx.db.query("generationStepRuns").take(10));
  expect(records).toHaveLength(1); expect(records[0]).toMatchObject({ status, errorCode: code, finishedAt: expect.any(Number) });
  expect(JSON.stringify(records)).not.toMatch(/private family|private-token/);
  expect(fetcher).toHaveBeenCalledTimes(kind === "config" ? 0 : 1);
});

test("the scheduled deadline pauses an abandoned draft without changing its credit or checkpoints", async () => {
  const { t, args, credit, draftId } = await fixture();
  const paymentBefore = await t.run(ctx => ctx.db.get(credit));
  const checkpointBefore = await t.run(ctx => ctx.db.query("generationCheckpoints").take(10));
  const id = await t.mutation(internal.generationTelemetry.begin, args);
  await t.mutation(internal.generationTelemetry.expire, { stepId: id });
  expect((await t.run(ctx => ctx.db.get(id)))?.status).toBe("started");
  await vi.advanceTimersByTimeAsync(STEP_DEADLINE_MS);
  await t.finishAllScheduledFunctions(vi.runAllTimers);
  expect(await t.run(ctx => ctx.db.get(id))).toMatchObject({ status: "timed_out", errorCode: "deadline_exceeded", elapsedMs: STEP_DEADLINE_MS });
  expect(await t.run(ctx => ctx.db.get(draftId))).toMatchObject({ status: "failed", completedParts: 1 });
  expect(await t.run(ctx => ctx.db.get(credit))).toEqual(paymentBefore);
  expect(await t.run(ctx => ctx.db.query("generationCheckpoints").take(10))).toEqual(checkpointBefore);
  expect(await t.mutation(internal.generationTelemetry.finish, { stepId: id, status: "succeeded", httpStatus: 200 })).toBe(false);
});

test("an old deadline cannot pause a resumed attempt or a ready story", async () => {
  const { t, args, draftId } = await fixture();
  const first = await t.mutation(internal.generationTelemetry.begin, args);
  await t.run(ctx => ctx.db.patch(draftId, { attemptId: "attempt-2" }));
  await vi.advanceTimersByTimeAsync(STEP_DEADLINE_MS);
  await t.finishAllScheduledFunctions(vi.runAllTimers);
  expect((await t.run(ctx => ctx.db.get(first)))?.status).toBe("timed_out");
  expect((await t.run(ctx => ctx.db.get(draftId)))?.status).toBe("running");
  await expect(t.mutation(internal.generationTelemetry.begin, args)).rejects.toThrow(/no longer active/);
  const second = await t.mutation(internal.generationTelemetry.begin, { ...args, attemptId: "attempt-2" });
  await t.run(ctx => ctx.db.patch(draftId, { status: "ready" }));
  await vi.advanceTimersByTimeAsync(STEP_DEADLINE_MS);
  await t.finishAllScheduledFunctions(vi.runAllTimers);
  expect((await t.run(ctx => ctx.db.get(second)))?.status).toBe("timed_out");
  expect((await t.run(ctx => ctx.db.get(draftId)))?.status).toBe("ready");
});
