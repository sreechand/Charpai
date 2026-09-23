import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireAuthUserId(ctx);
    return await ctx.storage.generateUploadUrl();
  }
});

export const recordAudioUpload = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    contentType: v.optional(v.string()),
    size: v.number()
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const existing = await ctx.db
      .query("audioFiles")
      .withIndex("by_storage_id", (q) => q.eq("storageId", args.storageId))
      .unique();

    if (existing) {
      if (existing.userId !== userId) {
        throw new Error("This audio upload belongs to another user.");
      }
      return null;
    }

    await ctx.db.insert("audioFiles", {
      userId,
      storageId: args.storageId,
      fileName: args.fileName,
      contentType: args.contentType,
      size: args.size,
      createdAt: Date.now()
    });

    return null;
  }
});

export const getUrl = query({
  args: {
    storageId: v.id("_storage")
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const upload = await ctx.db
      .query("audioFiles")
      .withIndex("by_storage_id", (q) => q.eq("storageId", args.storageId))
      .unique();

    if (!upload || upload.userId !== userId) {
      throw new Error("Uploaded audio could not be found for this user.");
    }

    return await ctx.storage.getUrl(args.storageId);
  }
});

async function requireAuthUserId(ctx: MutationCtx | QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Sign in to continue.");
  }
  return userId;
}
