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
