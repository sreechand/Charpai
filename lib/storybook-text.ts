import type { StorybookDraft } from "./storybook";

type BookText = Pick<StorybookDraft, "title" | "subtitle" | "coverSubtitle" | "dedication" | "sections" | "closingNote"> & {photos?: {title: string; description: string}[]};

export function storybookText(story: BookText) {
  return [story.title, story.coverSubtitle !== story.subtitle ? story.coverSubtitle : "", story.subtitle,
    story.dedication,
    ...story.sections.flatMap(section => [section.heading, section.body]),
    story.closingNote,
    ...(story.photos || []).flatMap(photo => [photo.title, photo.description])
  ].filter(text => text?.trim()).join("\n\n") + "\n";
}

export function storybookTextFilename(title: string) {
  const name = title.normalize("NFC").replace(/[^\p{L}\p{M}\p{N}\u200c\u200d]+/gu, "_").replace(/^_+|_+$/g, "") || "Storybook";
  return `Charpai_${name}.txt`;
}

export function applyStoryText(current: StorybookDraft, edited: StorybookDraft): StorybookDraft {
  let narrativeChanged = current.closingNote !== edited.closingNote;
  const sections = current.sections.map(section => {
    const update = edited.sections.find(item => item.id === section.id);
    if (!update) return section;
    const bodyChanged = section.body !== update.body;
    narrativeChanged ||= bodyChanged || section.heading !== update.heading;
    return {...section, heading: update.heading, body: update.body,
      // Paragraph timestamps cannot be trusted after their text changes.
      ...(bodyChanged ? {sourceLinks: undefined} : {})};
  });
  return {...current, title: edited.title, subtitle: edited.subtitle, coverSubtitle: edited.coverSubtitle,
    dedication: edited.dedication, closingNote: edited.closingNote, shareRecording: edited.shareRecording,
    sections, ...(current.coverage !== undefined || current.coverageNeedsReview !== undefined
      ? {coverageNeedsReview: current.coverageNeedsReview || (Boolean(current.coverage) && narrativeChanged)} : {})};
}

export function downloadStorybookText(story: BookText) {
  const url = URL.createObjectURL(new Blob(["\uFEFF", storybookText(story)], {type: "text/plain;charset=utf-8"}));
  const link = document.createElement("a");
  link.href = url;
  link.download = storybookTextFilename(story.title);
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
