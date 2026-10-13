# Storybook reader implementation plan

## Latest reference update
- [x] Replace the cover with a green cloth-like left title panel and full-height right illustration panel, using existing story content.
- [x] Replace the historical image/text pairs with the latest reference's prose-above-artwork interior pages, warm paper, italic headings, and consistent forest-green ink. Measure paragraph layout before pagination; keep long prose intact.
- [x] Replace the multi-ink image prompt with exactly one forest-green ink, a single physical artifact, hand-carved detail and generous paper. Use an inline SVG ink treatment for older multicolour images.
- [x] Generate a fictional development book through the actual app, review fresh artwork, check desktop/mobile, export and inspect the PDF, decode QR codes and open their destination without sign-in.
- [x] Run tests, lint/build and update the verified scope in project notes. Leave a working development preview; production release requires separate approval.

**Goal:** Match the supplied green-cover, white-spread reference with larger type, one rubber-stamp artifact on each story page, story-specific QR links, and a PDF preserving page layout.

**Architecture:** A shared reader renders the editor preview and saved story. Section artwork is stored as optional fields for backwards compatibility. Browser-based PDF export captures the same individual page layout at high resolution; its work runs only when requested.

**Stack:** Existing Next.js/React and Convex; local QR generation, HTML page capture, PDF assembly.

**Spec:** User's three reference screenshots and requirements in this session; design decisions recorded in docs/STORYBOOK_DESIGN.md.

## Constraints
- Existing stories remain readable; no automatic rewrite or paid regeneration of saved stories.
- One story-relevant object per generated illustration, no scenery or object collections.
- A QR code encodes the saved story's actual URL; an unsaved preview cannot advertise a nonexistent link.
- Large print text, explicit page boundaries, no clipped prose. Retain editable source fields.
- Development only until a separately approved production release.

## Tasks
- [x] Extend sections with artifact subject, brief, storage ID and resolved URL; normalize old drafts and enforce ownership on publication.
- [x] Update the writing and image prompts and generate one image per section; preserve successful images and report individual failures.
- [x] Build a shared green-cover reader with accessible previous/next controls, responsive spreads, measured text pagination and QR codes.
- [x] Replace the editor's old single spread with the shared reader; keep editing separate and save the actual published URL before exporting.
- [x] Export each page using the shared DOM layout, wait for fonts/images, preserve colors and page dimensions, and show export errors.
- [x] Verify meaningful content/prompt, ownership and backwards-compatibility tests, types, lint and build; development backend push; browser review; PDF visual review and QR decoding.
- [x] Update project notes with verified evidence, limitations and next release step.

Release follow-up: review the sample and obtain production approval; short and long PDF exports are verified in docs/STORYBOOK_DESIGN.md.
