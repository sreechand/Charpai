## Editable generated story text — production release preparation, 2026-10-15

Visible Edit story text opens a separate working copy. Regenerate storybook applies the exact title, cover/inner subtitle, dedication, chapter headings/bodies and closing note together; Cancel edits leaves the current book unchanged. Regeneration re-paginates the existing book without AI calls or credits. The shared reader offers a complete UTF-8 `.txt` download alongside PDF. Exports are hidden while text edits are open. Existing illustrations and original source artifacts stay intact.

Saved books now reload their latest saved text through an owner-checked Convex query by paid run; the original checkpoint no longer overwrites saved wording. Save changes updates the same unlisted story URL. Sign-in and ownership checks reject unrelated accounts. This release is built from the exact previously live PDF-template snapshot plus text editing/downloading and the small reopening fix. Other local source-review, original-photo management, cost tracking and Interview Assist changes remain unpublished.

Release checks: 79 tests pass, TypeScript/build pass, lint has no errors (three existing unused-variable warnings). BrowserOS neo verified the release's real editor/reader at desktop and 390px phone, exact English/Telugu wording, cancellation/validation/focus in earlier checks and an actual text download read back from disk. The release includes a new negative ownership/reopen test. Live account save/reopen remains to be checked with an authenticated account; no family data or generation credits are used for release tests. Production launch flag remains false. Deployment details will be recorded in `docs/PUBLISHING.md`.

# Storybook redesign — 2026-10-09

## Latest cover and QR refinements — 2026-10-14

Removed the two decorative vertical lines from the front artwork panel and the A FAMILY STORY label. Replaced the front-cover CHARPAI text with the selected transparent logo at a smaller 150-layout-pixel width. Existing title, subtitle, dedication and illustration remain.

The book now has exactly one QR, at the top right of its first text page (48 layout pixels from the top/right). Pagination reserves an 82-pixel header on that first page only, so longer stories continue without text overlap or lost words. Continuation and subsequent section pages have no QR; page numbers remain at the bottom. Left-image/right-text pairing and blank facing pages are retained.

Back-cover top 75% now uses the exact green crosshatch pattern from the front cover's cloth panel; lower 25% keeps the warm paper and existing bottom-centered 220-pixel logo. Neither uploaded artwork nor logo files were altered.

Verified with the saved Ba book: eight export pages, one QR/link annotation on PDF page 3 only, exact top-right margins and 75% back-cover split, no prose overflow, removed line pseudo-elements/series label, and front-cover logo. Revised covers and first text page rendered and visually inspected; the relocated QR decoded to the saved story URL. Lint, TypeScript, thirteen tests and production build pass. Released `dpl_GyFhwUw1aLFpUneXsDSCuA7UPusE`; actual live browser export passes the same page-count, QR and cover checks. No generation or credits used. Corrected PDF remains at `output/pdf/ba-and-the-draughty-house-facing-pages.pdf`. Next: user reviews the PDF or re-exports their existing book.

## Current layout: facing pages and back cover — 2026-10-14

User requested that an opened book have an illustration on the left and prose on the right, with a blank left page when relevant artwork is unavailable, plus a bottom-centered Charpai logo on the back cover. This supersedes the combined illustration/prose interior below; the cloth-panel front cover and single-ink styling remain.

Updated the shared reader/export DOM to render each measured text chunk as an illustration/text pair. A section's existing illustration accompanies its first spread; continuation spreads and sections without artwork have genuinely blank left pages, without placeholder captions. Text occupies the full right page with justified serif paragraphs, existing heading, page number and QR. Navigation advances one complete spread and includes the back cover. The original selected transparent 601 × 161 logo is served from `public/landing/charpai-back-cover-logo.png`, centered 52 layout pixels from the back-cover bottom with its aspect ratio preserved.

Export order is front cover, alternating left/right interior pages, back cover. A5 dimensions and 2.5× image capture are retained. PDF `/PageLayout /TwoPageRight` places the front cover alone and keeps even-numbered PDF pages on the left in compatible facing-page viewers. Export overflow checking now reserves space above the QR/footer. No story text, saved URL, illustrations, generation prompts or credits were changed.

Verified using the existing Ba story: eight pages (front cover, three pairs, back cover), one illustrated left page and two blank left pages, all prose preserved without overflow. All pages rendered and visually reviewed. Three rendered QR codes decoded at high-resolution PDF rendering to the exact saved story URL; their PDF link annotations match. A nine-times-longer text fixture on a phone-sized preview produced twenty export pages without clipping or lost prose, with continuation left pages blank and fixed 640 × 908 export dimensions.

