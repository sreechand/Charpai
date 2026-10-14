# Project action items

## Direct story-generation workshop — 2026-10-13

- Current user priority: improve story generation using the supplied Telugu transcript, with samples written directly in the conversation and no API calls until the user says “commit this change.”
- Completed a seven-page draft directly in the conversation, through arrival at the village school, with a closing drawn from the narrator's own reflection. Draft wording and proposed generation rules remain under review. Application prompts remain unchanged; no API calls, commit, or deployment performed.
- User approved the three workshop rules: pages follow distinct memories; unclear details are resolved by asking the user one question at a time and revising the story after each answer; the ending follows the recording and only includes explicitly spoken reflection.
- First clarification answered: narrator is Ramadevi, speaking to her son. His great-grandfather is her grandfather; references to his grandfather probably mean her father and remain tentative where not explicit. Apply family terms from Ramadevi's point of view; updated confirmed great-grandfather references in pages 5 and 6 accordingly.
- Confirmed: Ramadevi's grandfather (the user's great-grandfather) imposed the no-job condition on her B.Ed. studies. Revised pages 1 and 3 to identify him from her point of view as “మా తాతయ్యగారు”.
- Confirmed: her first teaching job was at బీసెంట్ స్కూల్ (Besant School); added its name to page 4 in the conversation draft.
- Confirmed by user: a family well-wisher, neither her father nor grandfather, accompanied her to పేరాపురం. Revised page 7 accordingly; name remains unconfirmed. Nearby transcript references to “మడిపిల్లి రాజా గారు” / “మడిపులి రాజు” discuss posting help and do not clearly establish the companion's identity.
- Completed a full text review and consolidated the confirmed corrections into the seven-page conversation draft. Kept unconfirmed family identities unstated in the greeting-card and first-school permission passages; the village companion remains unnamed.
- Completed an editorial Telugu wording pass, including correcting “గోడ” (wall) to “గోడు” (troubles) in the letter passage. Kept the narrator's colloquial and mixed-language expressions; Ramadevi has not reviewed the edited wording.
- Drafted the agreed generation/clarification instructions for review: narrator-relative family terms, evidence from transcript plus confirmed answers, memory-based page count, spoken voice, one question at a time, immediate scoped revisions, handling unknown answers, source-supported endings, and whole-draft checks. Saved the proposed instructions in the prompt notes; application code is unchanged.
- Completed the manual rehearsal: consolidated eight-page conversation draft includes confirmed corrections and wording edits, with the declined job offer and Madras visit now separate memories. Review was against the transcript and answers, not original audio or Ramadevi's own review.
- Exported the complete latest Telugu draft at the user's request to [ramadevi-story.md](docs/ramadevi-story.md) for sharing with Ramadevi. Includes all eight pages and the closing reflection; no workflow notes in the shareable file.
- Next: Ramadevi's feedback on the draft, then revise the story and clarification record. App implementation waits for the user's “commit this change” instruction; current app prompts and five-section cap remain unchanged. No API calls or application changes made. Notes: [Storybook prompts](docs/STORYBOOK_PROMPTS.md).

## Product definition — 2026-10-10

- Filled [PRODUCT.md](PRODUCT.md) for Charpai at the user's request. It covers the job, switch, core flow, onboarding, first-release scope, riskiest guess, and milestones.
- Existing payment-first and one-payment-per-book decisions are preserved. Customer motivations and success signals are proposed; development verification is distinguished from live-release work.
- Next product check: show a sample to a prospective maker and see whether they commit a real recording and accept paying before their own draft. This research step does not replace the existing feature priorities or authorize a release.

## Storybook redesign — 2026-10-09

- Latest references implemented: green cloth-like cover title panel with an illustrated right panel; warm-paper interior with serif prose above one artifact per page, all forest-green ink. Updated actual generation prompt; verified fresh AI images, phone reading, three-page PDF, and nine-page long-text PDF. Both sample QR codes decode correctly and their destination opens without sign-in. Short fictional sample restored and local preview left ready. Final checks pass; production remains unchanged. Current notes: [Storybook design](docs/STORYBOOK_DESIGN.md).

- Correction requested and implemented: each spread now has the single artifact image on the left and prose on the right; PDF retains this pairing. Updated five-page sample visually reviewed. Both exported QR codes scanned to the correct local story URL, and the destination returned the expected content without sign-in. Live phone scanning awaits a released export with the live website address.

