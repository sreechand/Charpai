import { Resend } from "@convex-dev/resend";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import { env, internalMutation, internalQuery } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { buildNotificationEmail } from "../lib/notification-email";

export function emailService() {
  return new Resend(components.resend, { apiKey: env.RESEND_API_KEY || "", webhookSecret: env.RESEND_WEBHOOK_SECRET || "", testMode: false });
}

// Event keys and recipients originate on the server, never from browser arguments.
export async function queueNotification(ctx: MutationCtx, event: Pick<Doc<"emailNotifications">, "key" | "kind"> & {
  userId?: Id<"users">; waitlistId?: Id<"waitlist">; paymentOrderId?: Id<"paymentOrders">; generationId?: string; title?: string;
}) {
  const existing = await ctx.db.query("emailNotifications").withIndex("by_key", q => q.eq("key", event.key)).unique();
  if (existing) return existing._id;
  const notificationId = await ctx.db.insert("emailNotifications", { ...event, title: event.title?.slice(0, 200), status: "pending", createdAt: Date.now() });
  await ctx.scheduler.runAfter(0, internal.notifications.deliver, { notificationId });
  return notificationId;
}

export const deliver = internalMutation({
  args: { notificationId: v.id("emailNotifications") }, returns: v.null(),
  handler: async (ctx, { notificationId }) => {
    const notice = await ctx.db.get(notificationId);
    if (!notice || notice.status !== "pending") return null;
    // Preserve pending events while the sender/account is being connected.
    if (env.EMAIL_ENABLED !== "true" || !env.RESEND_API_KEY || !env.EMAIL_FROM || !env.EMAIL_OWNER_TO) return null;
    const user = notice.userId ? await ctx.db.get(notice.userId) : null;
    const signup = notice.waitlistId ? await ctx.db.get(notice.waitlistId) : null;
    const payment = notice.paymentOrderId ? await ctx.db.get(notice.paymentOrderId) : null;
    const isReceipt = notice.kind === "payment_receipt";
    if (isReceipt && (!payment || payment.status !== "paid" || !payment.paymentId || payment.amount <= 0 || payment.parentOrderId || payment.userId !== notice.userId)) {
      await ctx.db.patch(notificationId, { status: "skipped" }); return null;
    }
    if ((notice.userId && !user) || (notice.waitlistId && !signup)) {
      await ctx.db.patch(notificationId, { status: "skipped" }); return null;
    }
    const ownerOnly = notice.kind === "waitlist_signup" || notice.kind === "account_signup";
    const policy = env.EMAIL_USER_EVENTS_TO || "user";
    const recipients = new Set<string>();
    if (ownerOnly || (!isReceipt && (policy === "owner" || policy === "both"))) recipients.add(env.EMAIL_OWNER_TO.trim().toLowerCase());
    if (!ownerOnly && (isReceipt || policy !== "owner") && user?.email) recipients.add(user.email.trim().toLowerCase());
    if (!recipients.size) { await ctx.db.patch(notificationId, { status: "skipped" }); return null; }
    const appUrl = new URL("/app", env.SITE_URL || "https://charpai.sreechand.pm").href;
    const content = buildNotificationEmail(notice.kind, {
      name: signup?.name || user?.name, email: signup?.email || user?.email,
      phone: signup?.phone, note: signup?.note, title: notice.title, createdAt: payment?.paidAt || notice.createdAt, appUrl,
      payment: isReceipt && payment ? { amount: payment.amount, currency: payment.currency, credits: payment.creditsPerPurchase || 1, orderId: payment.orderId, paymentId: payment.paymentId!, testMode: Boolean(env.RAZORPAY_KEY_ID?.startsWith("rzp_test_")) } : undefined
    });
    const service = emailService();
    const emailIds: string[] = [];
    for (const to of recipients) {
      emailIds.push(await service.sendEmail(ctx, { from: env.EMAIL_FROM, to, replyTo: [env.EMAIL_OWNER_TO], ...content, idempotencyKey: `${notice.key}:${to}` }));
    }
    await ctx.db.patch(notificationId, { status: "queued", emailIds, queuedAt: Date.now() });
    return null;
  }
});

// Runs only after the authentication transaction commits a successful new session.
export const login = internalMutation({
  args: { userId: v.id("users"), eventKey: v.string() }, returns: v.null(),
  handler: async (ctx, { userId, eventKey }) => {
    await queueNotification(ctx, { key: eventKey, kind: "login", userId });
    return null;
  }
});

export const accountSignup = internalMutation({
  args: { userId: v.id("users") }, returns: v.null(),
  handler: async (ctx, { userId }) => {
    await queueNotification(ctx, { key: `account_signup:${userId}`, kind: "account_signup", userId });
    return null;
  }
});

export const flushPending = internalMutation({
  args: {}, returns: v.number(),
  handler: async (ctx) => {
    const pending = await ctx.db.query("emailNotifications").withIndex("by_status", q => q.eq("status", "pending")).take(50);
    for (const row of pending) await ctx.scheduler.runAfter(0, internal.notifications.deliver, { notificationId: row._id });
    return pending.length;
  }
});

export const deliveryStatus = internalQuery({
  args: { notificationId: v.id("emailNotifications") }, returns: v.array(v.object({ emailId: v.string(), status: v.string() })),
  handler: async (ctx, { notificationId }) => {
    const notice = await ctx.db.get(notificationId);
    const results: { emailId: string; status: string }[] = [];
    for (const emailId of notice?.emailIds || []) {
      const result = await emailService().status(ctx, emailId as Parameters<Resend["status"]>[1]);
      results.push({ emailId, status: result?.status || "unknown" });
    }
    return results;
  }
});

// Admin-only delivery check; no caller-supplied address or message.
export const sendTestEmail = internalMutation({
  args: { kind: v.optional(v.literal("payment_receipt")) }, returns: v.string(),
  handler: async (ctx, { kind }) => {
    if (!env.RESEND_API_KEY || !env.EMAIL_FROM || !env.EMAIL_OWNER_TO) throw new Error("Connect the Resend key, sender and owner email first.");
    const receipt = kind ? buildNotificationEmail("payment_receipt", {
      createdAt: Date.now(), appUrl: new URL("/app", env.SITE_URL || "https://charpai.sreechand.pm").href,
      payment: { amount: 20000, currency: "INR", credits: 4, orderId: "order_example", paymentId: "pay_example", testMode: true }
    }) : null;
    return await emailService().sendEmail(ctx, {
      from: env.EMAIL_FROM, to: env.EMAIL_OWNER_TO, replyTo: [env.EMAIL_OWNER_TO], subject: "Charpai email setup check",
      text: "Charpai's email service is connected. This is a setup check for signup alerts, login alerts and story-generation updates.",
      ...receipt,
      idempotencyKey: `setup-check:${Date.now()}`
    });
  }
});

export const emailStatus = internalQuery({
  args: { emailId: v.string() }, returns: v.union(v.string(), v.null()),
  handler: async (ctx, { emailId }) => {
    const result = await emailService().status(ctx, emailId as Parameters<Resend["status"]>[1]);
    return result?.status || null;
  }
});
