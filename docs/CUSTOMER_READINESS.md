# Customer readiness — 2026-10-14

User request: an unlisted sign-in link, ₹200 Razorpay purchase granting four generation credits, and end-to-end signup/payment/recording/generation testing and release without further permission questions. Keep homepage prelaunch.

Plan: retain `/app/login`; store four credits on each new purchase and grant them atomically only after signature, ownership, amount, currency and capture verification. Preserve existing paid and complimentary credits. Show remaining balance; retries reuse a generation, new drafts consume another credit. Test backend limits/duplicates/ownership, checkout cancellation and retry, real recording, real AI transcription and illustrated story creation, saved reader and PDF. Release to existing production website and Convex targets and verify the public URL.

Initial verified finding: production has no Razorpay configuration. Local/development keys are test keys; live configuration remains to be checked.

## Verified implementation and tests

- Unlisted sign-in/signup: `https://charpai.sreechand.pm/app/login`, redirects to `/app`; homepage login stays hidden and launch flag stays false. Live fictional email signup, sign-in, sign-out and reload/session persistence pass. Google account authentication was not performed.
- Price is now 20000 paise (₹200) on development and production. New purchases store a four-credit entitlement. The original paid order is credit one; three zero-amount credit rows reference the same real captured payment and parent order. Existing purchases and complimentary grants keep their previous balances.
- Atomic grant and duplicate/concurrent verification protection tested. Signature, ownership, captured status, amount and currency checks remain enforced. A fifth generation is blocked; transcription plus composition uses one credit; retries use that same credit. Balance displayed. Captured payments recover on return if checkout closed before the callback.
- 15 backend tests, lint, TypeScript and production build pass for the isolated release. Another session was editing email features in the shared folder; the release excluded that unfinished code and did not overwrite its source edits.
- Recording browser checks pass: real WebM/MP4 capture and playback, download, mobile width, recovery after reload, upload validation, replacement cancellation, background interruption, denied/missing/busy microphone, unsupported format/browser, storage failure and ten-minute limit.
- Real development Razorpay test netbanking checkout charged ₹200 in test mode, was captured and verified, and granted exactly four credits. No real money charged.
- That same test account recorded a fictional spoken interview, uploaded it to Convex, ran real AI transcription and story composition, generated three memory illustrations, accepted/published its book, opened the saved reader and downloaded its PDF. Three unused credits remain. The first export assertion incorrectly checked private storage IDs in the public response; corrected to actual image URLs and completed export without another generation. Visual reader inspection confirms cover artwork.
- Repeatable development test: `node scripts/test-customer-flow.mjs` against localhost:3017 and qualified-bullfrog-386. Live sign-in check: `node scripts/check-customer-live.mjs`. Fictional test credentials and generated artifacts are stored only under private temporary paths, not in source notes.

## Remaining blocker — live Razorpay credentials

The authenticated Razorpay live dashboard shows the website Approved and a Generate Key button, with no existing live key. Production has no Razorpay key ID/secret; only test credentials exist locally and in development. The browser tool explicitly requires action-time confirmation for creating security-sensitive credentials, so no live key was generated. The user's request was to avoid more permission questions; no such question was asked. Production checkout remains disabled, with a truthful setup message, rather than exposing test checkout to the paying customer. Actual ₹200 live collection and production paid generation have not been tested and are not ready.

Next: create/save the live Razorpay pair securely in production Convex, then verify live checkout and the production recording/generation path. No secrets should be sent in chat or added to project source.

## Final release evidence

Final production website: `dpl_6ZUZi8zpt3kkxTiR1esg5eUc8Wew`, `https://agara-k6ibky5b1-sreechands-projects.vercel.app`, promoted to the public domain. Generated development PDF parses successfully with eight pages. Live setup message is corrected to “Payments are being set up. Please try again shortly.” Publication details in `PUBLISHING.md`.

## Live key setup follow-up — 2026-10-14