- Built the reference-style green cover and white spreads with larger serif type, measured page breaks, per-story QR codes, and one source-supported rubber-stamp artifact per section/page.
- PDF export preserves fixed A5 formatting, includes clickable QR links, and saves edited text to the same story URL. Development backend updated; production unchanged for this feature.
- Ten tests and production build pass. Real fictional generation produced two separate artifact images. Browser-exported three-page PDF visually checked; phone/desktop output identical and both QR codes decoded correctly. Long text saved intact, showed 12 reading pages, and exported as a visually checked 13-page PDF with all 12 story links.
- Notes and limitations: [Storybook design](docs/STORYBOOK_DESIGN.md). Next: review the sample PDF, then approve production release.

## Live login blocker — 2026-10-09

- Confirmed: Google login succeeds, but the live app calls `payments:status`, which production `elegant-mosquito-650` has not deployed. Browser console and production logs agree.
- All six payment tests pass. Fixed a shared-file import caught by the release dry-run; the repeated dry-run passes backend typechecking and schema validation, with no index deletions.
- Next: approve and deploy the current backend to the named production deployment, then verify the signed-in page in the user's browser. Reload alone did not fix the failure. No production release has been performed in this session.

Update: user approved and production backend deployment completed successfully. Verified the same signed-in Arc page finishes loading and displays three saved stories. Login-page blocker resolved. Fresh Google login was not repeated. Checkout remains unavailable because the live price is unset; next: configure production checkout after confirming the price and live payment setup. The shared import fix remains uncommitted locally.

## Next feature priority — 2026-10-07

The user asked what comes next in the action items. The highest remaining original feature priority is live interview guidance: listen during recording and suggest a useful follow-up question based on the storyteller's words. Current prompts are static; this feature has not been built. Recommended next action: build and test this flow. Longer-book PDF output and edits after confirmation remain separate release checks. Recent changes and verification notes were pushed to GitHub through `3009613`.

## Microphone and PDF checks completed — 2026-10-07

- Local microphone capture, playback, download, and recovery passed; downloaded audio decoded successfully.
- Fixed sample PDF spreading across three pages. Visually verified the exported one-page PDF with all text and artwork.
- TypeScript, lint, and production build passed. Changes are in `ad9e96a`; production remains unchanged.
- Next: verify longer generated-book PDF output and edits after confirmation, then review production release readiness.

## Paid upload journey passed — 2026-10-07

- Verified real upload → transcription → story and image generation → edit → save → sign out/in → full reload → reopen the same saved book, using fictional test audio and the previously paid development account.
- Edited title and dedication persisted; reopening required no new payment. Removed automatic external hosting from Confirm changes; the flow now saves with Convex.
- TypeScript and lint pass. Remaining checks before release: live microphone capture, PDF export, and whether edits after confirming persist. These were not verified by the upload journey.

## Recommended next check — 2026-10-07

After Razorpay confirmed the test integration, the user asked what comes next. Recommended verifying the complete paid-user journey: use a paid development account, record/upload, generate and edit a storybook, save/publish it, then sign out/in and confirm the same book remains accessible without another payment. Payment checkout is verified; this full journey has not been verified in this session. Production release follows after resolving any failures and obtaining explicit production approval. The next original feature priority remains live interview guidance.

## Razorpay test integration confirmed — 2026-10-07

- Synced the wizard's current test keys to development only, with user approval; secrets remain ignored.
- Fresh ₹500 test card payment `pay_Tkz2xS8n3qP1f2` completed through Charpai checkout and unlocked the recording workspace.
- Retried the wizard until step 4 explicitly confirmed Transaction successful and successful website integration. Earlier “no transaction” reports are historical; live payment setup remains unfinished.
- Next: review the first-use flow after payment, then prepare a separately approved production release.

## Razorpay onboarding retry — 2026-10-07

- Retried the wizard's completed-test-transaction check; it still reports none, despite the captured card payment verified in the dashboard.
- Reopening the wizard automatically generated a different test key. Next: align the development app with that key securely, complete a fresh checkout, then retry the wizard. Key-specific filtering remains a hypothesis; no production changes were made.

## Current status — 2026-10-07

The recovered original list has eight items, with automatic payment verification and Razorpay integration overlapping.

Remaining feature work:

