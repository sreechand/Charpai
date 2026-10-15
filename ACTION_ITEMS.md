# Text-editing release — 2026-10-15

- Commit and publish scoped exact-wording editing/regeneration, text download and owner-safe reopening of saved wording. Preserve the current launch flag and already-live PDF template. 79 tests, TypeScript/build and release browser checks pass; deployment/public-domain verification follows. Other local projects remain outside this release.

# Project action items

- 2026-10-14: Resend is live on production `elegant-mosquito-650`. Infomaniak records saved and sender verified; existing inbox preserved. Restricted sending key and signed delivery callback connected privately. Setup email and controlled signup alert delivered; duplicate signup produced one alert. Signup to owner, login/story to account user. 22 earlier tests and deployment TypeScript checks pass. Historical pending setup entries below are superseded. Next: observe real customer events and remove the unused first restricted key during housekeeping. Details: `docs/SIGNUP_NOTIFICATIONS.md`.

- 2026-10-14: Resend and Infomaniak sign-in completed. Added mail.charpai.sreechand.pm in Resend; prepared its three verification records and first TXT form, without saving DNS or creating a key. Existing Infomaniak inbox stays intact. Grouped browser-tool confirmation pending for domain sending authorization/key creation. Prepared ignored private settings and safe explicit-target setup script. Next: receive that confirmation, save/verify records, connect sending-only key and webhook, test delivery, activate alerts. Details: `docs/SIGNUP_NOTIFICATIONS.md`.

## First customer session — 2026-10-14

- First customer is scheduled for tonight at 9pm (Asia/Kolkata), as reported by the user. This supersedes the earlier next step of finding a prospective maker.
- Next: check the customer journey before the session, then record what they complete and where they need help. Payment and successful completion remain unconfirmed.

- 2026-10-14: User approved Resend for signup/login/story-generation services. Implemented shared templates, server-only deduplicated event hooks, official queue component and signed-webhook route on development. 22 tests, TypeScript and real dev auth/event checks pass; delivery disabled. Defaults: signup to owner, login/story updates to account user (configurable). Resend login/API key/allowed sender still missing; no real delivery or production release yet. Chrome setup tab is held for user sign-in. Next: connect credentials/sender, test real delivery, review unrelated pending payment changes, release and enable. Details in `docs/SIGNUP_NOTIFICATIONS.md`.

- 2026-10-14: User requested automatic signup alerts and a current count. Production has three genuine launch-update signups plus two test entries (five total). No email provider configured. Proposed one queued owner email per new unique signup, with available contact fields/time; duplicates send no new alert. Provider permission required by the latest project instructions before adding Resend. Details in `docs/SIGNUP_NOTIFICATIONS.md`. Next: obtain that permission and configure/test delivery.

## Reference storybook feature inventory — 2026-10-14

- Reviewed the user-supplied Magic Patterns family fieldbook in Chrome: both stories, chronology, object/place/person threads, keepsake interactions, language/narration controls and physical-print previews.
- Saved the observed features and separately identified the authoring/storage/generation tools needed to create them in [Storybook design](docs/STORYBOOK_DESIGN.md). Added the earlier code comparison and complete first-stage audio-linked clarification plan; these are documented findings/proposals, not implemented features.
- Proposed order: (1) source-linked memories, family profiles and original artifacts; (2) editable multilingual stories, reader and printable output; (3) chronology/threads and disagreements; (4) tactile interactions, restoration, ambience and specialty physical-book production. These priorities remain proposals.
- Comparison completed earlier in this conversation: 13 tests passed and a saved local book was checked in Chrome. Findings are historical because other project work has since changed application files; recheck before implementation. Existing shortening, local-only photos, lost source timing, demo fallbacks and transcript edits that do not rebuild the story were identified.
- User added a requirement: ask transcript-based clarifying questions one at a time, show the relevant excerpt, automatically move the recording player to the question's timestamp, save the response, and generate/revise the story with clickable source timestamps and audio playback.
- First-stage plan: preserve original audio/full transcript and separate corrections; retain original-recording timestamps; remove narrative shortening; store source-linked revisions/checkpoints; report every omission; resume processing without consuming a new book credit; verify reader/PDF completeness and source ownership. Proposed defaults: seek without autoplay, replay the selected passage, allow unresolved answers, and keep shared recording access off unless explicitly enabled.
- Current authorization is to save these Markdown notes only. No application changes, paid generation, commits or publication were made for this documentation write.
- Next: implement the documented first stage when requested, after checking the latest generation/recovery code. Later stages remain family profiles/keepsakes, richer reader/PDF, chronology/threads, tactile interactions and specialty printing.

