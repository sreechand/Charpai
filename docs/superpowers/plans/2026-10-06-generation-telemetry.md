# Generation Telemetry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recover the available historical storybook records and save private diagnostics for future generations, including their input/output JSONs and usage.

**Architecture:** Store indexed request/event summaries in Convex and full JSON artifacts in its private file storage. The existing Next.js generation route writes each AI call before parsing the result; the browser supplies a shared generation ID and records product actions.

**Tech Stack:** Existing Next.js 16.3.4, Convex 1.45.0, Convex Auth, OpenAI SDK, TypeScript and Playwright.

**Spec:** User's 6 October request to inspect the live database and start recording diagnostics; scope and release limitations are documented in `docs/GENERATION_TELEMETRY.md`.

## Global Constraints

- Use Convex for all persistence and enforce authenticated ownership.
- Preserve raw text JSON before parsing/editing; omit credentials, signed URLs and binary image content.
- Test without paid AI requests and without altering customer records.
- Announce the deployment before changes; production release requires a fresh approval for its named target.
- Work inline in the existing project; no additional features or redesign.

---

### Task 1: Inspect existing data

**Files:** Temporary `/tmp/agara-dev-runs.json`, `/tmp/agara-dev-pages.json`, `/tmp/agara-prod-runs.json`, `/tmp/agara-prod-pages.json`; summary in `docs/GENERATION_TELEMETRY.md`.

- [x] Read latest 20 rows using `npx convex data runs --limit 20 --format json` and `npx convex data storybookPages --limit 20 --format json` for configured dev and default prod.
- [x] Count statuses and inspect saved fields without publishing family content.
- [x] Record that historical exact prompts/responses/transcripts were not persisted.

### Task 2: Add private diagnostic storage

**Files:** `convex/schema.ts`, `convex/telemetry.ts`, `convex/runs.ts`, generated API definitions.

**Interfaces:** `telemetry.start` returns a request ID; `record` stores an artifact; `finish` records completion; `latestMine`, `eventsMine` and `artifactMine` enforce ownership; `productEvent` validates event names.

- [x] Add request, event and product event tables plus indexed owner/request lookups.
- [x] Store full artifact JSON in private storage and remove orphan artifacts on failed insertion.
- [x] Link accepted runs with an optional generation ID.
- [x] Push development functions and check authenticated, anonymous and wrong-user behavior.

### Task 3: Instrument generation and browser actions

**Files:** `lib/generation-telemetry.ts`, `lib/telemetry-events.ts`, `app/api/generate-storybook/route.ts`, `app/providers.tsx`, `components/audio-intake.tsx`, `components/storybook-app.tsx`.

**Interfaces:** `GenerationTelemetry.trace(name, input, operation)` preserves the operation's result/error; `recordEvent(name, details)` accepts the shared event vocabulary. Requests use `X-Generation-Id` and `X-Generation-Stage`.

- [x] Capture request metadata, exact prompts, raw responses, available usage, provider IDs, timing, fallbacks and failures.
- [x] Record starts before generation; record final responses independently of preview acceptance.
- [x] Connect recording, upload, preview, publishing, export request and browser error events.
- [x] Surface logging outages without discarding successful results.

### Task 4: Verify and release

**Files:** `scripts/generation-telemetry.test.mjs`, `scripts/test-generation-telemetry.mjs`, `scripts/check-live-telemetry.mjs`, `scripts/check-generation-route.mjs`, `docs/GENERATION_TELEMETRY.md`.

- [x] Run capture/security/storage unit checks and real development persistence checks.
- [x] Drive successful and failing local generation requests with a fake OpenAI service.
- [x] Run the existing browser recording tests and inspect the mobile screenshot.
- [x] Run lint, TypeScript and production build checks.
- [x] Obtain named production backend approval and deploy `elegant-mosquito-650`; confirm telemetry tables and anonymous access protection.
- [ ] Resolve the missing application deploy command, release the updated app, and verify a production record.
