import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v, type Infer } from "convex/values";
import type { Id } from "./_generated/dataModel";

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

const storybookDraft = v.object({
  title: v.string(),
  subtitle: v.string(),
  coverSubtitle: v.optional(v.string()),
  dedication: v.string(),
  languageNote: v.string(),
  sections: v.array(storySection),
  closingNote: v.string(),
  transcript: v.string(),
  illustrationBrief: v.string(),
  stampSubject: v.string(),
  stampMotifs: v.array(v.string()),
  illustrationStorageId: v.optional(v.id("_storage")),
  photoCaptions: v.array(v.string()),
  designSystem: charpaiDraftDesign
});

const publicStorySection = v.object({
  id: v.string(), heading: v.string(), body: v.string(),
  artifactSubject: v.optional(v.string()), artifactBrief: v.optional(v.string()),
  illustrationUrl: v.union(v.string(), v.null())
});

const publicStorybookPage = v.object({
  _id: v.id("storybookPages"),
  slug: v.string(),
  title: v.string(),
  subtitle: v.string(),
  coverSubtitle: v.optional(v.string()),
  dedication: v.string(),
  languageNote: v.string(),
  sections: v.array(publicStorySection),
  closingNote: v.string(),
  illustrationBrief: v.string(),
  stampSubject: v.string(),
  stampMotifs: v.array(v.string()),
  illustrationUrl: v.union(v.string(), v.null()),
  photoCaptions: v.array(v.string()),
  designSystem: charpaiDraftDesign,
  createdAt: v.number(),
  updatedAt: v.number()
});

const storybookPageSummary = v.object({
  _id: v.id("storybookPages"),
  slug: v.string(),
  title: v.string(),
  subtitle: v.string(),
  createdAt: v.number(),
  updatedAt: v.number()
});

export const listMine = query({
  args: {},
  returns: v.array(storybookPageSummary),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const pages = await ctx.db
      .query("storybookPages")
      .withIndex("by_owner_id_and_status", (q) =>
        q.eq("ownerId", userId).eq("status", "published")
      )
      .order("desc")
      .take(50);

    return pages.map((page) => ({
      _id: page._id,
      slug: page.slug,
      title: page.title,
      subtitle: page.subtitle,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt
    }));
  }
});

export const getPublicBySlug = query({
  args: {
    slug: v.string()
  },
  returns: v.union(v.null(), publicStorybookPage),
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("storybookPages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!page || page.status !== "published") {
      return null;
    }

    return await toPublicPage(ctx, page);
  }
});

export const publish = mutation({
  args: {
    runId: v.optional(v.id("runs")),
    draft: storybookDraft
  },
  returns: publicStorybookPage,
  handler: async (ctx, args) => {
    const ownerId = await requireAuthUserId(ctx);
    if (!args.runId) throw new Error("A paid storybook is required to publish.");
    await requireOwnedRun(ctx, args.runId, ownerId);
    const existing = await ctx.db.query("storybookPages").withIndex("by_run", q => q.eq("runId", args.runId)).unique();
    if (args.draft.illustrationStorageId) {
      await requireOwnedStorybookImage(ctx, args.draft.illustrationStorageId, ownerId);
    }

    for (const section of args.draft.sections) {
      if (section.illustrationStorageId) {
        await requireOwnedStorybookImage(ctx, section.illustrationStorageId, ownerId);
      }
    }
    const now = Date.now();
    const draft = sanitizeDraft(args.draft);
    if (existing) {
      if (existing.ownerId !== ownerId || existing.status !== "published") {
        throw new Error("This storybook page is no longer available.");
      }
      await ctx.db.patch(existing._id, { ...draft, updatedAt: now });
      const updated = await ctx.db.get(existing._id);
      if (!updated) throw new Error("Saved page could not be loaded.");
      return await toPublicPage(ctx, updated);
    }
    const slug = await generateUniqueSlug(ctx, draft.title);
    const id = await ctx.db.insert("storybookPages", {
      ownerId,
      runId: args.runId,
      slug,
      status: "published",
      ...draft,
      createdAt: now,
      updatedAt: now
    });

    const page = await ctx.db.get(id);
    if (!page) {
      throw new Error("Published page could not be loaded.");
    }
    return await toPublicPage(ctx, page);
  }
});

export const deletePage = mutation({
  args: {
    pageId: v.id("storybookPages")
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const ownerId = await requireAuthUserId(ctx);
    const page = await ctx.db.get(args.pageId);
    if (!page) {
      throw new Error("Storybook page not found.");
    }
    if (page.ownerId !== ownerId) {
      throw new Error("You do not have access to this storybook page.");
    }
    if (page.status === "deleted") {
      return null;
    }

    const now = Date.now();
    await ctx.db.patch(args.pageId, {
      status: "deleted",
      deletedAt: now,
      updatedAt: now
    });
    return null;
  }
});

async function requireAuthUserId(ctx: MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Sign in to manage storybook pages.");
  }
  return userId;
}

async function requireOwnedRun(ctx: MutationCtx, runId: Id<"runs">, ownerId: Id<"users">) {
  const run = await ctx.db.get(runId);
  if (!run) {
    throw new Error("Storybook run not found.");
  }
  if (run.userId !== ownerId) {
    throw new Error("You do not have access to this storybook run.");
  }
}