Lint, TypeScript, thirteen tests and production build pass. Released to the existing website as `dpl_DPregsJT6rS7UUzfG5oD6gb4B5NV`. Actual live browser checks and Export PDF download pass, including facing-page order, eight pages, three QR link annotations and visible back cover. All eight rendered live-download pages match the visually reviewed PDF renders byte for byte. Corrected download: `output/pdf/ba-and-the-draughty-house-facing-pages.pdf` (ignored from source control). Next: review the corrected PDF or re-export existing books from the live app.

## Historical references: cloth-panel cover and single-ink illustrated pages

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

## Back-cover logo resource — 2026-10-14

The user selected the supplied under-bed Charpai wordmark as the back-cover logo for future PDF work and asked to keep it in the project resources. Saved the original unchanged at [charpai-back-cover-logo.png](../resources/branding/charpai-back-cover-logo.png), with its purpose recorded in [the branding resource notes](../resources/branding/README.md).

Verified the resource matches the supplied file byte for byte. It is a 601 × 161 transparent PNG. Preserve the aspect ratio and transparency when placing it on a back cover. This task stores the asset and decision only; no PDF layout, export behavior, commit, or publication was changed. Next: use this asset when implementing the PDF back cover.

## Magic Patterns reference review — 2026-10-14

Reference: https://project-chaarpai-dsv1.magicpatterns.app/. User requested a feature inventory to create books like this, not implementation or publication. Reviewed the family contents page, both stories, chronology, object/place/person threads, photo reverse, unfolded document, envelope and artifact close-up, Telugu translation, narration controls, stacked-object controls, and print layout with overlay and gatefold controls in Chrome.

This is an interactive reading/print-design reference. It does not expose an authoring workflow. The inventory below describes target capabilities, not verified gaps in the current Charpai app.

### Visible reading and organization features

- Family book title, places, keeper/compiler credit and year; counts of composed stories, held recordings and catalogued artifacts.
- Story contents with narrator, location, date, subtitle, evidence counts, composition date and print-ready status; recordings can remain held without becoming stories.
- Three entry paths: contents, chronology and threads. Chronology supports exact, approximate, relative, uncertain, life-stage and contested dates, including ranges and multiple alternatives.
- Object, place and person threads aggregate quotations across narrators and years, with links to composed stories and labels for held recordings/unrecorded telephone accounts. Objects retain their own dates and can change appearance across time.
- Family profiles with preferred/family name, full name, relationship, birth details, portrait, authentic handwriting sample when available, language/voice notes, recording count, duration and story count. Honest missing-photo/handwriting states.
- Long-form story reader with object-first opening, prose, attributed quotations, contextual captions, location/date and recording/translation credits; back, contents and next-story navigation.
- Telugu/English switching for the first story's prose and interface. The second story did not show a language switch.
- Original narrator audio controls, duration, play/pause/close and progress display. Controls opened successfully; audible playback, seeking and paragraph synchronization were not verified.
- Original photographs and documents alongside explicitly labelled drawn reconstructions. Captions state source, date, location, original/reconstructed status, damage and uncertainty. Story-level documented/remembered/reconstructed counts.
- Preservation of conflicting memories side by side without deciding unsupported facts; no invented handwriting or unsupported details.
- Photo front/back with handwriting, translation and uncertain date; hold-to-view-restored control; folded report card; envelope revealing pressed flowers; artifact inspection overlay with return to reading position; layered receipt/slip; separable photo stack.
- Hand-drawn route map with vivid/remembered/suggested/unknown legend and retrace control; television test-pattern reconstruction with replay control. Replay/restoration controls were present; their complete animations were not separately verified.
- Reader state messaging and retention of opened/flipped objects during navigation. Persistence across reload/devices was not tested. Reconstructed ambience is described separately from source audio; actual ambience playback was not verified.
- Warm ivory paper, restrained ink colours, serif prose, small metadata labels, generous whitespace, photographic mounts, aged-paper details, folds, authentic handwriting and deliberately incomplete drawings.
- Dedicated print-layout view with facing pages, page numbers, 240 × 280 mm trim specification, seven sample spreads, paper-stock specifications and binding/production notes. Header claims 28 pages; complete 28-page output was not demonstrated.
- Physical equivalents: mounted photo insert, reverse handwriting page, tracing-paper overlay, fold-out route map, glassine document pocket, restrained final page; image/document sizing without arbitrary crop/enlargement. Overlay and gatefold preview controls worked. No download/checkout/print-order workflow was shown.

