# Google sign-in button

## Login failure diagnosis — 2026-10-09

Verified in the user's Arc browser at `https://charpai.sreechand.pm/app`: reload briefly shows a signed-in account, then the page fails on `payments:status`. The browser console names that query; production logs for `elegant-mosquito-650` report `Could not find public function for 'payments:status'`. This is a frontend/backend release mismatch. Production `SITE_URL` matches the live origin and the page returns HTTP 200.

The missing function already exists in `convex/payments.ts`. All six payment tests and the root TypeScript check pass. The production dry-run caught an additional release blocker: the shared `lib/storybook.ts` import used an alias unavailable to the backend's TypeScript configuration. Changed it to a relative import. The repeated production dry-run passes, including backend typechecking and schema validation. It would add four payment-order indexes and the storybook-page run index; no indexes would be deleted. Actual deployment and signed-in browser verification remain pending. Next: obtain explicit production approval, deploy to `elegant-mosquito-650`, and verify the same browser page loads.

### Release and verification completed — 2026-10-09

The user approved the production deployment. Released the current backend to `elegant-mosquito-650`; backend typechecking, schema validation, and deployment succeeded. Reloaded the same signed-in Arc page, waited for the access check to complete, and verified the payment gate and three existing saved stories render. Closed the browser error inspector. The missing-function failure is resolved. A fresh Google sign-in was not repeated; the existing signed-in session was verified.

The loaded page shows checkout unavailable because the production price is not set. Payment configuration is a separate next step; no payment or environment changes were performed. The import fix remains local and should be committed to GitHub.

## Conversation summary — 2026-10-07

The user requested that the app page's Continue with Google button follow [Google's branding guidelines](https://developers.google.com/identity/branding-guidelines).

Replaced the generic account icon with Google's official current multicolor G asset. The light button uses a white background, #747775 border, #1F1F1F text, Google Sans Medium at 14px/20px, 12px horizontal padding and a 10px gap after the fixed 20px logo. The logo and font are served locally. Kept the existing Convex Google sign-in handler and its loading/disabled behavior.

Visually checked the button in Chrome's iPhone 16 preview at `/app`; lint passes. This was a branding change; no new Google account sign-in was completed, and no deployment was run.