1. Live interview guidance: suggest questions based on what the storyteller is saying. Highest original priority; current prompts are static.
2. Improve the generated storybook's design and format.
3. Add recording playback alongside the saved/shared storybook. Recording preview already exists before generation.
4. Add QR code access to shared storybooks.

Implemented locally/development:

- Razorpay checkout and automatic captured-payment verification.
- One payment unlocks one book and ongoing access; unused payment and unfinished books persist across logins.
- Landing page, mobile layout revision, and Google-branded sign-in button.
- Generation usage and error tracking; broader product tracking/reporting can be assessed separately.

Next release work: commit the pending paid-onboarding changes, review the first-use flow after payment, reconcile landing-page claims with shipped features, and prepare production payment configuration for an explicitly approved release. Production remains unchanged. Six payment tests pass; simulated Razorpay checkout was completed successfully in Chrome.

Conversation summary: the user asked for the remaining action items. Checked the saved laundry list, onboarding/landing notes, and feature references in the code; separated remaining feature work from development implementations and release tasks.

## GitHub checkpoint — 2026-10-07

- User requested committing and pushing all current changes to GitHub `sreechand/agara`, branch `main`.
- Includes payment-first onboarding, one payment per storybook, returning-user paid access and draft resumption, backend payment access checks, updated verification scripts/tests, and Razorpay transaction evidence.
- Verified before committing: all six automated tests, TypeScript checks, lint, production build, and whitespace checks pass. Configured secret values are absent from changed files; `.env` and `.env.local` remain ignored.
- Browser and Razorpay dashboard confirmed the ₹500 test card payment is captured. Pushing to GitHub does not deploy the app.
- Next: retry Razorpay's onboarding test-transaction check; production release remains a separate task.

## Laundry list

Recovered from the earlier conversation on 2026-10-06. The original list contains eight items. Completion status has not been checked against the current app.

1. Automatically verify payments so users can start using the app without manual UPI payment checks.
2. Improve the generated storybook's design and format.
3. Allow audio playback alongside the storybook.
4. Allow anyone to open a shared storybook by scanning a QR code.
5. **Top priority: live interview guidance.** Suggest questions and steer the interviewer toward stories based on what the interviewee is currently saying.
6. Create an appealing landing page that encourages people to try the app.
7. Collect ongoing usage and error data to understand what works, what breaks, and what needs improvement.
8. Integrate Razorpay instead of IndiePay.

Items 1 and 8 overlap and were combined in the later build plan.

## Previously discussed build order

1. Live interview guidance.
2. Usage and error tracking.
3. Better storybook design.
4. Audio alongside the storybook.
5. QR code access.
6. Razorpay payments with automatic verification.
7. Appealing landing page.

## Conversation summary — 2026-10-06

- Retrieved the original laundry list from saved conversation history. The user recalled twelve items, but the recovered list contains eight.
- Checked project Markdown files, including hidden folders; the laundry list had not been saved as a project document.
- The user requested that future project discussions be summarized in relevant Markdown files within the project.
- Saved this list in `ACTION_ITEMS.md` and recorded the ongoing summary rule in `AGENTS.md`. Other topics will use an existing relevant file or `docs/<topic>.md`.
- Next step: check each action item against the current app and record verified completion status.

## Razorpay update — 2026-10-06

- The user requested Standard Web Checkout and supplied test credentials, which are stored only in ignored settings.
- Implemented authenticated order creation, checkout, server signature and captured-payment verification, private Convex order records, and cancellation/failure/retry handling. New storybook run records use verified payment status instead of automatically claiming payment was received.
- Deployed the payment backend to development only. Automated payment tests and browser error-flow checks pass; real Razorpay test orders and checkout-window opening were checked. No captured test payment was submitted.
- Price and whether a payment buys one book or ongoing access are awaiting the user's decision. The temporary ₹1 test price was removed. Enforced payment access and production release remain pending.
- Full setup, file list, test results, and manual steps: [Razorpay notes](docs/RAZORPAY.md).

## GitHub checkpoint — 2026-10-06

- The user requested committing and pushing the current local changes before discussing pricing.
- This checkpoint includes generation telemetry, recording updates, Razorpay checkout, automated checks, and project notes.
- Destination: `main` in `sreechand/agara`. Local environment files remain ignored and are not included.
- Pricing and the payment access rule remain the next product decision; pushing code does not deploy the app.

## Landing page — 2026-10-07

