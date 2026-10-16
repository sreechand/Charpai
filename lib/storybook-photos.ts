import type {StoryPhoto, StorySection} from "./storybook";

export const MAX_STORY_PHOTOS = 3;
export const MAX_PHOTO_TITLE = 120;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export function normalizePhotos(value: unknown): StoryPhoto[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > MAX_STORY_PHOTOS) throw new Error("Choose up to three family photos.");
  const ids = new Set<string>();
  return value.map((raw, index) => {
    if (!raw || typeof raw !== "object") throw new Error("A family photo is incomplete.");
    const photo = raw as Partial<StoryPhoto>;
    const id = typeof photo.id === "string" && photo.id ? photo.id : `photo-${index + 1}`;
    if (ids.has(id)) throw new Error("Each family photo must have a different ID.");
    ids.add(id);
    const title = typeof photo.title === "string" ? photo.title : "";
    if (title.length > MAX_PHOTO_TITLE) throw new Error(`Keep photo titles within ${MAX_PHOTO_TITLE} characters. The description can hold the rest.`);
    return {id, title, description: typeof photo.description === "string" ? photo.description : "",
      ...(typeof photo.storageId === "string" && photo.storageId ? {storageId: photo.storageId} : {}),
      ...(typeof photo.url === "string" && photo.url ? {url: photo.url} : {}),
      ...(typeof photo.sectionId === "string" && photo.sectionId ? {sectionId: photo.sectionId} : {}),
      ...(typeof photo.suggestedSectionId === "string" && photo.suggestedSectionId ? {suggestedSectionId:photo.suggestedSectionId} : {})};
  });
}

/** Suggest from the user's own caption; uncertain matches belong at the end. */
export function photoSection(photo: StoryPhoto, sections: StorySection[]) {
  if (photo.sectionId && sections.some(section => section.id === photo.sectionId)) return photo.sectionId;
  if (photo.suggestedSectionId && sections.some(section=>section.id===photo.suggestedSectionId))return photo.suggestedSectionId;
  const tokens = (text: string) => new Set((text.toLowerCase().match(/[\p{L}\p{M}\p{N}]+/gu) || []).filter(word => word.length > 2 && !["the", "and", "our", "this", "that", "with", "from", "photo", "photograph", "picture"].includes(word)));
  const caption = tokens(`${photo.title} ${photo.description}`);
  const scored = sections.map(section => {
    const heading = tokens(section.heading), body = tokens(section.body);
    const matches = [...caption].filter(token => heading.has(token) || body.has(token));
    return {id: section.id, matches: matches.length, score: matches.reduce((sum, token) => sum + (heading.has(token) ? 4 : 1), 0)};
  }).sort((a,b) => b.score-a.score);
  return scored[0]?.matches >= 2 && scored[0].score > (scored[1]?.score ?? 0) ? scored[0].id : sections.at(-1)?.id;
}
