/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { beforeEach, expect, test, vi } from "vitest";
import { createHmac } from "node:crypto";
import schema from "./schema";
import { demoDraft } from "../lib/storybook";
import { api, internal } from "./_generated/api";
import { validPaymentSignature } from "../lib/payment-signature";

const provider = vi.hoisted(() => ({ create: vi.fn(), fetch: vi.fn() }));
vi.mock("razorpay", () => ({ default: class { orders = { create: provider.create }; payments = { fetch: provider.fetch }; } }));
const modules = import.meta.glob("./**/*.ts");
const secret = "synthetic-test-secret";
const signature = (order = "order_test", payment = "pay_test") => createHmac("sha256", secret).update(`${order}|${payment}`).digest("hex");

beforeEach(() => {
  vi.stubEnv("RAZORPAY_KEY_ID", "rzp_test_synthetic");
  vi.stubEnv("RAZORPAY_KEY_SECRET", secret);
  vi.stubEnv("PAYMENT_BACKEND_TOKEN", "synthetic-server-token");
  vi.stubEnv("RAZORPAY_AMOUNT_PAISE", "100");
  provider.create.mockReset().mockResolvedValue({ id: "order_test", amount: 100, currency: "INR" });
  provider.fetch.mockReset().mockResolvedValue({ id: "pay_test", order_id: "order_test", amount: 100, currency: "INR", status: "captured" });
});

async function setup() {
  const t = convexTest(schema, modules);
  const [owner, other] = await t.run(async ctx => [await ctx.db.insert("users", { email: "owner@example.invalid" }), await ctx.db.insert("users", { email: "other@example.invalid" })]);
  return { t, owner, user: t.withIdentity({ subject: `${owner}|session` }), other: t.withIdentity({ subject: `${other}|session` }) };
}

test("signature checks reject tampering, missing or malformed signatures", () => {
  expect(validPaymentSignature("order_test", "pay_test", signature(), secret)).toBe(true);
  for (const value of ["", "g".repeat(64), "0".repeat(64), signature().slice(1)]) expect(validPaymentSignature("order_test", "pay_test", value, secret)).toBe(false);
  expect(validPaymentSignature("order_other", "pay_test", signature(), secret)).toBe(false);
});

test("creates a server-priced order for the signed-in user and requires authentication", async () => {
  const { t, user, owner } = await setup();
  await expect(t.action(api.razorpay.createOrder, {})).rejects.toThrow(/Sign in/);
  expect(await user.action(api.razorpay.createOrder, {})).toEqual({ order_id: "order_test", amount: 100, currency: "INR", key_id: "rzp_test_synthetic" });
  const order = await t.query(internal.payments.ownedOrder, { userId: owner, orderId: "order_test" });
  expect(order?.status).toBe("created");
  expect(await user.query(api.payments.status, {})).toMatchObject({ available: false });
  await expect(user.mutation(api.runs.createRun, { generationId: "book", elderName: "Test", relationship: "Parent", originPlace: "Test village", languageMix: "English", hasAudio: false, photoCount: 0 })).rejects.toThrow(/paid storybook/);
  expect(provider.create.mock.calls[0][0]).toMatchObject({ amount: 100, currency: "INR" });
});

test("invalid amount and provider errors do not create orders", async () => {
  const { t, user } = await setup();
  vi.stubEnv("RAZORPAY_AMOUNT_PAISE", "99");
  await expect(user.action(api.razorpay.createOrder, {})).rejects.toThrow(/at least/);
  expect(provider.create).not.toHaveBeenCalled();
  vi.stubEnv("RAZORPAY_AMOUNT_PAISE", "100");
  provider.create.mockRejectedValue({ statusCode: 401 });
  await expect(user.action(api.razorpay.createOrder, {})).rejects.toThrow(/credentials/);
  provider.create.mockRejectedValue({ statusCode: 500 });
  await expect(user.action(api.razorpay.createOrder, {})).rejects.toThrow(/try again/);
  expect(await t.run(ctx => ctx.db.query("paymentOrders").take(1))).toEqual([]);
});

