import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const storySection = v.object({
  id: v.string(),
  heading: v.string(),
  body: v.string()
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

  paymentOrders: defineTable({
    userId: v.id("users"),
    orderId: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.union(v.literal("created"), v.literal("paid")),
    paymentId: v.optional(v.string()),
    createdAt: v.number(),
    paidAt: v.optional(v.number())
  }).index("by_order_id", ["orderId"])
    .index("by_user_id_and_status", ["userId", "status"]),

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
    .index("by_slug", ["slug"])
    .index("by_owner_id_and_status", ["ownerId", "status"]),

  waitlist: defineTable({
    name: v.string(),
    email: v.string(),
    note: v.optional(v.string()),
    createdAt: v.number()
  }).index("by_email", ["email"])
});