## PDF back-cover logo — 2026-10-14

- Saved the user-selected under-bed Charpai logo unchanged at [resources/branding/charpai-back-cover-logo.png](resources/branding/charpai-back-cover-logo.png); original file match and transparent PNG dimensions verified.
- Use this artwork for the back cover in future PDF work. Asset and decision saved; PDF behavior unchanged.
- Next: place the resource on the PDF back cover when that work is requested. Details: [Storybook design](docs/STORYBOOK_DESIGN.md).

## Link preview image — 2026-10-14

- Set the supplied charpai artwork as the sharing image locally for both the Next app and standalone homepage. Preserved the original PNG unchanged; current page artwork is unchanged.
- Both builds, changed-file lint, metadata/asset checks, and browser image inspection pass. No commit or publication. Actual messaging-app preview remains a post-release check.
- Next: publish the homepage updates when requested and verify a freshly shared link. Details: [Landing page](docs/LANDING_PAGE.md).

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
- 2026-10-14: User asked about brevity. Verified that the shareable file is a complete edited draft, not exhaustive transcript coverage. Several meaningful episodes were omitted, including detailed family difficulties, the family-doctor exchange, and the unclear passage about meals; other details were condensed or omitted because the transcription was uncertain. Story file unchanged.
- 2026-10-14: New user requirement supersedes brevity limits: preserve all narrations and details, with no word/page/book-length limit; after every generation or revision, report everything left outside the readable story and why. Updated the proposed workshop instructions accordingly.
- Rebuilt [ramadevi-story.md](docs/ramadevi-story.md) as a 23-chapter expanded draft. Preserved all 330 source entries in [ramadevi-transcript.md](docs/ramadevi-transcript.md); added a detailed coverage and omission report in [ramadevi-story-review.md](docs/ramadevi-story-review.md). No narration intentionally omitted solely for brevity; several substantive transcription uncertainties still await clarification.
- User will ask Ramadevi about the meals-arrangement question and get back to us; leave that passage unresolved while proceeding with other clarifications. Story unchanged.
- User-approved family-work context: describe Radha Babu simply as Ramadevi's cousin close to the family; this is enough relationship detail. Updated story to “రాధాబాబు నా కజిన్” and removed the maternal-side qualifier at the user's request. Do not ask further about the family branch/generation. Her father's accounts-work sentence remains; omission report updated.
- User confirmed the word at 22:50 is Jute and supplied corrected 23:17 wording mentioning a mother's sister's son and going there to work. Saved the correction alongside the original transcript. Exact business type is not confirmed.
- Selection clarification received: Ramadevi recollects only an interview. Added that to the story with an explicit memory qualifier; omitted the conflicting written-test/pass fragment from readable prose, retaining it in the source and omission report. No existing narration removed.
- Clarified 28:25: her father put her down with words. Restored that narration without claiming physical hitting; no narration removed. Source clarification and omission report updated.
- Clarified 00:42: the older aunt married into a cinema-hall family, her mother-in-law did not look after her properly, and the aunt died. All confirmed details restored; no causal claim about the death added. Earlier personal-ownership implication corrected. Source notes and omission report updated; no narration removed in the latest revision.
- Confirmed 01:03–01:27: Ramadevi's father took a business risk and it failed. Replaced the garbled outcome in the opening with the confirmed failure, preserving all surrounding narration and adding no financial/legal specifics. Source and omission notes updated.
- Restored confirmed money account (22:21–22:43): salary around ₹325/month, rickshaw expenses around ₹150–₹175, ₹25 kept for herself, rest given to her father. Kept amounts approximate; no calculated balance or narration removed. Source and omission report updated; do not ask the already-answered rickshaw question again.
- Confirmed 02:08: the letter also promised not to speak to any men. Restored “మగపురుగుతో మాట్లాడను అని కూడా రాశాను” without removing narration. Source and omission report updated.
- Confirmed 25:50: her father accompanied her to the government-job interview. Updated companion and acquaintances to “డాడీ”; no narration removed. Source and omission report updated. Village companion remains the separately confirmed family well-wisher.
- Confirmed greeting-card recipient (09:03–09:23): Ramadevi's grandfather, the family head. Updated his identity, the stated reason she gave him the envelope, and his subsequent reaction in the story; no narration removed. Source and omission report updated.
- Confirmed Besant School permission (17:20–18:57): she asked her grandfather and he allowed it. Named him in the request, consideration, rickshaw rules, and approval passages; her father remains the person who accompanied her to join. No narration removed; source and omission report updated.
- User confirmed her father took her on Besant School joining day. Updated both references to that day; retained subsequent daily rickshaw travel without claiming daily father accompaniment. Unconfirmed ten-o'clock time stays outside the story; no other narration removed. Source and omission report updated.
- Confirmed B.Ed. college: Maharaja College in Vizianagaram (11:49). Added the city to the story; no narration removed. Unclear neighbouring building/institution words remain in the source and omission report.
- Confirmed visiting restriction (32:04–32:16): she could visit only her aunt's house. Corrected the absolute no-visits statement and restored that exception, retaining limited exposure/village fear. Exact aunt name/place remains unresolved; source and omission report updated.
- Confirmed Madras host (15:32–16:04): her father's younger brother. Added “మా బాబాయి ఇంట్లో ఉన్నాను. ఆయన మా డాడీ తమ్ముడు”, retaining childcare, language/job limits, and return details. No narration removed; source and omission report updated.
- Confirmed Babu is her older aunt's son and connected to Alankar Theatre. Added the general theatre connection to the story. User's suggestion that he may live nearby stays outside prose as tentative; do not infer ownership/employment. No existing narration removed; source and omission report updated.
- Confirmed Madras trip companion: Babu, her older aunt's son, called “Babu uncle” by the user. Corrected the earlier father-as-traveller interpretation, preserving the phone plan without guessing its caller. Her father's younger brother remains the separate host. Caller/in-law and tentative Alankar residence details remain outside prose; source and omission report updated.
- Completed 06:52–06:56 correction: Ramadevi carried the mental burdens, while her sister was not weighed down by those worries and was living a happy life. Restored “హ్యాపీ లైఫ్” as the sister's life; no narration removed. Do not imply Ramadevi's burdens are gone or assign older/younger sister status. Source and omission report updated.
- Confirmed 00:50: the younger aunt's husband's own brothers taught him to drink. Made that relationship explicit in the story, retaining the property-loss account. Nothing removed; source and omission report updated.
- Confirmed 26:41: selection letter arrived about two months after the interview. Restored the approximate sixty-day interval without changing the selection/posting distinction or inventing an exact date. No narration removed; source and omission report updated.
- Confirmed Prasad Guruji was a family well-wisher. Added that role to the story, preserving the full name/description paragraph; no narration removed. Do not infer that he was the unnamed village companion. Source and omission report updated.
- User clarified Ramakrishna is another person related to Prasad Guruji and asked to skip both references. Removed the associated 21:53–22:02 paragraph, including the style/well-wisher description, at the user's explicit request. Original source and earlier clarification records retained; omission report updated. Do not ask further about either person.
- Confirmed పేరాపురం journey time (31:47–31:51): roughly thirty to forty minutes. Restored the approximate duration without inventing a route/date/travel mode; no narration removed. Source and omission report updated.
- Confirmed the local family's surname is ఆకివారు (30:40/31:39). Restored their name in the posting discussion without inferring mill ownership or kinship. Nothing removed; source and omission report updated.
- Confirmed first పేరాపురం trip was to the village, not a visit to the ఆకివారు family (31:39). Existing story already reflects this; no narration changed or removed. Source and review notes updated; family-visit question closed.
- Confirmed the mills belonged to someone in her family's extended community (30:40–30:53). Added that broad ownership account without naming ఆకివారు as owners or inventing caste/kinship. Nothing removed; source and omission report updated.
- Confirmed at 07:55 she blamed her two aunts' husbands for ruining their lives. Restored her statement without inventing joint action or linking it causally to the older aunt's death. Nothing removed; source and omission report updated.
- User requested all clarification questions be prepared first and then asked in increasing audio-timestamp order, to avoid repeated backward/forward listening. Saved the complete remaining queue in [ramadevi-clarification-questions.md](docs/ramadevi-clarification-questions.md); updated proposed workflow instructions and review notes. Ask one question at a time, mark answers immediately, skip later questions resolved by earlier answers, and put newly discovered earlier questions into a separately announced follow-up pass. No story wording changed or narration removed.
- Q01 refined (00:16): exact sentence “నేను ఒక టావు లెటర్ రాశాను”; టావు means foolscap paper and the letter was a full sheet in length. Corrected earlier paper-only interpretation, restored her wording and length detail. Nothing removed. Q02's conversational exchange remains in the source without a redundant paper question. Story, source, review and queue updated.
- Q03 answered (02:41–02:48): her grandfather called her father. Existing story already includes this; no duplicate event, scolding or telephone call added. Source, review and queue updated.
- Q04 answered (03:57): the family doctor was from her community. Added that description without assigning a caste or kinship; nothing removed. Story, source, review and queue updated.
- Q05 answered (04:05): “మడిపోయిన మూతి” is a Telugu phrase essentially meaning a loser of a person. Restored the phrase in her internal reaction using the supplied spelling; nothing removed. No actual physical action or independent audio verification claimed. Story, source, review and queue updated.
- Q06 answered (04:25): don't talk to anyone. Restored the explicit instruction and her backtracking: avoiding shame to the family name was implied rather than directly said. Nothing removed; story, source, review and queue updated. Do not narrow the instruction to men or merge it with her earlier written promises.
- Q07 answered (04:38–04:41): మర్నాడు, the next day. Repositioned the existing attempt to dissuade her from B.Ed. with the confirmed timing; no narration omitted or duplicate event added. Story, source, review and queue updated.
- Q08 answered (04:46): exact sentence “ఆ డాక్టర్ దగ్గర ఊరుకొని ఉన్నాను”. Restored it after the next-day persuasion attempt; corrected the earlier seating interpretation. No narration removed or seating layout/reason for silence invented. Story, source, review and queue updated.
- Q10 answered (06:29): టావు again; Ramadevi asks her son whether he knows what the unit means. Preserved the direct question in the letter paragraph; no narration removed or question assigned to an earlier family/doctor scene. Story, source, review and queue updated.
- Q11 closed (06:33–06:50): user requested ignoring the undecipherable exchange as unimportant. Recorded it as an explicitly accepted omission; it was already outside the story, so no additional text was removed. Original source preserved; do not ask again. Review, source and queue updated.
- Q12 answered (07:33): her grandfather asked whether she would get married if she worked as a teacher. Restored his question before her repeated promise not to work; retained the separate earlier marriage warning. Nothing removed; story, source, review and queue updated.
- Next: Q13 at 08:11, whether the degree is her existing B.A. Previously asked without an answer; now reached in audio order. Q09 meals remains deferred. Include the omission report after every story revision. App implementation waits for “commit this change”; current app limits/code remain unchanged. No API calls, app changes, commits, or deployment. Notes: [Storybook prompts](docs/STORYBOOK_PROMPTS.md).

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

