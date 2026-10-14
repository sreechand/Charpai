# Razorpay payment workflow

## Conversation summary — 2026-10-06

The user requested Razorpay Standard Web Checkout with order creation, a checkout modal, and server-side signature verification. The project uses Next.js, React, Convex Auth, and a Convex database. Test credentials are stored only in ignored environment files or Convex deployment settings.

The user confirmed ₹500 unlocks one storybook with ongoing access to that book; another storybook requires another payment. Never trust a browser-supplied price or mark an order paid from the checkout callback alone. See [ONBOARDING.md](ONBOARDING.md) for the current implementation and verification status.

## Implementation plan

- [x] Install the Razorpay Node SDK and save test credentials in ignored `.env`.
- [x] Add `convex/payments.ts` for private order records and authenticated payment status. Add `convex/razorpay.ts` for order creation and signature verification, with provider payment status and amount checks before marking orders paid.
- [x] Add Next.js `/api/create-order` and `/api/verify-payment` adapters to authenticated Convex actions; missing fields and signature mismatch return 400, authentication failures return 401, provider failures return 500.
- [x] Add a checkout component and connect it to the existing storybook screen. Handle checkout loading, cancellation, payment failure, and verification failure.
- [x] Check type safety, production build, payment ownership, signature rejection, duplicate verification, and browser checkout behavior. Deploy and verify only in development; production release requires a separate explicit approval.
- [x] Confirm price and access rule; enforce one payment per storybook on the server and payment screen.

## Configuration

Convex requires `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_AMOUNT_PAISE` (an integer of at least 100). Only the public key ID is returned to the browser. Configure automatic payment capture in the Razorpay dashboard. Real payments require live credentials and a production release.

Development deployment `qualified-bullfrog-386` is configured for 50000 paise. The replacement test key pair is accepted by Razorpay; the ₹500 test checkout completed successfully in Chrome. `PAYMENT_BACKEND_TOKEN` must also be configured in both the Next server and Convex to authorize generation credit operations. Production is unchanged.

## Files created or modified for payments

- Created: `app/api/create-order/route.ts`, `app/api/verify-payment/route.ts`, `components/razorpay-checkout.tsx`, `convex/payments.ts`, `convex/razorpay.ts`, `lib/payment-route.ts`, `lib/payment-signature.ts`.
- Modified: `app/providers.tsx`, `components/storybook-app.tsx`, `convex/schema.ts`, `convex/runs.ts`, `convex/convex.config.ts`, `convex/tsconfig.json`, `package.json`, `package-lock.json`; Convex generated API and environment types were refreshed.
- Tests: `convex/payments.test.ts`, `vitest.config.ts`, `scripts/test-payment-checkout.mjs`, `scripts/check-live-payment.mjs`.
- Notes: `docs/RAZORPAY.md`, `ACTION_ITEMS.md`.
- Local configuration: ignored `.env`; the existing `.gitignore` already excludes it. No credentials are stored in source code or these notes.

## Verification results

- Four Convex tests pass: authenticated server-priced orders, minimum-price enforcement and provider errors, payment signatures, ownership, captured status, amount/currency matching, duplicate verification, and truthful run payment status.
- Mobile browser checks pass using a simulated Razorpay callback: cancellation, failed payment, verification failure and retry without creating another order.
- Real development sign-in and API checks pass: Razorpay created a test order, ignored a browser-supplied lower price, rejected missing verification fields and a bad signature, and left payment access unverified.
- The real Razorpay checkout window opened in a browser. No actual test payment was submitted; successful captured-payment verification was checked with simulated provider responses.
- Type checks, lint, production build, and development deployment pass. Existing runs are not backfilled; new runs are marked pending unless the user has a verified payment.

## How to test after choosing the price

1. Set the development price in paise: `npx convex env set --deployment qualified-bullfrog-386 RAZORPAY_AMOUNT_PAISE <amount>` (at least 100).
2. In Razorpay test-mode settings, enable automatic capture as described in the [Standard Checkout guide](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/).
3. Run `npm run dev`, open `http://localhost:3000`, and sign in. Click the displayed Pay button to open Razorpay. Use Razorpay's test payment methods; do not use live credentials for this check.
4. Complete a test payment. The app should confirm verification; a failed signature must never mark an order paid. Close checkout to check cancellation; retry verification if capture is pending.
5. Run `npx vitest run` and, with the app running, `node scripts/test-payment-checkout.mjs`. The latter creates a synthetic development account and mocks Razorpay responses. `node scripts/check-live-payment.mjs` additionally creates real test orders and requires the development price to be exactly 100 paise.

## Next step

### Credential retry — 2026-10-07

