/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import schema from "./schema";
import { api, internal } from "./_generated/api";
import { buildNotificationEmail } from "../lib/notification-email";

const provider = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("@convex-dev/resend", () => ({ Resend: class {
  sendEmail = provider.send;
  status = async () => ({ status: "delivered" });
} }));
const modules = import.meta.glob("./**/*.ts");
beforeEach(() => { provider.send.mockReset().mockResolvedValue("test-email-id"); vi.stubEnv("EMAIL_ENABLED", undefined); });
afterEach(() => vi.unstubAllEnvs());

function configured() {
  vi.stubEnv("EMAIL_ENABLED", "true"); vi.stubEnv("RESEND_API_KEY", "synthetic-key");
  vi.stubEnv("EMAIL_FROM", "Charpai <mail@example.invalid>");
  vi.stubEnv("EMAIL_OWNER_TO", "owner@example.invalid"); vi.stubEnv("EMAIL_USER_EVENTS_TO", "user");
}

test("new signups queue one owner alert; duplicates preserve contacts and never add another alert", async () => {
  const t = convexTest(schema, modules);
  await t.mutation(api.waitlist.add, { name: "Reader", email: "Reader@example.invalid", phone: "+1 202 555 0100" });
  await t.mutation(api.waitlist.add, { name: "Changed", email: "reader@example.invalid" });
  const rows = await t.run(ctx => ctx.db.query("emailNotifications").collect());
  expect(rows).toHaveLength(1);
  await t.mutation(internal.notifications.deliver, { notificationId: rows[0]._id });
  expect(provider.send).not.toHaveBeenCalled();
  expect((await t.run(ctx => ctx.db.get(rows[0]._id)))?.status).toBe("pending");
  configured();
  await t.mutation(internal.notifications.deliver, { notificationId: rows[0]._id });
  await t.mutation(internal.notifications.deliver, { notificationId: rows[0]._id });
  expect(provider.send).toHaveBeenCalledTimes(1);
  expect(provider.send.mock.calls[0][1]).toMatchObject({ to: "owner@example.invalid", subject: "New Charpai launch-update signup" });
  expect(provider.send.mock.calls[0][1].text).toContain("+1 202 555 0100");
  expect(provider.send.mock.calls[0][1].text).not.toContain("Changed");
});

test("server login events deduplicate retries and send to the signed-in user", async () => {
  configured();
  const t = convexTest(schema, modules);
  const userId = await t.run(ctx => ctx.db.insert("users", { email: "reader@example.invalid" }));
  await t.mutation(internal.notifications.login, { userId, eventKey: "successful-login-1" });
  await t.mutation(internal.notifications.login, { userId, eventKey: "successful-login-1" });
  const rows = await t.run(ctx => ctx.db.query("emailNotifications").collect());
  expect(rows).toHaveLength(1);
  await t.mutation(internal.notifications.deliver, { notificationId: rows[0]._id });
  expect(provider.send.mock.calls[0][1].to).toBe("reader@example.invalid");
  expect(rows[0].kind).toBe("login");
});

test("only server-authorized generations queue updates; wrong tokens and unpaid accounts queue none", async () => {
  vi.stubEnv("PAYMENT_BACKEND_TOKEN", "test-server-key");
  const t = convexTest(schema, modules);
  const userId = await t.run(ctx => ctx.db.insert("users", { email: "reader@example.invalid" }));
  const user = t.withIdentity({ subject: `${userId}|session` });
  const args = { backendToken: "test-server-key", generationId: "test-generation", stage: "full" as const, payloadHash: "payload", token: "attempt" };
  await expect(user.mutation(api.payments.beginGeneration, { ...args, backendToken: "wrong" })).rejects.toThrow();
  await expect(user.mutation(api.payments.beginGeneration, args)).rejects.toThrow();
  expect(await t.run(ctx => ctx.db.query("emailNotifications").collect())).toHaveLength(0);
  await t.run(ctx => ctx.db.insert("paymentOrders", { userId, orderId: "complimentary-email-test", amount: 0, currency: "INR", status: "paid", createdAt: Date.now() }));
  await user.mutation(api.payments.beginGeneration, args);
  await user.mutation(api.payments.finishGeneration, { backendToken: "test-server-key", generationId: args.generationId, token: args.token, response: JSON.stringify({ draft: { title: "A family story" } }) });
  const rows = await t.run(ctx => ctx.db.query("emailNotifications").collect());
  expect(rows.map(row => row.kind)).toEqual(["generation_started", "generation_ready"]);
  configured();
  for (const row of rows) await t.mutation(internal.notifications.deliver, { notificationId: row._id });
  expect(provider.send.mock.calls.map(call => call[1].to)).toEqual(["reader@example.invalid", "reader@example.invalid"]);
});

