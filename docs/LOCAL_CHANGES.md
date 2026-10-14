# Local changes not yet saved to GitHub — 2026-10-14

Compared local HEAD with a fresh origin/main fetch: both are commit `955446b`; there are no committed changes waiting to push. At inventory time, 43 tracked files were modified and 37 additional files were untracked. This inventory file adds one further untracked document. No commit, push or deployment performed for this review.

Remaining work groups:

- Saved story drafts and generation recovery: background workflow, original recordings/photos, intermediate results, resume/retry, real progress, timeout/multipart fixes, ownership checks and tests. Main files include app/providers.tsx, components/storybook-app.tsx, app/api/generation-step/, convex/generation*, lib/generation* and lib/storybook-generation-engine.ts. Saved release notes report this is already deployed; complete recovered-story generation remained in progress at the latest recorded check.
- Email notifications: owner signup alerts, user login and story-event updates, templates, Resend integration, webhook processing, tests and private-settings setup helper. Recorded as live, with production signup delivery and duplicate suppression verified.
- Payments and login access: ₹200/four-credit checkout, credit balance/grant and payment recovery, clearer login failures, direct /app/login route and removal of the prelaunch /app redirect. Prior publishing notes record these releases.
- Storybook/PDF design: facing illustration/text pages, cover and back-cover logo/pattern, single QR placement, pagination/export changes and image assets. Recorded as previously released.
- Homepage and sharing: social preview metadata/image and additional here.now homepage build/publish tooling, app links and upload exclusions. Recorded as previously released.
- Project records and samples: publishing/readiness/stack/telemetry/design notes, action items and customer-planning updates; family-story transcript/review/questions, revised example story and sample PDF; branding source resources. Family-story material needs a deliberate sharing decision before inclusion in GitHub.
- Supporting package versions, generated Convex types and test/lint configuration accompany the changes above.

Live status above is based on recorded releases and this session's known deployment source; it is not a fresh end-to-end retest of every feature. Local GitHub differences do not imply those features are absent from the public app. Ignored local credentials/settings should remain excluded.

Next: review the application code and tests in coherent groups, keep private family-story material separate, and commit/push the reviewed groups on user instruction.


## Full GitHub save and live testing — 2026-10-14

User requested committing all listed local changes, including notes and samples, and wanted to test the live app. Prepared a stable source snapshot at the start of the request. It passes 36 tests, lint with no errors (three existing warnings), TypeScript and production build. Credential-pattern scan found no matches; ignored environment files/credentials remain excluded. Website upload exclusions now also keep root project notes, design notes, source branding resources and reference screenshots off the website.

While checking, generation.ts/schema.ts changed and a new sourceReview module appeared in the workspace. Those newer edits fail TypeScript at this check and are beyond the passing snapshot; preserve them locally rather than overwrite or publish partially assembled code. The passing snapshot includes all files present at the start of this save request. No new paid generation or checkout was run for release validation.
