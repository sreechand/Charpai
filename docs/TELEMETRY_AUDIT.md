# Story generation and product telemetry audit

Read-only inspection on 14 October 2026. This is a snapshot, not a continuous monitor. Production: `elegant-mosquito-650`; development: `qualified-bullfrog-386`. No generation, payment, credit change, deployment or customer message was triggered.

## Main finding

We have useful generation diagnostics, but not complete product telemetry. The only production generation with detailed records failed in the website request and remains marked `started` in the database. Long-audio failure is also reproduced in development records. Older saved stories cannot be reconstructed from the available diagnostics, and tests cannot reliably be separated from customer activity using a stored flag.

## Evidence and scope

Inspected every returned row in generation requests/events, product events, runs, payment orders, storybook pages and notification records in both databases. Each table was requested with a 10,000-row limit; every nonempty table was below that limit. The generation draft/checkpoint tables returned no documents at inspection time. Downloaded and inspected all 120 referenced JSON diagnostic artifacts: 8 production and 112 development. Private artifacts remain in a restricted temporary directory outside the repository; no transcripts, contact details, credentials or signed storage URLs are included here.

Also inspected a bounded recent Convex execution-log window, requesting the latest 1,000 entries per deployment and briefly receiving live entries. The returned production window covered October 13–14; development covered part of October 14. This does not cover all historical errors or website-host logs. The browser's saved timeout error is the direct evidence for the production website failure. Source review explains recording gaps but does not establish that every local change is deployed.

| Saved records | Production | Development |
| --- | ---: | ---: |
| Generation HTTP requests | 1 | 15 |
| Distinct generation IDs in those requests | 1 | 8 |
| Request outcomes | 1 started, no completion | 11 succeeded, 4 failed |
| Generation diagnostic events/artifacts | 8 | 112 |
| Product events | 22 | 30 |
| Older/newer run records combined | 8 | 28 |
| Runs carrying a generation ID | 0 | 4 |
| Storybook records | 3 published, 3 deleted | 5 published |

Counts are records, not a customer success rate. Development includes deliberate failures, mocked AI calls and real AI tests. A run is created after accepting a preview, so run counts omit many generation attempts. Production's eight older runs have no generation ID; development has 24 such runs. Older failures lack the detail needed for reliable diagnosis.

## All generation IDs with detailed diagnostics

IDs are included so the operator can find exact records without saving family material. Dates below are UTC.

| Environment / generation ID | Date | Recorded result | Interpretation |
| --- | --- | --- | --- |
| Production `3f243449-2d3a-470a-8530-028a2ac6b8af` | Oct 14 | Transcription request still `started`; browser reports `FUNCTION_INVOCATION_TIMEOUT`; two audio parts started, one completed in 140.67s; speaker-selection call completed in 3.68s | Confirmed user-visible failure. No final transcript, composition, preview, saved response or run. Credit remains assigned, with the original transcription lock stored. |
| Development `verification-a86bfaaf-eaee-4cd7-a249-48dfcb8f41d1` | Oct 6 | One success and one synthetic failure | Storage/ownership verification; no real AI generation. |
| Development `ae74f448-13c5-45ac-a050-eac0f111945b` | Oct 6 | Compose success, then deliberate writing failure | Mocked provider route tests; exclude from customer reliability. |
| Development `9a3eec76-1baa-4751-b142-cb95d90bcb0a` | Oct 6 | Two transcription successes, compose success, deliberate writing failure | Mocked provider route/fallback tests; exclude from customer reliability. |
| Development `5426d23d-b6cd-43ce-a5a3-52b9fdf6f112` | Oct 7 | Transcribe 27.85s; compose 56.09s | Real provider calls; transcription used fallback; three-section draft, one illustration call. |
| Development `77bc8f7c-84f0-4b4d-b065-8aa29d715b80` | Oct 9 | Compose 60.87s | Real provider test using supplied transcript; two-section draft and two illustration calls. Not proof of an audio-to-book flow. |
| Development `40c52cfe-00fc-44e2-a266-2b1c6c86e6d6` | Oct 9 | Compose 64.25s | Real provider test using supplied transcript; two-section draft and two illustration calls. |
| Development `e0579ff1-8f3b-43c3-8b20-4d5b4bcac671` | Oct 14 | Transcribe 35.05s; compose 59.82s | Real AI browser test, approximately 95s across both requests; three sections and three illustration calls. Saved run and payment link exist. |
| Development `f97fdb7f-386d-4086-89fa-52da4f924430` | Oct 14 | Transcription failed after 921.22s; one part took 906.79s before timeout, another completed in 123.27s | Confirmed long-recording failure. Error identifies the HTTP client's wait for response headers. No composed response or saved run; credit remains assigned. |