- 2026-10-13: Checked publishing the landing page at `stories.here.now`. Verified it is the Charpai team workspace; current docs/OpenAPI and live root-mount API show that workspace roots cannot serve a mounted Site. No existing stories changed. Closest supported address: `charpai.stories.here.now`. Next: obtain the user's choice before publishing at an alternate address.

- 2026-10-13: Published the homepage permanently at `https://charpai.stories.here.now/` (site `bronze-glacier-wpz9`, version `01M4V6W4S6QBMW3KB48Y3EQMVK`) after the user approved the alternate address. Reuses existing homepage; signup proxy saves to production Convex. Verified live content/assets and one fictional contact with duplicate protection. Existing story labels unchanged; original Vercel site not republished. Added repeatable build/publish scripts and kept credentials/state ignored. Next: review the new homepage; see `docs/PUBLISHING.md` for future releases.

- 2026-10-14: User requested complimentary generation credits. Production has two accounts for the requested login (Google/password), both with zero credits. Sign-in-method question pending; no writes yet. Production generation authorization setting is absent, so credits alone will not make generation work. Next: confirm the login method, add/verify ten credits, then resolve the generation configuration using the current project instructions.

- 2026-10-14: User confirmed password sign-in; ten complimentary credits are now verified in production and the credit gate returns available. Unlisted `/app/login` added and checked locally in a browser; homepage/login navigation and launch flag unchanged. Not published and full generation untested. Next: request the hosting exception required by the latest instructions, publish the direct login and repair the missing production generation authorization. Details: `docs/RAZORPAY.md`.

