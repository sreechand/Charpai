import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import schema from "./schema";
import { productEventNames, redactDiagnosticText } from "../lib/telemetry-events";

const status = v.union(v.literal("succeeded"), v.literal("failed"));
const eventFields = {
  requestId: v.id("generationRequests"),
  name: v.string(),
  status,
  model: v.optional(v.string()),
  providerRequestId: v.optional(v.string()),
  elapsedMs: v.number()
};

// Diagnostic records supplied by the app, not authoritative billing receipts.
export const start = mutation({
  args: {
    generationId: v.string(),
    stage: v.union(v.literal("full"), v.literal("transcribe"), v.literal("compose")),
    promptVersion: v.string()
  },
  returns: v.id("generationRequests"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in before generating a storybook.");
    if (args.generationId.length > 100 || args.promptVersion.length > 100) throw new Error("Invalid generation identifier.");
    return await ctx.db.insert("generationRequests", { ...args, userId, status: "started", createdAt: Date.now() });
  }
});

export const requireOwner = internalQuery({
  args: { requestId: v.id("generationRequests"), userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.requestId);
    if (!record || record.userId !== args.userId) throw new Error("Generation record not found.");
    return null;
  }
});

export const insertEvent = internalMutation({
  args: { ...eventFields, userId: v.id("users"), artifactStorageId: v.id("_storage") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.requestId);
    if (!record || record.userId !== args.userId) throw new Error("Generation record not found.");
    await ctx.db.insert("generationEvents", { ...args, createdAt: Date.now() });
    return null;
  }
});

// JSON artifacts live in private storage, avoiding the database's document size limit.
export const record = action({
  args: { ...eventFields, artifactJson: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in to save diagnostics.");
    await ctx.runQuery(internal.telemetry.requireOwner, { requestId: args.requestId, userId });
    if (args.name.length > 100 || !Number.isFinite(args.elapsedMs) || args.elapsedMs < 0) throw new Error("Invalid diagnostic event.");
    JSON.parse(args.artifactJson);
    const { artifactJson, ...metadata } = args;
    const artifactStorageId = await ctx.storage.store(new Blob([artifactJson], { type: "application/json" }));
    try {
      await ctx.runMutation(internal.telemetry.insertEvent, { ...metadata, userId, artifactStorageId });
    } catch (error) {
      await ctx.storage.delete(artifactStorageId);
      throw error;
    }
    return null;
  }
});

export const finish = mutation({
  args: {
    requestId: v.id("generationRequests"), status, elapsedMs: v.number(), httpStatus: v.number(),
    error: v.optional(v.string()), warning: v.optional(v.string())
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const record = await ctx.db.get(args.requestId);
    if (!userId || !record || record.userId !== userId) throw new Error("Generation record not found.");
    const { requestId, ...patch } = args;
    await ctx.db.patch(requestId, { ...patch, finishedAt: Date.now() });
    return null;
  }
});

export const latestMine = query({
  args: {},
  returns: v.array(schema.doc("generationRequests")),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db.query("generationRequests").withIndex("by_user_id", q => q.eq("userId", userId)).order("desc").take(20);
  }
});

export const eventsMine = query({
  args: { requestId: v.id("generationRequests") },
  returns: v.array(schema.doc("generationEvents")),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const record = await ctx.db.get(args.requestId);
    if (!userId || !record || record.userId !== userId) throw new Error("Generation record not found.");
    return await ctx.db.query("generationEvents").withIndex("by_request_id", q => q.eq("requestId", args.requestId)).take(100);
  }
});

export const artifactMine = action({
  args: { eventId: v.id("generationEvents") },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in to read diagnostics.");
    const storageId = await ctx.runQuery(internal.telemetry.ownedArtifact, { ...args, userId });
    const blob = await ctx.storage.get(storageId);
    if (!blob) throw new Error("Diagnostic artifact not found.");
    return await blob.text();
  }
});

export const ownedArtifact = internalQuery({
  args: { eventId: v.id("generationEvents"), userId: v.id("users") },
  returns: v.id("_storage"),
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event || event.userId !== args.userId) throw new Error("Diagnostic artifact not found.");
    return event.artifactStorageId;
  }
});

export const productEvent = mutation({
  args: {
    name: v.union(...productEventNames.map(name => v.literal(name))),
    generationId: v.optional(v.string()), elapsedMs: v.optional(v.number()),
    bytes: v.optional(v.number()), contentType: v.optional(v.string()), error: v.optional(v.string())
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in to save diagnostics.");
    await ctx.db.insert("productEvents", {
      ...args, userId, createdAt: Date.now(),
      generationId: args.generationId?.slice(0, 100), contentType: args.contentType?.slice(0, 100),
      error: args.error ? redactDiagnosticText(args.error).slice(0, 2000) : undefined
    });
    return null;
  }
});
