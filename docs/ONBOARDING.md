# Onboarding

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
