# Onboarding

## Microphone and PDF checks — 2026-10-07

Verified built-in microphone capture in the local app: stopped and saved a roughly ten-second recording, played it without a browser media error, downloaded it, and reloaded to confirm recovery. FFmpeg successfully decoded 9.90 seconds of downloaded audio. This recording was not submitted for transcription; the separate paid upload test below verified generation.

The sample book initially exported across three pages because editable text areas retained screen heights. Print-only flowing text and compact spacing fixed this. Re-exported through Chrome's Save as PDF and visually inspected the rendered result: one landscape page with complete text and artwork, without clipping. Output: `~/Downloads/charpai-export-test.pdf`. A longer generated book's PDF and edits after confirmation remain unverified.

TypeScript, lint, production build, and whitespace checks passed. Code changes are already in commit `ad9e96a`; this entry records the remaining verification evidence. Production was not deployed. Next: review release readiness and outstanding checks.

## Full paid upload journey verified — 2026-10-07

Used the development account that completed test payment `pay_Tkz2xS8n3qP1f2`. Uploaded a 37-second synthetic spoken interview with fictional family memories through Chrome's native file picker. Real transcription, composition, and image generation completed; the app presented a reviewable draft. Corrected the name/relationship fields and edited the title and dedication before Confirm changes. Convex saved the book and the library showed one story.

Signed out and back into the same account, then fully reloaded to discard in-memory state. The library still contained the saved book; its Open link displayed the edited title and dedication, the generated image, and all three sections without another payment. Saved page: `/s/meera-s-courtyard-journey-test-2l506j633s0n4o47`. A payment offer on the account screen is for another book; it did not block reopening this one.

Removed the old automatic call to the external publishing service from Confirm changes, so this user flow saves in Convex and opens the existing Charpai story URL as required by the fixed stack. The older external-publishing endpoint remains in the repository but is no longer called by this flow. TypeScript and lint pass. Live microphone capture, PDF export, edits made after confirming, and production were not tested in this run. Next: verify microphone capture and PDF export before release.

Final verification: production build and whitespace checks also pass. This session's code fix and notes are local changes, not yet committed or deployed to production.

## Recording controls review — 2026-10-07

The user approved hiding the empty details fields. The details heading and name, relationship, place, and language inputs now appear only when a storybook draft has sections, including generated, resumed, or demo drafts.

Checked Record here and Upload audio in Chrome; switching works and the upload option displays accepted formats and a 100 MB limit. No microphone recording or file upload was performed in this review. The empty details fields, optional photos, Load demo, and empty library still appear before recording. Recommended next simplification: hide the automatically extracted details until processing completes. This recommendation has not been implemented.

## Desktop preview — 2026-10-07

The user also requested removing the workspace message about payment unlocking the book and free retries. Removed that notice; payment access and retry behavior remain in place.

During the joint post-payment review, the user requested hiding the empty storybook preview on desktop until a draft is generated. The desktop workspace now centers the recording/upload panel while there are no story sections, then restores the two-column editor layout when a generated or resumed draft is available. Mobile layout is unchanged.

## Returning paid users — 2026-10-07

The user confirmed that payment must persist across logins even if no storybook has been generated. Payment is attached to the account, not the browser session. An unused paid credit opens the workspace without checkout; an unfinished paid book shows Continue your storybook and explicitly says it is already paid. Added a test that signs in with distinct sessions for the same account before and during creation, confirming no additional order is created.

## Discussion — 2026-10-07

The user asked how onboarding should work after clicking Sign Up. The current app offers Google sign-in or email account creation and then opens the workspace; it has no separate guided onboarding.

Proposed flow, pending user approval:

1. Create an account using Google or email. Existing users return to their workspace.
2. Welcome the new user with a short explanation of recording, drafting and editing, then ask whether they already have a recording. Offer Upload a recording, Record now, and Explore first.
3. For users ready to start, collect the storyteller's name, relationship and spoken language as part of the first story setup. Let users skip unknown details.
4. Explain recording consent before recording/uploading. Continue into the existing story creation flow and editable draft.

The user decided that payment is required before using the app, using Razorpay. This supersedes the earlier suggestion to charge after a preview. The intended sequence is account creation → payment → first-story setup. Users who cancel or fail payment stay on the payment step; access opens only after server verification of a captured payment.

The user confirmed one payment unlocks creation of one storybook and ongoing access to that book. Another book requires another payment. Development checkout is configured at ₹500 (50000 paise), matching the landing page.

## Implementation and checks

- Sign-in/account creation now leads to a payment gate until a verified payment is available. Previously created published books remain accessible in Your stories.
- One captured payment is reserved atomically against one generation identifier. Concurrent requests cannot spend it twice. Changed recordings or composition inputs require a new payment.
- The generation server uses a private `PAYMENT_BACKEND_TOKEN` shared with Convex to reserve/finish generation. Browser clients cannot grant access or finish these operations. The token is only in ignored `.env.local` and development Convex settings.
- Successful transcription and draft responses are cached in Convex, so retries return the same book instead of generating another. Failed stages can retry on the same payment. An interrupted server attempt has a six-minute lock before resuming.
- Unfinished books can be resumed from the payment screen, including restoring a prepared draft. Saving a run and publishing its page are idempotent: repeated clicks return the same book.
- Uploads and direct generation requests are blocked for unpaid users. Creating another book returns the user to payment; completed published books remain in the library.
- Five automated tests pass, covering signatures, ownership, one-book credits, duplicate/concurrent attempts, failed retries, persistent published access, and a second purchase. Type checks, lint, build, and the development Convex push pass.
- Chrome sign-up was tested with a synthetic development account: the ₹500 payment step appears and the recording workspace is hidden.
- A real authenticated API check confirmed unpaid generation returns 402 and uploads are rejected. Real order creation fails with `Razorpay rejected the configured credentials.` This happened on two attempts. Successful captured checkout has not been tested end to end with the current keys.

Only development deployment `qualified-bullfrog-386` was updated. Production is unchanged. Next: replace the invalid Razorpay test key pair in secure environment configuration, verify captured checkout, then request production approval with live payment configuration.

## Successful Razorpay test — 2026-10-07

The user replaced the test key pair in `.env`. Fixed its colon-separated entries to dotenv `NAME=value` format, synced them to development, and verified the real order API check. A ₹500 simulated netbanking payment completed through Razorpay's mock bank page in Chrome; the app's server verified it and the recording workspace opened. This resolves the credential blocker above. No live money was charged and production was not updated. Secrets remain in ignored environment files and development settings.
