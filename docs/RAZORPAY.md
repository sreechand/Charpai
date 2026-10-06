# Razorpay payment workflow

## Conversation summary — 2026-10-06

The user requested Razorpay Standard Web Checkout with order creation, a checkout modal, and server-side signature verification. The project uses Next.js, React, Convex Auth, and a Convex database. Test credentials are stored only in ignored environment files or Convex deployment settings.

Price and what each payment unlocks are awaiting the user's answer. Never trust a browser-supplied price or mark an order paid from the checkout callback alone.

## Implementation plan

- [x] Install the Razorpay Node SDK and save test credentials in ignored `.env`.
- [x] Add `convex/payments.ts` for private order records and authenticated payment status. Add `convex/razorpay.ts` for order creation and signature verification, with provider payment status and amount checks before marking orders paid.
- [x] Add Next.js `/api/create-order` and `/api/verify-payment` adapters to authenticated Convex actions; missing fields and signature mismatch return 400, authentication failures return 401, provider failures return 500.
- [x] Add a checkout component and connect it to the existing storybook screen. Handle checkout loading, cancellation, payment failure, and verification failure.
- [x] Check type safety, production build, payment ownership, signature rejection, duplicate verification, and browser checkout behavior. Deploy and verify only in development; production release requires a separate explicit approval.
- [ ] Confirm price and whether payment buys one storybook or ongoing access; implement that access rule on the server and screen. Existing generation remains available until this product decision is answered.

## Configuration

Convex requires `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_AMOUNT_PAISE` (an integer of at least 100). Only the public key ID is returned to the browser. Configure automatic payment capture in the Razorpay dashboard. Real payments require live credentials and a production release.

The test keys are configured on development deployment `qualified-bullfrog-386`. A temporary price of 100 paise was used to create real test orders, then removed. Checkout currently displays “Checkout unavailable” until the price is configured. Production is unchanged.

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

Choose the price and access rule, enforce it, then complete a captured test payment before requesting a production release.