- 2026-10-14: After explicit hosting approval, published the direct login at `https://charpai.sreechand.pm/app/login` and fixed matching production generation settings. Live login form checked in a browser; homepage login hidden and prelaunch update signup retained. Lint, 13 tests and production build pass. Configuration checks used no credits; full generation/password submission not performed. Next: user signs in with email/password and tries a recording. Release details in `docs/PUBLISHING.md`.

- 2026-10-14: Added ten complimentary credits to the requested Google sign-in account too. Production checks confirm the Google credit gate passes and both Google/password accounts have ten available credits each. No deployment or credit consumption. Updated `docs/RAZORPAY.md`. Next: user selects Continue with Google at the direct login and tries a recording.

- 2026-10-14: Fixed the post-login landing-page redirect by separating direct `/app` access from homepage launch visibility; `/app/login` now points to `/app`. Published `dpl_A46e9g1j3vHDt62Qmhpijkr9T1At`. Real development password sign-in reached recording workspace without payment and survived reload; live routes/homepage checked in a browser. No production credits consumed. Google authentication/full story generation not performed. Next: user signs in at `https://charpai.sreechand.pm/app` and tries a recording. Updated `docs/PUBLISHING.md`.

- 2026-10-14: Corrected book/PDF interiors to left illustration (or blank) facing right prose; added selected bottom-centered back-cover logo. Released `dpl_DPregsJT6rS7UUzfG5oD6gb4B5NV`. Real Ba book exported from live page as eight-page PDF; all text, QR annotations and cover placement checked, plus long/mobile pagination. No AI generation or credit use. Updated `docs/STORYBOOK_DESIGN.md`, `docs/PUBLISHING.md` and branding notes. Next: user reviews the corrected PDF or re-exports existing books.

