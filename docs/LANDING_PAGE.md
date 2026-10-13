# Charpai landing page

## Conversation summary — 2026-10-06

The user supplied `/Users/sreechandt/Downloads/Charpai Landing Page_claude.html` and requested a local implementation to review before a production release.

## Local implementation

- Preserve the supplied page's cream, rust, blue weave patterns, typography, wording, and section layout.
- Convert the bundled custom-component HTML into a React component, with local logo and font files rather than its export runtime.
- Make `/` the landing page and move the existing sign-in/storybook workspace to `/app`.
- Connect Start a storybook and Log in to `/app`; Google sign-in returns to `/app`.
- Keep the three preview tabs and FAQ accordions interactive, and fix narrow-screen layout overflow.
- Replace the example duration/year/illustration bracket labels with neutral example labels. The maker's social handle remains plain text because the source has no destination URL.

## Review before production

- The supplied copy states ₹500 per digital keepsake. This is preserved for visual review, not configured as a checkout price or access rule.
- The supplied copy claims eleven supported languages and conversation steering. These claims have not been verified against the current app and need review before publication.
- The source says printable keepsakes are not yet available, whereas the current workspace offers PDF export; reconcile this copy before release.
- The example first spread uses the supplied woven placeholder illustration and is a visual demonstration, not a real generated family storybook.
- Production release remains pending the user's review. No deployment is authorized before that review.

## Validation

## Mobile revision — 2026-10-07

The user also requested a single action in the closing section headed “Someone in your family has a story only they can tell.” Removed its Continue with Google link; the Start a storybook button remains.

The user reported that the navigation links and duplicate top button crowded out the hero on a phone. The mobile header now contains a smaller logo and a Menu button. Navigation and the header's Start a storybook link stay hidden until Menu is opened, in a panel that does not push the hero down. The hero is centered, with smaller spacing and readable phone-sized text; its main action remains beside a quieter How it works link. Desktop navigation is unchanged. Checked visually in Chrome's iPhone 16 preview (393px wide), and confirmed the menu opens and closes. No deployment has run.

Type checks, lint, and production build pass. The development server is running at `http://localhost:3000`; `/app` is included in the build. Existing payment browser scripts were updated to use `/app` after the route move.

Chrome review completed on 2026-10-07: the landing page renders, switching to Family details and First spread changes the preview, the FAQ expands, and Start a storybook opens the existing sign-in page at `/app`. The desktop page was visually inspected. Mobile appearance was subsequently checked in Chrome’s iPhone preview, as recorded above. The local preview is left open in Chrome for the user's review. No production deployment has run.

## Launch updates and maker narrative — 2026-10-10

Implemented the requested screenshot narrative inside the existing maker section, preserving the personal introduction, listening references, and the conversation with Sreechand's mother. Added the generation between oral traditions and digital life, courtyard and journey memories, disappearing stories, and Charpai as a bridge for preserving community voices, humour, recipes, places, and lessons.

Before launch, header and hero actions say **Get launch updates** and lead to the closing form. Email is required; phone is optional. The form stores normalized contacts and the time consent was given in the existing Convex `waitlist` table. Validation errors are visible, submission has a saving state, and success says **You’re on the list.** Duplicate emails return success without creating a second record or overwriting existing contact details. No email or SMS sending service has been added; these are stored update requests, not automatically sent messages.

### One launch switch

`CHARPAI_LAUNCHED` defaults to false when missing. Keep it false in the frontend server settings before launch. Set `CHARPAI_LAUNCHED=true` and restart/release the frontend at launch. This single switch restores **Start a storybook**, the **Log in** link, and access to `/app` together. Before launch, direct `/app` visits redirect to `/#start`. Public story links remain readable. This is a visitor-facing launch gate, not a replacement for the backend's existing authentication.

The flag is read on incoming requests, rather than being frozen into the homepage at build time. `.env.example` records the default. There is no separate database flag to keep in sync.

### Verified results

- Production build and lint passed; all 13 automated tests passed, including launch defaults, contact validation, optional phone, normalization, consent recording, and duplicate protection.
- Backend changes deployed to development only: `qualified-bullfrog-386`.
- Chrome: submitted fictional email plus phone, saw the success message, and confirmed the stored development row.
- Chrome's iPhone 16 preview (393px): inspected the form, saw invalid-phone feedback, cleared the optional phone, and successfully submitted email alone.
- Browser: prelaunch homepage hides login; direct `/app` redirects to the form. A separate local launch-enabled server restores the login link and Start buttons and opens the existing Google/email sign-in screen.
- Maker narrative inspected visually on desktop.

