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
