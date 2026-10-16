# Publishing Charpai

## Complete photo flow released — 2026-10-16

Published original-photo uploads, optional family titles/descriptions, reviewable AI descriptions, automatic chapter matching and manual chapter choice to `https://charpai.sreechand.pm`. Originals remain unchanged in the reader and PDF. Library **Edit** reopens an owned saved book without requiring another purchase; saving retains its existing link, caption and placement. The previously released story-text editor/regeneration and complete text download remain available, including photo captions in downloads.

Final website: `dpl_5PvQxhFKtTEkPdacpxjQk1E3NPyb`, immutable URL `https://agara-7d21vb3h9-sreechands-projects.vercel.app`. Replaces first photo release `dpl_CjgHxm9pAzNvPUju7ESZXxE414m8` with a verified full-width photo form inside the intake grid. Backend functions/schema deployed to production `elegant-mosquito-650`; no indexes deleted. Build/runtime use the production backend and `CHARPAI_LAUNCHED=false`. The additional here.now homepage was unchanged.

Scoped source: `/private/tmp/charpai-photo-release-20261016`, based on committed production snapshot `57be1f7`. Unrelated source-review, generation-cost tracking and Interview Assist remain local. Upload inspection excluded environment files, credentials, notes, sample exports and removed desk artwork. No migration of hosts or changes to live payment credentials.

Verified: 90 scoped tests pass, TypeScript/build pass, lint has zero errors and three historical warnings. Production backend dry-run, schema validation and hosted builds pass. BrowserOS neo checked the actual signed-in public website using a fictional account and classroom image: upload automatically invokes real AI; classroom matches teaching; suggested caption can be adopted then corrected; manual placement survives save/reload/reopen; returning to automatic placement saves the AI chapter; original downloaded bytes match uploaded bytes. Live owner checks used no payment or generation credit. A synthetic account and one appended synthetic run/book were used; no existing family data was edited.

Desktop 1440px and phone 390px checks cover the photo form, edited/complete states, chapter controls, keyboard focus and shared reader; no horizontal overflow. A real production 8-page A5 PDF was downloaded, all pages rendered and visually inspected: original classroom image and exact custom caption appear with the teaching chapter, all narration follows and no empty leaves remain. Actual text download matches every final field, chapter and caption. Existing Ramadevi six chapter bodies/135 paragraphs are unchanged (joined-body SHA-256 `3e14b2cc115d308d62c3a433a13e600a87e4cfa57ecb683db810499c98c9bd0d`). Homepage stays prelaunch, direct workspace works, invalid update signup returns 400, prior fictional duplicate signup returns 200, unsigned photo analysis returns 401. Failure/retry and in-flight edit protection were exercised in development and covered by automated tests; no new audio-to-story generation or real family-photo AI analysis was performed in production.

Evidence: `output/verification/photo-release/`; earlier complete development checks: `docs/STORYBOOK_DESIGN.md` (AI photo analysis section). Next: owner opens an existing book with **Edit**, adds family photographs, reviews descriptions and saves.


## Story text editing and downloads released — 2026-10-15

Published code commit `5a56083` to GitHub `main` and production website deployment `dpl_4w56fALkJPDgoQ4re9Quk1XFxytd`, immutable URL `https://agara-acmylmqb7-sreechands-projects.vercel.app`, promoted to `https://charpai.sreechand.pm`. Convex production `elegant-mosquito-650` includes the owner-checked `storybookPages:getOwnedByRun` query so reopened generated books load their saved wording instead of their old generation checkpoint. Save changes keeps the existing unlisted link.

Visible text editing uses a separate working copy, explicit Regenerate storybook and Cancel edits. Regeneration keeps exact wording/artwork and uses no generation credit or AI request. Shared/private/public readers offer complete UTF-8 text downloads beside PDF; downloads stay hidden while edits are open. Existing homepage/launch flag remains `CHARPAI_LAUNCHED=false`; no here.now update was needed.

