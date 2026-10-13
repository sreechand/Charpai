/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";
import { demoDraft, normalizeDraft } from "../lib/storybook";
import { buildStorybookImagePrompt } from "../lib/storybook-image";
import { illustrateStorySections } from "../lib/storybook-illustrations";
import { paginateStoryText } from "../lib/storybook-pagination";
const modules = import.meta.glob("./**/*.ts");

test("pagination retains all words, paragraphs and long unbroken script", () => {
  const prose = "I carried the copper tumbler.\n\n" + "These are my words. ".repeat(200);
  const pages = paginateStoryText(prose, 90, text => Math.ceil(text.length / 30) * 30);
  expect(pages.length).toBeGreaterThan(2);
  expect(pages.join(" ").replace(/\s+/g, " ").trim()).toBe(prose.replace(/\s+/g, " ").trim());
  expect(pages[0]).toContain("\n\n");
  expect(pages.every(page => Math.ceil(page.length / 30) * 30 <= 90)).toBe(true);
  const script = "家族の思い出".repeat(60);
  const parts = paginateStoryText(script, 10, text => Array.from(text).length);
  expect(parts.join("")).toBe(script);
  expect(parts.every(part => part.length <= 10)).toBe(true);
});

test("one artifact per section is generated and successful images survive a sibling failure", async () => {
  const draft = normalizeDraft({ ...demoDraft(), sections: [
    { id: "a", heading: "Coffee", body: "My coffee.", artifactSubject: "Coffee tumbler", artifactBrief: "One ribbed metal tumbler" },
    { id: "b", heading: "School", body: "My ruler.", artifactSubject: "Ruler", artifactBrief: "One wooden ruler" }
  ] });
  const subjects: string[] = [];
  const warning = await illustrateStorySections(draft, async section => {
    subjects.push(section.artifactSubject!);
    expect(buildStorybookImagePrompt(draft, section)).toContain("exactly ONE isolated physical artifact");
    expect(buildStorybookImagePrompt(draft, section)).toContain(`Primary subject: ${section.artifactSubject}`);
    if (section.id === "b") throw new Error("Synthetic image failure");
    return { storageId: "test-image", url: "https://example.invalid/tumbler.webp" };
  });
  expect(subjects).toEqual(["Coffee tumbler", "Ruler"]);
  expect(draft.sections[0].illustrationStorageId).toBe("test-image");
  expect(warning).toContain("School");
  expect(warning).not.toContain("Coffee");
});

test("saved section images resolve publicly, reject another user's images, and keep the same QR URL after edits", async () => {
  const t = convexTest(schema, modules);
  const seeded = await t.run(async ctx => {
    const owner = await ctx.db.insert("users", { email: "owner@example.invalid" });
    const other = await ctx.db.insert("users", { email: "other@example.invalid" });
    const run = await ctx.db.insert("runs", { userId: owner, buyerName: "", email: "", elderName: "Test", relationship: "Parent", originPlace: "Home", languageMix: "English", hasAudio: true, photoCount: 0, status: "draft_ready", createdAt: 1, updatedAt: 1 });
    const image = await ctx.storage.store(new Blob(["test-image"], { type: "image/webp" }));
    await ctx.db.insert("storybookImages", { userId: owner, storageId: image, contentType: "image/webp", size: 10, model: "test", createdAt: 1 });
    const foreign = await ctx.storage.store(new Blob(["other-image"], { type: "image/webp" }));
    await ctx.db.insert("storybookImages", { userId: other, storageId: foreign, contentType: "image/webp", size: 11, model: "test", createdAt: 1 });
    return { owner, other, run, image, foreign };
  });
  const user = t.withIdentity({ subject: `${seeded.owner}|session` });
  const { illustrationUrl, illustrationStorageId, ...base } = demoDraft();
  void illustrationUrl; void illustrationStorageId;
  const draft = { ...base, sections: [{ id: "coffee", heading: "Coffee", body: "I kept this tumbler.", artifactSubject: "Coffee tumbler", artifactBrief: "One metal tumbler", illustrationStorageId: seeded.image }] };
  await expect(user.mutation(api.storybookPages.publish, { runId: seeded.run, draft: { ...draft, sections: [{ ...draft.sections[0], illustrationStorageId: seeded.foreign }] } })).rejects.toThrow(/access to this storybook image/);
  const page = await user.mutation(api.storybookPages.publish, { runId: seeded.run, draft });
  expect(page.sections[0].illustrationUrl).toBeTruthy();
  const publicPage = await t.query(api.storybookPages.getPublicBySlug, { slug: page.slug });
  expect(publicPage?.sections[0].artifactSubject).toBe("Coffee tumbler");
  expect(publicPage).not.toHaveProperty("transcript");
  expect(publicPage?.sections[0]).not.toHaveProperty("illustrationStorageId");
  const updated = await user.mutation(api.storybookPages.publish, { runId: seeded.run, draft: { ...draft, title: "A revised title" } });
  expect(updated.slug).toBe(page.slug);
  expect(updated.title).toBe("A revised title");
  await expect(t.withIdentity({ subject: `${seeded.other}|session` }).mutation(api.storybookPages.publish, { runId: seeded.run, draft })).rejects.toThrow(/access to this storybook run/);
});

test("old saved stories still resolve without new section fields", async () => {
  const t = convexTest(schema, modules);
  const draft = demoDraft();
  await t.run(async ctx => {
    const ownerId = await ctx.db.insert("users", {});
    await ctx.db.insert("storybookPages", { ownerId, slug: "old-story", status: "published", title: draft.title, subtitle: draft.subtitle, dedication: draft.dedication, languageNote: draft.languageNote, sections: draft.sections.map(({ id, heading, body }) => ({ id, heading, body })), closingNote: draft.closingNote, illustrationBrief: draft.illustrationBrief, stampSubject: "Tumbler", stampMotifs: [], photoCaptions: [], designSystem: draft.designSystem, createdAt: 1, updatedAt: 1 });
  });
  const page = await t.query(api.storybookPages.getPublicBySlug, { slug: "old-story" });
  expect(page?.sections).toHaveLength(3);
  expect(page?.sections[0].artifactSubject).toBe("Tumbler");
  expect(page?.sections[0].illustrationUrl).toBeNull();
});
