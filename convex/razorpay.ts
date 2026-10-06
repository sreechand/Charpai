"use node";

import Razorpay from "razorpay";
import { randomUUID } from "node:crypto";
import { ConvexError, v } from "convex/values";
import { action, env } from "./_generated/server";
import { internal } from "./_generated/api";
import { validPaymentSignature } from "../lib/payment-signature";

function client() {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new ConvexError({ status: 500, message: "Razorpay checkout is not configured yet." });
  }
  return new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
}

function providerError(error: unknown): never {
  const code = error && typeof error === "object" && "statusCode" in error ? Number(error.statusCode) : 500;
  throw new ConvexError({ status: code === 401 ? 401 : 500,
    message: code === 401 ? "Razorpay rejected the configured credentials." : "Razorpay could not complete this request. Please try again." });
}

export const checkoutDetails = action({
  args: {}, returns: v.object({ amount: v.union(v.number(), v.null()), currency: v.string(), testMode: v.boolean() }),
  handler: async (ctx): Promise<{ amount: number | null; currency: string; testMode: boolean }> => {
    const userId = await ctx.runQuery(internal.payments.identity, {});
    if (!userId) throw new ConvexError({ status: 401, message: "Sign in before paying." });
    const amount = Number(env.RAZORPAY_AMOUNT_PAISE);
    return { amount: Number.isSafeInteger(amount) && amount >= 100 ? amount : null,
      currency: "INR", testMode: Boolean(env.RAZORPAY_KEY_ID?.startsWith("rzp_test_")) };
  }
});

export const createOrder = action({
  args: {},
  returns: v.object({ order_id: v.string(), amount: v.number(), currency: v.string(), key_id: v.string() }),
  handler: async (ctx): Promise<{ order_id: string; amount: number; currency: string; key_id: string }> => {
    const userId = await ctx.runQuery(internal.payments.identity, {});
    if (!userId) throw new ConvexError({ status: 401, message: "Sign in before paying." });
    const amount = Number(env.RAZORPAY_AMOUNT_PAISE);
    if (!Number.isSafeInteger(amount) || amount < 100) {
      throw new ConvexError({ status: 500, message: "The storybook price has not been configured. It must be at least ₹1." });
    }
    const razorpay = client();
    const order = await razorpay.orders.create({ amount, currency: "INR", receipt: randomUUID() }).catch(providerError);
    if (Number(order.amount) !== amount || order.currency !== "INR") {
      throw new ConvexError({ status: 500, message: "Razorpay returned an unexpected order." });
    }
    await ctx.runMutation(internal.payments.saveOrder, { userId, orderId: order.id, amount, currency: "INR" });
    return { order_id: order.id, amount, currency: "INR", key_id: env.RAZORPAY_KEY_ID! };
  }
});

export const verifyPayment = action({
  args: { razorpay_payment_id: v.string(), razorpay_order_id: v.string(), razorpay_signature: v.string() },
  returns: v.object({ success: v.boolean(), order_id: v.string() }),
  handler: async (ctx, args): Promise<{ success: boolean; order_id: string }> => {
    const userId = await ctx.runQuery(internal.payments.identity, {});
    if (!userId) throw new ConvexError({ status: 401, message: "Sign in before verifying payment." });
    if (!args.razorpay_payment_id || !args.razorpay_order_id || !args.razorpay_signature) {
      throw new ConvexError({ status: 400, message: "All payment verification fields are required." });
    }
    const order = await ctx.runQuery(internal.payments.ownedOrder, { userId, orderId: args.razorpay_order_id });
    if (!order) throw new ConvexError({ status: 400, message: "Payment order not found for this account." });
    const razorpay = client();
    // Use the stored server order ID, not an unchecked ID from the callback.
    if (!validPaymentSignature(order.orderId, args.razorpay_payment_id, args.razorpay_signature, env.RAZORPAY_KEY_SECRET!)) {
      throw new ConvexError({ status: 400, message: "Payment signature did not match. Access has not been unlocked." });
    }
    const payment = await razorpay.payments.fetch(args.razorpay_payment_id).catch(providerError);
    if (payment.id !== args.razorpay_payment_id || payment.order_id !== order.orderId || Number(payment.amount) !== order.amount || payment.currency !== order.currency) {
      throw new ConvexError({ status: 400, message: "Payment details do not match this order." });
    }
    if (payment.status !== "captured") {
      throw new ConvexError({ status: 400, message: "Payment is not captured yet. Wait a moment and retry verification." });
    }
    await ctx.runMutation(internal.payments.markPaid, { userId, orderId: order.orderId, paymentId: payment.id });
    return { success: true, order_id: order.orderId };
  }
});