Release source: `/private/tmp/charpai-text-release-20261015`, based on the exact prior live PDF snapshot. Commit `66618b5` records that already-published baseline; `5a56083` adds this scoped feature and reopening fix. Unrelated source-review, photo management, cost tracking and Interview Assist work stays local. Environment files/credentials/notes/sample exports were excluded from the 132-file website upload.

79 release tests, TypeScript, build, changed-file lint, Convex dry-run/schema validation/deploy and hosted build pass; no indexes removed. Full release lint has only three historical unused-variable warnings. BrowserOS neo verified the actual public book at 1440px/390px and downloaded its `.txt`; disk comparison matches every final public field and all six chapters exactly. Existing six chapter bodies/135 paragraphs and image URLs remain unchanged (body SHA-256 `3e14b2cc115d308d62c3a433a13e600a87e4cfa57ecb683db810499c98c9bd0d`). The actual editor/regenerate/cancel flow was checked in the release component harness with bilingual text and a real download. Production assets contain the editor/reopening code and production backend URL, with no development URL. Live signed-out owner query refuses access. Homepage, direct login, invalid update signup and a prior fictional duplicate signup pass. Owner save/reopen is covered by automated owner/wrong-user tests; it was not exercised with a signed-in production account.

The Vercel deploy command reported `Not authorized` while watching build status; API inspection/build logs confirmed the same deployment was successfully building. It reached READY and was promoted normally; no retry deployment or weakened protection. No family edits, payments or generation credits were used. Next: owner checks Edit story text → Regenerate storybook → Save changes on a generated book.


## Verified setup and standing approval

Verified on 2026-10-13: `https://charpai.sreechand.pm` is served by Vercel; Convex runs the backend, authentication and storage. The user explicitly approved the existing host and asked to save this setup and publishing permission so we do not ask again.

A user request to publish/go live authorizes a normal production release to these existing targets, including corresponding backend changes. Announce the targets, complete checks and publish without another approval question. This supersedes the older Convex-only hosting instruction for this repository and the skill's repeated production-confirmation requirement for these routine releases. It does not authorize automatic publication of every edit or a host migration.

- Vercel project: `agara`, scope `sreechands-projects`; use the existing `.vercel/project.json` link.
- Public domain: `https://charpai.sreechand.pm`.
- Convex production: `elegant-mosquito-650`, `https://elegant-mosquito-650.convex.cloud`.
- Convex development: `qualified-bullfrog-386`. Local `.env.local` targets development; do not copy that URL into production.
- Production Convex `SITE_URL`: `https://charpai.sreechand.pm`.
- There is no `npm run deploy` script. Git push is not a release.

## Release procedure

1. Inspect the source changes and the existing project link. Run the appropriate tests, lint and build; current commands are `npx vitest run`, `npm run lint`, `npm run build`.
2. Announce production targets. If backend files changed, check and deploy them first:

```sh
npx convex deploy --dry-run --typecheck enable --yes
npx convex deploy --typecheck enable --yes
```

With the current local Convex project configuration and no overriding deploy key, these commands select production `elegant-mosquito-650`. Confirm the CLI's announced target before continuing. Do not treat a development backend push as a production release.

3. Preserve `.vercelignore`, which excludes environment files, project notes, sample exports and the removed workdesk photo. Inspect the upload list when exclusions change:

```sh
vercel deploy --dry --json
```

4. Deploy the website against the production backend, preserving the user's current launch state. For the current prelaunch state:

```sh
vercel deploy --prod --skip-domain --yes \
  --env CHARPAI_LAUNCHED=false \
  --build-env CHARPAI_LAUNCHED=false \
  --env NEXT_PUBLIC_CONVEX_URL=https://elegant-mosquito-650.convex.cloud \
  --build-env NEXT_PUBLIC_CONVEX_URL=https://elegant-mosquito-650.convex.cloud
```

