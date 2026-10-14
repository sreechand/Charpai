# Charpai — Technical Stack One-Pager

**Reviewed: 14 October 2026.** Based on the current repository, installed packages and saved release records; this review did not retest the live services. Versions below are installed locally, not a claim about every deployed build.

Charpai turns a family interview recording into an editable, illustrated storybook that users can share online or download as a PDF.

## Stack at a glance

| Layer | Technology | What it does |
| --- | --- | --- |
| Website and app | **Next.js 16.3.4, React 19.2.8, TypeScript 6.0.3** | Builds the homepage, sign-in, recording workspace and storybook reader. Next.js App Router organizes pages and server endpoints; TypeScript checks code types. |
| Visual interface | **Custom CSS, Lucide React** | Provides responsive layouts, book styling and icons. |
| Server processing | **Next.js server endpoints, Node.js** | Coordinates story generation, payment requests, update signup and external story publishing. |
| Database and backend | **Convex 1.46.0** | Stores accounts, generation runs, orders/credits, published books, waitlist contacts and diagnostic records. React subscriptions keep app data current. |
| Sign-in | **Convex Auth, Auth.js Google provider** | Supports Google and email/password accounts. Backend functions use the signed-in identity to check ownership. |
| File storage | **Convex Storage** | Holds uploaded audio, generated illustrations and generation diagnostic files. Audio uploads go directly from the browser to storage. |
| AI generation | **OpenAI SDK 7.9.0** | Transcribes recordings, extracts family details, writes stories and generates illustrations. Calls run on the server. |
| Recording and audio | **Browser microphone APIs, MediaRecorder, FFmpeg** | Records audio in the browser; FFmpeg prepares and splits recordings for transcription. |
| Payments | **Razorpay** | Provides checkout and payment verification. Convex tracks orders and available story-generation credits. |
| Email | **Resend through its Convex component** | Implements signup, login and generation notifications, with scheduled delivery and a webhook for email events. Sending requires enabled server settings. |
| PDF and sharing | **html-to-image, pdf-lib, qrcode** | Captures book pages as images, assembles an A5 PDF with clickable links, and adds a QR code linking to the online book. |
| Hosting | **Vercel + here.now** | Vercel serves the main Next.js website and app. here.now hosts an additional standalone homepage and supports exported story sites. |
| Development and checks | **Codex, GitHub, npm, ESLint, Vitest, convex-test, Playwright** | Supports coding, source history, dependency management, code checks, backend tests and browser checks. |

## How the pieces connect

**Sign in → obtain generation credits → record/upload audio → transcribe → review transcript → generate story and illustrations → edit → share or export PDF.**

The browser sends audio directly to Convex Storage. The Next.js generation endpoint checks the user's identity and credit access, retrieves the recording, and calls OpenAI. Generated images return to Convex Storage. Published storybook content is saved in Convex; the reader and PDF exporter use the same page layout.

Users own their recordings, images, runs and books. Payment orders can link to runs; generation events link to generation requests and stored diagnostic files. Client-accessible backend functions handle uploads, books, credits and progress; internal functions handle payment bookkeeping and notification delivery. Published books have a public read path at `/s/[slug]`.

## AI models and production setup

- **Code defaults:** `gpt-4o-transcribe-diarize` separates speakers during transcription; `gpt-4o-mini-transcribe` is the fallback. Story writing defaults to `gpt-5-mini`; illustrations default to `gpt-image-2.5-flare`. Server settings can override the text, image and fallback transcription models.
- **Main website/app:** `https://charpai.sreechand.pm` on the existing Vercel project `agara`.
- **Backend:** production Convex deployment `elegant-mosquito-650`; development deployment `qualified-bullfrog-386`.
- **Additional homepage:** `https://charpai.stories.here.now/`; its update form forwards to the main website and existing Convex database.
- **Releases:** website and backend deploy separately through their CLIs; Git pushes do not deploy. The additional homepage has its own build/publish scripts. Homepage launch visibility is controlled by `CHARPAI_LAUNCHED`.

**Source references:** [dependencies](../package.json), [database model](../convex/schema.ts), [generation pipeline](../app/api/generate-storybook/route.ts), [release setup](PUBLISHING.md). Next step: use [customer readiness](CUSTOMER_READINESS.md) to assess what remains before wider launch.