test("only matching captured payment unlocks access; duplicate verification is safe", async () => {
  const { t, user, other } = await setup();
  await user.action(api.razorpay.createOrder, {});
  const fields = { razorpay_order_id: "order_test", razorpay_payment_id: "pay_test", razorpay_signature: signature() };
  await expect(other.action(api.razorpay.verifyPayment, fields)).rejects.toThrow(/not found/);
  await expect(user.action(api.razorpay.verifyPayment, { ...fields, razorpay_signature: "0".repeat(64) })).rejects.toThrow(/signature/);
  expect(provider.fetch).not.toHaveBeenCalled();
  for (const change of [{ status: "authorized" }, { amount: 1 }, { currency: "USD" }, { order_id: "order_other" }, { status: "refunded" }]) {
    provider.fetch.mockResolvedValueOnce({ id: "pay_test", order_id: "order_test", amount: 100, currency: "INR", status: "captured", ...change });
    await expect(user.action(api.razorpay.verifyPayment, fields)).rejects.toThrow();
    expect(await user.query(api.payments.status, {})).toMatchObject({ available: false });
  }
  expect(await user.action(api.razorpay.verifyPayment, fields)).toEqual({ success: true, order_id: "order_test" });
  await user.action(api.razorpay.verifyPayment, fields);
  expect(await t.run(ctx => ctx.db.query("paymentOrders").take(10))).toHaveLength(1);
  expect(await user.query(api.payments.status, {})).toMatchObject({ available: true });
  await user.mutation(api.payments.beginGeneration, { backendToken: "synthetic-server-token", generationId: "book", stage: "full", payloadHash: "recording", token: "attempt" });
  await user.mutation(api.payments.finishGeneration, { backendToken: "synthetic-server-token", generationId: "book", token: "attempt", response: JSON.stringify({ draft: { title: "Test" } }) });
  const runId = await user.mutation(api.runs.createRun, { generationId: "book", elderName: "Test", relationship: "Parent", originPlace: "Test village", languageMix: "English", hasAudio: false, photoCount: 0 });
  const run = await t.run(ctx => ctx.db.get(runId));
  expect(run?.paymentStatus).toBe("received");
  expect(run?.paymentReference).toBe("pay_test");
  expect(await other.query(api.payments.status, {})).toMatchObject({ available: false });
  expect(await t.query(api.payments.status, {})).toMatchObject({ available: false });
});


test("paid access survives new sign-in sessions before and during story creation", async () => {
  const { t, user, owner } = await setup();
  await user.action(api.razorpay.createOrder, {});
  await user.action(api.razorpay.verifyPayment, { razorpay_order_id: "order_test", razorpay_payment_id: "pay_test", razorpay_signature: signature() });
  const nextSession = t.withIdentity({ subject: `${owner}|new-session` });
  expect(await nextSession.query(api.payments.status, {})).toEqual({ available: true, resumeId: null, response: null });
  await nextSession.mutation(api.payments.beginGeneration, { backendToken: "synthetic-server-token", generationId: "unfinished-book", stage: "transcribe", payloadHash: "same-audio", token: "attempt" });
  const returningSession = t.withIdentity({ subject: `${owner}|another-session` });
  expect(await returningSession.query(api.payments.status, {})).toMatchObject({ available: false, resumeId: "unfinished-book" });
  expect(provider.create).toHaveBeenCalledTimes(1);
});

