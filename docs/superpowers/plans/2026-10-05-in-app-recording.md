# In-app Recording Implementation Plan

> **For agentic workers:** Implement inline in this session, following the user's instruction to complete the feature without a handoff.

**Goal:** Make browser recording the default audio input, retaining uploads and mobile support.

**Architecture:** A separate client component owns microphone capture, browser-selected encoding, local draft recovery, playback and download. It passes a validated File into the existing audio upload/generation flow. No backend changes or new services.

**Tech Stack:** React, MediaRecorder, IndexedDB, existing Next.js application.

**Spec:** User request in this session: default in-app recording, retain upload, robust mobile browser recording.

## Global Constraints
- Keep existing authentication and audio generation behavior.
- Use supported browser formats; HTTPS is required outside localhost.
- Stop and preserve capture on backgrounding or microphone interruption.
- Never clear a usable recording until its replacement is ready.

### Task 1: Capture and audio intake
**Files:** Create `components/audio-intake.tsx`; modify `components/storybook-app.tsx`, `lib/files.ts`, `app/globals.css`.
**Interface:** `AudioIntake({ audio: File | null, onChange: (file: File) => void, disabled: boolean, onBusyChange: (busy: boolean) => void })`.
- [x] Add record/upload tabs, microphone permission errors, elapsed timer, stop, playback, download and confirmed replacement.
- [x] Capture chunks with MediaRecorder and combine after final data arrives; release microphone on every exit.
- [x] Stop on hidden tab or ended microphone; cap recording at 10 minutes and 100 MB.
- [x] Persist completed recordings in IndexedDB and restore on reload; report storage failures without losing the in-memory take.
- [x] Connect the File to existing generation and block generation during capture.

### Task 2: Verification
**Files:** Create `scripts/test-audio-recording.mjs`.
- [x] Run TypeScript, lint and build.
- [x] Exercise real Chromium recording with fake microphone input, playback, download, upload, draft recovery, denied permissions and interruption at desktop/mobile viewport sizes.
- [x] Exercise Safari-style MP4 selection with real capture and playback; use browser API doubles for unavailable microphone/storage and canceled permission cases.
- [x] Review rendered desktop/mobile screenshots; report physical-device limitations honestly.

## Verification results
- TypeScript, lint and production build passed.
- Chromium captured playable WebM and MP4 audio; playback and downloading passed.
- 320px/390px mobile widths and desktop layout checked; no horizontal overflow.
- Upload validation, reload recovery, background interruption, permission denial/cancellation, unavailable microphone, blocked storage and automatic ten-minute stop passed.
- Temporary test route is created and removed by `node scripts/test-audio-recording.mjs`; start `npm run dev` first.
- Physical iPhone/Android microphone behavior and the paid transcription service were not exercised in this local test run.