- 2026-10-14: Removed front-cover artwork lines/series label, replaced CHARPAI text with the smaller selected logo, moved the book's single QR to the first text page's top right, and patterned the back cover's top 75% with the logo below. Released `dpl_GyFhwUw1aLFpUneXsDSCuA7UPusE`; live eight-page Ba PDF export, margins, one QR annotation and cover split checked. Rendered covers reviewed and QR scanned. No generation/credits used. Updated `docs/STORYBOOK_DESIGN.md` and `docs/PUBLISHING.md`. Next: user reviews updated PDF or re-exports.
- 2026-10-14: Created `docs/TECHNICAL_STACK.md`, a one-page stack overview checked against source, installed package versions and saved publishing records. Covers the app, Convex, AI, audio, payments, email, PDF/sharing and both homepage hosts. Documentation only; no live-service retest or deployment. Next: review customer readiness before wider launch.

- 2026-10-14 customer readiness: ₹200/four-credit implementation and unlisted login released; 15 backend tests and full development test payment→recording→real AI/three illustrations→saved reader/PDF pass, with three credits left. Live signup/sign-in/reload and hidden homepage login checked. **Priority blocker:** generate/configure live Razorpay keys; production payment checkout stays disabled until then. Actual live ₹200 collection and production paid generation remain untested. No permission question asked; browser rules require confirmation to create the live credential. Details: `docs/CUSTOMER_READINESS.md` and `docs/RAZORPAY.md`.