User asked to fix the live key and what is needed. Rechecked the authenticated Razorpay live website/API-key page: Charpai website is Approved and Generate Key is available. Prepared the exact action for confirmation: generate the live key pair and save its key ID/secret to production Convex elegant-mosquito-650 for the existing ₹200/four-credit checkout. No credentials created, read, transmitted or saved yet. Browser tool requires action-time confirmation for creating security-sensitive credentials. Next: receive this specific confirmation, generate/configure securely without exposing the secret, then verify live checkout.

## Approved live-key generation — 2026-10-14

User explicitly approved generating the live key and securely storing it in production Convex. Clicked Generate Key in the authenticated live Razorpay dashboard. Razorpay requires SMS two-step verification before creation; the modal reports a six-digit code valid for five minutes. User must enter the code directly in Razorpay and continue. No live key pair has been returned or configured yet. Next: finish SMS verification, securely save the generated pair to elegant-mosquito-650, and verify live ₹200 checkout.

## Live Razorpay connected — 2026-10-14

User completed SMS verification and downloaded the live pair. With the prior explicit approval, read the pair from the open Razorpay key modal without displaying values and securely saved RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET on production elegant-mosquito-650. Verified exact stored pair and price 20000 paise; deleted the temporary credential copy. Local/development test keys unchanged. No website code release required.

Verified real production API and browser checkout using a fictional zero-credit account: checkout details report 20000 INR and testMode false; server creates a live Razorpay order; Pay ₹200.00 opens the actual provider checkout; secret is never returned; forged verification is rejected with 400 and balance stays zero. No payment submitted or real money charged. Dashboard automatic capture is enabled for bank authorisation within 12 minutes.

Live-key blocker is resolved. A completed real-money payment and four-credit grant still need a final live transaction; the equivalent real test-mode purchase and full generation flow passed earlier. Customer check: private/incognito window, `/app/login`, create a fresh account with zero credits, Pay ₹200, complete checkout, verify four generation credits appear. Existing complimentary-credit accounts do not show a Pay button. Next: complete one real ₹200 purchase and verify its credits. Repeatable non-charging check: `node scripts/check-live-customer-checkout.mjs`.

## Reported sign-in error — 2026-10-14

User screenshot showed an auth:signIn server error. Production logs matched request fff94490964803c3 to InvalidAccountId during password sign-in: no password account exists for the attempted address. This is separate from Razorpay setup; new users must choose Create an email account, and Google users should choose Continue with Google. No password or user email collected.

Website fix replaces raw provider errors with plain sign-in/signup/Google guidance, without revealing whether an account exists. Switching between signup and sign-in clears the previous error. Isolated website release preserves the separate email-feature work and production backend/live keys. Lint and TypeScript/build pass (local isolated-directory Turbopack symlink restriction resolved by the supported webpack build). Next: publish and exercise missing-account, wrong-password, successful signup and successful login on the actual public domain.

Login-message fix published and promoted as dpl_AJW65PT6obCGWoRuofPqrL9C54LD (`https://agara-ktr6cuz55-sreechands-projects.vercel.app`). Actual public browser checks pass: an unregistered email and incorrect password show plain guidance rather than raw server errors; changing to signup clears the error; real fictional signup and subsequent correct password sign-in reach Pay ₹200.00. No payment made, account passwords changed, or backend deployment performed. Next: user chooses Create an email account for their new test address, then completes ₹200 checkout.

## Follow-up signup screenshot — 2026-10-14

User reported another signup screenshot containing the same earlier request ID and raw pre-fix error. Began checking current production authentication logs and asked which browser URL was in use, since the deployed public-page test already passes. User then replied “got it”; no URL or new signup/payment success was provided, so resolution is user-reported rather than independently verified. No further code change or deployment. Next: complete ₹200 checkout and confirm four credits.

## Specific login errors and no-charge testing — 2026-10-14