test("notification HTML escapes supplied contact information and omits story content", () => {
  const rendered = buildNotificationEmail("waitlist_signup", { name: '<script>alert("x")</script>', email: "reader@example.invalid", createdAt: 0, appUrl: "https://charpai.sreechand.pm/app" });
  expect(rendered.html).not.toContain("<script>");
  expect(rendered.html).toContain("&lt;script&gt;");
  expect(rendered.text).toContain("reader@example.invalid");
});

test("a failed attempt and successful retry send one start, failure and ready update", async () => {
  vi.stubEnv("PAYMENT_BACKEND_TOKEN", "test-server-key");
  const t = convexTest(schema, modules);
  const userId = await t.run(ctx => ctx.db.insert("users", { email: "reader@example.invalid" }));
  await t.run(ctx => ctx.db.insert("paymentOrders", { userId, orderId: "complimentary-retry-test", amount: 0, currency: "INR", status: "paid", createdAt: Date.now() }));
  const user = t.withIdentity({ subject: `${userId}|session` });
  const args = { backendToken: "test-server-key", generationId: "retry-generation", stage: "full" as const, payloadHash: "payload", token: "attempt-one" };
  await user.mutation(api.payments.beginGeneration, args);
  await user.mutation(api.payments.finishGeneration, { backendToken: args.backendToken, generationId: args.generationId, token: args.token });
  await user.mutation(api.payments.beginGeneration, { ...args, token: "attempt-two" });
  await user.mutation(api.payments.finishGeneration, { backendToken: args.backendToken, generationId: args.generationId, token: "attempt-two", response: JSON.stringify({ draft: { title: "Ready after retry" } }) });
  expect((await t.run(ctx => ctx.db.query("emailNotifications").collect())).map(row => row.kind)).toEqual(["generation_started", "generation_failed", "generation_ready"]);
});

test("both-recipient mode does not double-email an owner signing into their own account", async () => {
  configured(); vi.stubEnv("EMAIL_USER_EVENTS_TO", "both");
  const t = convexTest(schema, modules);
  const userId = await t.run(ctx => ctx.db.insert("users", { email: "OWNER@example.invalid" }));
  await t.mutation(internal.notifications.login, { userId, eventKey: "owner-login" });
  const row = (await t.run(ctx => ctx.db.query("emailNotifications").collect()))[0];
  await t.mutation(internal.notifications.deliver, { notificationId: row._id });
  expect(provider.send).toHaveBeenCalledTimes(1);
  expect(provider.send.mock.calls[0][1].to).toBe("owner@example.invalid");
});

test("email queue problems leave saved signups intact and the notification pending", async () => {
  configured(); provider.send.mockRejectedValueOnce(new Error("Email queue unavailable"));
  const t = convexTest(schema, modules);
  const signup = await t.mutation(api.waitlist.add, { name: "Reader", email: "reader@example.invalid" });
  const row = (await t.run(ctx => ctx.db.query("emailNotifications").collect()))[0];
  await expect(t.mutation(internal.notifications.deliver, { notificationId: row._id })).rejects.toThrow("Email queue unavailable");
  expect(await t.run(ctx => ctx.db.get(signup))).not.toBeNull();
  expect((await t.run(ctx => ctx.db.get(row._id)))?.status).toBe("pending");
  await t.mutation(internal.notifications.deliver, { notificationId: row._id });
  expect((await t.run(ctx => ctx.db.get(row._id)))?.status).toBe("queued");
});
