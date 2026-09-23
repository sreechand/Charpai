import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  runs: defineTable({
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

  waitlist: defineTable({
    name: v.string(),
    email: v.string(),
    note: v.optional(v.string()),
    createdAt: v.number()
  }).index("by_email", ["email"])
});