Use the resulting deployment URL, not an old example URL. Wait for the production build to pass. If the temporary URL is protected, use the authenticated `vercel curl` command to check it rather than weakening deployment protection:

```sh
vercel curl / --deployment <new-deployment-url>
vercel promote <new-deployment-url> --yes
```

5. Verify the real public domain after promotion. Check the approved copy and artwork, current login behavior, and a fictional update signup when that form is active. Confirm the production test row and duplicate protection without printing real user contact information. Browser checks should be performed when browser control is available; live HTTP/source checks are useful but are not a visual browser review.
6. Save deployment URL/ID and verified results in project notes. Report the live URL and relevant remaining work.

## Launch switch

Current requested state: prelaunch updates collection; `CHARPAI_LAUNCHED=false`, homepage login hidden. Direct `/app` access uses the existing sign-in and credit checks, independently of the homepage launch flag. `/app/login` redirects to `/app`.

Only when the user asks to launch or enable signup, deploy with `CHARPAI_LAUNCHED=true` at both build and runtime. Do not confuse publishing reviewed changes with enabling signup. Later releases must preserve the most recently requested state.

## Last verified release

- Date: 2026-10-13.
- Deployment: `dpl_2GHQSLuD263APbCVM2nrAGqe1ZcC`.
- Immutable URL: `https://agara-j4z79bxz4-sreechands-projects.vercel.app`.
- Public domain: `https://charpai.sreechand.pm`.
- Backend: `elegant-mosquito-650`.
- Checks passed: 13 automated tests, lint/build, backend schema validation, Vercel production build, live homepage/assets/redirects, and a fictional update signup saved once with optional phone and consent timestamp.
- No production generation/PDF rerun or visual browser automation during that release. No Git commit/push was performed.

Next: follow this procedure on the next release request without repeating the hosting/production approval question.

## Latest release — 2026-10-13 (homepage follow-up)

Deployment `dpl_2Y9rWWFnBEANYmphAhvnxke8w93M`, immutable URL `https://agara-kstp9iw0z-sreechands-projects.vercel.app`, promoted to `https://charpai.sreechand.pm`. Includes the October 15 announcement, shorter hero invitation, one-time preview intro and favicon. Prelaunch flag remains false; backend stays `elegant-mosquito-650`. Production build and live HTTP/assets checks pass. No backend changes required this release.

## here.now workspace root check — 2026-10-13

The user asked whether the landing page could be published directly at `https://stories.here.now`, alongside existing story sites on its subdomains. Applied the here-now skill and read the current documentation/OpenAPI spec before checking the authenticated account.

Verified: `stories` is the active Charpai team workspace, and the user is an admin. It is not a personal vanity subdomain. Current here.now documentation explicitly states that workspace subdomains do not take domain mounts. Authenticated `GET /api/v1/mounts` with the stories selector returned no mounts and no hostname; `GET /api/v1/mounts/__root__` returned 404 with: “Workspace mounts live on workspace custom domains. Pass domain to target one.” The workspace-update schema only supports display name/icon, with no landing-site setting.

Conclusion: current here.now support does not allow the Charpai landing page at the exact workspace root `stories.here.now`. A labelled workspace Site such as `charpai.stories.here.now` is supported, or the workspace can use a separately owned custom domain. No story sites, workspace settings, public access settings or live domains were changed. Next: if the user chooses the labelled address, prepare the landing page with working update capture and publish it there; do not silently publish at a different address.

## here.now homepage published — 2026-10-13

The user approved `charpai.stories.here.now` after the workspace-root check. Published the actual homepage there, with public access and no expiry, in the existing Charpai `stories` workspace.

