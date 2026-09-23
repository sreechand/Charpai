import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

export const createRun = mutation({
  args: {
    buyerName: v.optional(v.string()),
    email: v.optional(v.string()),
    elderName: v.string(),
    relationship: v.string(),
    originPlace: v.string(),
    languageMix: v.string(),
    audioStorageId: v.optional(v.id("_storage")),
    hasAudio: v.boolean(),
    photoCount: v.number()
  },
  returns: v.id("runs"),
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const user = await ctx.db.get(userId);
    const now = Date.now();
    return await ctx.db.insert("runs", {
      ...args,
      userId,
      buyerName: args.buyerName || user?.name || "",
      email: args.email || user?.email || "",
      paymentStatus: "received",
      status: "created",
      createdAt: now,
      updatedAt: now
    });
  }
});

export const markGenerating = mutation({
  args: {
    id: v.id("runs")
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedRun(ctx, args.id);
    await ctx.db.patch(args.id, {
      status: "generating",
      updatedAt: Date.now()
    });
    return null;
  }
});

export const markDraftReady = mutation({
  args: {
    id: v.id("runs"),
    title: v.string()
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedRun(ctx, args.id);
    await ctx.db.patch(args.id, {
      status: "draft_ready",
      title: args.title,
      updatedAt: Date.now()
    });
    return null;
  }
});

export const markExported = mutation({
  args: {
    id: v.id("runs"),
    title: v.string()
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedRun(ctx, args.id);
    await ctx.db.patch(args.id, {
      status: "exported",
      title: args.title,
      updatedAt: Date.now()
    });
    return null;
  }
});

export const markFailed = mutation({
  args: {
    id: v.id("runs"),
    error: v.string()
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedRun(ctx, args.id);
    await ctx.db.patch(args.id, {
      status: "failed",
      error: args.error,
      updatedAt: Date.now()
    });
    return null;
  }
});

async function requireAuthUserId(ctx: MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Sign in to continue.");
  }
  return userId;
}

async function requireOwnedRun(ctx: MutationCtx, id: Id<"runs">) {
  const userId = await requireAuthUserId(ctx);
  const run = await ctx.db.get(id);
  if (!run) {
    throw new Error("Storybook run not found.");
  }
  if (run.userId !== userId) {
    throw new Error("You do not have access to this storybook run.");
  }
  return run;
}
