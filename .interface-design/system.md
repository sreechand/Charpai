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

## Generated book text editing — 2026-10-15

Use a separate paper working-copy form above the shared reader. Controls retain 44px minimum targets, 14px UI labels/help, story-serif fields and pen-blue focus. Keep 16px object gaps and 32px thought spacing around action/chapter groups. Apply with Regenerate storybook; Cancel edits restores the existing book and focus returns to Edit story text. Wrap the Download text/Export PDF action group on phones. Never export the old wording while editing is open. Desktop/390px browser checks passed.

## Photo flow release — 2026-10-16

Photo editing spans all intake upload-grid columns (`grid-column: 1 / -1`) and uses existing paper/ink, 16px object/32px thought spacing, shared 44px controls and visible focus. AI descriptions remain a separate reviewable suggestion with an explicit adoption action; manual chapter choice takes precedence. Original proportions/colours remain unchanged in mounted book leaves. Production desktop 1440px and phone 390px form/shared-reader checks, actual PDF rendering and text download pass. Published release details: `docs/PUBLISHING.md`.
