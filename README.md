# Charpai - A Family Heirloom with Stories

Charpai lets signed-in users upload one family interview recording and receive an editable keepsake storybook with a PDF/export path.

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

3. Configure Convex Auth environment variables:

```bash
npx convex env set SITE_URL=http://localhost:3000
npx convex env set GOOGLE_CLIENT_ID=...
npx convex env set GOOGLE_CLIENT_SECRET=...
```

Generate `JWT_PRIVATE_KEY` and `JWKS` with `jose`, then set them with `npx convex env set "NAME=value"`.

4. Start Convex in another terminal:

```bash
npm run convex:dev
```

5. Start the app:

```bash
npm run dev
```

If `OPENAI_API_KEY` is missing, the app runs in demo mode so the UI and export path can still be verified. Production Revenue proof should use real transcription and story generation.

## Auth

Access keys are no longer used. Users sign in with Google or email/password before uploading audio, and Convex stores storybook runs against the authenticated user.
