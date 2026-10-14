# Login and signup screens

Updated on 2026-10-14 at the user's request:

- Signup heading: “Sign up on Charpai”. Bottom row: Sign in on the left, Create account on the right.
- Sign-in screen: Sign up on the left, Sign in on the right.
- Main action remains the form submission button; the left button switches screens without submitting.
- Existing tracked payment browser script now selects Sign up by its new label.

Verified in local Chromium at 1267px, 375px and 320px: correct headings, side-by-side positions, both mode switches, retained email and no horizontal overflow or browser script errors. Targeted ESLint and TypeScript checks passed. Desktop and narrow-phone screenshots were visually reviewed. User reviewed and approved the local preview, then requested a GitHub commit and push. No publication requested.

Only these screen changes are included in this commit; other unfinished project changes remain local. Next: publish the screen changes when requested.