The user supplied a replacement test key ID and then said “go” after being asked to save its matching secret in `.env`. The local file still contained the previous key ID, so it was replaced and the local key pair was synced to development deployment `qualified-bullfrog-386`, without displaying the secret. Razorpay still rejected the synced pair during order creation. The matching secret must be checked/replaced in the ignored `.env` file before another checkout test. Production was not changed.

The captured test checkout now passes. Review the local onboarding flow, then request a production release with live payment configuration. Use `node scripts/check-payment-access.mjs` to check development price and unpaid access. The older 100-paise validation described above is historical.

### Corrected environment format — 2026-10-07

After the user said “go” again, `.env` contained the new key pair using `NAME: value` rather than dotenv's `NAME=value` format. Corrected the two Razorpay entries, synced the pair to development, and reran `scripts/check-payment-access.mjs`. The check passes: a real ₹500 test-mode order is created, unpaid generation/uploads are blocked, and a bad signature is rejected without granting access. The Razorpay checkout modal also opened in Chrome. A ₹500 simulated netbanking payment was completed through Razorpay’s mock bank page in Chrome. Charpai verified the signature and captured payment, then unlocked the recording workspace. No real money was charged; production remains unchanged.

### Supplied test card transaction — 2026-10-07

Completed a ₹500 Razorpay test-mode card payment in Chrome at `http://localhost:3000/app`, using the user-supplied test card on a fresh disposable development account. Declined saving the card and selected Success on Razorpay's demo bank page. Razorpay displayed Payment Successful with payment ID `pay_Tkynct9Y9HEpUw`; Charpai then unlocked the recording workspace and displayed “Your payment unlocks this storybook.” No real money was charged. UPI and the public production website were not tested in this run. Next: test the supplied UPI method on another unpaid development account.

### Dashboard does not recognize test payment — 2026-10-07

The user reported Razorpay still says no completed test transaction. Queried Razorpay directly with the local configured credentials: payment `pay_Tkynct9Y9HEpUw`, order `order_TkynNz7hqc7E3c`, is confirmed captured for ₹500 INR by card under test key ID `rzp_test_TkiTIBolZwYSXg`. Whether the user's dashboard is the same merchant account remains unverified; an account mismatch or dashboard delay is only a hypothesis. Opened the dashboard in Chrome, which requires login. Next: user signs into Razorpay, then compare its test key ID and payment list with the verified provider record.

After the user signed in, the dashboard initially showed Live Mode and no live payments. Switched its view to Test Mode. The list showed the earlier captured ₹500 netbanking payment; opening the card payment directly confirmed `pay_Tkynct9Y9HEpUw` is Captured for ₹500, card ending 1007, captured October 7 at 3:38 PM. This verifies the card payment belongs to the signed-in merchant account. Left its detail page open. The onboarding checklist's recognition of the payment remains unverified; next step is to retry its test-transaction check.

### Onboarding check retried — 2026-10-07

User requested retrying the onboarding check. Test-mode home showed 3/3 completed, but reopening Integrate now started the four-step wizard and automatically generated a different test key ID (`rzp_test_TkyyGed47K4ydc`). Clicking “I have done the transaction” at step 3 still returned “No test transaction done yet.” Earlier captured payments remain verified; wizard recognition has not succeeded. The new key differs from the app's configured key; whether the check filters by that new key is unverified. No secret was saved to project documentation. Next: securely update development credentials to the wizard's current pair, complete a fresh checkout, and retry recognition. Production was not changed.

### Wizard recognition succeeded — 2026-10-07

With user approval, saved the wizard's current test pair in ignored `.env` and `.env.local`, synced it to development `qualified-bullfrog-386`, and verified both values match without displaying secrets. Completed a fresh ₹500 test card checkout through the app with a disposable development account, declining card saving. Razorpay reported Payment Successful, ID `pay_Tkz2xS8n3qP1f2`, and Charpai verified the payment and opened the recording workspace.

The first immediate wizard check still failed. A subsequent retry succeeded: step 4 says “Transaction successful”, “Razorpay is successfully integrated with your website”, and “Test transaction was successful” for ₹500. Its observed request queries test payments within a ten-minute time range, so the prior assumption that key filtering alone caused the mismatch is unproven; older payments may have fallen outside its time range. Left the success page open and did not select Get live API keys. No real money was charged, and production was unchanged. Next: review first-use flow after payment before a separate production release decision.

## Requested complimentary generation credits — 2026-10-14

Latest follow-up: user also requested credits for Google sign-in. Verified the matching Google account had zero credits and no matching grant batch, then appended ten complimentary zero-amount credits to that account in production. Verified Google `payments:status` returns `available: true`; Google and password accounts each retain ten available credits. No generation credit consumed and no code deployment needed. Next: use Continue with Google at the direct login link to generate a story.