- Implemented the user's supplied Claude HTML export as the local homepage, preserving its visual direction and draft copy. Local assets include the logo and fonts.
- Moved the existing storybook workspace to `/app` and connected the landing-page start/login links and Google sign-in return route.
- Type checks, lint, and production build pass. Visual browser review remains pending because the computer-use tool denied access to Arc.
- The user wants to inspect it locally before production. Draft pricing, language claims, interview guidance, printable-copy wording, and the missing social destination need review before release.
- Notes: [Landing page](docs/LANDING_PAGE.md). Next: review `http://localhost:3000`.

- Builder Pulse: fresh GrowthX receipts verified for Codex and Claude Code; context sharing configured for Agara and old reporting plugins removed. Restart open agent windows and sign in to Claude Code again: its test reported an expired login (see docs/builder-pulse-setup.md).

## Prelaunch update collection — 2026-10-10

- Done locally: blend the supplied bridge/oral-tradition narrative into the existing maker story.
- Done locally: required email and optional phone update form, stored consent time, validation, duplicate protection, and visible saving/success/error states.
- Done locally: hide login and redirect direct `/app` visits before launch. `CHARPAI_LAUNCHED=true` restores start/signup/login together after a frontend restart/release.
- Verified: Chrome desktop and iPhone form review, real fictional development signups, invalid-phone recovery, both launch modes, build, lint, and 13 automated checks.
- Development database updated; production unchanged. Next: review/publish the prelaunch version. At launch, enable the switch. Update delivery is not automated by this change.
- Details and switch instructions: [Landing page](docs/LANDING_PAGE.md).

## Storybook prompt review — 2026-10-12

- Exported the complete current local story, illustration, details-extraction, speaker-selection, and single-speaker transcription prompts to `docs/STORYBOOK_PROMPTS.md`, including the embedded design-system text and all twelve interview questions.
- No prompts or generation behavior changed. This is a source-code snapshot, not confirmation of the live deployment.
- Review next: inconsistent multi-colour design instructions versus single-ink artwork, explicit story section count, and demo fallback content when model fields are missing. Compare future changes using the same source transcript.

## Landing sample and hero hooks — 2026-10-13

- Removed hero pricing text; replaced the First spread placeholder with the supplied Ba artwork, title, and full story. Preserved the existing prelaunch switch.
- Proposed four new hero hooks in `docs/LANDING_PAGE.md`; current heading awaits the user's choice. Recommended: “The stories you grew up with. A book to pass on.”
- Build/lint checks pass. Visual browser review is pending because browser access failed twice; production unchanged.
- Next: select the hero hook and review the replacement spread visually.

- 2026-10-13: User selected hero option 2; applied “The stories you grew up with. A book to pass on.” Selection is complete. Next: visual review before publication.

- 2026-10-13: Reduced and balanced the hero against its preview; changed the First spread into a miniature book with smaller text and a closer stamp crop. Build passed; visual review awaits the user because browser control is unavailable. Next: review the refreshed local homepage.

- 2026-10-13: Fixed preview height changes by keeping all three panels in one shared grid cell, reserving the tallest panel's space while hiding inactive panels visually and from keyboard/assistive access. Build/lint pass; visual tab cycling awaits local review because browser control is unavailable.

- 2026-10-13: Applied justified prose, English hyphenation and even book-style margins to the First spread preview. Next: local visual review.

- 2026-10-13: Added official The Moth/Story Collider links and the supplied Sahil Bloom tweet as a maker inspiration. Tweet content was unavailable; no claims about its content added. Next: review the maker section.

- 2026-10-13: Added the workdesk photo to the maker section with a portrait crop, caption and descriptive alternative text. Next: local visual review.

- 2026-10-13: Replaced the workdesk caption with the intended contrast between our recorded traces and older stories that may never have been told. Next: review the revised caption.

- 2026-10-13: Removed the maker photo and caption for now, as requested; kept the image file for possible reuse. Next: review the maker section.

## Publish reviewed changes — 2026-10-13

- Requested: release the reviewed landing page and storybook updates, keeping prelaunch email collection and hidden login.
- Checks: all 13 automated tests pass; latest build/lint passed. Production unchanged.
- Hosting decision required: repository is linked to an existing non-Convex host, but standing instructions require Convex. The current app needs server routes and cannot be published as a Convex static export without adaptation.
- Next: obtain the hosting choice, then complete release and live verification. Do not treat Git push as deployment.

