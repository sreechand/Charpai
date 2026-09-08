# Charpai - A Family Heirloom with Stories

Build Week Revenue product: paid buyers upload one family interview recording and receive an editable keepsake storybook with a PDF/export path.

Production audio uploads go directly to Convex storage before transcription, so buyer recordings above Vercel's function body limit do not hit the API route as multipart uploads.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and set:

```bash
OPENAI_API_KEY=
NEXT_PUBLIC_CONVEX_URL=
```

3. Start Convex in another terminal:

```bash
npm run convex:dev
```

4. Start the app:

```bash
npm run dev
```

If `OPENAI_API_KEY` is missing, the app runs in demo mode so the UI and export path can still be verified. Production Revenue proof should use real transcription and story generation.

## Buyer links

Collect payment outside the app, then send each buyer a private keyed URL:

```text
https://your-vercel-url.vercel.app/?key=buyer-kk-001
```

The key is saved with the Convex run for Build Week evidence and buyer tracking. It is not authentication or a security boundary, so do not treat it as a private archive link after the PDF is exported.