- Primary URL returned by the API: `https://charpai.stories.here.now/`.
- Canonical Site URL returned by the API: `https://bronze-glacier-wpz9.here.now/`.
- Site slug: `bronze-glacier-wpz9`.
- Latest version: `01M4V6W4S6QBMW3KB48Y3EQMVK`.
- No existing story labels or sites changed. The existing Vercel website/app and Convex backend remain in place.

The standalone build reuses `components/landing-page.tsx` and `components/launch-updates.tsx`, so it includes the latest wording, social link, gentle card-first preview fade, artwork and favicon. A small native image adapter serves the same image files directly. Server-rendered HTML is hydrated with the homepage's React code. It does not include the full workspace, backend, credentials, or removed photo.

Email capture uses a here.now proxy route at `/api/updates` to the existing `https://charpai.sreechand.pm/api/updates` endpoint; contacts therefore land in the existing production Convex waitlist. No cross-origin browser exception or new database is required. Finalize reported no manifest warnings.

### Repeatable release

```sh
npm run build:landing
node scripts/publish-herenow-landing.mjs
```

The publishing script reads the saved here.now credential without printing it, checks the existing workspace label and live version, uploads changed files, finalizes at the exact `charpai` label, makes this homepage public, verifies it has no expiry, and confirms that other story labels are unchanged. `.herenow/landing-state.json` stores local publishing state and is excluded from Git and Vercel uploads. If the live version differs from the saved one, read the owner's live files and reconcile rather than blindly overwriting it.

The same launch flag applies at build time: default `CHARPAI_LAUNCHED=false`; when explicitly launching, build with `CHARPAI_LAUNCHED=true` and republish. Its signup/login links then lead to `https://charpai.sreechand.pm/app`, where the actual authenticated app runs. Enable the main website's flag too when the user requests launch. Publishing this standalone copy does not automatically update the original Vercel site.

### Verified results

- Standalone build, project lint and Next production build pass.
- Actual public homepage returns HTTP 200 with the latest copy, October 15 date, previews, update form and maker links.
- Deployed JavaScript, CSS, artwork, logo and favicon match the local build bytes; final live HTML/client version also checked after the launch-flag support was added.
- Through the here.now address, invalid input returns HTTP 400; a fictional email/phone signup succeeds, and a repeat also succeeds.
- Production Convex confirms one matching fictional record with phone and consent timestamp, without duplication.
- Both launch states checked at build time; prelaunch was restored before final publication.
- Existing workspace story labels still point to their original site slugs.
- Browser automation is unavailable (native startup failure), so these are HTTP, asset, build and database checks rather than an in-browser visual inspection.

Next: user reviews the here.now homepage. Future homepage changes can be built and published through these saved commands when requested.

## Direct prelaunch login published — 2026-10-14

The user explicitly approved using the existing website host for this login release and the missing generation configuration after the latest Convex-only instructions were raised. This approval covers this concrete release; the homepage launch switch remains false.

- Live direct login: `https://charpai.sreechand.pm/app/login`, reusing the existing authenticated workspace. No homepage login link was added; `/app` still redirects to `/#start` before launch.
- Deployment: `dpl_2wPZSu55o9zKJftLSWA711oqFioy`, immutable URL `https://agara-9mnpfi9uu-sreechands-projects.vercel.app`, promoted to the existing public domain.
- Saved a fresh, matching private generation authorization setting in the production website and Convex `elegant-mosquito-650`. No secret values recorded in documentation or source.
- Excluded `.specstory/` conversation records from website uploads.
- Verification: lint, 13 automated tests, deployment build/TypeScript, live Playwright browser checks of enabled email/password login and retained homepage update CTA, hidden homepage login, existing `/app` redirect, unsigned generation rejection, and generation endpoint configuration check. Production backend logs confirm the valid private setting reaches the recording prerequisite without spending a credit.
- Actual password submission and full story generation were not performed; the user retains their password and all complimentary credits for their own recordings. Next: sign in at the direct link and generate a story.

## Post-login homepage redirect fixed — 2026-10-14