test("one payment grants one book, retries reuse it, and clients cannot grant access", async () => {
  const { t, user, other } = await setup();
  const begin = { backendToken: "synthetic-server-token", generationId: "book-one", stage: "transcribe" as const, payloadHash: "audio-one", token: "attempt-one" };
  await expect(user.mutation(api.payments.beginGeneration, begin)).rejects.toThrow(/Pay/);
  await user.action(api.razorpay.createOrder, {});
  await user.action(api.razorpay.verifyPayment, { razorpay_order_id: "order_test", razorpay_payment_id: "pay_test", razorpay_signature: signature() });
  await expect(user.mutation(api.payments.beginGeneration, { ...begin, backendToken: "browser-forgery" })).rejects.toThrow(/authorization/);
  await expect(other.mutation(api.payments.beginGeneration, begin)).rejects.toThrow(/Pay/);
  await user.mutation(api.payments.beginGeneration, begin);
  await expect(user.mutation(api.payments.beginGeneration, { ...begin, token: "concurrent" })).rejects.toThrow(/already being/);
  await expect(user.mutation(api.payments.beginGeneration, { ...begin, generationId: "book-two" })).rejects.toThrow(/Pay/);
  await user.mutation(api.payments.finishGeneration, { backendToken: begin.backendToken, generationId: begin.generationId, token: begin.token });
  await user.mutation(api.payments.beginGeneration, { ...begin, token: "retry" });
  await user.mutation(api.payments.finishGeneration, { backendToken: begin.backendToken, generationId: begin.generationId, token: "retry", response: JSON.stringify({ transcript: "Family memory" }) });
  expect(await user.mutation(api.payments.beginGeneration, begin)).toMatchObject({ response: JSON.stringify({ transcript: "Family memory" }) });
  await expect(user.mutation(api.payments.beginGeneration, { ...begin, payloadHash: "another-audio" })).rejects.toThrow(/another recording/);
  const compose = { ...begin, stage: "compose" as const, payloadHash: "story-one", token: "compose" };
  await user.mutation(api.payments.beginGeneration, compose);
  await user.mutation(api.payments.finishGeneration, { backendToken: begin.backendToken, generationId: begin.generationId, token: "compose", response: JSON.stringify({ draft: { title: "Family book" } }) });
  const runArgs = { generationId: begin.generationId, elderName: "Test", relationship: "Parent", originPlace: "Test village", languageMix: "English", hasAudio: false, photoCount: 0 };
  const runId = await user.mutation(api.runs.createRun, runArgs);
  expect(await user.mutation(api.runs.createRun, runArgs)).toBe(runId);
  const { illustrationUrl, illustrationStorageId, ...draft } = demoDraft({ elderName: "Test" });
  void illustrationUrl; void illustrationStorageId;
  const page = await user.mutation(api.storybookPages.publish, { runId, draft });
  expect((await user.mutation(api.storybookPages.publish, { runId, draft }))._id).toBe(page._id);
  expect(await user.query(api.storybookPages.listMine, {})).toHaveLength(1);
  expect((await t.query(api.storybookPages.getPublicBySlug, { slug: page.slug }))?.title).toBe(draft.title);
  await expect(user.mutation(api.files.generateUploadUrl, {})).rejects.toThrow(/Pay/);
  await expect(user.mutation(api.payments.beginGeneration, { ...compose, payloadHash: "another-story" })).rejects.toThrow(/another recording/);
  expect(await user.query(api.payments.status, {})).toMatchObject({ available: false, resumeId: null });
  provider.create.mockResolvedValueOnce({ id: "order_second", amount: 100, currency: "INR" });
  provider.fetch.mockResolvedValueOnce({ id: "pay_second", order_id: "order_second", amount: 100, currency: "INR", status: "captured" });
  await user.action(api.razorpay.createOrder, {});
  const secondSignature = createHmac("sha256", secret).update("order_second|pay_second").digest("hex");
  await user.action(api.razorpay.verifyPayment, { razorpay_order_id: "order_second", razorpay_payment_id: "pay_second", razorpay_signature: secondSignature });
  await user.mutation(api.payments.beginGeneration, { ...begin, generationId: "book-two" });
  expect(await t.run(ctx => ctx.db.get(runId))).toMatchObject({ paymentStatus: "received" });
});
