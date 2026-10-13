import type { StorybookDraft, StorySection } from "./storybook";

export function buildStorybookImagePrompt(draft: StorybookDraft, section?: StorySection) {
  return `
Use case: stylized-concept
Asset type: square storybook field-note illustration

Primary subject: ${section?.artifactSubject || draft.stampSubject}
Story-specific visual direction: ${section?.artifactBrief || draft.illustrationBrief}
Exactly ONE artifact. All carved forms must be parts of that same object. Never add a second object, scenic background, human figure, or collection.
Memory context: ${draft.designSystem.memoryWorldLabel}

First use your visual knowledge of the subject to determine its most distinctive and recognisable forms. Do not create a generic interpretation. Select only the minimum visual information needed for the subject to be immediately identifiable. Preserve defining proportions, structure, and spatial relationships. Use only three to six essential forms or relationships.

Composition and paper:
- 1:1 square composition.
- Cover the entire frame with warm ivory uncoated paper (#f2eee3), subtle fibres and a matte finish.
- Preserve large areas of completely unprinted paper; whitespace is essential.
- Place one single-colour hand-carved rubber-stamp illustration in the centre.
- The complete artifact occupies 65%–75% of the image height, with generous unprinted paper around it.
- Give it the quiet, delicate detail of a vintage illustrated storybook: expressive carved lines, stippled shading and paper showing through. Never a logo, seal, or poster.
- No box, circle, border, or defined frame.

Subject interpretation:
- Illustrate exactly ONE isolated physical artifact named in Primary subject.
- Preserve its characteristic silhouette, proportions, construction, segmentation, layers, and culturally specific details.
- Three to six essential forms means parts of this ONE artifact, never three to six separate objects.
- No scenery, landscapes, room arrangements, companion objects, supporting props, decorative flowers, people, or object collections.
- Do not illustrate the whole story. The one artifact carries the memory.

Colour:
- Exactly ONE printing ink: forest green #264c3e, on warm ivory paper #f2eee3.
- Every contour, shadow and detail uses that same green ink. Create lighter tones only through sparse dots, hatching, dry ink and paper show-through.
- No second ink, no natural object colours, no black outlines, no brown, copper, red, yellow or blue. The subject's real material must be shown through shape and marks, never additional colours.
- Let the unprinted paper create highlights. No coloured background scenery or painted gradients.

Rubber-stamp treatment:
- Render one hand-stamped ink layer only.
- Authentic carved-rubber texture, hand-engraved marks, uneven line widths, irregular contour notches, fractured edges, dry ink shortages, granular deposits, pinholes, paper show-through, uneven pressure and faint partial ghosting. No colour misregistration or multiple ink layers.
- Rough analog edges, never digitally smooth. It must look like a real hand-carved stamp pressed onto fibrous paper, not a photograph with a filter.

Mood: quiet, restrained, tactile, culturally and regionally specific, slightly nostalgic, collectible—like a field note kept by an architect, engineer, travel writer, or natural observer.

Text: no captions, titles, dates, labels, decorative lettering, slogans, repeated branding, or watermarks. Only if a word or marking is intrinsic to recognizing the subject may it appear once, small and imperfectly stamped.

Avoid: full-page illustration, photographic realism, glossy product photography, advertisements, tourist souvenir templates, monument montages, generic city icons, smooth vector graphics, clean line-art logos, circular seals, Chinese red stamps, postage perforations, wax seals, stickers, collage layouts, dense detail, decorative clutter, childish craft styles, cartoons, 3D rendering, plastic textures, glossy gradients, oversaturation, borders, captions, and watermarks.
`.trim();
}