The user reported that sign-in returned them to the landing page. Root cause: Google sign-in correctly targets `/app`, but its server page redirected to `/#start` while the homepage launch flag was false, interrupting the sign-in return. Removed that route-level launch redirect; the existing client sign-in and backend credit/ownership checks still guard generation. `/app/login` now redirects to canonical `/app`, so email/password login also stays in the workspace. Homepage launch updates and hidden login navigation remain unchanged.

Published and promoted `dpl_A46e9g1j3vHDt62Qmhpijkr9T1At`, immutable URL `https://agara-p5sd0ctop-sreechands-projects.vercel.app`, to `https://charpai.sreechand.pm`. Production backend and private settings unchanged.

Verification: lint, TypeScript, 13 tests and production build pass. A fictional development password account with one development-only complimentary credit successfully signed in through a browser, opened Record an interview without a payment prompt, and retained the workspace after reload. No production credit was used. Live browser checks confirm `/app/login` reaches `/app`, app reload does not redirect to the homepage, Google sign-in is enabled, and homepage launch-update signup/login visibility remain unchanged. Actual Google account authentication and full story generation were not performed by the agent. Next: user signs in at `/app` and uploads or records their interview.

## Facing-page PDF and back cover released — 2026-10-14

Published `dpl_DPregsJT6rS7UUzfG5oD6gb4B5NV`, immutable URL `https://agara-l5t4zm2ma-sreechands-projects.vercel.app`, to the existing public domain. Shared reader and PDF now use left illustration/blank pages facing right prose pages and include the selected logo at the bottom center of the back cover. Homepage remains prelaunch, direct `/app` remains accessible with existing sign-in/credit checks, and production backend/settings are unchanged.

Lint, TypeScript, 13 tests and production build pass. Rendered and visually reviewed the real saved Ba PDF and scanned its QR links. Actual live saved-story route, paired DOM and Export PDF download verified in Playwright: eight pages, three link annotations, TwoPageRight viewer layout, and visible back-cover logo. No new AI generation or credit consumption. Details and corrected local PDF path: `docs/STORYBOOK_DESIGN.md`. Next: user reviews or re-exports their book.

## Cover and single QR refinements released — 2026-10-14

Published and promoted `dpl_GyFhwUw1aLFpUneXsDSCuA7UPusE`, immutable URL `https://agara-n8zs9qm04-sreechands-projects.vercel.app`, to the existing public domain. Front artwork lines and series label removed; front brand text replaced with the selected small logo. Exactly one QR now appears at the first text page's top right. Back cover has the matching cloth pattern over its top 75%, with the existing logo below on warm paper.

Lint, TypeScript, 13 tests and production build pass. Revised PDF renders reviewed and QR scanned. Live Playwright browser and PDF download confirm eight facing pages, one link annotation on PDF page 3, correct QR margins, front-cover logo and 75% patterned back cover. Launch state, backend and credits unchanged. Next: user reviews the updated PDF; see `docs/STORYBOOK_DESIGN.md`.

## Customer-readiness release — 2026-10-14

Production Convex `elegant-mosquito-650` now has the four-credit entitlement/grant, balance, ownership/duplicate safety and missed-checkout callback recovery. Production price is 20000 paise. Backend deploy/schema/TypeScript checks passed.

Website release `dpl_6ZUZi8zpt3kkxTiR1esg5eUc8Wew`, immutable URL `https://agara-k6ibky5b1-sreechands-projects.vercel.app`, promoted to `https://charpai.sreechand.pm`. It replaces initial customer release `dpl_MbPnE4MSeSRjHBss24YYxX961mX5` and corrects the unavailable-checkout message. Both build/runtime point to production Convex; `CHARPAI_LAUNCHED=false` retained. Unlisted `/app/login` continues to redirect to `/app`. No here.now homepage release was needed.