## Fix list, in order

1. **Highest priority: make long recordings finish independently of an open website request.** Production's approximately 29 MB upload was split into two parts; one completed, but the page request timed out. Development's approximately 47.5 MB upload failed after more than 15 minutes. File size validation alone does not make a recording safe to process. Use bounded background steps, time-limited provider calls and resumable part results. Verify with a representative long recording, leaving/reopening the page, and an intentionally interrupted part. Increasing a website timeout alone does not establish a fix.

2. **Highest priority: recover unfinished attempts without spending another credit or repeating completed AI work.** Production's credit row has no saved transcription/composition response and retains its original lock. Its age can make the lock retryable under the existing six-minute rule; this is not proof that the credit is permanently lost. However, no stored checkpoint is available for resuming its completed part. Add durable part checkpoints and explicit recovery outcomes. Prove retry reuses the same generation/credit and does not rerun successful parts.

3. **Highest priority: honor the preserve-everything story requirement.** `lib/storybook.ts` still caps section prose at 130 words and `normalizeDraft` keeps only the first five sections. The generation system instruction still requests a short storybook. This conflicts with the October 14 requirement recorded in the story-workshop notes. Remove the length-driven omissions, preserve all source narration, and produce a source-to-story coverage/omission report after generation and revision. This is verified from source, not evidence that every historical story lost facts. No audio listening or factual quality review was performed in this audit.

4. **High priority: give every attempt a truthful final outcome.** The production browser knows the request failed, while the server record says `started`. Add a heartbeat/deadline, stale-attempt reconciliation, explicit canceled/timed-out/interrupted states and a safe distinction between unknown provider outcome and confirmed failure. Record the actual final HTTP result only after response persistence succeeds: the current compatibility route marks diagnostics successful before `payments.finishGeneration`, so a later save failure could still return 503. That ordering risk is source-confirmed, not an observed occurrence in these rows.

5. **High priority: verify email delivery and surface delivery failures.** Production logs contain a permanent Resend `401 Unauthorized / API key is invalid` at `2026-10-14T13:11:18Z`. The application notification table has one `queued` waitlist event; queued does not prove delivery, and the failing email cannot be attributed to that event from the inspected parent rows alone. Check the failed provider message, verify current credentials with a controlled check, and store delivered/failed/bounced outcomes. Development has 26 pending notifications; distinguish deliberately disabled delivery from a fault. Transcription-only attempts also bypass the existing generation-started/failed notification hooks.

6. **High priority: capture failures before generation diagnostics start.** Missing configuration, rejected sign-in, malformed request/upload, payment authorization failure and cached-response returns happen before `telemetry.start`. Add a server request ID at entry and record rejection/cached/retried outcomes. Otherwise the generation ledger cannot count every request or explain every user-visible failure.

7. **High priority: make concurrent AI calls distinguishable.** Both long recordings launch two transcription calls with identical event names. File metadata in artifacts permits manual reconstruction, but there is no first-class call ID, part index, parent call or retry number. Started events are even labeled `succeeded`. Add call lifecycle states and identifiers so one unfinished part is visible without opening private artifacts. Record fallback reason and which transcript was selected, including speaker-selection confidence/uncertainty.

