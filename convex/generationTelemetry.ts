import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { internalMutation, query, env } from "./_generated/server";
import { internal } from "./_generated/api";
import schema from "./schema";

// Longer than the 280-second worker HTTP deadline, with room for final writes.
export const STEP_DEADLINE_MS = 330_000;
const stepId = v.id("generationStepRuns");
const errorCode = v.union(v.literal("configuration"), v.literal("worker_http"), v.literal("network"), v.literal("deadline_exceeded"), v.literal("invalid_response"));

export const begin = internalMutation({
  args: { draftId: v.id("generationDrafts"), attemptId: v.string(), operation: v.string(), partIndex: v.optional(v.number()) },
  returns: stepId,
  handler: async (ctx, args) => {
    const draft = await ctx.db.get(args.draftId);
    if (!draft || draft.attemptId !== args.attemptId || !["queued", "running"].includes(draft.status)) throw new ConvexError("This generation attempt is no longer active.");
    if (args.operation.length > 50 || (args.partIndex !== undefined && (!Number.isSafeInteger(args.partIndex) || args.partIndex < 0))) throw new ConvexError("Invalid generation step.");
    const createdAt = Date.now(), deadlineAt = createdAt + STEP_DEADLINE_MS;
    const id = await ctx.db.insert("generationStepRuns", { ...args, userId: draft.userId, generationId: draft.generationId, backendUrl: env.CONVEX_CLOUD_URL, status: "started", createdAt, deadlineAt });
    await ctx.scheduler.runAt(deadlineAt, internal.generationTelemetry.expire, { stepId: id });
    return id;
  }
});

export const finish = internalMutation({
  args: { stepId, status: v.union(v.literal("succeeded"), v.literal("failed"), v.literal("timed_out")), httpStatus: v.optional(v.number()), errorCode: v.optional(errorCode), appRelease: v.optional(v.string()) },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.stepId);
    // A late HTTP response must not erase a deadline or another terminal outcome.
    if (!record || record.status !== "started") return false;
    const finishedAt = Date.now();
    await ctx.db.patch(record._id, { status: args.status, httpStatus: args.httpStatus, errorCode: args.errorCode, appRelease: args.appRelease?.slice(0, 128), finishedAt, elapsedMs: finishedAt - record.createdAt });
    return true;
  }
});

export const expire = internalMutation({
  args: { stepId }, returns: v.null(),
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.stepId);
    if (!record || record.status !== "started") return null;
    if (Date.now() < record.deadlineAt) return null;
    await ctx.db.patch(record._id, { status: "timed_out", errorCode: "deadline_exceeded", finishedAt: Date.now(), elapsedMs: Date.now() - record.createdAt });
    // fail() checks attempt identity and protects ready/published drafts. It leaves
    // checkpoints and the assigned credit untouched, so resume is safe.
    await ctx.runMutation(internal.generation.fail, { draftId: record.draftId, attemptId: record.attemptId, error: "Generation worker deadline exceeded." });
    return null;
  }
});

export const listMine = query({
  args: { draftId: v.id("generationDrafts") }, returns: v.array(schema.doc("generationStepRuns")),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx), draft = await ctx.db.get(args.draftId);
    if (!userId || !draft || draft.userId !== userId) return [];
    return await ctx.db.query("generationStepRuns").withIndex("by_draftId", q => q.eq("draftId", args.draftId)).order("desc").take(200);
  }
});
