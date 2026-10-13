# Publishing Charpai

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

Current requested state: prelaunch updates collection; `CHARPAI_LAUNCHED=false`, login hidden, `/app` redirects to `/#start`.

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