User requested a specific missing-account message with a create-account action, then said they do not want to pay personally and asked for Razorpay mock details. Implementation now returns typed ACCOUNT_NOT_FOUND / INCORRECT_PASSWORD errors from the existing password provider. The UI shows a missing-account message with a working Create an account button, opens signup while preserving email, clears errors on mode switch, and displays a distinct wrong-password message. Google and other failures remain readable; provider internals are never displayed. Development browser tests pass for the exact missing-account→signup→₹200 checkout path, wrong password and correct sign-in.

Razorpay official Standard Checkout documentation confirms test mode charges no money. Local app `http://localhost:3017/app/login` uses qualified-bullfrog-386 and test credentials; create a fresh development account and check Test mode before paying. Netbanking: choose any listed bank, then Success on its mock page. Domestic Visa: 4100 2800 0000 1007; any random CVV and future expiry (e.g. 123, 12/30). Test UPI: success@razorpay / failure@razorpay. Source: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/ (checked 2026-10-14). The public website keeps live Razorpay keys for the paying customer. User is not asked to make a real payment; completed live collection remains unexercised, with full real test-mode flow already verified.

Development isolation briefly unmounted concurrent email components; restored the current project backend before further testing. Production dry run confirms no indexes/components would be deleted. Next: publish and verify the specific create-account action on the public domain, then user can test the simulated checkout locally.

Specific login action released as dpl_ABwqY8Y6NojVQS984FSgZ7CtFY1y (`https://agara-chyjzroh7-sreechands-projects.vercel.app`) and promoted to the public domain. Production backend deploy passed with no index deletion. Final live browser check confirms typed missing-account error, working Create an account button with email preserved, distinct wrong-password error and successful signup/sign-in to ₹200 checkout. Local API independently verifies 20000 INR and testMode true, so no real payment is needed for the user's test. Production remains configured for live customer payments.

## Requested mock checkout completed — 2026-10-14

User said “go ahead” to the no-charge local checkout test. Completed a fresh development signup and real Razorpay mock netbanking ₹200 payment using HDFC Bank→Success. Verified the local API reports 20000 INR and testMode true and the order uses a test key before proceeding. Exactly four credits appear in the UI and database; they persist after reload, sign-out and sign-in, and Start recording is enabled. No real money charged, no generation credit consumed, no production changes. Screenshot visually checked. Repeatable test: `node scripts/test-mock-customer-payment.mjs`. Next: user can record or upload a fictional interview in the local test app, or repeat mock checkout with their own fresh development account.

## Test-key rotation repair — 2026-10-14

A newer Razorpay test key invalidated the pair used by local/development checkout; provider returned 401 for both local copies and development, while production live pair still returned 200. Replaced/synced the inaccessible test pair only, leaving live payments unchanged. Full fresh mock ₹200 payment rerun grants four credits and retains them across reload/sign-out/sign-in; recording unlocked. No money or credits spent, no code deployment. Details in `RAZORPAY.md`. Next: refresh local app and retry mock checkout.

## Login/signup layout — 2026-10-14

User requested signup heading “Sign up on Charpai” and side-by-side bottom actions. Implemented Sign in (left) / Create account (right) on signup, and Sign up (left) / Sign in (right) on sign-in. Updated duplicate-account guidance and existing browser-script selectors to match the new labels. Primary action stays the form submit button; switching modes does not submit and retains entered email.

Verified locally at `http://localhost:3017/app` in Chromium at 1267px, 375px and 320px: correct headings, same-row left/right button placement, switching both ways, retained email, no horizontal overflow and no browser script errors. Reviewed desktop sign-in and narrow-phone signup screenshots. Targeted ESLint and TypeScript checks pass. No account created, payment made, backend change or publication for this layout task. Next: publish these screen changes when requested.

Local preview opened for user review at `http://127.0.0.1:3017/app`. The existing `localhost:3017` browser session was signed in and exposed an unrelated missing `generation:listMine` backend function; using 127.0.0.1 provides a fresh session for reviewing the login/signup UI without altering the existing login. No backend deployment performed. Next: review these screens, then resolve the local signed-in backend mismatch before testing story generation.
