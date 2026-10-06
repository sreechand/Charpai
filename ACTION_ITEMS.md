# Project action items

## Laundry list

Recovered from the earlier conversation on 2026-10-06. The original list contains eight items. Completion status has not been checked against the current app.

1. Automatically verify payments so users can start using the app without manual UPI payment checks.
2. Improve the generated storybook's design and format.
3. Allow audio playback alongside the storybook.
4. Allow anyone to open a shared storybook by scanning a QR code.
5. **Top priority: live interview guidance.** Suggest questions and steer the interviewer toward stories based on what the interviewee is currently saying.
6. Create an appealing landing page that encourages people to try the app.
7. Collect ongoing usage and error data to understand what works, what breaks, and what needs improvement.
8. Integrate Razorpay instead of IndiePay.

Items 1 and 8 overlap and were combined in the later build plan.

## Previously discussed build order

1. Live interview guidance.
2. Usage and error tracking.
3. Better storybook design.
4. Audio alongside the storybook.
5. QR code access.
6. Razorpay payments with automatic verification.
7. Appealing landing page.

## Conversation summary — 2026-10-06

- Retrieved the original laundry list from saved conversation history. The user recalled twelve items, but the recovered list contains eight.
- Checked project Markdown files, including hidden folders; the laundry list had not been saved as a project document.
- The user requested that future project discussions be summarized in relevant Markdown files within the project.
- Saved this list in `ACTION_ITEMS.md` and recorded the ongoing summary rule in `AGENTS.md`. Other topics will use an existing relevant file or `docs/<topic>.md`.
- Next step: check each action item against the current app and record verified completion status.

## Razorpay update — 2026-10-06

- The user requested Standard Web Checkout and supplied test credentials, which are stored only in ignored settings.
- Implemented authenticated order creation, checkout, server signature and captured-payment verification, private Convex order records, and cancellation/failure/retry handling. New storybook run records use verified payment status instead of automatically claiming payment was received.
- Deployed the payment backend to development only. Automated payment tests and browser error-flow checks pass; real Razorpay test orders and checkout-window opening were checked. No captured test payment was submitted.
- Price and whether a payment buys one book or ongoing access are awaiting the user's decision. The temporary ₹1 test price was removed. Enforced payment access and production release remain pending.
- Full setup, file list, test results, and manual steps: [Razorpay notes](docs/RAZORPAY.md).

## GitHub checkpoint — 2026-10-06

- The user requested committing and pushing the current local changes before discussing pricing.
- This checkpoint includes generation telemetry, recording updates, Razorpay checkout, automated checks, and project notes.
- Destination: `main` in `sreechand/agara`. Local environment files remain ignored and are not included.
- Pricing and the payment access rule remain the next product decision; pushing code does not deploy the app.

## Landing page — 2026-10-07

- Implemented the user's supplied Claude HTML export as the local homepage, preserving its visual direction and draft copy. Local assets include the logo and fonts.
- Moved the existing storybook workspace to `/app` and connected the landing-page start/login links and Google sign-in return route.
- Type checks, lint, and production build pass. Visual browser review remains pending because the computer-use tool denied access to Arc.
- The user wants to inspect it locally before production. Draft pricing, language claims, interview guidance, printable-copy wording, and the missing social destination need review before release.
- Notes: [Landing page](docs/LANDING_PAGE.md). Next: review `http://localhost:3000`.
