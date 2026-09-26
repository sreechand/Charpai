# Generated story illustrations implementation plan

## Goal

Generate one square, story-specific rubber-stamp image after the story draft is written, store it in Convex, show it in the editable preview, and publish it with the unlisted story page.

## File map

- `app/api/generate-storybook/route.ts`: build the image prompt from the selected story subject, call the OpenAI Image API, upload the returned image to Convex, and return its storage identity and preview URL with the draft.
- `lib/storybook.ts`: extend the draft shape with generated-image metadata while keeping demo and normalization paths safe.
- `convex/schema.ts`: add an owner-scoped generated-image table and an optional image reference on published pages so existing pages remain valid.
- `convex/files.ts`: record generated image ownership and return authenticated preview URLs.
- `convex/storybookPages.ts`: validate image ownership during publication and resolve the stored image into a public URL.
- `app/providers.tsx`: strip preview-only URL data and pass the typed storage reference to the publish mutation.
- `components/storybook-app.tsx`: show the generated image in the editable visual page and retain the current SVG as a fallback.
- `components/storybook-public.tsx`: render the stored image on public story pages and retain the current fallback for older pages.
- `app/globals.css`: size and print the square image without changing the storybook layout.

## Task 1: Persist generated images securely

1. Add a `storybookImages` table keyed by storage ID and owner.
2. Add authenticated mutations/queries for recording and previewing generated images.
3. Add an optional image storage ID to published story pages for backwards compatibility.
4. Verify ownership before accepting an image during publication.
5. Run Convex code generation and TypeScript checks.

## Task 2: Generate and upload the story image

1. Normalize the generated story draft before image generation.
2. Build a focused prompt from `stampSubject`, `stampMotifs`, `illustrationBrief`, and the story context, incorporating the supplied composition, paper, ink, texture, text, mood, and avoidance rules.
3. Generate a `1024x1024` opaque image through the OpenAI Image API.
4. Decode the base64 result, upload it to Convex storage, register ownership, and resolve an authenticated preview URL.
5. Treat image generation failure as a warning/fallback rather than losing an otherwise valid story draft.

## Task 3: Render and publish the image

1. Extend the draft normalization and client response types with storage ID, URL, and optional generation warning.
2. Render the generated bitmap in the story editor, falling back to the existing deterministic stamp SVG for demos, failures, and legacy data.
3. Persist only the storage ID when publishing and resolve the URL in the public query.
4. Render the same image on `/s/[slug]`, again preserving the legacy fallback.
5. Update the progress copy so the final stage mentions illustration generation.

## Verification

1. Run Convex codegen.
2. Run `npx tsc --noEmit`.
3. Run `npm run lint`.
4. Run `npm run build`.
5. Exercise an authenticated generation with a short test recording and confirm the image appears in preview and on the published page.
6. Confirm old pages without an image still render the SVG fallback.