8. **Medium priority: identify releases and tests reliably.** All 12 request artifacts that include a client metadata block say `appRelease: unversioned`; two early request artifacts have no client block. Add release/build ID, deployment/environment, prompt version for each stage and a server-controlled test marker. Deliberate synthetic writing/auth/payment failures must not count as customer incidents. Raw `text` names should distinguish speaker selection, intake extraction and story writing.

9. **Medium priority: add source coverage and quality checks.** Preserve source segment IDs/times, identified speaker and inclusion/exclusion reason through transcription and writing. Track uncertain names/relations, language choice, corrections and supported versus unsupported additions. Current speaker filtering discards the interviewer's lines from the writing transcript; without a coverage record, useful context can disappear unnoticed. Do not infer quality from HTTP 200 or use a model's self-score as proof. Keep a human-review result where checked.

10. **Medium priority: repair end-to-end product tracking.** Add the events in the matrix below. Current browser events are sent without waiting or retrying; failures only print to the console. Add stable event IDs, delivery acknowledgement, retry/deduplication and a lost-event counter. Carry generation/run/book IDs across reloads and existing-book actions. Record run-save failures: the acceptance flow catches them as warnings without its own structured failure event.

11. **Medium priority: turn raw logs into useful operating signals.** Add a private summary for recent successes/failures, time spent per stage, stale attempts, credits held, incomplete illustrations and unknown usage. Alert on stuck generations, provider/configuration failures and payment verification/credit mismatches. There is no complete production success rate or cost ledger today. Keep missing provider usage unknown; price successful/retried calls against a dated pricing snapshot and reconcile to provider billing before treating estimated spend as actual spend.

12. **Medium priority: set diagnostic retention and deletion behavior.** Exact prompts, transcripts and model outputs are saved privately, but there is no automatic diagnostic retention schedule. Choose a retention period and record deletion completion across artifacts, audio and related diagnostics. Avoid copying family text into ordinary analytics events.

### Historical errors to monitor, not assert as current failures

- Production has 18 `browser_error` events for `payments:status`, all dated October 6–8. Their server-side cause is absent from the October 13–14 execution-log window. Current local source has the named payment indexes. Preserve as historical/unresolved evidence; only mark fixed after a relevant check, and do not call this a current outage.
- Recent production logs include missing-account, incorrect-password, bad payment signature and generation-access rejections. Project notes document deliberate negative tests for these paths. Count these as rejected operations until a stored test marker and user/session context establish which were customer problems.
- Recent development logs include two rejected Razorpay credential calls. Project notes report a subsequent test-key repair. This audit did not repeat checkout and does not reopen that historical incident as a confirmed current fault.

## Product-wide data points needed

Every event should carry: unique event ID; server-received time and client time where relevant; environment; release; server-controlled test/live classification; anonymous session ID before sign-in and internal user ID after sign-in; route/surface; attempt/generation/request/run/book IDs where relevant; outcome; duration; safe error code; retry/parent event ID. Do not place credentials, payment signatures or family story text in these events. Fields that do not apply should be absent, not invented.