Release built from `/private/tmp/charpai-customer-release` to avoid publishing another session's unfinished email code. That code's source edits were preserved. Environment files, notes, sample exports and credentials were excluded through `.vercelignore`. No Git commit/push.

Verified: 15 backend tests, lint, TypeScript, production build, real ₹200 development test-mode checkout granting four credits, real browser recording→AI transcription→three illustrations→saved reader→eight-page PDF, leaving three credits. Final public-domain browser check verifies fictional signup/sign-in/sign-out/reload, updated purchase message, hidden homepage login and unsigned payment rejection. Actual Google authentication was not performed.

**Release is not yet ready for a paying customer's purchase:** production has no live Razorpay keys. Dashboard shows Approved website and Generate Key. Browser tool requires confirmation to create the live credential; no key was generated or permission question asked. Live checkout intentionally remains unavailable, and production paid generation was not exercised. Next: securely configure live Razorpay keys and verify actual production checkout and generation. See `CUSTOMER_READINESS.md`.

### Live keys activated — 2026-10-14

Supersedes the earlier missing-live-key blocker: after user approval and SMS verification, the generated live pair is securely saved in production Convex elegant-mosquito-650; price stays ₹200 and development keeps test credentials. Live production order creation and real checkout opening pass, automatic capture is enabled, forged verification fails without granting credits. No code release or real payment made. Next: a fresh zero-credit account completes one real ₹200 purchase and verifies four credits. See `CUSTOMER_READINESS.md`.

## Plain login errors released — 2026-10-14

User's exact auth:signIn failure matched InvalidAccountId: password sign-in attempted without a corresponding password account. Released frontend error guidance and clearing on sign-in/signup mode switch, as dpl_AJW65PT6obCGWoRuofPqrL9C54LD (`https://agara-ktr6cuz55-sreechands-projects.vercel.app`) to the public domain. Lint, TypeScript/build and final live browser missing-account, wrong-password, signup, successful-sign-in tests pass; successful access reaches Pay ₹200.00. No real payment, backend update, launch flag change or live-key modification. Isolated release preserves concurrent email source work. Next: complete real checkout with a new account.

## Missing-account action released — 2026-10-14

Production password provider now sends typed missing-account/wrong-password failures. Website shows the corresponding message, with Create an account action retaining email and a signup-specific heading. Published dpl_ABwqY8Y6NojVQS984FSgZ7CtFY1y (`https://agara-chyjzroh7-sreechands-projects.vercel.app`) and promoted to the public domain. Backend deploy/dry run confirmed no index deletion; lint, 15 isolated backend tests, TypeScript/build and real development/public browser authentication checks pass. Concurrent development email components preserved/restored. Launch flag stays false, existing live Razorpay keys retained. Local checkout independently verified as ₹200 Test mode; user can test with mock payment details without making a real payment. Next: local simulated checkout.


## Login/signup layout published — 2026-10-14

User approved publishing after reviewing the local screens and requesting GitHub commit `955446b`. On inspection, the newer production release `dpl_BdNinQBKCn8ZLrUXBz743fxd699G` already contained the requested headings/action markup, but lacked the `.auth-actions` layout CSS. Reconstructed that exact release from its source manifest (106 local files matched uploaded SHA-1 values; retrieved the two differing source files through the authenticated deployment API), added only the approved two-column action CSS, and excluded project notes from upload. This preserves the concurrently published generation recovery and email integration; unfinished workspace edits were not published.

Published and promoted `dpl_J33DMfKoKuRGWNd7k7ZPj9Ein2CT`, immutable URL `https://agara-n32mistur-sreechands-projects.vercel.app`, to `https://charpai.sreechand.pm`. Existing project/organization verified; build/runtime retain production Convex `elegant-mosquito-650` and `CHARPAI_LAUNCHED=false`. No backend deployment or here.now update needed.

