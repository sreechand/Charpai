# Storybook redesign — 2026-10-09

## Latest references: cloth-panel cover and single-ink illustrated pages

The user supplied a new cover reference and an illustrated interior reference, asked for a single colour and a matching image-generation prompt, and authorized completing the working update while away. This supersedes the earlier image-left/text-right arrangement.

Implemented a green cloth-like title panel across 38% of the cover and a full-height illustration panel across the remainder. Real titles/subtitles/dedications remain editable. Longer titles use smaller type; long dedications move into the opening prose without truncation. The inside now uses warm ivory paper, forest-green serif prose, italic headings, indented paragraphs, and one isolated artifact illustration near the bottom of each page. QR codes sit at the foot of the page. Full spreads render when the reader has enough space; otherwise pages stack, including the narrower editing panel. The fixed PDF layout is independent of that responsive presentation.

Updated `lib/storybook-image.ts` to specify exactly one forest-green ink (#264c3e), warm ivory paper (#f2eee3), carved/stippled detail, and one artifact occupying 65–75% of the source image height. Removed the previous multi-ink layers and misregistration instructions. The writing prompt now prohibits scene/landscape concepts and colour requests. Prompt version: `2026-10-09.2`. An inline SVG ink treatment unifies older coloured images and clears pale paper backgrounds; verified this treatment also survives PDF export.

### Verified for this version

- Real app generation through the existing API, using a fictional two-memory interview, created and stored a fresh single-green-ink tumbler and ruler. No payment was charged; synthetic development access was used.
- Reviewed the cover and full interior spread in Chrome. Fixed an unwanted rectangle in the ink filter and compressed phone-page heights during visual checks. Phone preview at 393×852 has no horizontal overflow, and prose precedes artwork without overlap. Restored the browser viewport afterward.
- Exported and rendered the current three-page sample PDF; all pages visually reviewed. Cover, warm paper, green ink, paragraphs, artifact images and QR link annotations survive export.
- Both rendered QR codes decoded to `http://localhost:3017/s/two-small-things-2v1p46513y633a0l`. A request without authentication cookies returned HTTP 200 with the correct restored title and story prose. This is local verification; cross-device phone scanning requires a released export using the live website address.
- Temporarily extended only the fictional development book with a near-maximum title/subtitle, a long dedication and repeated prose. Measured all eight reading pages: prose/artwork clearance ranged from 41px upward. Exported and visually reviewed its nine-page PDF, including the final-word marker. The full title/credit fit the fixed cover page. Restored the original short sample afterward at the same URL.
- Ten automated tests pass. Final lint, TypeScript and production build pass. Production was not changed for this feature; no commit/push was performed.

Current sample: `output/pdf/storybook-style-preview.pdf`. Working local preview: `http://localhost:3017/s/two-small-things-2v1p46513y633a0l`. PDF pages are high-resolution images and text is not selectable. Next: review the current sample and authorize production release separately.

The sections below record earlier iterations and their historical verification.

## Image-left / text-right correction

The user clarified that each spread must put the artifact illustration on the left and story prose on the right. The shared reader and PDF now render paired pages for each measured text chunk: QR/title/large single-object illustration on the left, heading and prose on the right. Navigation advances by complete spreads. On phones the pair stacks vertically; exported pages retain fixed A5 dimensions and the same image/text order. Increased the measured prose capacity to use the separate text page.

Verified the actual browser DOM positions: left page contains an image and no prose; right page contains prose and no image. Exported and visually reviewed all five pages of the updated two-story sample. Scanned the rendered QR codes on PDF pages 2 and 4 using macOS Vision: both decoded to the exact saved story URL. Followed the QR link in Chrome and separately fetched it without any authentication cookie: HTTP 200 and the expected title and story body. This is a local development URL; scanning it on another device requires a released export using the live website origin. Production was not changed.

Ten tests, lint and production build passed for the layout correction. A final minor correction hides the misleading save message while an already-saved story is loading its browser origin. Sample PDF replaced at `output/pdf/storybook-style-preview.pdf`. Next: review the corrected sample, then approve release to the live app.

The earlier layout and verification below are historical; the paired-page layout above supersedes the prior illustration-and-prose-on-each-page arrangement.

The user requested the supplied green-cover and white-book-spread style, larger serif text, a QR linking to the specific saved story, one relevant rubber-stamp artifact per story page, and a PDF retaining formatting.

Implemented a shared reader for the editor and saved story: green cover, white pages, 22px print-layout prose, 34px headings, previous/next controls, desktop spreads and single-page phone reading. Text is measured and split across pages rather than clipped. Continuation pages repeat their section's single artifact. Long dedications move into the measured opening prose; long cover titles use a compact layout.

Generation now selects a source-supported artifact and brief for each section, then generates and stores each image independently using the single-object rubber-stamp prompt. Individual image failures produce warnings without discarding successful siblings. The writing prompt avoids invented facts and padding. Old stories remain readable with their legacy first illustration; additional old-story artwork is not generated automatically.

Saved stories resolve owned section images. Publishing edits updates the existing owned page and keeps its URL stable. Every story-page QR encodes that page's actual absolute URL; unsaved previews show a save message instead. Export saves current edits before generating the PDF. Export tracking runs after the PDF download is started.

PDF output captures fixed 640×908 page layouts at 2.5× resolution and assembles A5 pages. Fonts, images, colors and QR positions are preserved, independent of phone/desktop viewport. QR areas are also clickable PDF links. PDF text is rendered into page images, so it is not searchable/selectable. Local test PDFs contain localhost links; released exports will use the live origin. Photos remain in the editing gallery; the book uses the requested artifact illustrations.

## Verified

- Ten automated tests pass: prose/paragraph preservation including scripts without spaces, partial illustration failure, image ownership, unauthorized access rejection, stable publication URL, older-story compatibility and existing payment behavior.
- Type checking and production build pass. Lint passes after removing a test-script warning.
- Development backend pushed to `qualified-bullfrog-386`; no production release for this feature.
- Real AI generation using a fictional two-section interview produced a single copper tumbler and a single wooden ruler, stored and published independently. Synthetic development payment access was used; no payment was charged.
- Opened the saved book in Chrome, reviewed pages on desktop and phone layout, and downloaded PDFs through the actual Export PDF button.
- Rendered and visually reviewed all three sample PDF pages. Desktop and phone exports have identical rendered pixels. Both QR codes decoded to the exact saved story URL; PDF link annotations match.
- A 4,508-character development edit saved without truncation and kept its URL. Chrome displayed 12 reading pages. Downloaded the 13-page long-book PDF, rendered every page into a review montage, and checked the last-word marker at full size. All 12 story-page PDF links are present. The fictional story was restored afterward. Earlier blank preview recovered when browser tools were reconnected; no console error was present.

Sample: `output/pdf/storybook-style-preview.pdf`. Reproducible real-generation check: `scripts/check-storybook-generation.mjs` (development only; creates fictional test data and makes AI calls).

Next: review the sample, then obtain explicit approval for a production release. Existing live checkout configuration is a separate outstanding task.

## Production release — 2026-10-13

The user authorized publishing all reviewed changes using the existing website host. The updated reader, illustration prompts, pagination/PDF code and section artifact backend fields were released alongside the landing page to `https://charpai.sreechand.pm` and production Convex `elegant-mosquito-650`. Existing automated reader/payment/update tests and production builds pass. The workspace remains gated by `CHARPAI_LAUNCHED=false`; public story routes remain available. This release did not generate a new paid production storybook or rerun a production PDF/QR export. Earlier development generation, PDF and QR checks above remain the end-to-end evidence for those workflows. Production deployment ID: `dpl_2GHQSLuD263APbCVM2nrAGqe1ZcC`.