- 2026-10-14: Live Razorpay-key blocker resolved after approved generation, user SMS verification and secure production configuration. Real ₹200 live order/checkout opens; automatic capture confirmed; bad verification rejected with zero credits. No real money charged. **Remaining final check:** complete a real ₹200 purchase on a fresh zero-credit account and confirm four credits. Existing complimentary-credit accounts bypass payment. Updated customer-readiness, Razorpay and publishing notes.

- 2026-10-14: Reported login error diagnosed from exact production request as a missing password account. Published clear login/signup/Google guidance and mode-switch error clearing; tested real live missing-account, wrong-password, new signup and correct sign-in reaching ₹200 checkout. Release dpl_AJW65PT6obCGWoRuofPqrL9C54LD. No payment charged. Next: choose Create an email account for a fresh address, then verify the real ₹200/four-credit purchase. Details: `docs/CUSTOMER_READINESS.md`.

- 2026-10-14: User requested specific missing-account guidance/action and declined a personal real-money test. Typed password errors and Create an account action implemented and development-tested; email retained and wrong-password message distinct. Use the local test checkout at localhost:3017 with Netbanking→Success or documented test card/UPI; public customer checkout remains live. Full simulated ₹200/four-credit and recording/generation flow already passed. A personal real-money transaction is not required as the next step. Details: `docs/CUSTOMER_READINESS.md`.

- 2026-10-14: Requested no-charge mock checkout rerun passes: fresh development signup, ₹200 Razorpay mock bank Success, exactly four credits, reload/sign-out/sign-in persistence, recording unlocked. No real money charged or generation credit spent; production unchanged. Updated `docs/CUSTOMER_READINESS.md` and `docs/RAZORPAY.md`. Next: try recording in the local test app.

- 2026-10-14: Fixed rejected local Razorpay credentials after a newer test key invalidated the saved pair. Rotated only test credentials with 24-hour overlap, securely synced development/local settings and reran full ₹200 mock payment→four credits→session persistence→recording access successfully. Production live keys accepted and unchanged; no real money or generation credit used. Updated `docs/RAZORPAY.md` and customer-readiness notes. Next: refresh local app and retry mock checkout.


- 2026-10-14 telemetry audit: inspected all saved production/development generation requests (16), diagnostic artifacts (120), related product/payment/run/book records and bounded recent execution logs, read-only. Full evidence, all nine instrumented generation IDs, 12 prioritized fixes and missing product-wide events: [docs/TELEMETRY_AUDIT.md](docs/TELEMETRY_AUDIT.md). Updated historical context in [docs/GENERATION_TELEMETRY.md](docs/GENERATION_TELEMETRY.md).
  - First: verify long-recording background processing and saved-part recovery; production timed out with an unfinished request/assigned credit, and development recorded a 921-second transcription failure. Local repair work was changing during the audit and remains unverified by this audit.
  - High priority: truthful timeout/final-save states; remove five-section/130-word limits to meet the preserve-everything requirement; source coverage/omission report; verify production email delivery after an observed provider 401; record early request rejection and individual part/call outcomes.
  - Next coverage work: sign-in/checkout failures, reader/share/delete/PDF outcomes, release/test markers, event delivery reliability, costs/alerts and retention. Historical October 6–8 payment-status errors are not evidence of a current outage. No deployment, generation, payment or credit mutation was performed.