### Creation tools inferred as necessary (not shown)

- Create/edit books and family profiles; record/upload audio; store original files, transcripts, translations, source timestamps and recording context.
- Upload/categorize photographs, front/back scans, documents, handwriting and keepsakes; attach them to people, memories, stories, objects and places. Preserve originals and store restorations separately.
- Extract memories, people, places, objects, date claims and quotations from transcripts; suggest story groupings and threads for human review; ask for missing/unclear details one question at a time.
- Compose editable stories in the narrator's voice, retaining all supplied narration/details per the user's existing requirement; report everything omitted and why. Track claims back to transcript/confirmed answers and preserve disagreements.
- Generate optional pencil/ink object drawings, maps and reconstructions from supported descriptions; mark them as reconstructions, show unknown details as unknown, and retain consistent object identity across dates. Never fabricate evidence or handwriting.
- Arrange reusable prose, quotation, photo, document, envelope, map, stacked-object and disagreement blocks. Choose the opening object, captions, language versions and applicable interactions.
- Review corrections, evidence labels and source links before publishing; retain versions, retry failed processing without losing recordings/edits, and regenerate only chosen material.
- Save relationships between books, people, recordings, memories, sources, artifacts, date claims, threads and story blocks. Apply owner/access rules to family material and let the keeper control sharing.
- Produce complete printable/PDF layouts from the same reviewed material, including pagination, original-resolution images, suitable Telugu fonts, facing pages and static equivalents of interactions. Specialty pockets/overlays/fold-outs additionally require production files and a printer able to manufacture them; a PDF alone does not create those constructions.
- Phone layouts, keyboard controls, image descriptions, readable contrast, reduced-motion behavior and reliable long-book rendering are necessary implementation checks; these were not audited in the reference.

The comparison and subsequent audio-linked clarification plan are recorded below. Build-order proposals are in ACTION_ITEMS.md. No application changes or deployments made for this review.

## Reference comparison — 2026-10-14

Status: findings from the earlier inspection in this conversation, not a fresh audit of the latest working tree or production. At that inspection, the existing 13 tests passed and the saved local sample at `http://localhost:3017/s/two-small-things-2v1p46513y633a0l` was opened in Chrome; its cover, illustrated reading spread, prose, navigation and story QR link were checked. Production generation was not retested. Other project work has since changed application files; recheck these findings before implementation.

Charpai already had the basic recording → editable story → illustrated book → PDF flow. The main new capabilities were the family archive, real keepsakes inside stories, linked memories, and interactive objects.

| Feature | State at inspection | Work identified |
|---|---|---|
| Record or upload an interview | Exists | Expand from one recording per generation to multiple recordings within a family book. |
| Recording recovery and playback | Exists during intake | Add a saved recording library and playback inside stories. |
| Transcription | Exists | Preserve complete speaker accounts and source timestamps for linking claims to recordings. |
| Generate stories in the spoken language | Exists | Add reviewed translations and a language switch in the reader. |
| Edit titles, dedication, headings, prose, and ending | Exists | Add section insertion, removal, reordering, and reopening saved books for editing. |
| Illustrated story pages | Exists | Add more illustration types and explicitly label reconstructions. |
| Desktop spreads and phone layout | Exists | Extend layouts to photographs, documents, maps, and interactive objects. |
| PDF export | Exists | Add reference-style layouts and printable equivalents of interactions. PDF text is rendered as an image and cannot be selected or searched. |
| Stable story links and QR codes | Exists | Retain this behavior for family books and richer stories. |
| Saved-story list | Exists | Turn separate books into a family collection with contents and recording/artifact counts. |
| Family member profiles | Basic name, relationship, place, and language fields | Add reusable profiles, portraits, birth details, real handwriting, and recording/story totals. |
| Photographs and keepsakes | Up to three local photo previews | Save originals, attach them to memories, and include them in the reader and PDF. |
| Artifact catalogue | Missing | Store documents, notes, photographs, and objects with dates, sources, captions, and related people. |
| Evidence and uncertainty labels | Missing as structured features | Add documented/remembered/reconstructed labels, source links, and uncertain dates. |
| Conflicting memories | Missing | Preserve different narrators' accounts side by side. |
| Timeline | Missing | Organize memories using exact, approximate, relative, and disputed dates. |
| Object/place/person threads | Missing | Connect references across recordings, narrators, stories, and years. |
| Interactive photographs | Missing | Add front/back flipping, handwritten annotations, and original/restored comparison. |
| Interactive documents and keepsakes | Missing | Add unfolding, envelopes, hidden items, separated photo stacks, and close-up inspection. |
| Drawn maps and replayable reconstructions | Missing | Add narration-based route maps, uncertainty markings, and replay controls. |
| Reader memory | Missing | Remember reading position and opened/flipped objects. |
| Background sound | Missing | Add optional, clearly labelled reconstructed ambience. |
| Review and recovery | Accept/cancel preview, cached generation results, partial artwork failure handling | Add corrections history, clarification questions, and selective regeneration. |
| Family access controls | Owner checks protect management | Add private/invited-reader access. Unlisted links are readable by anyone holding the link. |
| Physical specialty books | Missing | Create production layouts for overlays, fold-outs, photo inserts, and document pockets; arrange manufacturing separately. |