Verification: 33 tests pass, lint has no errors (three existing unused-variable warnings), local and hosted production builds pass. Actual public-domain Chrome review confirms Sign up left/Sign in right on login, “Sign up on Charpai” and Sign in left/Create account right on signup; both actions span one row and mode switching works. Live homepage retains October 15 updates collection with login hidden. No new account, payment, credit use, full generation, or launch-update submission during this layout release. Next: user reviews the live screens.

## Durable generation drafts and long-recording repair — 2026-10-14

Released production Convex workflow/checkpoint/draft APIs on `elegant-mosquito-650` and final website `dpl_987QPYRECPkms9T3h1qLHH7hKgJr` (`https://agara-fsbsgb9nd-sreechands-projects.vercel.app`) to the existing public domain. Existing email components/functions/settings were verified as already deployed and preserved. Website build/runtime use production Convex; homepage flag remains false. Existing here.now homepage was not republished. No Git commit/push or real payment.

33 tests, TypeScript, lint with no errors, deployment build and public-domain route/client/authorization checks pass. Real failed development 24:35 recording recovered and finished through the public worker: five transcript parts, complete transcript, extracted fields, three sections and all three images saved as a ready draft. Last legacy transcript part reused without another provider call; no additional story credit. Browser reload and reopening the complete draft succeed, with all illustrations rendered and original recording restored. A newer submitted draft also restores its two family photos. Customer story left in draft for review, not published. Details and practical response-loss limitation: `docs/GENERATION_RECOVERY.md`.

Next: review the recovered draft in the local test app's Saved drafts. Newly submitted production stories now save/continue through the same durable workflow.


## Full GitHub save and live testing — 2026-10-14

User requested committing all listed local changes, including notes and samples, and wanted to test the live app. Prepared a stable source snapshot at the start of the request. It passes 36 tests, lint with no errors (three existing warnings), TypeScript and production build. Credential-pattern scan found no matches; ignored environment files/credentials remain excluded. Website upload exclusions now also keep root project notes, design notes, source branding resources and reference screenshots off the website.

While checking, generation.ts/schema.ts changed and a new sourceReview module appeared in the workspace. Those newer edits fail TypeScript at this check and are beyond the passing snapshot; preserve them locally rather than overwrite or publish partially assembled code. The passing snapshot includes all files present at the start of this save request. No new paid generation or checkout was run for release validation.


### Checked snapshot released for user testing — 2026-10-14

Pushed application snapshot `ecabad1e6b91385222ef57b5a70c087ba00e2899` to GitHub main: 85 changed/new files, including requested notes and sample family-story artifacts. Published website release `dpl_8o2yGfPhPQ7SMADBbyd3nb5fTLfP` (`https://agara-qmbl72glu-sreechands-projects.vercel.app`) and promoted it to `https://charpai.sreechand.pm`. Production build/runtime retain `elegant-mosquito-650` and `CHARPAI_LAUNCHED=false`. Backend dry-run against that production target passed schema/TypeScript, deleted no indexes and showed only a Node action runtime configuration difference; the feature functions already matched the checked snapshot, so no backend code deployment was needed. Existing here.now homepage was not changed.

Validation: 36 automated tests, lint with no errors (three existing warnings), TypeScript, local production build and hosted production build pass. Live Chrome confirms login and signup switching. Live HTTP checks pass for homepage, app, login redirect, back-cover logo and sharing image; unsigned checkout, generation and worker requests return 401. Homepage keeps October 15 updates collection and hides login links. No new account, payment, email-trigger test or AI generation performed in this release. Full live purchase/recording/book flow remains for the user's test.

Important scope: other edits arrived while these checks ran. Newer generation/source-review and notification changes remain in the working folder and were not included in this passing snapshot; a TypeScript check of the changing folder caught errors. Do not claim the working folder is clean or that every latest concurrent edit is live. The stable snapshot protects those unfinished files from overwrite. Next: sign in at `/app` and test a recording with the released saved-draft/resume flow.