| Product step | Already available | Missing events and data |
| --- | --- | --- |
| Both homepages | Saved waitlist records; one notification record | Page/CTA views, entry source, homepage host, signup started/submitted/succeeded/failed/duplicate, consent version, safe failure code. Anonymous visitors currently absent from authenticated telemetry. |
| Signup and sign-in | Auth execution logs; some notification records | Method, signup/login start/result, safe reason, redirect destination/result, session restored/expired, logout, elapsed time. Link anonymous session after sign-in without storing passwords or emails in events. |
| Checkout and credits | Created/paid orders, assigned credit and run links | Checkout viewed/opened/closed, script load failure, provider failure, verification retry/result, expected versus granted credits, credit reservation/reuse/release, test/live mode, order correlation, reconciliation state. A created order is not proof checkout opened. |
| Recording | Started/saved/failed/interrupted browser events | Microphone permission denied, actual duration, input device category, interruption cause, recovery offered/restored/discarded, playback checked, file selection versus in-app recording, unsupported format. Recording events generally lack generation linkage because the generation ID is created later. |
| Upload | Started/succeeded/failed; bytes/type on start; audio storage metadata | Upload attempt/file ID, real duration, throughput, retry, network/offline outcome, progress, duration/format validation and rejected limits. Ensure early upload failure also finalizes the overall attempt. |
| Generation request | Authenticated start/finish, generation ID, stage, prompt version, artifacts | Early rejections, cache hits, server-controlled release/test marker, heartbeat/deadline, user cancellation/page exit/resume, final persistence/delivery state. Track actual stages rather than the screen's elapsed-time timers. |
| Audio preparation/transcription | Input/prepared file metadata, raw responses, speaker segments and usage when returned | Source duration and prepared-duration coverage, part index/start/end, per-part checkpoint, call ID, each retry, provider request ID on failure where supplied, fallback reason, selected speaker and uncertainty, language and discarded-segment reasons. |
| Intake/story writing | Exact prompt and raw response artifacts, model/usage, final draft | Named operation, schema/parse/normalization changes, generated versus retained section count, source coverage, omitted/uncertain facts and reasons, narration/relationship checks, reviewer corrections and output acceptance reason. |
| Illustrations | Prompts, response usage, call elapsed time; image records | Section ID and image-call ID linkage, expected/generated/saved/displayed counts, storage failures, fallback/missing-image reasons, retry/reuse, quality-review result. Existing older books with fewer section images are not automatically new failures. |
| Preview/save/publish | Preview ready/accept/reject, publish result, some run/book links | Review started/duration, rejection reason, edits, run-save failure, publish started/duration, saved/recovered draft state, published book ID in each result. Acceptance is a decision, not proof of a saved book. |
| Reader/share/delete | Saved published/deleted state | Reader opened, book loaded/failed, page navigation/completion, mobile/layout failure, share/copy-link/QR action and destination category, deletion requested/succeeded/failed. Use privacy-preserving aggregates for public readers. |
| PDF export | Export requested; run may be marked exported | Build started/succeeded/failed, duration, pages, layout/overflow warnings, font/image failures, download initiated and book ID. The current reader catches PDF failures locally. Browser download initiation cannot prove a file reached disk. Older documentation describing print-only export is outdated. |
| Notifications | Pending/queued/skipped application rows; provider component logs/status query | Delivered/bounced/failed/suppressed outcome joined to app event, retry count, last error, backlog age, provider-message correlation; distinguish disabled delivery. Keep recipient addresses outside general event payloads. |
| Errors and telemetry health | Signed-in uncaught browser messages, server logs, logging warnings | Handled UI failures, stack/fingerprint/source map, route/device/release, network state, HTTP request correlation, dropped-event counts, artifact write/size failures, stale-start detector and alert acknowledgement. |
| Privacy and retention | Ownership checks; private artifact storage; limited secret redaction | Retention expiry, access audit, deletion request/result and orphan-artifact cleanup. Restrict inspection tools; do not expose raw artifacts in a public reporting screen. |

## Acceptance checks for the repair work

1. A long recording survives page closure, resumes completed parts and produces a book using exactly one assigned credit.
2. Terminating a worker yields a visible, recoverable final attempt state; there is no indefinitely `started` row.
3. A recording containing more than five memories retains them all, with an explicit source coverage/omission report and no length-driven truncation.
4. One controlled journey can be followed from visit → sign-in → checkout/credits → upload → generation → acceptance → saved book → reader → PDF using linked IDs, including failures and retries.
5. Intentional tests are excluded from production customer metrics; missing usage/delivery evidence is shown as unknown.
6. A controlled notification's actual delivered/failed outcome is visible in the same journey.

Local files were changing during this audit, including new background-generation/timeout work (`convex/generation*`, `lib/generation-openai.ts`, and the extracted generation engine). These are promising implementation work, not verified repairs in this report. The empty draft/checkpoint tables at snapshot time do not prove those changes failed; they show no saved execution evidence was available yet. This audit changed documentation only and did not browser-test or deploy those changes.

Next: complete and verify the long-recording background/resume repair first, with the linked lifecycle events above.