Local prelaunch preview: `http://localhost:3017`. Production has not been changed. Next: publish the reviewed prelaunch version, then enable the single switch when ready to launch. Production Convex changes require fresh explicit approval under the deployment guard.

## Hero options and supplied sample story — 2026-10-13

Removed the pricing text under the hero actions in launch mode. The pricing FAQ was outside this request and remains unchanged. Prelaunch update collection and its launch switch remain in place.

Replaced the First spread tab's woven placeholder with the user-supplied stamp illustration and the title “The fog, the pinch, and shouting.” Included the complete supplied first-person Ba story without an editorial rewrite. The image sits on the left and the story on the right on desktop; they stack on phones. The text panel scrolls to accommodate the full story, with a visible reading cue and keyboard access. Removed the old preview's “Click any line to change it” instruction because this example is not an editor.

Four proposed hero hooks (not applied pending the user's choice):

1. Turn a conversation with someone you love into a book.
2. The stories you grew up with. A book to pass on. (Recommended.)
3. Before they were Nani and Dada, they had stories of their own.
4. Keep their words. Make them a family storybook.

Validation: production build and lint passed for the replacement. Browser access failed twice with “Sky Computer Use native pipe startup failed”; visual review is pending. No production release ran. Next: select a hook, then review the updated sample in a browser when access is available.

## Hero selection — 2026-10-13

The user selected option 2. Applied “The stories you grew up with. A book to pass on.” to the homepage hero, retaining the existing rust italic treatment on the second sentence. This supersedes the pending selection above. Next: visually review the local page before publishing.

## Hero and miniature spread sizing — 2026-10-13

Reduced the hero heading from its previous 96px maximum to 52px (44px maximum on phones), tightened the spacing, and aligned both hero columns to the same overall height. The left copy distributes the heading, description and actions across that height.

The First spread now presents a miniature two-page book rather than a full-size reading panel: smaller chapter/title/body text, the complete supplied story without a scrolling panel, and the supplied stamp artwork enlarged to 195% inside a cropped left page. The image and text remain side by side on phones to retain the book-spread shape. This display intentionally prioritizes an overall impression of the book over reading every word at homepage size.

Build passed. Browser inspection remains unavailable: the computer-use connection reported “Sky Computer Use native pipe startup failed.” Next: user visual review of the refreshed local page; production unchanged.

## Stable preview height — 2026-10-13

The user's screenshots showed the hero and next section moving when First spread was selected. Cause: only the selected tab's contents participated in sizing; the taller spread expanded the card and stretched the left hero copy.

All three panels now stay in the same grid cell and jointly reserve the tallest panel's height at the current screen width. Only the selected panel is visible. Inactive panels are hidden from assistive technology and made inert, so their controls cannot receive keyboard focus. Tab changes affect visibility only, keeping the hero copy, card bounds and following section stationary. This also adapts to narrower screens without a hard-coded height that could cut off family details.

Build and lint passed. Browser control still reports “Sky Computer Use native pipe startup failed”; the visual tab-cycle check is pending. Next: refresh the local page and cycle through all three tabs. Production unchanged.

## Book-style text alignment — 2026-10-13

Justified the miniature story paragraph with a left-aligned final line, automatic English hyphenation and equal 20px horizontal margins on desktop. Preserved the smaller phone margins and left-aligned chapter/title. The shared panel sizing still reserves the same space for all preview tabs. Visual review remains pending because browser control is unavailable. Next: review the refreshed First spread preview.

## Maker inspiration links — 2026-10-13

Linked The Moth and Story Collider to their official websites. Added the user-supplied Sahil Bloom tweet as another inspiration to build Charpai, immediately after the origin story about the conversation with his mother. Links open in a new tab. The tweet could not be retrieved through web access, so its content was neither quoted nor paraphrased; the inspiration attribution comes from the user. Next: review the maker section locally.

- Maker wording follow-up: the user requested “a recent tweet”; updated the linked inspiration sentence to “A recent tweet by Sahil Bloom was another inspiration to build Charpai.”

## Maker workdesk photo — 2026-10-13

Added the user-supplied workdesk photograph under the maker label in the left column, beside the existing narrative. A portrait crop and slight zoom frame the storytelling cards, handwritten notes and dice; the source photograph is preserved and the crop is applied by page styling. Added a short caption and descriptive alternative text. On phones the photo appears above the maker narrative. Next: review the maker section visually. Production unchanged.

## Meaning behind the maker photo — 2026-10-13

Replaced the literal workdesk caption with the user’s intended meaning: photos, letters and emails leave traces of our lives, while many older generations’ stories have no such trace and may never have been told. The caption closes with Charpai giving those stories a form we can keep. Used “many” to avoid claiming that all previous generations lack artifacts. Next: review the revised caption beside the maker note.

## Maker photo removed for now — 2026-10-13

At the user’s request, removed the workdesk photo and its caption from the maker section. Kept the source image available for possible reuse. The maker narrative and inspiration links remain. Next: review the maker section without the photo.

## Release request and hosting decision — 2026-10-13

The user requested going live with all reviewed changes. Preserve prelaunch mode: update collection active, login hidden, no maker photo/caption. Thirteen automated tests pass; the latest build and lint also passed before this request.

Release is waiting on a hosting decision. This repository has no `npm run deploy` command and is linked to an existing non-Convex host through `.vercel/project.json` (project `agara`). The user's standing instructions require Convex hosting and prohibit using another host without asking first. The current served Convex ship procedure requires a static export, whereas this Next app has runtime pages and Node API routes for generation, payments, publishing and updates. Changing hosts therefore requires application changes rather than uploading the existing build.

No production deployment or hosting change has run. Clarification needed: explicitly authorize the existing host for this release, or move the app to Convex hosting first. Do not infer that a Git push deploys the app. The production backend recorded in prior notes is `elegant-mosquito-650`; local environment currently targets development `qualified-bullfrog-386`.

## Live hosting verified — 2026-10-13

Checked the actual live domain instead of relying on the repository's old hosting metadata. `https://charpai.sreechand.pm` returns HTTP 200 with `server: Vercel`, `x-vercel-cache`, and `x-vercel-id` headers. Its public CNAME points to `6d72cbae092cf11d.vercel-dns-017.com`. Production Convex `SITE_URL` is `https://charpai.sreechand.pm`.

Verified conclusion: the public website is currently served by Vercel, while Convex supplies the backend/auth/storage. This corrects the uncertainty in the release note above. No production changes were made. Publishing remains the user's active request; their standing instruction forbids using a non-Convex host without asking, so obtain an explicit exception for the existing website host before releasing there.

## Production release completed — 2026-10-13

The user authorized publishing to the existing Vercel website after verifying that Convex supplies the backend while Vercel serves the public domain. This is an explicit exception for this release to the standing Convex-only hosting instruction.

Released all reviewed application changes to `https://charpai.sreechand.pm`. Production Convex backend `elegant-mosquito-650` was deployed first, with type checking and schema validation passing and no indexes removed. The website deployment is `dpl_2GHQSLuD263APbCVM2nrAGqe1ZcC`, at `https://agara-j4z79bxz4-sreechands-projects.vercel.app`, promoted to the existing public domain after the production build and authenticated homepage check passed.

Prelaunch remains active: `CHARPAI_LAUNCHED=false` was explicitly supplied at build and runtime. Both public and server Convex settings point to production `https://elegant-mosquito-650.convex.cloud`, not the development database. At launch, release with `CHARPAI_LAUNCHED=true`; do not reuse the false override from this prelaunch deployment.

Added `.vercelignore` so local environment files, project notes, sample exports and the removed workdesk image are excluded from the website upload. The image remains local for possible future reuse and its public URL returns 404. This was a direct release of the current local source, not a Git commit or push.

Verified on the actual public domain:

- HTTP 200 with the selected hero hook, update form, required email and optional phone, and all three maker inspiration links.
- Hero pricing and login link absent; direct `/app` access returns a 307 redirect to `/#start`.
- Ba artwork returns an image successfully; deployed source includes the full sample story, stable overlapping preview panels and justified text styles.
- Removed workdesk image returns 404 and is absent from the homepage.
- Invalid email is rejected with HTTP 400. A fictional email/phone signup succeeds; repeat submission also succeeds without duplication.
- Read the production waitlist to confirm exactly one matching fictional test entry with its phone and consent timestamp. No actual messages were sent and no real user contact information was used for the test.
- Thirteen automated tests, local lint/build, production backend validation and Vercel's production build all passed.

Verification used live HTTP responses, deployed assets and a production database check. Visual browser automation remains unavailable; do not describe the release as visually inspected in-browser. Next: the user reviews the live site; switch signup/login on when ready to launch. Automatic email/SMS delivery remains outside this release.

## Hero invitation and launch date — 2026-10-13

Replaced the hero’s process/editing explanation with: “Some stories only your family can tell. Keep them in their own words, in a book you can share and pass on.” Updated the prelaunch hero line and closing signup invitation to the user’s launch date, October 15, 2026. Update collection remains active; the launch switch has not been enabled and does not automatically flip on that date. These copy changes are local until the next release request. Next: review and publish the updated invitation/date.

## Preview intro sequence — 2026-10-13

On page load, show Recording for three seconds, then Family details for three seconds, then stop on First spread. Added a short fade when the visible panel changes. The shared grid still reserves the same height throughout. Clicking any tab cancels the remaining automatic changes, keeping the chosen tab selected. Timers are cleared when the component unmounts; visitors who request reduced motion go straight to the final spread without a fade. This is a one-time sequence, not a repeating carousel. Changes remain local pending the next release request. Next: check/publish the preview sequence and October 15 copy together.

Validation for the intro sequence: build and lint passed. Executed the actual timer effect with a controlled clock to confirm the three-/six-second transitions, termination, manual-cancellation cleanup, and reduced-motion shortcut. Visual browser review remains pending.

## Favicon replacement — 2026-10-13

Replaced only `app/icon.png` with the supplied `charpaiv8_ffav.png`, preserving its transparency. This file is Next.js’s browser icon; the header/footer logo asset and logo markup were not changed. Local pending the next publication. Next: publish with the updated copy and preview sequence.

## October 15 copy, intro sequence and favicon published — 2026-10-13

Published the latest requested changes to `https://charpai.sreechand.pm`: the shorter family-story invitation, October 15 launch announcement, one-time three-/six-second preview intro that stops on First spread, and the supplied browser favicon. Header/footer logos remain unchanged. Production deployment: `dpl_2Y9rWWFnBEANYmphAhvnxke8w93M`, immutable URL `https://agara-kstp9iw0z-sreechands-projects.vercel.app`.

Local lint/build and Vercel production build pass. Verified the protected production homepage before promotion, then the actual public domain: invitation and both date announcements present; prelaunch update collection remains active; `/app` returns its launch-gate redirect. Live favicon bytes exactly match `app/icon.png`; live logo bytes exactly match the unchanged website logo asset. Deployed JavaScript contains the one-time timings, reduced-motion handling, manual-cancellation cleanup and final spread. Actual timer behavior was checked locally with a controlled clock; no live visual browser automation was available.

No backend code changed since the previous verified release, so no redundant Convex deployment or new signup test was performed. Production frontend continues to use `elegant-mosquito-650`. Next: review the live site; enable signup/login only when the user asks to launch.

- Hero wording follow-up: changed “Keep them in their own words” to the user’s requested “Immortalize them in their own words.” Local change, pending publication.

- Recording-preview wording follow-up: replaced “A phone voice memo works. So does a call you recorded across cities.” with “A voice memo over the phone. Or a call recorded across cities.” Local pending publication alongside the hero wording update.

## Gentle preview crossfade — 2026-10-13

Changed the preview transition to a 700ms ease-in-out crossfade. Previously, outgoing panels became invisible immediately, so only the incoming panel faded. Outgoing visibility now changes after its fade completes; inactive panels remain inert and cannot capture clicks or focus. Shared grid sizing, the one-time sequence and manual cancellation remain unchanged. Reduced-motion visitors see an immediate switch. Local pending publication with the latest wording changes. Next: review/publish together.

- Linked “Follow @storygult” to `https://x.com/storygult`, opening in a new tab. Local pending publication with the latest copy and preview-fade changes.

## Card-first preview sequence — 2026-10-13

Separated the visible card from the highlighted button. The card crossfades first; after its 700ms fade, the corresponding button changes with a short colour transition. Rapid selections clear outdated highlight timers, and reduced-motion visitors skip both animation delays. The actual selected card still determines the button’s accessible pressed state immediately. Local pending publication. Next: review and publish the pending homepage changes.

## GitHub checkpoint request — 2026-10-13

The user requested committing all current project changes to GitHub. Includes the storybook redesign, update collection and launch gate, landing-page revisions/assets/favicon, release instructions, project documents and verification scripts. Latest hero wording, recording copy, gentle crossfade, delayed tab highlight and social link remain pending website publication; a Git push does not publish them. The GitHub repository is now named `sreechand/Charpai`; the existing `sreechand/agara` remote redirects there. Local environment/settings stay excluded. Build/lint and all 13 automated tests passed before this checkpoint. Next: publish the remaining homepage updates when requested.

Checkpoint privacy check: the removed original desk photograph contains GPS metadata, so it is kept local and ignored rather than uploaded to this public repository. All active website assets are included.

## Workdesk metadata cleanup — 2026-10-13

The user confirmed they have the original and authorized removing metadata from the local project copy. Removed metadata using a lossless JPEG transform, baking the original orientation into the pixels so the photograph stays upright. Verified that EXIF, XMP, IPTC and the orientation tag are absent, with dimensions unchanged at 2992 × 2992. The original in Downloads was not modified. The cleaned project photo is now included in the requested GitHub checkpoint; it remains excluded from website deployments and is not displayed on the page. This supersedes the earlier local-only exclusion.
