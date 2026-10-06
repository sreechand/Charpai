# Transcription languages

## Conversation summary — 2026-10-06

The user asked which Indian languages the transcription service supports.

The user clarified that the question is specifically about the OpenAI `gpt-4o-transcribe-diarize` API, rather than languages tested in Charpai. The official model page, speech-to-text guide, and transcription API reference do not establish a complete Indian-language list for that exact model. Do not substitute Whisper's language inventory or a proposed product testing list for an authoritative answer.

## Current app configuration

- Provider: OpenAI.
- Main model: `gpt-4o-transcribe-diarize`, which separates speakers in a recording.
- When the main model detects fewer than two speakers, the app transcribes again with `OPENAI_TRANSCRIBE_MODEL`, or `gpt-4o-mini-transcribe` by default.
- The main request does not specify a language. The fallback prompt requests the original spoken language and script and includes the user's language notes.
- Source: `app/api/generate-storybook/route.ts`, functions `transcribeSegment` and `transcribeWithoutDiarization`.

## What is verified

The [official model page](https://developers.openai.com/api/docs/models/gpt-4o-transcribe-diarize) describes the main model and its speaker separation. The current [speech-to-text guide](https://developers.openai.com/api/docs/guides/speech-to-text#supported-languages) does not provide an exhaustive named Indian-language list for this exact model. Its Whisper language list and newer `gpt-transcribe` language-code guidance must not be treated as a verified support matrix for the app's current models.

No per-language audio tests were run in this discussion. We cannot honestly claim an exact tested Indian-language support list for Charpai yet.

## Proposed validation list — not confirmed support

Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Bengali, Gujarati, Punjabi, Urdu, and Nepali. Also test interviews that mix these languages with English. These are candidate languages for evaluating the product, not an official guarantee that each language works well with the configured model.

Next step: evaluate short native-speaker recordings against human-written transcripts, starting with Telugu and Hindi, and record accuracy and speaker separation before advertising language support.

## Plain GPT-4o transcription — follow-up

The user next asked about `gpt-4o-transcribe` generally, without speaker separation. The [model page](https://developers.openai.com/api/docs/models/gpt-4o-transcribe) documents speech-to-text and improved language recognition. The current guide still does not establish a complete named language inventory for that model.

As a practical expectation, common languages to try include English, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Korean, Arabic, Russian, and Hindi. This is an expectation about multilingual capability, not a verified model-specific support list or a product accuracy guarantee. Exact Indian-language coverage remains unverified in this session.

No model configuration was changed. Next step: verify the particular Indian languages required by the product before claiming support.

### Request for a specific supported Indian-language list

The user requested a specific list for `gpt-4o-transcribe`. Targeted searches of official OpenAI documentation for Hindi/Tamil, Bengali/Telugu, and the older Hindi/Kannada/Marathi/Tamil/Urdu grouping did not return a model-specific support list. The earlier Hindi example was an expectation, not verified official coverage. Lack of a published list does not establish that these languages are unsupported. No specific Indian-language inventory can be reported as verified from the evidence collected so far.
