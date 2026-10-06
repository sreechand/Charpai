# Generation diagnostics

Implemented on 6 October 2026. The app records diagnostics in Convex; it does not send family content to a separate analytics service.

## Database inspection before adding diagnostics

- Configured development database: `qualified-bullfrog-386`. Latest 20 run records: 10 draft ready, 8 failed, 1 exported, 1 generating. One saved published storybook.
- Default production database: `elegant-mosquito-650`. Eight run records: 6 draft ready, 2 exported. Six retained storybook records: 3 published and 3 marked deleted.
- These historical rows contain partial intake and final story content, not complete transcripts, exact prompts, raw AI responses or usage. A run is created when a preview is accepted, so these counts are not a reliable total of API attempts. Older run statuses can also belong to previous versions of the flow.
- Customer content retrieved during inspection stays in temporary local files, outside the repository.

## What is recorded

- `generationRequests`: authenticated owner, shared generation ID, request stage, prompt version, start/end, elapsed time, HTTP result, errors and illustration/diagnostic warnings. A started request without completion exposes interruption/timeouts.
- `generationEvents`: each API call's start and result, audio preparation, request input, final response, call latency, model, provider request ID, and a private storage reference to its JSON artifact.
- JSON artifacts preserve supplied intake, audio storage reference/file metadata, transcript, exact instructions/prompts, original text responses (before parsing/editing), available provider usage including cached/reasoning tokens, speaker-labelled transcription responses and fallback calls. Images retain prompts and usage but omit base64 image contents.
- Transcription and composition share `X-Generation-Id`; each HTTP request has its own record. Accepted runs also keep this ID.
- `productEvents`: recording start/save/failure/interruption; upload start/success/failure; generation start/preview/failure; preview accept/reject; publish success/failure; export request; uncaught errors and rejected promises while signed in.
- `APP_RELEASE` is optional server configuration identifying the application release. Bump `PROMPT_VERSION` in `lib/generation-telemetry.ts` whenever prompts change.

## Access and limitations

All client-accessible functions require sign-in and enforce ownership. There is no public artifact URL. Account owners can access their own records; project operators inspect all records through the Convex dashboard/CLI. Artifacts contain private family material and should not be published or committed to source control.

API keys, bearer tokens, passwords, signed URL query strings and image contents are omitted from captured artifacts. No extra copy of raw audio is made. There is no automatic deletion schedule; retain/delete diagnostics according to the project's future retention decision.

The app refuses to begin generation if it cannot create its initial diagnostic record. Later logging failures do not discard a generated story: they produce server messages and a visible warning. Telemetry is diagnostic, not an authoritative billing ledger; authenticated clients can invoke these logging functions. JSON artifacts must fit Convex's action argument limit (1 MiB); larger writes produce a warning rather than silent truncation.

Usage is saved as returned by the provider. Absent usage is not reported as zero cost. Dollar costs still require a pricing snapshot or billing reconciliation. The SDK retries transient errors internally (configured default: 2); records capture the overall call and final outcome, not each internal retry. Export requests are tracked, but browser printing cannot prove that a PDF was actually saved. Signed-out visitors and sign-in failures are not written to the authenticated event store. Process termination can leave a request in started status.

## Verification and release

- `node scripts/test-generation-telemetry.mjs`: capture, credential omission, success/failure, logging outages, owner checks and large JSON storage with mocked contexts.
- `node scripts/check-live-telemetry.mjs`: real development storage and ownership checks with synthetic test accounts; no AI requests.
- `node scripts/check-generation-route.mjs`: real local Next.js endpoint with fake OpenAI service and real development Convex storage; success, usage, illustration and provider failure.
- `RECORDING_TEST_URL=http://localhost:3012/recording-check node scripts/test-audio-recording.mjs`: browser capture/playback/recovery/interruption checks against a running development server.
- `npm run lint`, `npx tsc --noEmit`, `npm run build`.

Development backend has been pushed and checked. The production backend was deployed to `elegant-mosquito-650` with user approval on 6 October 2026; schema validation and deployment completed successfully. The new tables are present and the anonymous telemetry query returns no private records. The updated application still needs releasing before production generation calls will write telemetry, because only the backend was deployed. This repository currently has no `npm run deploy` script; static hosting cannot directly run the existing Node.js API routes. Releasing the frontend requires resolving that existing hosting setup rather than assuming a git push deploys it.
