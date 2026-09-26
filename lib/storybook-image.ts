import type { StorybookDraft } from "@/lib/storybook";

export function buildStorybookImagePrompt(draft: StorybookDraft) {
  return `
Use case: stylized-concept
Asset type: square storybook field-note illustration

Primary subject: ${draft.stampSubject}
Story-specific visual direction: ${draft.illustrationBrief}
Essential forms already identified from the story: ${draft.stampMotifs.join(", ")}
Memory context: ${draft.designSystem.memoryWorldLabel}

First use your visual knowledge of the subject to determine its most distinctive and recognisable forms. Do not create a generic interpretation. Select only the minimum visual information needed for the subject to be immediately identifiable. Preserve defining proportions, structure, and spatial relationships. Use only three to six essential forms or relationships.

Composition and paper:
- 1:1 square composition.
- Cover the entire frame with warm off-white aged paper with subtle fibres, natural grain, faint usage marks, and a matte finish.
- Preserve large areas of completely unprinted paper; whitespace is essential.
- Place one horizontally organised, multi-colour rubber-stamp impression in the lower-middle.
- The complete stamped scene occupies only 30%–38% of the image height, with generous blank space around it and especially above it.
- Keep it a small field-note impression, never a conventional full-page illustration, logo, seal, or poster.
- No box, circle, border, or defined frame.

Subject interpretation:
- For a place, prioritize one unmistakable landmark with a restrained suggestion of surrounding geography.
- For an object or food, prioritize its characteristic silhouette, construction, segmentation, layers, or packaging cue.
- For an interior or remembered scene, retain only the main spatial anchors and story-bearing objects.
- Do not assemble a catalogue. Remove people, crowds, vehicles, repetitive buildings, dense windows, excessive vegetation, decorative objects, and background clutter.

Colour:
- Use two to four desaturated spot inks appropriate to this exact subject.
- Use one dark ink for primary contours, one distinctive subject colour, and at most two restrained secondary colours.
- Let the paper create highlights and pale areas. Avoid large areas of solid colour.

Rubber-stamp treatment:
- Render every colour as a separately hand-stamped layer.
- Authentic carved-rubber texture, hand-engraved marks, uneven line widths, irregular contour notches, fractured edges, dry ink shortages, granular deposits, pinholes, paper show-through, uneven pressure, faint partial ghosting, and approximately 1–2 mm natural colour misregistration.
- Rough analog edges, never digitally smooth. It must look like a real hand-carved stamp pressed onto fibrous paper, not a photograph with a filter.

Mood: quiet, restrained, tactile, culturally and regionally specific, slightly nostalgic, collectible—like a field note kept by an architect, engineer, travel writer, or natural observer.

Text: no captions, titles, dates, labels, decorative lettering, slogans, repeated branding, or watermarks. Only if a word or marking is intrinsic to recognizing the subject may it appear once, small and imperfectly stamped.

Avoid: full-page illustration, photographic realism, glossy product photography, advertisements, tourist souvenir templates, monument montages, generic city icons, smooth vector graphics, clean line-art logos, circular seals, Chinese red stamps, postage perforations, wax seals, stickers, collage layouts, dense detail, decorative clutter, childish craft styles, cartoons, 3D rendering, plastic textures, glossy gradients, oversaturation, borders, captions, and watermarks.
`.trim();
}
