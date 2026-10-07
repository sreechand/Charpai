import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery, mutation, query, env } from "./_generated/server";

import schema from "./schema";



export const identity = internalQuery({
  args: {}, returns: v.union(v.id("users"), v.null()),
  handler: async (ctx) => await getAuthUserId(ctx)
});

export const saveOrder = internalMutation({
  args: { userId: v.id("users"), orderId: v.string(), amount: v.number(), currency: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("paymentOrders").withIndex("by_order_id", q => q.eq("orderId", args.orderId)).unique();
    if (existing) {
      if (existing.userId !== args.userId || existing.amount !== args.amount || existing.currency !== args.currency) {
        throw new ConvexError({ status: 400, message: "Payment order does not match." });
      }
      return null;
    }
    await ctx.db.insert("paymentOrders", { ...args, status: "created", createdAt: Date.now() });
    return null;
  }
});

export const ownedOrder = internalQuery({
  args: { userId: v.id("users"), orderId: v.string() },
  returns: v.union(schema.doc("paymentOrders"), v.null()),
  handler: async (ctx, args) => {
    const order = await ctx.db.query("paymentOrders").withIndex("by_order_id", q => q.eq("orderId", args.orderId)).unique();
    return order?.userId === args.userId ? order : null;
  }
});

// Internal only: browsers cannot grant themselves payment access.
export const markPaid = internalMutation({
  args: { userId: v.id("users"), orderId: v.string(), paymentId: v.string() }, returns: v.null(),
  handler: async (ctx, args) => {
    const order = await ctx.db.query("paymentOrders").withIndex("by_order_id", q => q.eq("orderId", args.orderId)).unique();
    if (!order || order.userId !== args.userId) throw new ConvexError({ status: 400, message: "Payment order not found." });
    if (order.status === "paid") {
      if (order.paymentId !== args.paymentId) throw new ConvexError({ status: 400, message: "Order already has a different payment." });
      return null;
    }
    await ctx.db.patch(order._id, { status: "paid", paymentId: args.paymentId, paidAt: Date.now() });
    return null;
  }
});

export const status = query({
  args: {}, returns: v.object({ available: v.boolean(), resumeId: v.union(v.string(), v.null()), response: v.union(v.string(), v.null()) }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { available: false, resumeId: null, response: null };
    const credit = await ctx.db.query("paymentOrders").withIndex("by_available", q => q.eq("userId", userId).eq("status", "paid").eq("generationId", undefined)).first();
    const recent = await ctx.db.query("paymentOrders").withIndex("by_user_id_and_status", q => q.eq("userId", userId).eq("status", "paid")).order("desc").first();
    const active = recent?.generationId && !recent.runId ? recent : null;
    return { available: Boolean(credit), resumeId: active?.generationId || null, response: active?.composeResponse || (active?.inputJson ? JSON.stringify({ intake: JSON.parse(active.inputJson) }) : null) };
  }
});

function requireBackend(token: string) {
  if (!env.PAYMENT_BACKEND_TOKEN || token !== env.PAYMENT_BACKEND_TOKEN) throw new ConvexError({ status: 403, message: "Server authorization required." });
}

// Only our generation server can spend a credit or finish a paid generation.
export const beginGeneration = mutation({
  args: { backendToken: v.string(), generationId: v.string(), stage: v.union(v.literal("full"), v.literal("transcribe"), v.literal("compose")), payloadHash: v.string(), token: v.string(), inputJson: v.optional(v.string()) },
  returns: v.object({ response: v.union(v.string(), v.null()) }),
  handler: async (ctx, args) => {
    requireBackend(args.backendToken);
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError({ status: 401, message: "Sign in to create a storybook." });
    if (!args.generationId || args.generationId.length > 100) throw new Error("Invalid storybook identifier.");
    let order = await ctx.db.query("paymentOrders").withIndex("by_generation", q => q.eq("userId", userId).eq("generationId", args.generationId)).unique();
    if (!order) {
      if (args.stage === "compose") throw new ConvexError({ status: 403, message: "Record or upload your interview first." });
      order = await ctx.db.query("paymentOrders").withIndex("by_available", q => q.eq("userId", userId).eq("status", "paid").eq("generationId", undefined)).first();
      if (!order) throw new ConvexError({ status: 402, message: "Pay to unlock a new storybook." });
      await ctx.db.patch(order._id, { generationId: args.generationId, mode: args.stage === "full" ? "full" : "split", inputJson: args.inputJson });
    }
    if (order.status !== "paid") throw new ConvexError({ status: 402, message: "Payment is not verified." });
    if (order.mode && ((args.stage === "full") !== (order.mode === "full"))) throw new Error("This payment is already assigned to a different storybook workflow.");
    const hashKey = args.stage === "transcribe" ? "transcribeHash" : "composeHash";
    const responseKey = args.stage === "transcribe" ? "transcribeResponse" : "composeResponse";
    if (order[hashKey] && order[hashKey] !== args.payloadHash) throw new ConvexError({ status: 402, message: "This payment belongs to another recording or story. Pay to start another storybook." });
    if (order[responseKey]) return { response: order[responseKey]! };
    if (order.runId) throw new Error("This storybook has already been created.");
    if (args.stage === "compose" && !order.transcribeResponse) throw new Error("Finish transcription first.");
    if (order.lock && Date.now() - order.lock.startedAt < 360000) throw new ConvexError({ status: 409, message: "Your storybook is already being prepared. Please wait." });
    await ctx.db.patch(order._id, { [hashKey]: args.payloadHash, lock: { token: args.token, stage: args.stage, startedAt: Date.now() } });
    return { response: null };
  }
});

export const finishGeneration = mutation({
  args: { backendToken: v.string(), generationId: v.string(), token: v.string(), response: v.optional(v.string()) }, returns: v.null(),
  handler: async (ctx, args) => {
    requireBackend(args.backendToken);
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in to continue.");
    const order = await ctx.db.query("paymentOrders").withIndex("by_generation", q => q.eq("userId", userId).eq("generationId", args.generationId)).unique();
    if (!order || order.lock?.token !== args.token) throw new Error("Generation attempt not found.");
    const responseKey = order.lock.stage === "transcribe" ? "transcribeResponse" : "composeResponse";
    await ctx.db.patch(order._id, { lock: undefined, ...(args.response ? { [responseKey]: args.response } : {}) });
    return null;
  }
});
