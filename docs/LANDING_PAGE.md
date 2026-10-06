# Charpai landing page

## Conversation summary — 2026-10-06

The user supplied `/Users/sreechandt/Downloads/Charpai Landing Page_claude.html` and requested a local implementation to review before a production release.

## Local implementation

- Preserve the supplied page's cream, rust, blue weave patterns, typography, wording, and section layout.
- Convert the bundled custom-component HTML into a React component, with local logo and font files rather than its export runtime.
- Make `/` the landing page and move the existing sign-in/storybook workspace to `/app`.
- Connect Start a storybook and Log in to `/app`; Google sign-in returns to `/app`.
- Keep the three preview tabs and FAQ accordions interactive, and fix narrow-screen layout overflow.
- Replace the example duration/year/illustration bracket labels with neutral example labels. The maker's social handle remains plain text because the source has no destination URL.

## Review before production

- The supplied copy states ₹500 per digital keepsake. This is preserved for visual review, not configured as a checkout price or access rule.
- The supplied copy claims eleven supported languages and conversation steering. These claims have not been verified against the current app and need review before publication.
- The source says printable keepsakes are not yet available, whereas the current workspace offers PDF export; reconcile this copy before release.
- The example first spread uses the supplied woven placeholder illustration and is a visual demonstration, not a real generated family storybook.
- Production release remains pending the user's review. No deployment is authorized before that review.

## Validation

## Mobile revision — 2026-10-07

The user also requested a single action in the closing section headed “Someone in your family has a story only they can tell.” Removed its Continue with Google link; the Start a storybook button remains.

The user reported that the navigation links and duplicate top button crowded out the hero on a phone. The mobile header now contains a smaller logo and a Menu button. Navigation and the header's Start a storybook link stay hidden until Menu is opened, in a panel that does not push the hero down. The hero is centered, with smaller spacing and readable phone-sized text; its main action remains beside a quieter How it works link. Desktop navigation is unchanged. Checked visually in Chrome's iPhone 16 preview (393px wide), and confirmed the menu opens and closes. No deployment has run.

Type checks, lint, and production build pass. The development server is running at `http://localhost:3000`; `/app` is included in the build. Existing payment browser scripts were updated to use `/app` after the route move.

Chrome review completed on 2026-10-07: the landing page renders, switching to Family details and First spread changes the preview, the FAQ expands, and Start a storybook opens the existing sign-in page at `/app`. The desktop page was visually inspected. Mobile appearance was subsequently checked in Chrome’s iPhone preview, as recorded above. The local preview is left open in Chrome for the user's review. No production deployment has run.
