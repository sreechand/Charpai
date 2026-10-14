# Saved generation drafts and timeout repair — 2026-10-14

User request: debug the stalled story first, then make every submitted story retrievable as a draft, retaining completed AI steps so retries do not waste API usage.

## Verified cause

The failed development request f97fdb7f-386d-4086-89fa-52da4f924430 was still transcribing, despite the timed UI showing image creation. A 24:35/45.3 MB recording was split at 1200 seconds. The first 20-minute chunk hit Node fetch's response-header timeout and automatic SDK retries stretched failure to 921224ms. The shorter final chunk and speaker selection succeeded and were saved in diagnostic storage. No complete story text or illustrations had started.

## Implementation plan

1. Pair OpenAI with an undici fetch/Agent matching its explicit 220-second timeout, disable automatic paid-call retries, and split at 300 seconds. Preserve existing models/prompts.
2. Save an owned draft on submit with original audio/input and the existing generation/credit identity. Use the official Convex workflow component for browser-independent execution.
3. Save private JSON checkpoints for audio preparation, each transcription part, raw text/transcription API responses, extracted intake, story text, each stored illustration and final result. Retry skips saved checkpoints. Keep old workflow attempts from overwriting new ones.
4. Show Draft/Preparing/Needs attention/Ready statuses, actual completed parts, and an Open/Resume action in the account's saved stories. Restore results after reload/sign-in; do not simulate progress with timers.
5. Recover the actual interrupted recording and final chunk from existing diagnostics, with no new credit reservation.
6. Test ownership, first-write-wins, stale workers, one-credit retries, failure/reload/resume without repeated completed API calls, worker authorization, real long-recording processing and browser draft retrieval. Publish to existing production targets with unchanged homepage launch state, and verify the public page.

## Work boundaries

Convex backend helper owns new generation tables/workflow APIs; primary agent owns the Next worker, shared AI engine and saved-draft UI. Preserve concurrent email work and all existing dirty files. Worker calls are authenticated by the private backend setting, scoped to the named dev/production deployments; no customer JWT is stored in a workflow. Large artifacts stay in private Convex storage. No API keys or interview text are recorded in these notes.

## Released implementation and checks

Released website `dpl_987QPYRECPkms9T3h1qLHH7hKgJr` (`https://agara-fsbsgb9nd-sreechands-projects.vercel.app`) to the existing public domain. Both development and production Convex have the workflow component and private generation APIs. Existing email integration/settings were retained after verifying it was already deployed in production. Homepage launch flag remains false; direct app/login remains accessible. No live payment or additional generation credit was charged for recovery.

Submission saves original recording, entered details and up to three uploaded family photos in an owned draft before starting background work. Each five-minute part, raw successful transcription/text response, inferred details, story text, each image and final result are saved separately in private storage. Resume uses the original assigned payment/credit and skips saved work. Paired actions wait for both outcomes before exposing a failure, protecting the other in-flight completed response. Old attempts cannot overwrite a resumed draft. Drafts expose an owned saved-work manifest and partial story text as well as the ready result.

The OpenAI transport explicitly matches its undici dispatcher and 220-second deadline, with zero automatic provider retries. A first production worker check caught undici 8/global FormData incompatibility before a paid transcription was made. Fixed with a scoped multipart adapter (no global replacements); added a real local HTTP upload test. Latest production worker successfully entered transcription of the recovered original recording; no errors observed in that release's runtime logs at this check.

Verified: 33 automated tests, TypeScript, lint with no errors, production website build, unauthenticated worker HTTP 401, live login page, development browser saved-draft retrieval after reload, original recording restored, two family photos restored on the newer submitted draft, accurate 1/5 progress for the original (existing final chunk reused), unchanged two-credit balance after resume. Browser reload during transcription leaves work running in the backend.

Recovery: original 24:35 recording recovered from owned legacy diagnostics and same paid generation identity. Its finished final 4:35 transcript/speaker selection became the fifth cached transcript part. Legacy previews were never uploaded, so the original draft cannot restore those two photos; the newer submitted draft does retain its photos. No interview text, private contact information, keys or credentials are included in this document.

Final recovery verified: all five transcript parts, complete 2,943-word transcript, extracted details, three story sections and three illustrations are saved; draft status is ready. The recovered fifth part made zero new provider calls. All three stored image URLs return HTTP 200 and render in the browser. Reloaded the local app, opened the finished draft and turned through each illustrated spread; balance stayed at two credits. Left the draft open for user review, without publishing the family story. The newer submitted draft remains separately saved with both photos.

Final public-domain checks: homepage and login HTTP 200, /app/login reaches /app, shipped client contains Saved drafts/Resume and only the production backend URL, prelaunch updates remain visible, unsigned worker remains HTTP 401. Final website build/typecheck passed. Removed the misleading model/time badge from draft review and reused existing paper panels/UI typography for the new controls. Generation/AI output was fully tested using the development account and public production worker; a new real-money production purchase was not made.

Next: user reviews the recovered draft through Saved drafts → Open draft in the local test app. New production submissions use the same released saving/resume flow.

Practical limit: responses already received and saved are reused. If a provider finishes a request but the connection dies before its response arrives, the app cannot recover that unknown provider result; a manual retry may need that specific call again. It will still keep the same story credit and all other checkpoints.
