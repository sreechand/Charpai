import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";

const orderFields = {
  userId: v.id("users"), orderId: v.string(), amount: v.number(), currency: v.string(),
  status: v.union(v.literal("created"), v.literal("paid")),
  paymentId: v.optional(v.string()),
  createdAt: v.number(), paidAt: v.optional(v.number())
};

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
  returns: v.union(v.object({ _id: v.id("paymentOrders"), _creationTime: v.number(), ...orderFields }), v.null()),
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
  args: {}, returns: v.object({ available: v.boolean() }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { available: false };
    const order = await ctx.db.query("paymentOrders").withIndex("by_user_id_and_status", q => q.eq("userId", userId).eq("status", "paid")).order("desc").first();
    return { available: Boolean(order) };
  }
});
