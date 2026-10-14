import { vWorkflowId, vResultValidator } from "@convex-dev/workflow";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery, mutation, query, env } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { api, internal } from "./_generated/api";
import schema from "./schema";
import { workflow } from "./generationWorkflow";
import { queueNotification } from "./notifications";

const draftId = v.id("generationDrafts");
const attemptArgs = { draftId, attemptId: v.string() };
const serverArgs = { backendToken: v.string(), ...attemptArgs };
const stages = v.union(v.literal("preparing"), v.literal("transcribing"), v.literal("understanding"), v.literal("writing"), v.literal("illustrating"), v.literal("ready"));
const summaryValidator = schema.doc("generationDrafts").pick("_id", "generationId", "title", "fileName", "status", "stage", "completedParts", "totalParts", "createdAt", "updatedAt").extend({ error: v.union(v.string(), v.null()) });
function summary(d: Doc<"generationDrafts">) {
  return { _id: d._id, generationId: d.generationId, title: d.title, fileName: d.fileName, status: d.status, stage: d.stage, completedParts: d.completedParts, totalParts: d.totalParts, createdAt: d.createdAt, updatedAt: d.updatedAt, error: d.error ?? null };
}
function newAttemptId() { return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`; }
function requireBackend(token: string) {
  if (!env.PAYMENT_BACKEND_TOKEN || token !== env.PAYMENT_BACKEND_TOKEN) throw new ConvexError("Server authorization required.");
}
async function requireAttempt(ctx: QueryCtx | MutationCtx, id: Id<"generationDrafts">, attempt?: string) {
  const d = await ctx.db.get(id);
  if (!d || (attempt && d.attemptId !== attempt)) throw new ConvexError("This generation attempt is no longer active.");
  return d;
}
async function requireOwned(ctx: QueryCtx | MutationCtx, id: Id<"generationDrafts">) {
  const userId = await getAuthUserId(ctx);
  const d = await ctx.db.get(id);
  if (!userId || !d || d.userId !== userId) throw new ConvexError("Sign in to access your saved story.");
  return d;
}
async function checkpoint(ctx: QueryCtx | MutationCtx, id: Id<"generationDrafts">, key: string) {
  return await ctx.db.query("generationCheckpoints").withIndex("by_draftId_and_key", q => q.eq("draftId", id).eq("key", key)).unique();
}
export const submit = mutation({
  args: { generationId: v.string(), inputJson: v.string(), audioStorageId: v.id("_storage"), fileName: v.string(), photoCount: v.optional(v.number()), photoStorageIds: v.optional(v.array(v.id("_storage"))) }, returns: draftId,
  handler: async (ctx, args): Promise<Id<"generationDrafts">> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Sign in to create a story.");
    if (!args.generationId || args.generationId.length > 100 || args.inputJson.length > 100000) throw new ConvexError("Please check your story details.");
    JSON.parse(args.inputJson);
    const photoStorageIds = args.photoStorageIds ?? [];
    if (photoStorageIds.length > 3 || new Set(photoStorageIds).size !== photoStorageIds.length) throw new ConvexError("Choose up to three different family photos.");
    for (const storageId of photoStorageIds) {
      const photo = await ctx.db.query("generationPhotos").withIndex("by_storage_id", q => q.eq("storageId", storageId)).unique();
      if (!photo || photo.userId !== userId) throw new ConvexError("Upload your own family photos before creating a story.");
    }
    const existing = await ctx.db.query("generationDrafts").withIndex("by_generationId", q => q.eq("generationId", args.generationId)).unique();
    if (existing) {
      if (existing.userId !== userId || existing.audioStorageId !== args.audioStorageId || existing.inputJson !== args.inputJson || JSON.stringify(existing.photoStorageIds ?? []) !== JSON.stringify(photoStorageIds)) throw new ConvexError("This saved story belongs to a different recording or account.");
      return existing._id;
    }
    const audio = await ctx.db.query("audioFiles").withIndex("by_storage_id", q => q.eq("storageId", args.audioStorageId)).unique();
    if (!audio || audio.userId !== userId) throw new ConvexError("Upload your recording before creating a story.");
    const assigned = await ctx.db.query("paymentOrders").withIndex("by_generationId", q => q.eq("generationId", args.generationId)).take(2);
    if (assigned.some(p => p.userId !== userId)) throw new ConvexError("This story belongs to another account.");
    let payment = await ctx.db.query("paymentOrders").withIndex("by_generation", q => q.eq("userId", userId).eq("generationId", args.generationId)).unique();
    if (payment && (payment.status !== "paid" || payment.runId)) throw new ConvexError("This story has already been saved or its payment is unverified.");
    if (!payment) payment = await ctx.db.query("paymentOrders").withIndex("by_available", q => q.eq("userId", userId).eq("status", "paid").eq("generationId", undefined)).first();
    if (!payment) throw new ConvexError("Pay ₹200 to unlock four story generations.");
    if (payment.inputJson && payment.inputJson !== args.inputJson) throw new ConvexError("Resume your original saved story instead.");
    const now = Date.now(), attemptId = newAttemptId();
    await ctx.db.patch(payment._id, { generationId: args.generationId, inputJson: args.inputJson });
    const id = await ctx.db.insert("generationDrafts", { userId, generationId: args.generationId, paymentOrderId: payment._id, inputJson: args.inputJson, audioStorageId: args.audioStorageId, photoStorageIds, fileName: audio.fileName, title: "Your story draft", status: "queued", stage: "preparing", completedParts: 0, totalParts: 0, attemptId, createdAt: now, updatedAt: now });
    const workflowId = await workflow.start(ctx, internal.generationWorkflow.run, { draftId: id, attemptId }, { startAsync: true, onComplete: internal.generation.workflowComplete, context: { draftId: id, attemptId } });
    await ctx.db.patch(id, { workflowId });
    await queueNotification(ctx, { key: `generation_started:${userId}:${args.generationId}`, kind: "generation_started", userId, generationId: args.generationId });
    return id;
  }
});
export const listMine = query({ args: {}, returns: v.array(summaryValidator), handler: async ctx => {
  const userId = await getAuthUserId(ctx);
  if (!userId) return [];
  return (await ctx.db.query("generationDrafts").withIndex("by_userId", q => q.eq("userId", userId)).order("desc").take(50)).map(summary);
} });
export const getMine = query({ args: { draftId }, returns: v.union(summaryValidator.extend({ inputJson: v.string(), audioStorageId: v.id("_storage"), audioUrl: v.union(v.string(), v.null()), draftUrl: v.union(v.string(), v.null()), textDraftUrl: v.union(v.string(), v.null()), intakeUrl: v.union(v.string(), v.null()), transcriptUrl: v.union(v.string(), v.null()), runId: v.union(v.id("runs"), v.null()), completedSteps: v.array(v.string()), photos: v.array(v.object({ storageId: v.id("_storage"), fileName: v.string(), url: v.union(v.string(), v.null()) })) }), v.null()), handler: async (ctx, args) => {
  const userId = await getAuthUserId(ctx), d = await ctx.db.get(args.draftId);
  if (!d || !userId || d.userId !== userId) return null;
  const url = async (key: string) => { const c = await checkpoint(ctx, d._id, key); return c ? ctx.storage.getUrl(c.artifactStorageId) : null; };
  const photos: { storageId: Id<"_storage">; fileName: string; url: string | null }[] = [];
  for (const storageId of d.photoStorageIds ?? []) {
    const p = await ctx.db.query("generationPhotos").withIndex("by_storage_id", q => q.eq("storageId", storageId)).unique();
    if (p?.userId === d.userId) photos.push({ storageId, fileName: p.fileName, url: await ctx.storage.getUrl(storageId) });
  }
  const checkpoints = await ctx.db.query("generationCheckpoints").withIndex("by_draftId_and_key", q => q.eq("draftId", d._id)).take(500);
  const completedSteps = checkpoints.map(c => c.key).filter(key => /^(audio\.parts|transcription\.part\.\d+|transcript|intake|draft\.text|illustration\.\d+|result)$/.test(key));
  return { ...summary(d), completedSteps, inputJson: d.inputJson, photos, audioStorageId: d.audioStorageId, audioUrl: await ctx.storage.getUrl(d.audioStorageId), draftUrl: await url("result"), textDraftUrl: await url("draft.text"), intakeUrl: await url("intake"), transcriptUrl: await url("transcript"), runId: d.runId ?? null };
} });
export const resume = mutation({ args: { draftId }, returns: v.null(), handler: async (ctx, args): Promise<null> => {
  const d = await requireOwned(ctx, args.draftId);
  if (d.status !== "failed") return null;
  const attemptId = newAttemptId();
  await ctx.db.patch(d._id, { attemptId, status: "queued", error: undefined, updatedAt: Date.now() });
  const workflowId = await workflow.start(ctx, internal.generationWorkflow.run, { draftId: d._id, attemptId }, { startAsync: true, onComplete: internal.generation.workflowComplete, context: { draftId: d._id, attemptId } });
  await ctx.db.patch(d._id, { workflowId }); return null;
} });
export const markPublished = mutation({ args: { draftId, runId: v.id("runs") }, returns: v.null(), handler: async (ctx, args) => {
  const d = await requireOwned(ctx, args.draftId), run = await ctx.db.get(args.runId);
  if (!run || run.userId !== d.userId || run.generationId !== d.generationId || (d.status !== "ready" && d.status !== "published")) throw new ConvexError("Finish this story before saving it.");
  await ctx.db.patch(d._id, { status: "published", runId: args.runId, updatedAt: Date.now() }); return null;
} });
export const serverSnapshot = query({ args: { backendToken: v.string(), draftId, attemptId: v.optional(v.string()) }, returns: schema.doc("generationDrafts").extend({ audioUrl: v.union(v.string(), v.null()) }), handler: async (ctx, args) => {
  requireBackend(args.backendToken); const d = await requireAttempt(ctx, args.draftId, args.attemptId); return { ...d, audioUrl: await ctx.storage.getUrl(d.audioStorageId) };
} });
export const serverArtifact = query({ args: { backendToken: v.string(), draftId, key: v.string() }, returns: v.union(v.id("_storage"), v.null()), handler: async (ctx, args) => {
  requireBackend(args.backendToken); await requireAttempt(ctx, args.draftId); return (await checkpoint(ctx, args.draftId, args.key))?.artifactStorageId ?? null;
} });
export const serverRead = action({ args: { backendToken: v.string(), draftId, key: v.string() }, returns: v.union(v.string(), v.null()), handler: async (ctx, args): Promise<string | null> => {
  requireBackend(args.backendToken); const id: Id<"_storage"> | null = await ctx.runQuery(api.generation.serverArtifact, args); const blob = id ? await ctx.storage.get(id) : null; return blob ? blob.text() : null;
} });
export const saveCheckpoint = internalMutation({ args: { ...attemptArgs, key: v.string(), artifactStorageId: v.id("_storage"), model: v.optional(v.string()), providerRequestId: v.optional(v.string()) }, returns: v.boolean(), handler: async (ctx, args) => {
  await requireAttempt(ctx, args.draftId, args.attemptId);
  if (await checkpoint(ctx, args.draftId, args.key)) return false;
  const { attemptId: _, ...data } = args; await ctx.db.insert("generationCheckpoints", { ...data, createdAt: Date.now() }); return true;
} });
export const serverWrite = action({ args: { ...serverArgs, key: v.string(), artifactJson: v.string(), model: v.optional(v.string()), providerRequestId: v.optional(v.string()) }, returns: v.null(), handler: async (ctx, args): Promise<null> => {
  requireBackend(args.backendToken); JSON.parse(args.artifactJson);
  await ctx.runQuery(api.generation.serverSnapshot, { backendToken: args.backendToken, draftId: args.draftId, attemptId: args.attemptId });
  const id = await ctx.storage.store(new Blob([args.artifactJson], { type: "application/json" }));
  try { const kept: boolean = await ctx.runMutation(internal.generation.saveCheckpoint, { draftId: args.draftId, attemptId: args.attemptId, key: args.key, artifactStorageId: id, ...(args.model ? { model: args.model } : {}), ...(args.providerRequestId ? { providerRequestId: args.providerRequestId } : {}) }); if (!kept) await ctx.storage.delete(id); }
  catch (e) { await ctx.storage.delete(id); throw e; } return null;
} });
export const serverProgress = mutation({ args: { ...serverArgs, stage: stages, completedParts: v.optional(v.number()), totalParts: v.optional(v.number()), title: v.optional(v.string()) }, returns: v.null(), handler: async (ctx, args) => {
  requireBackend(args.backendToken); const d = await requireAttempt(ctx, args.draftId, args.attemptId);
  if (d.status === "ready" || d.status === "published" || d.status === "failed") throw new ConvexError("This generation attempt has finished.");
  await ctx.db.patch(d._id, { status: "running", stage: args.stage, completedParts: args.completedParts ?? d.completedParts, totalParts: args.totalParts ?? d.totalParts, ...(args.title ? { title: args.title } : {}), updatedAt: Date.now() }); return null;
} });
export const serverUploadUrl = mutation({ args: serverArgs, returns: v.string(), handler: async (ctx, args) => { requireBackend(args.backendToken); await requireAttempt(ctx, args.draftId, args.attemptId); return ctx.storage.generateUploadUrl(); } });
export const serverRegisterImage = mutation({ args: { ...serverArgs, storageId: v.id("_storage"), contentType: v.string(), size: v.number(), model: v.string() }, returns: v.null(), handler: async (ctx, args) => {
  requireBackend(args.backendToken); const d = await requireAttempt(ctx, args.draftId, args.attemptId);
  const metadata = await ctx.db.system.get(args.storageId);
  if (!metadata || metadata.size !== args.size || (metadata.contentType && metadata.contentType !== args.contentType)) throw new ConvexError("Image upload could not be verified.");
  const existing = await ctx.db.query("storybookImages").withIndex("by_storage_id", q => q.eq("storageId", args.storageId)).unique();
  if (existing && (existing.userId !== d.userId || existing.generationDraftId !== d._id)) throw new ConvexError("Image belongs to another account.");
  if (!existing) await ctx.db.insert("storybookImages", { userId: d.userId, generationDraftId: d._id, storageId: args.storageId, contentType: args.contentType, size: args.size, model: args.model, createdAt: Date.now() }); return null;
} });
export const complete = internalMutation({ args: { ...attemptArgs, response: v.string(), transcript: v.optional(v.string()), title: v.string() }, returns: v.null(), handler: async (ctx, args) => {
  const d = await requireAttempt(ctx, args.draftId, args.attemptId);
  if (d.status === "ready" || d.status === "published") return null;
  if (!(await checkpoint(ctx, d._id, "result"))) throw new ConvexError("The finished story has not been saved yet.");
  await ctx.db.patch(d.paymentOrderId, { composeResponse: args.response, ...(args.transcript ? { transcribeResponse: args.transcript } : {}), lock: undefined });
  await ctx.db.patch(d._id, { status: "ready", stage: "ready", title: args.title, error: undefined, updatedAt: Date.now() });
  await queueNotification(ctx, { key: `generation_ready:${d.userId}:${d.generationId}`, kind: "generation_ready", userId: d.userId, generationId: d.generationId, title: args.title }); return null;
} });
export const serverComplete = action({ args: serverArgs, returns: v.null(), handler: async (ctx, args): Promise<null> => {
  requireBackend(args.backendToken);
  const response: string | null = await ctx.runAction(api.generation.serverRead, { backendToken: args.backendToken, draftId: args.draftId, key: "result" });
  if (!response) throw new ConvexError("The finished story has not been saved yet.");
  const result = JSON.parse(response) as { draft?: { title?: string } };
  if (!result.draft || typeof result.draft.title !== "string") throw new ConvexError("The saved story is incomplete.");
  const transcript: string | null = await ctx.runAction(api.generation.serverRead, { backendToken: args.backendToken, draftId: args.draftId, key: "transcript" });
  await ctx.runMutation(internal.generation.complete, { draftId: args.draftId, attemptId: args.attemptId, response, title: result.draft.title, ...(transcript ? { transcript } : {}) }); return null;
} });
export const fail = internalMutation({ args: { ...attemptArgs, error: v.string() }, returns: v.null(), handler: async (ctx, args) => {
  const d = await ctx.db.get(args.draftId); if (!d || d.attemptId !== args.attemptId || d.status === "ready" || d.status === "published") return null;
  const error = "This step could not finish. Your recording and completed work are saved. Resume to continue without using another credit.";
  await ctx.db.patch(d._id, { status: "failed", error, updatedAt: Date.now() });
  await queueNotification(ctx, { key: `generation_failed:${d.userId}:${d.generationId}:${d.attemptId}`, kind: "generation_failed", userId: d.userId, generationId: d.generationId }); return null;
} });

// Migration helpers are internal-only: they never accept browser-supplied ownership.
export const legacyArtifacts = internalQuery({ args: { generationId: v.string(), userId: v.id("users") }, returns: v.object({ payment: v.union(schema.doc("paymentOrders"), v.null()), events: v.array(schema.doc("generationEvents")) }), handler: async (ctx, args) => {
  const payment = await ctx.db.query("paymentOrders").withIndex("by_generation", q => q.eq("userId", args.userId).eq("generationId", args.generationId)).unique();
  const requests = await ctx.db.query("generationRequests").withIndex("by_generation_id", q => q.eq("generationId", args.generationId)).take(20);
  const events: Doc<"generationEvents">[] = [];
  for (const request of requests) if (request.userId === args.userId) events.push(...await ctx.db.query("generationEvents").withIndex("by_request_id", q => q.eq("requestId", request._id)).take(100));
  return { payment, events };
} });
export const seedLegacyDraft = internalMutation({ args: { generationId: v.string(), userId: v.id("users"), audioStorageId: v.id("_storage"), inputJson: v.string() }, returns: draftId, handler: async (ctx, args): Promise<Id<"generationDrafts">> => {
  const existing = await ctx.db.query("generationDrafts").withIndex("by_generationId", q => q.eq("generationId", args.generationId)).unique();
  if (existing) { if (existing.userId !== args.userId || existing.audioStorageId !== args.audioStorageId) throw new Error("Legacy draft ownership mismatch."); return existing._id; }
  const payment = await ctx.db.query("paymentOrders").withIndex("by_generation", q => q.eq("userId", args.userId).eq("generationId", args.generationId)).unique();
  const audio = await ctx.db.query("audioFiles").withIndex("by_storage_id", q => q.eq("storageId", args.audioStorageId)).unique();
  if (!payment || payment.status !== "paid" || !audio || audio.userId !== args.userId) throw new Error("Legacy draft ownership or paid credit could not be verified.");
  const now = Date.now();
  return await ctx.db.insert("generationDrafts", { userId: args.userId, generationId: args.generationId, paymentOrderId: payment._id, inputJson: args.inputJson, audioStorageId: args.audioStorageId, photoStorageIds: [], fileName: audio.fileName, title: "Your recovered story draft", status: "failed", stage: "transcribing", completedParts: 0, totalParts: 0, attemptId: newAttemptId(), error: "Your recording and completed work have been recovered. Resume to continue without another credit.", createdAt: payment.createdAt, updatedAt: now });
} });
export const readLegacyArtifact = internalAction({ args: { generationId: v.string(), userId: v.id("users"), eventId: v.id("generationEvents") }, returns: v.string(), handler: async (ctx, args): Promise<string> => {
  const data: { events: Doc<"generationEvents">[] } = await ctx.runQuery(internal.generation.legacyArtifacts, { generationId: args.generationId, userId: args.userId });
  const event = data.events.find(e => e._id === args.eventId);
  if (!event) throw new Error("Legacy event ownership mismatch.");
  const blob = await ctx.storage.get(event.artifactStorageId); if (!blob) throw new Error("Legacy artifact missing."); return blob.text();
} });

export const workflowComplete = internalMutation({
  args: { workflowId: vWorkflowId, result: vResultValidator, context: v.object(attemptArgs) }, returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    const d = await ctx.db.get(args.context.draftId);
    if (!d || d.attemptId !== args.context.attemptId || d.status === "ready" || d.status === "published" || d.status === "failed") return null;
    await ctx.runMutation(internal.generation.fail, { ...args.context, error: "error" in args.result ? args.result.error : "Generation stopped before its result was saved." });
    return null;
  }
});

export const resumeRecovered = internalMutation({ args: { draftId }, returns: v.null(), handler: async (ctx, args): Promise<null> => {
  const d = await requireAttempt(ctx, args.draftId);
  if (d.status !== "failed") return null;
  const attemptId = newAttemptId();
  await ctx.db.patch(d._id, { attemptId, status: "queued", error: undefined, updatedAt: Date.now() });
  const workflowId = await workflow.start(ctx, internal.generationWorkflow.run, { draftId: d._id, attemptId }, { startAsync: true, onComplete: internal.generation.workflowComplete, context: { draftId: d._id, attemptId } });
  await ctx.db.patch(d._id, { workflowId }); return null;
} });
export const mediaOwnership = internalQuery({ args: { backendToken: v.string(), draftId, storageId: v.id("_storage") }, returns: v.object({ direct: v.boolean(), partsArtifact: v.union(v.id("_storage"), v.null()) }), handler: async (ctx, args) => {
  requireBackend(args.backendToken); const d = await requireAttempt(ctx, args.draftId);
  if (d.audioStorageId === args.storageId) return { direct: true, partsArtifact: null };
  const image = await ctx.db.query("storybookImages").withIndex("by_storage_id", q => q.eq("storageId", args.storageId)).unique();
  if (image?.userId === d.userId && image.generationDraftId === d._id) return { direct: true, partsArtifact: null };
  return { direct: false, partsArtifact: (await checkpoint(ctx, d._id, "audio.parts"))?.artifactStorageId ?? null };
} });
export const serverMediaUrl = action({ args: { backendToken: v.string(), draftId, storageId: v.id("_storage") }, returns: v.union(v.string(), v.null()), handler: async (ctx, args): Promise<string | null> => {
  requireBackend(args.backendToken);
  const ownership: { direct: boolean; partsArtifact: Id<"_storage"> | null } = await ctx.runQuery(internal.generation.mediaOwnership, args);
  if (!ownership.direct) {
    const blob = ownership.partsArtifact ? await ctx.storage.get(ownership.partsArtifact) : null;
    const payload: unknown = blob ? JSON.parse(await blob.text()) : null;
    if (!payload || typeof payload !== "object" || !("parts" in payload) || !Array.isArray(payload.parts) || !payload.parts.some((p: unknown) => !!p && typeof p === "object" && "storageId" in p && p.storageId === args.storageId)) throw new ConvexError("This file does not belong to this saved story.");
  }
  return ctx.storage.getUrl(args.storageId);
} });

export const recordPhotoUpload = mutation({ args: { storageId: v.id("_storage"), fileName: v.string(), contentType: v.string(), size: v.number() }, returns: v.null(), handler: async (ctx, args) => {
  const userId = await getAuthUserId(ctx); if (!userId) throw new ConvexError("Sign in to upload family photos.");
  const existing = await ctx.db.query("generationPhotos").withIndex("by_storage_id", q => q.eq("storageId", args.storageId)).unique();
  if (existing) { if (existing.userId !== userId) throw new ConvexError("This photo belongs to another account."); return null; }
  const audio = await ctx.db.query("audioFiles").withIndex("by_storage_id", q => q.eq("storageId", args.storageId)).unique();
  const image = await ctx.db.query("storybookImages").withIndex("by_storage_id", q => q.eq("storageId", args.storageId)).unique();
  if ((audio && audio.userId !== userId) || (image && image.userId !== userId)) throw new ConvexError("This photo belongs to another account.");
  const metadata = await ctx.db.system.get(args.storageId);
  const types = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/heic", "image/heif"];
  if (!metadata || metadata.size < 1 || metadata.size > 10 * 1024 * 1024 || metadata.size !== args.size || metadata.contentType !== args.contentType || !types.includes(args.contentType)) throw new ConvexError("Upload a photo smaller than 10 MB in a supported image format.");
  await ctx.db.insert("generationPhotos", { ...args, fileName: args.fileName.slice(0, 255), userId, createdAt: Date.now() }); return null;
} });