async function requireOwnedStorybookImage(
  ctx: MutationCtx,
  storageId: Id<"_storage">,
  ownerId: Id<"users">
) {
  const image = await ctx.db
    .query("storybookImages")
    .withIndex("by_storage_id", (q) => q.eq("storageId", storageId))
    .unique();
  if (!image || image.userId !== ownerId) {
    throw new Error("You do not have access to this storybook image.");
  }
}

async function generateUniqueSlug(ctx: MutationCtx, title: string) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slug = `${slugPrefix(title)}-${randomToken()}`;
    const existing = await ctx.db
      .query("storybookPages")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!existing) {
      return slug;
    }
  }

  throw new Error("Could not generate a unique storybook link.");
}

function randomToken() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(36).padStart(2, "0")).join("");
}

function slugPrefix(title: string) {
  const prefix = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return prefix || "storybook";
}

function sanitizeDraft(draft: Infer<typeof storybookDraft>) {
  return {
    title: limitText(draft.title, 160) || "Untitled Charpai Story",
    subtitle: draft.subtitle,
    ...(draft.coverSubtitle !== undefined ? {coverSubtitle: draft.coverSubtitle} : {}),
    dedication: draft.dedication,
    languageNote: limitText(draft.languageNote, 500),
    sections: draft.sections.map((section, index) => ({
      id: limitText(section.id, 48) || `section-${index + 1}`,
      heading: section.heading,
      body: section.body,
      artifactSubject: limitText(section.artifactSubject || "", 180),
      artifactBrief: limitText(section.artifactBrief || "", 500),
      illustrationStorageId: section.illustrationStorageId
    })),
    closingNote: draft.closingNote,
    illustrationBrief: limitText(draft.illustrationBrief, 500),
    stampSubject: limitText(draft.stampSubject, 180),
    stampMotifs: draft.stampMotifs.map((motif) => limitText(motif, 80)).filter(Boolean).slice(0, 6),
    illustrationStorageId: draft.illustrationStorageId,
    photoCaptions: draft.photoCaptions
      .map((caption) => limitText(caption, 160))
      .filter(Boolean)
      .slice(0, 3),
    designSystem: {
      memoryWorldLabel: limitText(draft.designSystem.memoryWorldLabel, 160),
      accent: limitHex(draft.designSystem.accent, "#9C4A2F"),
      deep: limitHex(draft.designSystem.deep, "#4F5F3C"),
      handInk: limitHex(draft.designSystem.handInk, "#2C3E5C"),
      handStyle: limitText(draft.designSystem.handStyle, 120),
      constructionNotes: limitText(draft.designSystem.constructionNotes, 260),
      artifactForms: draft.designSystem.artifactForms
        .map((form) => limitText(form, 80))
        .filter(Boolean)
        .slice(0, 5)
    }
  };
}

async function toPublicPage(ctx: MutationCtx | QueryCtx, page: {
  _id: Id<"storybookPages">;
  slug: string;
  title: string;
  subtitle: string;
  coverSubtitle?: string;
  dedication: string;
  languageNote: string;
  sections: Array<{ id: string; heading: string; body: string; artifactSubject?: string; artifactBrief?: string; illustrationStorageId?: Id<"_storage"> }>;
  closingNote: string;
  illustrationBrief: string;
  stampSubject: string;
  stampMotifs: string[];
  illustrationStorageId?: Id<"_storage">;
  photoCaptions: string[];
  designSystem: {
    memoryWorldLabel: string;
    accent: string;
    deep: string;
    handInk: string;
    handStyle: string;
    constructionNotes: string;
    artifactForms: string[];
  };
  createdAt: number;
  updatedAt: number;
}) {
  const illustrationUrl = page.illustrationStorageId
    ? await ctx.storage.getUrl(page.illustrationStorageId)
    : null;
  return {
    _id: page._id,
    slug: page.slug,
    title: page.title,
    subtitle: page.subtitle,
    ...(page.coverSubtitle !== undefined ? {coverSubtitle: page.coverSubtitle} : {}),
    dedication: page.dedication,
    languageNote: page.languageNote,
    sections: await Promise.all(page.sections.map(async (section, index) => ({
      id: section.id, heading: section.heading, body: section.body,
      artifactSubject: section.artifactSubject || (index === 0 ? page.stampSubject : ""),
      artifactBrief: section.artifactBrief || (index === 0 ? page.illustrationBrief : ""),
      illustrationUrl: section.illustrationStorageId
        ? await ctx.storage.getUrl(section.illustrationStorageId)
        : index === 0 ? illustrationUrl : null
    }))),
    closingNote: page.closingNote,
    illustrationBrief: page.illustrationBrief,
    stampSubject: page.stampSubject,
    stampMotifs: page.stampMotifs,
    illustrationUrl,
    photoCaptions: page.photoCaptions,
    designSystem: page.designSystem,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt
  };
}

function limitText(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

function limitHex(value: string, fallback: string) {
  return /^#[0-9a-f]{6}$/i.test(value.trim()) ? value.trim() : fallback;
}
