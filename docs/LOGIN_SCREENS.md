# Login and signup screens

Updated on 2026-10-14 at the user's request:

- Signup heading: “Sign up on Charpai”. Bottom row: Sign in on the left, Create account on the right.
- Sign-in screen: Sign up on the left, Sign in on the right.
- Main action remains the form submission button; the left button switches screens without submitting.
- Existing tracked payment browser script now selects Sign up by its new label.

Verified in local Chromium at 1267px, 375px and 320px: correct headings, side-by-side positions, both mode switches, retained email and no horizontal overflow or browser script errors. Targeted ESLint and TypeScript checks passed. Desktop and narrow-phone screenshots were visually reviewed. User reviewed and approved the local preview, then requested a GitHub commit and push. No publication requested.

Only these screen changes are included in this commit; other unfinished project changes remain local. Next: publish the screen changes when requested.


## Login/signup layout published — 2026-10-14

User approved publishing after reviewing the local screens and requesting GitHub commit `955446b`. On inspection, the newer production release `dpl_BdNinQBKCn8ZLrUXBz743fxd699G` already contained the requested headings/action markup, but lacked the `.auth-actions` layout CSS. Reconstructed that exact release from its source manifest (106 local files matched uploaded SHA-1 values; retrieved the two differing source files through the authenticated deployment API), added only the approved two-column action CSS, and excluded project notes from upload. This preserves the concurrently published generation recovery and email integration; unfinished workspace edits were not published.

Published and promoted `dpl_J33DMfKoKuRGWNd7k7ZPj9Ein2CT`, immutable URL `https://agara-n32mistur-sreechands-projects.vercel.app`, to `https://charpai.sreechand.pm`. Existing project/organization verified; build/runtime retain production Convex `elegant-mosquito-650` and `CHARPAI_LAUNCHED=false`. No backend deployment or here.now update needed.

Verification: 33 tests pass, lint has no errors (three existing unused-variable warnings), local and hosted production builds pass. Actual public-domain Chrome review confirms Sign up left/Sign in right on login, “Sign up on Charpai” and Sign in left/Create account right on signup; both actions span one row and mode switching works. Live homepage retains October 15 updates collection with login hidden. No new account, payment, credit use, full generation, or launch-update submission during this layout release. Next: user reviews the live screens.
