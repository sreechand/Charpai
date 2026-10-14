<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

## Save conversation summaries

Whenever we discuss project work, save a concise summary in a relevant Markdown file in this project before handing back to the user. Update an existing topic file when possible; otherwise create `docs/<topic>.md`. Keep the laundry list, priorities, and action-item decisions in `ACTION_ITEMS.md`. Record decisions, open questions, and next steps; distinguish verified results from proposals and historical reports. Tell the user which file was updated. Do not save secrets or unnecessary personal information.

## Charpai publishing — standing user instructions

These instructions apply to this repository (`agara` / Charpai), not other build-sprint projects. The user confirmed the actual hosting setup and explicitly authorized saving it so future releases do not require another hosting or production confirmation.

- Public website: `https://charpai.sreechand.pm`.
- Website host: Vercel, existing project `agara`, scope `sreechands-projects`. Linked project ID: `prj_KAoDFYupguaRuJLcHqvrNjWZX9Bm`; organization ID: `team_4hAbbgopGcp30kM5G3gEhy27`.
- Backend, sign-in and storage: Convex. Production deployment: `elegant-mosquito-650`; public/backend URL: `https://elegant-mosquito-650.convex.cloud`. Development deployment: `qualified-bullfrog-386`.
- The earlier Convex-only hosting instruction is superseded for this repository: retain the existing Vercel website and Convex backend. Do not migrate hosts as part of publishing.
- When the user asks to publish, deploy, go live, or release changes, that request authorizes the normal production website release and any corresponding Convex function/schema updates needed for those changes on the named targets. Announce the targets and proceed; do not ask for another hosting or production approval. This explicit user authorization takes precedence over a skill's requirement for a new production confirmation for these routine releases.
- This is permission to carry out requested releases, not to publish every local edit automatically.
- Publishing does not mean opening signup/login. Keep `CHARPAI_LAUNCHED=false` until the user asks to launch or enable the signup workflow. When publishing later, preserve the launch state the user most recently requested.
- There is currently no `npm run deploy` script. Git pushes do not deploy this app. Use the existing Convex and Vercel CLIs; do not assume static Convex hosting can run this Next.js app's server routes.
- Before release, verify the linked project and production backend, run appropriate checks, and use production Convex settings for both website build and runtime. Never upload local `.env` files, project notes, sample exports, or the removed desk photo; preserve `.vercelignore`.
- Verify the actual public domain after release, including the homepage, the current login/launch behavior and update signup when active. Report what was tested and record the deployment in project notes.
- Concrete publishing commands and verification details: `docs/PUBLISHING.md`.

### Additional here.now homepage

The user explicitly authorized publishing the homepage to `https://charpai.stories.here.now/` in the existing Charpai `stories` workspace. This is an approved additional homepage destination, not a migration of the authenticated app or backend. Its Site slug is `bronze-glacier-wpz9`; use `npm run build:landing` and `node scripts/publish-herenow-landing.mjs` for requested updates. Preserve the exact `charpai` label, public access, existing story labels, and the user's launch flag. Signup capture proxies to the existing production website and Convex database; after launch, login/signup links lead to the existing `/app`. Read `docs/PUBLISHING.md` for state/version checks and both destinations. Do not upload `.herenow` state or credentials. A here.now publish does not automatically publish Vercel changes.