- Hosting verified on 2026-10-13: live `charpai.sreechand.pm` is served by Vercel (HTTP headers and DNS), with Convex backend and matching production SITE_URL. No release made. Next: obtain permission to use the existing website host despite the standing Convex-only hosting instruction, then publish and verify.

## Live release completed — 2026-10-13

- Published all reviewed application changes to `https://charpai.sreechand.pm` after explicit authorization to use the existing Vercel website host. Convex backend remains production `elegant-mosquito-650`.
- Deployment: `dpl_2GHQSLuD263APbCVM2nrAGqe1ZcC`. Prelaunch updates enabled, login hidden, `/app` redirected; `CHARPAI_LAUNCHED=false` at build/runtime. At launch, release with the flag true.
- Verified actual live homepage, image and source assets, maker links, app redirect, invalid input rejection, and one fictional production signup with phone/consent and duplicate protection.
- Local build/lint and 13 tests pass; Convex validation and Vercel production build pass. Browser visual verification unavailable. New paid production storybook/PDF generation not run during release.
- Added upload exclusions for local settings, notes, sample exports and removed desk photo; the removed image is not publicly available.
- No Git commit/push performed. Automatic update emails/SMS not implemented. Next: review the live page, then enable signup/login when ready to launch.

- 2026-10-13: At the user's explicit request, saved the verified Vercel website/Convex backend setup and standing authorization for requested routine production releases in `AGENTS.md` and `docs/PUBLISHING.md`. This supersedes the older Convex-only hosting restriction for Charpai and repeated skill approval prompts for these targets. Preserve prelaunch mode until the user asks to enable signup. Next: use the saved procedure on future release requests without asking again.

- 2026-10-13: Shortened the hero supporting copy to a family-story invitation without process/editing details. Announced October 15, 2026 in the hero and signup section. Prelaunch remains active; no automatic launch switch. Changes are local pending publication. Next: review/publish the updated copy and date.

- 2026-10-13: Added a one-time preview intro: Recording (3 seconds), Family details (3 seconds), then stop on First spread. Manual tab clicks cancel autoplay; reduced-motion visitors skip the sequence. Keeps stable panel height. Local pending release alongside the October 15 copy. Next: verify and publish together.

- 2026-10-13: Replaced only the browser favicon with the supplied image; website logos unchanged. Local pending publication alongside the launch-date copy and preview intro sequence.

- 2026-10-13: Published the shorter hero invitation, October 15 launch date, one-time preview sequence and new favicon to `https://charpai.sreechand.pm` (deployment `dpl_2Y9rWWFnBEANYmphAhvnxke8w93M`). Production build passes; verified live copy/date, prelaunch redirect, exact favicon bytes, unchanged logo and deployed timer/cancellation code. Next: review live and enable signup/login when ready to launch.

- Changed hero wording to “Immortalize them in their own words,” as requested. Local pending publication; next: publish this copy update.

- Updated the recording preview to “A voice memo over the phone. Or a call recorded across cities.” Local pending publication with the hero wording change. Next: publish both copy updates.

- 2026-10-13: Added a gentle 700ms preview crossfade, including fading the outgoing panel before hiding it. Preserves stable sizing and reduced-motion behavior. Local pending publication with the two wording updates. Next: review/publish together.

- Linked “Follow @storygult” to the supplied X profile. Next: publish with pending copy and fade updates.

- 2026-10-13: Preview card now finishes its fade before the title button highlight transitions. Pending publication with the copy, fade and social-link changes.

- 2026-10-13: User requested committing/pushing all current project work to GitHub `main`. GitHub identifies the repository as `sreechand/Charpai` (old `agara` remote redirects). Includes code, assets, tests and project notes; local secrets/settings remain excluded. Latest homepage wording, crossfade, card-first highlight and social link are not yet live. Next: publish those changes when requested.

- 2026-10-13: User authorized metadata removal from the local workdesk image. Removed it losslessly, preserved upright orientation and dimensions, and kept the original untouched. Include the clean image in the GitHub checkpoint; it remains absent from the website.

- 2026-10-14: Updated login/signup wording and side-by-side actions: signup shows “Sign up on Charpai”, Sign in left/Create account right; login shows Sign up left/Sign in right. Browser checked at 1267px, 375px and 320px; targeted ESLint and TypeScript pass. GitHub save requested; no publication requested. Details: `docs/LOGIN_SCREENS.md`. Next: publish when requested.