### Problems identified before expanding the design

1. The inspected writing instructions requested at most 130 words per section. Both draft processing and publication kept only five sections; publication also cut section bodies after 8,000 characters. This conflicts with the user's requirement to preserve all narration and details.
2. Uploaded family photos appeared in the editor preview but did not become part of the saved book; the reader contained generated illustrations.
3. Sections held a heading, prose, and one illustration. The target reader additionally needs quotations, sources, photographs, documents, maps, disagreements, and interactions.
4. Missing real-generation fields could be replaced with demo prose during normalization. Correcting the transcript did not rebuild the story.
5. Timed transcription results were flattened into text, and single-speaker processing could discard available timing. Audio split for processing needs original-recording offsets for accurate seeking.

Recommended order: complete narration and source preservation → family profiles and saved keepsakes → richer reader and PDF → timelines and threads → interactive objects and specialty print layouts. This is a proposed order, not an implementation or release record.

## Complete stories with audio-linked clarification — implementation plan, 2026-10-14

Status: planning only. This replaces the earlier first-stage plan with the additional feature explicitly requested by the user: ask transcript-based clarification questions, generate stories with timestamps and recording playback, and move the player to the relevant timestamp whenever a question is shown. The user authorized saving these notes only; this write does not authorize implementation, paid generation, commits, or publication. Technical defaults below are proposed implementation choices, not verified behavior.

### Outcome

Preserve every narration and its original recording. Ask focused questions about unclear transcript passages, move the audio player to the relevant moment whenever a question appears, and use confirmed answers to generate or revise the story.

The readable story also includes clickable timestamps that lead to the supporting recording. Every generation or revision includes an omission report.

### Sources and timestamps

- Preserve original audio and the complete transcript, including interviewer contributions. Save corrections and confirmed answers separately; never overwrite the original.
- Give transcript passages stable identifiers with recording, speaker, text, start time, and end time. Retain timed transcription results even for single-speaker recordings.
- When audio is divided for processing, retain each part's actual offset and convert its timestamps to positions in the original recording. Do not assume speaker labels identify the same person across separate parts.
- If reliable timestamps cannot be obtained, preserve the transcription and show a timing-processing failure with retry. Never invent a timestamp or claim the audio-linked flow is ready.
- Add owner-protected source revisions, clarification records, generation checkpoints, and book revisions. Store large source/book content as files in Convex storage.
- Keep existing books and URLs working. Older books without source timing remain readable; do not automatically regenerate or retranscribe them.

### Clarification and audio player

- After transcription, identify unclear names, relationships, places, dates, contradictory accounts, and wording that materially changes the story. Do not ask about details already established by the transcript or confirmed answers.
- Show one question at a time, with the relevant transcript excerpt, its timestamp, an audio player, and a text response field.
- Whenever a question becomes active—including revisiting a saved question—pause playback and move the player to the beginning of its supporting passage. Wait for audio metadata before seeking.
- Position the recording automatically; start sound when the user presses Play. Provide “Replay this passage” and ordinary playback/seek controls. Passage replay stops at the passage end; ordinary playback can continue.
- Questions may reference multiple passages. Show a timestamp button for each; initially select the earliest relevant passage.
- Provide “Save answer” and “Leave unresolved.” Saving an answer attaches it to the question and source revision, then advances to the next question and moves the player accordingly. Unresolved questions remain available for later review.
- Preserve answers across reloads and processing failures. Do not discard a typed response when playback fails.
- If recording access or loading fails, keep the excerpt and answer field usable and show a retry control.
- After the question queue is answered or left unresolved, generate the story. Subsequent answers revise affected sections and refresh the omission report without replacing unrelated confirmed material.