The user requested free generation credits for their login. Read-only production checks on `elegant-mosquito-650` found two separate user records for the requested email: Google sign-in and password sign-in, both with zero available credits. Asked which sign-in method they use before changing either record. No credits granted yet and no backend code or deployment changed.

Production generation authorization (`PAYMENT_BACKEND_TOKEN`) is also absent; its value was not printed. Credits alone will not resolve that separate configuration blocker. The newly supplied project instructions replace earlier AGENTS instructions and require asking before using any non-Convex service, so do not reuse the older website-host standing approval blindly. Next: identify the intended sign-in account, grant ten complimentary zero-amount generation credits through the existing credit records, verify its available status, and report/address the remaining generation configuration within authorized scope.

### Password account credited and direct login prepared — 2026-10-14

User confirmed email/password sign-in. Appended ten complimentary zero-amount credit records to that production account only; no existing records deleted and no gateway payment identifiers fabricated. Verified exactly ten available credits and the existing `payments:status` query returns `available: true` for this account. No credit was consumed during verification.

Follow-up: user approved the existing website host for publishing this direct login and fixing generation configuration. Published `/app/login` on the existing public domain and saved matching private production generation authorization settings to both services. Live browser checks confirm enabled email/password login; homepage login remains hidden. The backend check returned the expected recording prerequisite rather than a server-authorization failure; no credit was consumed. Full story generation and actual password submission remain for the user to try. Deployment details are in `docs/PUBLISHING.md`.

Added an unlisted `/app/login` route reusing the existing authenticated workspace, without changing homepage navigation or the launch flag. TypeScript checks pass, local HTTP returns 200, and a Playwright browser check confirms the login heading and email/password fields are visible. Actual password sign-in and story generation have not been tested. Production generation authorization remains missing. The new route has not been published: the current user-supplied instructions require asking before using the existing non-Convex website host. Next: obtain that specific hosting exception, publish the route and matching generation configuration, then verify the live login and credit gate.

## Customer purchase update — 2026-10-14

Latest requested price replaces the historical ₹500 offer: ₹200 grants four generation credits. New drafts use one credit; retrying the same attempt uses no additional credit. Signature/capture/ownership/amount checks, duplicate safety and recovery after a missed callback are tested. Real development ₹200 Razorpay checkout plus recording, AI transcription, three illustrations, save/read and PDF export pass; balance changes from four to three.

The implementation is released to the existing production targets, but live payments remain disabled: production Razorpay credentials do not exist, and the live dashboard shows Generate Key for the approved website. No live payment made. See `CUSTOMER_READINESS.md` for verified results and the remaining live-key step.

### Live keys activated — 2026-10-14

Supersedes the earlier missing-live-key blocker: after user approval and SMS verification, the generated live pair is securely saved in production Convex elegant-mosquito-650; price stays ₹200 and development keeps test credentials. Live production order creation and real checkout opening pass, automatic capture is enabled, forged verification fails without granting credits. No code release or real payment made. Next: a fresh zero-credit account completes one real ₹200 purchase and verifies four credits. See `CUSTOMER_READINESS.md`.

### No-charge mock checkout rerun — 2026-10-14

At the user's request, completed a fresh local signup and ₹200 mock netbanking transaction against qualified-bullfrog-386 using verified test keys. Exactly four credits granted, retained after reload and sign-out/sign-in, recording unlocked. No real money or generation credits used; production/live keys untouched. Script: `scripts/test-mock-customer-payment.mjs`; details in `CUSTOMER_READINESS.md`.

## Rejected test credentials repaired — 2026-10-14

User reported “Razorpay rejected the configured credentials.” Read-only provider checks confirmed production live pair accepted (HTTP 200), but qualified-bullfrog-386 and both local saved test pairs rejected (401 Authentication failed). Development createOrder logs matched the failure. Dashboard showed a newer test key generated minutes earlier, so the app retained an invalidated older test pair. Existing downloaded rzp-key.csv was a live pair and was not used for development.

Current test secret was masked/unrecoverable. Rotated only the existing test pair, choosing 24-hour overlap for its immediately preceding key. Downloaded the replacement test CSV, validated it with Razorpay, and securely synced both values to qualified-bullfrog-386 and ignored .env/.env.local (including existing public test-key entry). Verified exact remote pair and unchanged 20000-paise price. Temporary upload file removed; key backup stays outside the project. Production live credentials unchanged.

Reran `scripts/test-mock-customer-payment.mjs`: fresh development signup, real ₹200 mock netbanking Success, exactly four credits, persistence after reload/sign-out/sign-in and recording unlocked all pass. No real money charged, no generation credits consumed, no code release needed. Next: refresh localhost:3017/app and retry the user's mock checkout. If keys are regenerated later, update both ID and secret together in development before retrying. No key values recorded in these notes.
