import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const storySection = v.object({
  id: v.string(),
  heading: v.string(),
  body: v.string(),
  artifactSubject: v.optional(v.string()),
  artifactBrief: v.optional(v.string()),
  illustrationStorageId: v.optional(v.id("_storage"))
});

const charpaiDraftDesign = v.object({
  memoryWorldLabel: v.string(),
  accent: v.string(),
  deep: v.string(),
  handInk: v.string(),
  handStyle: v.string(),
  constructionNotes: v.string(),
  artifactForms: v.array(v.string())
});

export default defineSchema({
  ...authTables,

  emailNotifications: defineTable({
    key: v.string(),
    kind: v.union(v.literal("waitlist_signup"), v.literal("account_signup"), v.literal("login"), v.literal("generation_started"), v.literal("generation_ready"), v.literal("generation_failed")),
    userId: v.optional(v.id("users")),
    waitlistId: v.optional(v.id("waitlist")),
    generationId: v.optional(v.string()),
    title: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("queued"), v.literal("skipped")),
    emailIds: v.optional(v.array(v.string())),
    createdAt: v.number(),
    queuedAt: v.optional(v.number())
  }).index("by_key", ["key"]).index("by_status", ["status"]),

  paymentOrders: defineTable({
    userId: v.id("users"),
    orderId: v.string(),
    creditsPerPurchase: v.optional(v.number()),
    parentOrderId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    status: v.union(v.literal("created"), v.literal("paid")),
    paymentId: v.optional(v.string()),
    createdAt: v.number(),
    paidAt: v.optional(v.number()),
    generationId: v.optional(v.string()),
    inputJson: v.optional(v.string()),
    runId: v.optional(v.id("runs")),
    mode: v.optional(v.union(v.literal("full"), v.literal("split"))),
    transcribeHash: v.optional(v.string()),
    composeHash: v.optional(v.string()),
    transcribeResponse: v.optional(v.string()),
    composeResponse: v.optional(v.string()),
    lock: v.optional(v.object({ token: v.string(), stage: v.string(), startedAt: v.number() }))
  }).index("by_order_id", ["orderId"])
    .index("by_user_id_and_status", ["userId", "status"])
    .index("by_available", ["userId", "status", "generationId"])
    .index("by_generation", ["userId", "generationId"])
    .index("by_generationId", ["generationId"])
    .index("by_unfinished", ["userId", "status", "runId"]),

  generationDrafts: defineTable({
    userId: v.id("users"), generationId: v.string(), paymentOrderId: v.id("paymentOrders"),
    inputJson: v.string(), audioStorageId: v.id("_storage"), photoStorageIds: v.optional(v.array(v.id("_storage"))), fileName: v.string(), title: v.string(),
    status: v.union(v.literal("queued"), v.literal("running"), v.literal("failed"), v.literal("ready"), v.literal("published")),
    stage: v.union(v.literal("preparing"), v.literal("transcribing"), v.literal("understanding"), v.literal("writing"), v.literal("illustrating"), v.literal("ready")),
    completedParts: v.number(), totalParts: v.number(), attemptId: v.string(), workflowId: v.optional(v.string()),
    runId: v.optional(v.id("runs")), error: v.optional(v.string()), createdAt: v.number(), updatedAt: v.number()
  }).index("by_userId", ["userId"]).index("by_generationId", ["generationId"]),
  generationPhotos: defineTable({
    userId: v.id("users"), storageId: v.id("_storage"), fileName: v.string(), contentType: v.string(), size: v.number(), createdAt: v.number()
  }).index("by_storage_id", ["storageId"]).index("by_userId", ["userId"]),
  generationCheckpoints: defineTable({
    draftId: v.id("generationDrafts"), key: v.string(), artifactStorageId: v.id("_storage"),
    model: v.optional(v.string()), providerRequestId: v.optional(v.string()), createdAt: v.number()
  }).index("by_draftId_and_key", ["draftId", "key"]),

  productEvents: defineTable({
    userId: v.id("users"), name: v.string(), createdAt: v.number(),
    generationId: v.optional(v.string()), elapsedMs: v.optional(v.number()),
    bytes: v.optional(v.number()), contentType: v.optional(v.string()), error: v.optional(v.string())
  }).index("by_user_id", ["userId"]).index("by_name", ["name"]),

  generationRequests: defineTable({
    userId: v.id("users"),
    generationId: v.string(),
    stage: v.union(v.literal("full"), v.literal("transcribe"), v.literal("compose")),
    status: v.union(v.literal("started"), v.literal("succeeded"), v.literal("failed")),
    promptVersion: v.string(),
    createdAt: v.number(),
    finishedAt: v.optional(v.number()),
    elapsedMs: v.optional(v.number()),
    httpStatus: v.optional(v.number()),
    error: v.optional(v.string()),
    warning: v.optional(v.string())
  }).index("by_user_id", ["userId"]).index("by_generation_id", ["generationId"]),

  generationEvents: defineTable({
    requestId: v.id("generationRequests"),
    userId: v.id("users"),
    name: v.string(),
    status: v.union(v.literal("succeeded"), v.literal("failed")),
    model: v.optional(v.string()),
    providerRequestId: v.optional(v.string()),
    elapsedMs: v.number(),
    artifactStorageId: v.id("_storage"),
    createdAt: v.number()
  }).index("by_request_id", ["requestId"]).index("by_user_id", ["userId"]),

  runs: defineTable({
    generationId: v.optional(v.string()),
    accessKey: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    buyerName: v.string(),
    email: v.string(),
    elderName: v.string(),
    relationship: v.string(),
    originPlace: v.string(),
    languageMix: v.string(),
    paymentReference: v.optional(v.string()),
    paymentStatus: v.optional(v.union(v.literal("pending"), v.literal("received"))),
    audioStorageId: v.optional(v.id("_storage")),
    status: v.union(
      v.literal("created"),
      v.literal("generating"),
      v.literal("draft_ready"),
      v.literal("exported"),
      v.literal("failed")
    ),
    hasAudio: v.boolean(),
    photoCount: v.number(),
    title: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_user_id", ["userId"])
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  audioFiles: defineTable({
    userId: v.id("users"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    contentType: v.optional(v.string()),
    size: v.number(),
    createdAt: v.number()
  })
    .index("by_storage_id", ["storageId"])
    .index("by_user_id", ["userId"]),

  storybookImages: defineTable({
    userId: v.id("users"),
    generationDraftId: v.optional(v.id("generationDrafts")),
    storageId: v.id("_storage"),
    contentType: v.string(),
    size: v.number(),
    model: v.string(),
    createdAt: v.number()
  })
    .index("by_storage_id", ["storageId"])
    .index("by_user_id", ["userId"]),

  storybookPages: defineTable({
    ownerId: v.id("users"),
    runId: v.optional(v.id("runs")),
    slug: v.string(),
    status: v.union(v.literal("published"), v.literal("deleted")),
    title: v.string(),
    subtitle: v.string(),
    dedication: v.string(),
    languageNote: v.string(),
    sections: v.array(storySection),
    closingNote: v.string(),
    illustrationBrief: v.string(),
    stampSubject: v.string(),
    stampMotifs: v.array(v.string()),
    illustrationStorageId: v.optional(v.id("_storage")),
    photoCaptions: v.array(v.string()),
    designSystem: charpaiDraftDesign,
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number())
  })
    .index("by_run", ["runId"])
    .index("by_slug", ["slug"])
    .index("by_owner_id_and_status", ["ownerId", "status"]),

  waitlist: defineTable({
    name: v.string(),
    email: v.string(),
    note: v.optional(v.string()),
    phone: v.optional(v.string()),
    consentAt: v.optional(v.number()),
    createdAt: v.number()
  }).index("by_email", ["email"])
});
