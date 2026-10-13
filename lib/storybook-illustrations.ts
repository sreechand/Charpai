import type { StorybookDraft, StorySection } from "./storybook";

export async function illustrateStorySections(
  draft: StorybookDraft,
  generate: (section: StorySection) => Promise<{ storageId: string; url: string }>
) {
  const results = await Promise.allSettled(draft.sections.map(async section => {
    if (!section.artifactSubject || !section.artifactBrief) {
      throw new Error(`No source-supported artifact was selected for “${section.heading}”.`);
    }
    const image = await generate(section);
    section.illustrationStorageId = image.storageId;
    section.illustrationUrl = image.url;
  }));
  draft.illustrationStorageId = draft.sections[0]?.illustrationStorageId || "";
  draft.illustrationUrl = draft.sections[0]?.illustrationUrl || "";
  return results.flatMap((result, index) => result.status === "rejected"
    ? [`Artwork for “${draft.sections[index].heading}” could not be created. ${result.reason instanceof Error ? result.reason.message : "Please try again."}`]
    : []).join(" ");
}