### Story generation, reader, and interfaces

- Remove the five-section cuts, 130-word instruction, and silent shortening of narrative text. Reject malformed real-generation output rather than filling it with demo prose. Keep the demo available only through the deliberate demo flow.
- Identify distinct memories before composing chapters. Preserve the narrator's language, perspective, uncertainty, supplied details, and explicitly spoken reflections. Express family relationships from the narrator's point of view.
- Process source text in ordered batches of up to 8,000 characters, splitting at passage boundaries. These are processing batches, not chapter limits. Divide longer passages into labelled continuations without dropping text. Save checkpoints and resume unfinished work using the existing book credit.
- Extend sections with source references. Display source timestamp ranges beside paragraphs, using the timing of supporting passages rather than pretending edited prose matches the audio word for word.
- Timestamp buttons move the shared recording player to the selected source passage. Keep a compact player available during reading. Do not automatically start sound.
- Preserve sources separately from generated prose. User-confirmed additions remain identifiable as clarifications, not words spoken in the recording.
- Require a coverage report accounting for every source passage: included, partly included, awaiting clarification, or outside the narrative, with reasons for remaining material. Partial inclusion must identify the remaining details and their reason.
- Run a final editorial coverage check against the complete source. Missing passage identifiers or unexplained exclusions prevent the draft from being marked ready. Passage accounting supports review; it is not proof that an AI preserved every meaning correctly.
- Recheck coverage after manual story edits. Preserve the existing readable revision until its replacement completes. Mark a story as needing regeneration after source corrections rather than silently retaining an outdated completeness claim.
- Extend generation responses with source/book revision references, checkpoint status, clarification state, and coverage-report references. Continue accepting existing request fields for compatibility.
- Add owner-only operations for reading sources, saving answers/corrections, resuming processing, retrieving revision history, and reopening books for editing. Derive ownership from sign-in, never from a supplied owner identifier.
- Replace the editable “original transcript” field with a preserved original view and a separate corrections view. Add “Edit” to saved books so owners can reopen their draft and report.
- Show the omission report after every generation or revision, including when nothing was omitted.
- Keep sources and omission reports private to the owner. Keep the recording private by default. Owners receive the audio-linked reader; an explicit “Include recording in shared story” setting enables playback for link recipients. Turning it off removes public recording access. Public story responses otherwise expose only approved prose, artwork and relevant timestamp labels.
- Preserve full text in reader and PDF pagination. Large books load section content in batches; PDF export loads the complete approved revision. Print timestamp labels and links to the saved story's corresponding audio position; recordings are not embedded in the PDF.
- Preserve existing artwork, tolerate individual illustration failures, and limit simultaneous illustration requests to two. Missing or failed artwork must never discard story text.
- Keep the current visual style and public-link behavior. Family threads, interactive keepsakes, translations, and specialty printing remain later stages.

### Verification and delivery

- Test question activation, next/previous questions, reload, repeated timestamps, multiple supporting passages, delayed audio loading, playback failure, and exact seek positions.
- Test timestamps across processing-part boundaries and changing speaker labels. Verify that single-speaker recordings retain timing.
- Test that confirmed answers update the intended story passages; unresolved questions never become invented facts. Cover unsupported family relationships and source-supported endings.
- Test more than five chapters, bodies exceeding 8,000 characters, long Telugu prose, long endings, and a synthetic 23-chapter book through saving, reading, and PDF export. Confirm exact saved-text preservation.
- Test coverage gaps, partial omissions, malformed generation, interrupted processing, reload/resume, duplicate retries, preserved answers, failed artwork, and unchanged credit assignment.
- Verify owner-only source access and optional public recording access, including removal of access when sharing is disabled. Another user must not retrieve private sources, reports, checkpoints, or revisions.
- Recheck older books, stable URLs, QR links, keyboard controls, and desktop/phone playback. Run existing tests, type checks, lint, and the production build.
- Use synthetic recordings and mocked AI responses for automated checks. Review the existing Ramadevi transcript locally without sending it to an external service.
- Complete development verification and update project notes before reporting implementation complete. Production publishing remains a separate task.

Next: implement this first stage only when implementation is requested, beginning with a fresh check of the current generation/recovery code. The present task saves documentation only.
