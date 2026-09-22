# Charpai Design System Integration

Source inspected: `https://github.com/sreechand/Charpai-Design-System-v1.0` at `8722c94975afe806e6d3dc8bff04d46723c8e927`.

## Direction

Generated storybooks must feel like memory worlds, not generic nostalgic scrapbooks. Each book should be derived from the transcript's period, geography, artifacts, narrator, and recollection.

Use high-quality uncoated paper, documentary labels, mounted artifacts, and quiet physical construction. Avoid aged/stained paper, decorative vintage styling, generic sepia, decorative clutter, and decade themes.

## Tokens

- Paper: `#F4F0E5`, deep paper `#EDE7D8`, edge `#E2DAC6`, mount `#E9E2D0`.
- Ink: `#241F1B`, soft `#554C42`, faint `#8A8074`, rule `#CFC6B2`.
- Memory colors: oxide `#9C4A2F`, pen blue `#2C3E5C`, banyan `#4F5F3C`, wrapper gold `#D7A84A`, uniform green `#3F5147`, teak `#6B4A2B`, test-card teal `#2E6C79`, carbon violet `#6A4E7C`, chrome `#8C9196`.
- Type: story serif `Gentium Book Plus, Georgia, serif`; UI/documentary `Inter, system-ui, sans-serif`; handwriting `Caveat/Kalam/cursive`.
- Spacing: touch `8px`, object `16px`, thought `32px`, scene `48-80px`, breath `72-128px`, silence `120-240px`.
- Depth: physical state only: mounted, loose, lifted, overlay. Do not use elevation for importance.

## Generated Draft Contract

Every generated `StorybookDraft` includes `designSystem` with:

- `memoryWorldLabel`
- `accent`
- `deep`
- `handInk`
- `handStyle`
- `constructionNotes`
- `artifactForms`

The prompt in `lib/storybook.ts` requires these fields and asks the model to select colors and page constructions from the Charpai system.

## Reusable Patterns

- Editable book spread: `article.book` sets per-draft `--memory-accent`, `--memory-deep`, and `--hand-ink`.
- Poster/stamp illustration: uses the memory variables and minimal artifact forms.
- Controls: UI font, 44px hit areas, quiet borders, focus rings in pen blue.
- Print output: paper background and no app chrome.