- 2026-10-14: Login/signup screen wording and action placement fixed locally: “Sign up on Charpai”; Sign in left/Create account right on signup; Sign up left/Sign in right on login. Browser checks pass at desktop and 375px/320px phone widths, plus targeted ESLint and TypeScript. No publication or backend changes. Updated `docs/CUSTOMER_READINESS.md`. Next: publish the screen changes when requested.

- 2026-10-14: Updated login/signup wording and side-by-side actions: signup shows “Sign up on Charpai”, Sign in left/Create account right; login shows Sign up left/Sign in right. Browser checked at 1267px, 375px and 320px; targeted ESLint and TypeScript pass. GitHub save requested; no publication requested. Details: `docs/LOGIN_SCREENS.md`. Next: publish when requested.

- 2026-10-14: Repaired long-recording timeout and replaced simulated generation stages with real backend progress. Released durable owned drafts, original audio/details/photos, per-part/per-image checkpoints and Resume without another credit. 33 tests, TypeScript/lint/build and browser reload/photo recovery pass. Original failed 24:35 interview is recovered with its completed final transcript chunk reused and is being finished through the repaired live worker. Keep the newer submitted draft separately saved. Next: verify full original result and browser retrieval; see `docs/GENERATION_RECOVERY.md`.

- 2026-10-14: Published approved login/signup layout to `https://charpai.sreechand.pm/app`, release `dpl_J33DMfKoKuRGWNd7k7ZPj9Ein2CT`. Preserved exact newer live source and added only missing two-column button CSS; 33 tests, lint with no errors, production builds and live Chrome review pass. Homepage stays prelaunch; no backend/here.now release, account creation or payment. Updated `docs/LOGIN_SCREENS.md` and `docs/PUBLISHING.md`. Next: user reviews live screens.

- 2026-10-14: Audited remaining GitHub differences after login-layout commit `955446b`: local main equals freshly fetched origin/main; 43 tracked files modified and 37 untracked files at inventory time. Grouped saved-draft recovery, notifications, payments/login, book/PDF, homepage tooling and documentation/sample changes in `docs/LOCAL_CHANGES.md`. Many are already live but not committed. No push/deployment performed. Next: review and commit application changes in groups, with a separate decision for private family-story material.

- 2026-10-14, generation recovery completed: supersedes the in-progress item above. Original failed 24:35 interview is now a ready draft with all five transcript parts, full transcript, inferred fields, three sections and three rendered illustrations. Reused the previously finished fifth part with zero repeat provider calls; balance stayed at two credits. Reload/reopen and newer draft's two-photo restore verified in browser. Final production release `dpl_987QPYRECPkms9T3h1qLHH7hKgJr` verified at the public domain; 33 tests pass. No real payment or family-story publication. Next: review Saved drafts → Open draft in the local test app. Updated `docs/GENERATION_RECOVERY.md` and `docs/PUBLISHING.md`.

- 2026-10-14: User requested all remaining changes saved to GitHub and available for live testing. Stable request-start snapshot passes 36 tests, lint without errors, TypeScript and production build; credentials excluded, notes/sample files included in GitHub only. Later generation/source-review edits appeared during checks and currently fail TypeScript; leave them local. Publishing checked snapshot to existing production website with launch flag false; no paid test. Details: `docs/LOCAL_CHANGES.md` and `docs/PUBLISHING.md`.

- 2026-10-14: Saved 85 files to GitHub (`ecabad1`) and published checked snapshot as `dpl_8o2yGfPhPQ7SMADBbyd3nb5fTLfP` to the public domain. 36 tests, lint without errors, TypeScript/build, live Chrome login/signup and HTTP routes/security checks pass. No charge, credit use or live full-generation test. Newer concurrent source-review/generation/email edits remain local and excluded. Details: `docs/PUBLISHING.md`, `docs/LOCAL_CHANGES.md`. Next: user tests a real recording at `/app`.
