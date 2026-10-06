# Google sign-in button

## Conversation summary — 2026-10-07

The user requested that the app page's Continue with Google button follow [Google's branding guidelines](https://developers.google.com/identity/branding-guidelines).

Replaced the generic account icon with Google's official current multicolor G asset. The light button uses a white background, #747775 border, #1F1F1F text, Google Sans Medium at 14px/20px, 12px horizontal padding and a 10px gap after the fixed 20px logo. The logo and font are served locally. Kept the existing Convex Google sign-in handler and its loading/disabled behavior.

Visually checked the button in Chrome's iPhone 16 preview at `/app`; lint passes. This was a branding change; no new Google account sign-in was completed, and no deployment was run.
