# Current storybook generation prompts

Read from local source on 2026-10-12. Prompt version: `2026-10-09.2`. This is the current implementation, not a proposed rewrite or verification of what is deployed live. No generation behavior was changed.

`{{field | fallback}}` represents a value inserted by the app; text after `|` is used when the value is missing. The transcript is inserted for each recording.

## Story generation: system instruction

```text
You are a careful family-history editor. You turn interview transcripts into truthful, warm, short storybooks. The transcript is the source of truth for output language: an English transcript must produce an English story. Return only valid JSON.
```


## Story generation: full input prompt

```text
Create a short keepsake storybook from a family interview transcript.

Charpai Design System v1.0:
- Treat the storybook as a memory world: Period x Geography x Artifacts x Recollection. Do not use generic nostalgia, decade themes, scrapbook clutter, or decorative vintage styling.
- Build the visual language from evidence in the transcript: place, route, room, food, document, object, weather, handwriting, family phrase, or surviving photograph.
- Foundation palette: paper #F4F0E5, deep paper #EDE7D8, paper edge #E2DAC6, ink #241F1B, soft ink #554C42, faint ink #8A8074, rule #CFC6B2.
- Memory accents must come from the Charpai palette when possible: oxide #9C4A2F, pen blue #2C3E5C, banyan #4F5F3C, wrapper gold #D7A84A, uniform green #3F5147, teak #6B4A2B, test-card teal #2E6C79, carbon violet #6A4E7C, chrome #8C9196.
- Typography intent: story prose is serif and literary; documentary labels are small uppercase UI text; handwriting is narrator-specific and should feel like fountain pen, ballpoint, pencil, or margin note.
- Spacing is semantic: touch 8px, object 16px, thought 32px, scene 48-80px, breath 72-128px, silence 120-240px.
- Physical constructions are allowed in the concept: mounted photograph, field note, tracing overlay, gatefold, pocket, document reverse, route strip, receipt, school record, recipe card, or typed label.

Audience:
- A child or younger family member reading about {{elderName | the elder}}, their {{relationship | family elder}}.
- Buyer: {{buyerName | not supplied}} ({{email | not supplied}}).

Family details to preserve:
- Elder name: {{elderName | the elder}}
- Relationship label: {{relationship | family elder}}
- Origin place: {{originPlace | home}}
- Languages in audio: {{languageMix | infer from transcript}}
- Names and places to preserve exactly: {{preserveWords | infer from transcript}}
- Dedication request: {{dedication | infer if present}}
- Extra buyer notes: {{notes | none supplied}}

Interview prompts the child may have asked:
1. Where did you grow up, and what did the place feel like?
2. What did you do for fun when you were young?
3. Who was the person who understood you best as a child?
4. What food or smell immediately takes you back home?
5. What is one story your family always told about you?
6. What was your first job, and what did it teach you?
7. How did you meet the person you loved or married?
8. What was a difficult moment that made you stronger?
9. Which family tradition do you hope continues?
10. What is one photograph or object you wish I knew more about?
11. What are you most proud of?
12. What would you like me to remember about you?

Transcript:
"""{{transcript}}"""

Return only valid JSON with this exact shape:
{
  "title": "warm storybook title",
  "subtitle": "short place/family subtitle",
  "dedication": "one sentence dedication",
  "languageNote": "short reminder to review names, places and mixed-language phrases",
  "sections": [
    {"id":"place","heading":"section heading","body":"up to 130 words in the interviewee's first-person voice, shorter when the source is brief","artifactSubject":"one concrete object mentioned in this memory","artifactBrief":"a single isolated object, its distinctive silhouette and material; no surrounding scene"},
    {"id":"memory","heading":"section heading","body":"up to 130 words in the interviewee's first-person voice, shorter when the source is brief","artifactSubject":"one concrete object mentioned in this memory","artifactBrief":"recognizable features of this one object only"},
    {"id":"another-memory","heading":"section heading","body":"up to 130 words in the interviewee's first-person voice, shorter when the source is brief","artifactSubject":"one concrete object mentioned in this memory","artifactBrief":"recognizable features of this one object only"}
  ],
  "closingNote": "one first-person closing paragraph using only what the interviewee said",
  "illustrationBrief": "one sentence visual direction for a small rubber-stamp field-note impression, no private data beyond names/places supplied",
  "stampSubject": "a short caption naming exactly one key thing shown in the illustration, such as Jasmine or Coffee tumbler",
  "stampMotifs": ["3 to 6 essential visual forms only, no labels, no people, no clutter"],
  "photoCaptions": ["caption 1", "caption 2", "caption 3"],
  "designSystem": {
    "memoryWorldLabel": "place/time/artifact label for the memory world",
    "accent": "one Charpai hex accent chosen from transcript evidence",
    "deep": "one Charpai hex deep color chosen from transcript evidence",
    "handInk": "one Charpai hex handwriting ink color",
    "handStyle": "short narrator handwriting/material description",
    "constructionNotes": "one sentence describing the physical book construction",
    "artifactForms": ["3 to 5 physical artifacts or page forms"]
  }
}

Rules:
- Each section is a story page. Select exactly ONE relevant physical artifact explicitly mentioned in that section's source memory: for example a coffee tumbler, chocolate wrapper, ruler, diploma, or house key. Do not invent possessions. When no handheld object is mentioned, use one concrete physical thing explicitly described, such as a doorway or flower.
- artifactSubject is a short noun phrase naming that one thing. artifactBrief describes only its recognizable shape/material. No collections, scenery, people, secondary objects, room arrangements, or montages. Choose distinct artifacts across memories where evidence permits.
- Keep section bodies to at most 130 words. There is NO minimum word count. Prefer a short faithful memory to padding, repeated facts, or invented sensory details. Separate paragraphs with blank lines.
- Write every section body and the closingNote in the interviewee's first-person voice, using “I,” “we,” and “my” as the interviewee did. Never narrate the interviewee's life in the third person.
- Keep the narrative as close as possible to the interviewee's own words, phrasing, emphasis, uncertainty, and point of view. Preserve distinctive expressions and concrete details from the transcript.
- You may lightly reorder, combine, and bridge statements only when needed to make the story coherent and readable. Do not change what happened or make the interviewee sound more certain, polished, sentimental, or reflective than they were.
- Do not add a moral, lesson, takeaway, interpretation, psychological explanation, legacy statement, or inspirational conclusion unless the interviewee explicitly expressed it in the transcript. Do not infer meaning on their behalf.
- Do not invent dialogue, thoughts, feelings, sensory details, motivations, chronology, or facts that the interviewee did not state.
- Section headings may be concise editorial labels, but they must describe the memories rather than interpret them.
- First determine the dominant language and script from the transcript itself. The transcript overrides the supplied "Languages in audio" field if they conflict.
- If the transcript is predominantly English, write every natural-language output field in English, including the title, subtitle, dedication, languageNote, section headings and bodies, closingNote, illustration fields, photo captions, and design-system descriptions. Preserve proper nouns and family terms in their original form.
- If the transcript is Hindi, Tamil, Telugu, or another non-English language, do not translate the storybook into English.
- If the transcript naturally mixes languages, preserve the same kind of code-switching and keep original family phrases, foods, places and relationship terms.
- Do not invent major life events that are not in the transcript.
- Keep the interviewee's own emotional texture and their concrete references to places, foods, people, and events.
- If the transcript is thin, write a modest story and say what needs confirmation.
- Preserve Indian family relationship terms and proper nouns.
- Avoid melodrama. Make it feel like a family keepsake, not an obituary.
- For stampSubject and stampMotifs, identify one physical artifact explicitly supported by the transcript. All motifs are parts of that same object; no landmarks, room scenes or landscapes. Do not make a catalogue.
- Describe illustration forms and materials, but never request additional colours. All artwork uses exactly one forest-green printing ink on ivory paper.
- stampSubject is the reader-facing caption under the illustration. Name exactly one visible subject in a short noun phrase. Do not describe the style, materials, rubber stamp, field note, impression, or other objects. Keep detailed visual direction in illustrationBrief only.
- Exclude people, crowds, vehicles, dense buildings, decorative clutter, slogans, captions, dates, labels and watermarks from the illustration concept.
- For designSystem, choose only colors from the Charpai palette unless the transcript provides a specific color that is essential evidence.
- designSystem.memoryWorldLabel must be specific to the transcript, not a generic phrase such as "family memories".
- designSystem.constructionNotes should name a physical page construction that fits the transcript, such as mounted photograph, document reverse, tracing overlay, route strip, recipe card, or field note.
```


## Illustration: full prompt, used once per story section

```text
Use case: stylized-concept
Asset type: square storybook field-note illustration

Primary subject: {{section.artifactSubject | draft.stampSubject}}
Story-specific visual direction: {{section.artifactBrief | draft.illustrationBrief}}
Exactly ONE artifact. All carved forms must be parts of that same object. Never add a second object, scenic background, human figure, or collection.
Memory context: {{draft.designSystem.memoryWorldLabel}}

First use your visual knowledge of the subject to determine its most distinctive and recognisable forms. Do not create a generic interpretation. Select only the minimum visual information needed for the subject to be immediately identifiable. Preserve defining proportions, structure, and spatial relationships. Use only three to six essential forms or relationships.

Composition and paper:
- 1:1 square composition.
- Cover the entire frame with warm ivory uncoated paper (#f2eee3), subtle fibres and a matte finish.
- Preserve large areas of completely unprinted paper; whitespace is essential.
- Place one single-colour hand-carved rubber-stamp illustration in the centre.
- The complete artifact occupies 65%–75% of the image height, with generous unprinted paper around it.
- Give it the quiet, delicate detail of a vintage illustrated storybook: expressive carved lines, stippled shading and paper showing through. Never a logo, seal, or poster.
- No box, circle, border, or defined frame.

Subject interpretation:
- Illustrate exactly ONE isolated physical artifact named in Primary subject.
- Preserve its characteristic silhouette, proportions, construction, segmentation, layers, and culturally specific details.
- Three to six essential forms means parts of this ONE artifact, never three to six separate objects.
- No scenery, landscapes, room arrangements, companion objects, supporting props, decorative flowers, people, or object collections.
- Do not illustrate the whole story. The one artifact carries the memory.

Colour:
- Exactly ONE printing ink: forest green #264c3e, on warm ivory paper #f2eee3.
- Every contour, shadow and detail uses that same green ink. Create lighter tones only through sparse dots, hatching, dry ink and paper show-through.
- No second ink, no natural object colours, no black outlines, no brown, copper, red, yellow or blue. The subject's real material must be shown through shape and marks, never additional colours.
- Let the unprinted paper create highlights. No coloured background scenery or painted gradients.

Rubber-stamp treatment:
- Render one hand-stamped ink layer only.
- Authentic carved-rubber texture, hand-engraved marks, uneven line widths, irregular contour notches, fractured edges, dry ink shortages, granular deposits, pinholes, paper show-through, uneven pressure and faint partial ghosting. No colour misregistration or multiple ink layers.
- Rough analog edges, never digitally smooth. It must look like a real hand-carved stamp pressed onto fibrous paper, not a photograph with a filter.

Mood: quiet, restrained, tactile, culturally and regionally specific, slightly nostalgic, collectible—like a field note kept by an architect, engineer, travel writer, or natural observer.

Text: no captions, titles, dates, labels, decorative lettering, slogans, repeated branding, or watermarks. Only if a word or marking is intrinsic to recognizing the subject may it appear once, small and imperfectly stamped.

Avoid: full-page illustration, photographic realism, glossy product photography, advertisements, tourist souvenir templates, monument montages, generic city icons, smooth vector graphics, clean line-art logos, circular seals, Chinese red stamps, postage perforations, wax seals, stickers, collage layouts, dense detail, decorative clutter, childish craft styles, cartoons, 3D rendering, plastic textures, glossy gradients, oversaturation, borders, captions, and watermarks.
```


## Earlier step: family details extraction — system instruction

```text
You extract structured storybook intake fields from family-history transcripts. Return only valid JSON.
```


## Earlier step: family details extraction — input

```text
Extract the editable storybook intake fields from this family interview transcript.

Current supplied fields, if any:
{{supplied intake fields as JSON}}

Transcript:
"""{{transcript}}"""

Return only valid JSON with this exact shape:
{
  "buyerName": "",
  "email": "",
  "elderName": "",
  "relationship": "",
  "originPlace": "",
  "languageMix": "",
  "preserveWords": "",
  "dedication": "",
  "notes": ""
}

Rules:
- Fill fields from the transcript wherever the transcript gives enough evidence.
- elderName is the person whose life story is being made.
- relationship is the family relationship term used by the buyer or child, such as Nani, Ajji, Thatha, Amma, Appa, grandmother, or uncle.
- originPlace is the most specific home, childhood, or family place in the transcript.
- languageMix should name the transcript's dominant language or language mix.
- preserveWords should be a comma-separated list of important names, places, foods, relationship terms, objects, and phrases that must be preserved exactly.
- dedication should be filled only when the transcript implies a dedication or family note.
- buyerName and email should be filled only if explicitly spoken or present in supplied fields.
- notes should briefly name uncertainty or missing fields that need human review.
- Use an empty string for any field not supported by the transcript or supplied fields. Do not invent facts.
```


## Earlier step: identifying the interviewee — system instruction

```text
Identify the interviewee in a speaker-diarized family-history interview. The interviewee is the person answering questions and sharing their own memories; the interviewer asks or prompts. Return only JSON in the form {"speaker":"A"}, using exactly one speaker label present in the transcript. Do not select a speaker merely because they speak first.
```


## Earlier step: identifying the interviewee — input

```text
Expected interviewee name or family title: {{elderName | not provided}}
Expected relationship: {{relationship | not provided}}
Available speaker labels: {{speaker labels, joined with commas}}
Transcript:
{{one line per segment: [speaker start-end] text}}
```


## Single-speaker transcription prompt

```text
This is a family interview for a keepsake storybook. Transcribe in the original spoken language and script where possible. Do not translate into English. The speaker may use {{languageMix | English, Hindi, Tamil, Telugu, or a mix}}. Preserve these names and places exactly where possible: {{preserveWords | none supplied}}.
```

## Settings and boundaries

- Initial transcription uses `gpt-4o-transcribe-diarize`, `diarized_json`, and automatic chunking, with no written prompt. With multiple speakers, the identification step selects the interviewee; only that speaker's words become the story transcript. With fewer than two speakers, the audio is transcribed again using the single-speaker prompt above.
- Story, details extraction, and speaker selection use `OPENAI_TEXT_MODEL`, defaulting to `gpt-5-mini`.
- Single-speaker transcription uses `OPENAI_TRANSCRIBE_MODEL`, unless missing or set to the diarization model, in which case it uses `gpt-4o-mini-transcribe`.
- Illustration uses `OPENAI_IMAGE_MODEL`, defaulting to `gpt-image-2.5-flare`: 1024 × 1024, medium quality, opaque background, WebP, one image per section. These are code defaults; server settings can override them.
- The story prompt shows three sample sections. The app keeps at most five returned sections; there is no explicit instruction explaining how to choose the number of sections.
- Page layout, cover construction, QR codes, text pagination, and PDF export are handled by application code, not by these prompts.
- The embedded design-system block still permits several accent colours and physical page constructions; later story/image rules require one forest-green printing ink. This is a prompt inconsistency to resolve in a future revision.
- Empty or missing story fields can be replaced with demo fallback content during normalization. Strict source fidelity therefore also requires reviewing that code, not just rewriting the prompt.

## Sources and next step

Sources: `lib/storybook.ts`, `lib/charpai-design-system.ts`, `lib/storybook-image.ts`, `app/api/generate-storybook/route.ts`, `lib/storybook-illustrations.ts`, `lib/generation-telemetry.ts`.

Next: agree on the desired improvements, revise the prompts and fallback behavior, and compare output using the same transcript. No revision has been implemented in this discussion.

## Direct story workshop — 2026-10-13

- User requested that story-generation experiments happen directly in the conversation, without API calls, until they explicitly say “commit this change.” Do not change application generation behavior or commit the experiment before that instruction.
- Received a Telugu interview transcript. First sample: one Telugu page in the interviewee's first-person voice, focused on requesting permission to study B.Ed. through a letter. Use the existing 130-word page limit as a starting point, not an approved new workflow.
- Preserve the stated connection between family experiences, wanting a degree, and wanting courage. Do not invent dialogue or sensory details. Omit unclear transcription rather than silently resolve it; the references to grandfather and great-grandfather need review before making the family relationships explicit.
- Verified: current local prompt documentation was read; no generation API calls were made. The sample is an editorial draft for review, not a browser-tested page or an implemented prompt change. No transcript copy was saved.
- User said “go ahead”; continued with a second Telugu sample page about the unsolicited greeting card during B.Ed. Preserve that she did not know who sent it, showed it to the elder herself, and described feeling guilty despite not knowing the sender. Do not imply a relationship or wrongdoing, or add an editorial lesson about the incident.
- User then requested completion of the whole task. Completed a seven-page story draft directly in the conversation, bringing the first two pages together with the declined job offer/Madras attempt, first school job, government-job application, selection and family permission, and arrival at the village school. Closing uses her explicitly stated present-day reflection about courage rather than an invented lesson.
- Editorial check: kept the unsolicited card separate from the study-permission letter; kept the earlier declined offer separate from the later application, selection, and posting; did not infer that a government job resolved her fear. Uncertain school/place spellings, exact salary/rickshaw amounts, and inconsistent test/interview details were omitted. Family references still need confirmation before making the grandfather/great-grandfather relationships explicit throughout.
- Proposed workflow improvements, not yet approved or implemented: map distinct memories before choosing the number of pages; keep questions about unclear details outside the narrator's prose; let the recording determine the ending, adding reflection only when explicitly spoken. Seven pages are a workshop choice; the current app caps generated sections at five.
- Verified: draft was checked against the supplied transcript as text. No API call, application change, browser verification, commit, or deployment was made. The draft is not approved final copy; the full personal transcript and story were not saved in project notes.
- Next: review the complete draft's voice, coverage, and proposed workflow rules with the user. Continue the workshop directly until explicit instruction to commit the change.

### Workshop rules adopted — 2026-10-13

- User approved the three editorial rules. They now govern this direct conversation workshop: choose pages around distinct memories, resolve unclear details with the user outside the story, and preserve the recording's ending with only explicitly spoken reflection.
- Clarification process: ask one concrete question at a time, wait for the user's answer, update the affected story passages using that answer, then ask the next unresolved question. Do not silently resolve ambiguity or treat unanswered questions as confirmed facts. Retain the transcript's wording where the user cannot confirm a detail.
- First answer received: Ramadevi is the narrator and B.Ed. graduate, speaking to her son. References to “ముత్తాతయ్యగారు” identify the son's great-grandfather, who is Ramadevi's grandfather. The user said references to “తాతయ్యగారు” probably identify Ramadevi's father (the son's grandfather); this latter mapping is tentative, not a blanket confirmed replacement.
- Apply family terms from the narrator's point of view in first-person prose. In passages explicitly identified as the son's great-grandfather, use “మా తాతయ్యగారు”; retain “డాడీ” for the narrator's father where explicit. Do not mechanically copy the interviewer's relationship terms into her narrative.
- Conversation revisions after this answer: identify the story as Ramadevi's memories; in page 5 identify the elder visited by the school correspondent as “మా తాతయ్యగారు”; in page 6 identify the elder handing her the selection letter as “మా తాతయ్యగారు”. Both elder identities are supported by explicit great-grandfather references in those transcript passages.
- Second answer received: user confirmed that Ramadevi's grandfather (the son's great-grandfather) allowed B.Ed. study on the condition that she would not take a job. This authority figure is now confirmed; it does not establish the identity of every other “తాతయ్య” reference.
- Conversation revisions: page 1 explicitly names “మా తాతయ్యగారు” as the person granting conditional permission; page 3 explicitly names him as the elder to whom she showed the first job order and whose promise she kept. Her father remains a separate person referred to as “డాడీ”.
- Local source files were inspected after initially interpreting “implement” as app work; no application code was changed. The earlier instruction to work directly without API calls until “commit this change” remains in force. The app's existing prompts and five-section cap remain unchanged.
- Third answer received: user confirmed her first teaching job was at “బీసెంట్ స్కూల్” (Besant School). Page 4 now opens: “తిరిగి వచ్చాక మా ఫ్రెండ్స్ అందరూ కొత్తగా పెట్టిన బీసెంట్ స్కూలులో టీచర్లుగా చేరుతున్నారు.”
- Fourth answer received: neither her father nor grandfather accompanied her to పేరాపురం; the user identified the companion as a family well-wisher, with name unconfirmed. Replace page 7's earlier “తాతయ్యని తీసుకొని వెళ్ళాను” with “మా కుటుంబానికి శ్రేయోభిలాషి అయిన ఒకాయనతో కలిసి వెళ్ళాను.” This correction comes from the user's clarification.
- Name check against supplied transcript: around 29:59 it says “మడిపిల్లి రాజా గారిని”, and around 30:24 “మడిపులి రాజు” in discussion about arranging the posting. The 31:34 accompaniment line reads “తాతిగాడిని తీసుకొని వెళ్ళాం పేరాపం.” These inconsistent/unclear words do not establish that the named person was the companion. Do not assign either spelling as his name without confirmation. No original audio was checked.
- Clarification workflow refinement: when asking who a person was, allow that it may be someone outside the suggested relationships; the earlier father/grandfather alternatives were too narrow. Do not force uncertain details into the suggested choices.
- Full draft reviewed after the user said “go ahead”. Consolidated all confirmed corrections into the seven-page conversation draft: Ramadevi's first-person perspective, her grandfather's B.Ed./no-job condition, Besant School, and the unnamed family well-wisher accompanying her to పేరాపురం.
- Review adjustments: leave the recipient's exact family relationship unstated in the greeting-card passage and the approver's relationship unstated in the first-school permission passage, since those scene-specific identities were not separately confirmed. Keep the declined first offer distinct from the later government-job application, selection letter, and posting. Do not assign the well-wisher a name from nearby ambiguous references.
- Verified by text review against the supplied transcript and user answers; no original audio, browser, or generated images were checked. No API calls, application changes, commit, or deployment performed. The full draft remains in the conversation, not in project notes.
- Telugu wording pass completed in the conversation. Corrected the draft's “నా గోడంతా” (wall) to “నా గోడు అంతా ఆ ఉత్తరంలో రాశాను” (her troubles); simplified the request to Ratna and the village-arrival wording; made the B.Ed. condition and first-job refusal read more naturally. Preserve colloquial phrases and spoken English such as “గిల్ట్ తినేసింది అనుకో”, “నోరు మూసుకొని వచ్చేశాను”, “డాడీ”, and “హ్యాపీ లైఫ్”.
- This was an editorial text check, not review by Ramadevi or verification against original audio. Confirmed facts and unresolved identities remain as recorded above. No API calls, application changes, commit, or deployment were made.
- Drafted the generation and clarification instructions below for review in the conversation. Checked them against the approved rules and the actual clarification examples. They are a proposed replacement for the story-editing instructions, not an updated snapshot of application code or a tested model response.
- Manual rehearsal completed after the user said “go ahead”: produced a consolidated eight-page Ramadevi draft directly in the conversation. Split the previously combined declined first job offer and Madras visit into separate memories; page count follows the episodes rather than the earlier seven-page layout.
- Included all confirmed corrections and the Telugu wording pass. Kept uncertain scene-specific relatives unspecified, the village companion unnamed, and the closing limited to Ramadevi's stated reflection. No additional names, dates, salary figures, later outcomes, or invented lessons were added.
- Text checked against the transcript and clarification record; not verified against original audio or reviewed by Ramadevi. No API calls, application changes, commit, or deployment made. App instructions and clarification UI remain future implementation until the user says “commit this change”.
- Next: obtain feedback on the consolidated draft; the draft and proposed instructions are ready for the user's review. Do not repeat completed editing passes without new feedback.

### Proposed story-generation and clarification instructions

You are a careful family-history editor. Turn an interview transcript and the user's confirmed clarifications into a readable story in the narrator's own voice.

1. **Establish whose story this is.** Identify the narrator and distinguish their memories from the interviewer's questions or comments. Express family relationships from the narrator's point of view. A person called great-grandfather by the interviewer may be the narrator's grandfather. Do not assign a relationship solely from a family term in the transcript; check who is speaking and whom they mean.
2. **Use the transcript and confirmed answers as evidence.** A clear user correction can resolve a transcription error. Keep a separate record of what was confirmed, what remains uncertain, and which story passages were revised. Words such as “probably” or “I think” do not establish certainty. Do not invent names, events, dialogue, thoughts, feelings, sensory details, or explanations.
3. **Preserve every narration; let memories determine structure.** First identify every narrated episode and its supported sequence. There is no word, chapter, page, or total-length limit. Do not condense, summarise, merge away, or remove any narration, detail, digression, repeated recollection, or emotional emphasis to fit a length target. Keep separate letters, job offers, applications, and postings distinct. Use descriptive headings and reading-page breaks only to organise the full content. A physical page may need a continuation; it must never cause text to be cut.
4. **Preserve the spoken voice.** Write in first person and in the transcript's dominant language and script. Preserve natural mixed-language phrases, family terms, regional expressions, repetition, the full intensity of feelings, and the narrator's own uncertainty. Limit editing to grammar/spelling and bridges needed to make the narration understandable without changing or shortening its substance. Do not make the narrator sound more formal, sentimental, confident, or reflective. Do not silently sanitise or soften the narrator's descriptions. Use quotation marks only for words supported by the source. Interviewer prompts or acknowledgements may sit outside the story, but disclose their exclusion and preserve the source.
5. **Prepare clarifications in audio order before asking.** Identify all remaining meaningful uncertainties in the transcript, remove questions already answered or explicitly skipped, and save a complete question list ordered by increasing audio timestamp. Ask one short, concrete question at a time from that list, always giving the timestamp and a brief source phrase so the user can listen forward through the audio. Ask when an unclear identity, relationship, name, event, or sequence would materially change the story; do not add unrelated minor-detail questions. Suggested choices must allow that neither is correct. Wait for the answer before assigning the disputed fact. Keep deferred questions recorded but do not ask again until the user returns to them. Do not jump backward during the pass; save newly discovered earlier questions for a separate follow-up pass and explain that before asking them.
6. **Revise after each answer.** Apply the answer to all affected passages, show the revised passage or passages, and update the separate clarification record and question-list status. Mark any later questions resolved by the same answer without asking them again. Then ask the next unanswered, non-deferred question in timestamp order. Do not apply a scene-specific answer to every occurrence of a family term, or ask again for facts already confirmed. Preserve unrelated wording and events.
7. **Handle unknown answers honestly.** If the user does not know, says neither choice is correct, or cannot confirm a name, use only the broader description that is supported. For example, write “a family well-wisher” when that is confirmed and leave the name out. Do not attach a nearby name to that person without evidence. Keep remaining uncertainty in the review notes, not as questions or editorial placeholders in the narrator's prose.
8. **Let the recording determine the ending.** Stop the events where the recorded account stops. Do not invent later success, resolution, healing, or a lesson. A closing reflection is optional and must come from something the narrator explicitly said; retain any uncertainty or fear present in the source.
9. **Check complete coverage as well as facts.** Check every source passage against the story and a separate coverage/clarification record. Every narration must be included or retained as an explicitly reported unresolved passage, never silently dropped as a minor detail or side story. Check facts against the transcript and confirmed answers, family relationships against the narrator's perspective, and wording for changes in meaning. Keep separate letters, offers, applications, selection notices, and postings distinct. Return the full revised story with review notes outside it. Do not claim exhaustive readable coverage while substantive passages still await clarification. Describe verification accurately; an editorial check is not review by the narrator or verification against the original audio.
10. **Report what was left out after every generation or revision.** Always give an explicit omission report, even if it says nothing was left out. For every excluded or unresolved passage, give its timestamp/source phrase, what is absent from the readable story, why, whether it is retained in the source/review record, and the question needed to restore it. Distinguish unclear narration, unassigned speaker/identity, interviewer prompts, and deliberate edits. Never report “nothing left out” merely because all major events appear. No exclusions solely for brevity are permitted.

Story pages contain only the title, headings, and narrator's prose. Clarification questions and answers belong in a separate review exchange. Continue that exchange until the important uncertainties are resolved or can safely be left unspecified.

### Shareable draft — 2026-10-13

- At the user's explicit request, saved the complete latest eight-page Telugu story and closing reflection in [ramadevi-story.md](ramadevi-story.md) for sharing with Ramadevi. This export preserves the consolidated conversation draft; it contains no workflow notes or clarification questions.
- The earlier note that the full story was not saved applied before this export. Original transcript remains unsaved. Ramadevi's review is pending; no API calls, app changes, commit, or deployment were made.
- Next: receive Ramadevi's corrections and update the story and clarification record.

### Brevity review — 2026-10-14

- User asked whether any parts were edited for brevity. Compared the saved story with the supplied conversation transcript: the file is a complete edited draft, not an exhaustive account of every transcript episode. Page bodies were shortened using the 130-word starting limit; repetition and interviewer prompts were removed, and some substantive episodes were omitted entirely.
- Substantive omissions include the detailed family difficulties behind her loss of confidence (00:42–01:27), the family doctor and her angry internal response (03:57–04:25), the passage about stopping meals at home and arranging food elsewhere (04:54–05:34; details unclear), train/children's names in the Madras visit (15:50–16:11), school assurances and money details, alternative postings/local contacts (29:59–31:26), and her description of the village children (33:33–34:00). Headmaster reassurance and the greeting-card reaction were also condensed.
- Some omissions were due to unclear transcription, not merely brevity: exact money figures, some names and relationships, and parts of the meals and posting arrangements need confirmation. Original audio has not been checked.
- The substantive omissions mean the earlier “complete” wording needed qualification. No story revision was requested or performed in this turn. Proposed next: restore meaningful omitted episodes, asking about unclear details, and allow additional pages rather than losing memories to the length limit.

### Unlimited-length revision and mandatory omission reporting — 2026-10-14

- User overrode the 130-word starting limit: do not condense any narrations, preserve all aspects, and impose no book-length limit. After every story generation or revision, explicitly report what was left out. Updated proposed instructions 3, 4, and 9 and added instruction 10 above. This is the current workshop requirement; earlier brevity-based drafting notes are historical.
- Replaced [ramadevi-story.md](ramadevi-story.md) with an expanded 23-chapter draft. Restored family difficulties and business recollection, doctor/anger, meals/secrecy, repeated promises, card reaction and sleeplessness, education and dates, Madras relatives/train/children, school/community/staffing/routines/family reputation, Guruji, application dialogue, interview details, letter-opening customs, father's role, alternative postings/local families/mills, headmaster's repeated reassurance, children's caste/clothing/appearance, and the first week/return home.
- Preserved all 330 supplied timestamped entries in [ramadevi-transcript.md](ramadevi-transcript.md), including unclear words and conversational interruptions. This source archive is necessary for the user's full-coverage request and must not be mistaken for verified transcription.
- Added [ramadevi-story-review.md](ramadevi-story-review.md) with a timestamped omission/uncertainty report and coverage table. Substantive gaps remain in the readable story, especially exact older-aunt/death details, salary/rickshaw amounts, Radha/Radhababu family-work account, test versus interview, possible mistreatment wording, and unclear names/places. Their source text is retained; do not label the readable draft exhaustive until resolved.
- Asked one clarification about the 04:54–05:34 meals arrangement; answer pending. Clear statements about hunger, four days, the separate kitchen, secrecy, and permission are restored without assigning a host or claiming a hunger strike. Continue revising as answers arrive.
- Verified file structure, restored-episode presence, source timestamp inventory, and coverage references. This is text-only review, not a model/API run or audio/narrator verification. Application code, current app length caps, commits, and deployments remain unchanged under the workshop instruction.
- Next: incorporate the meals answer and restore the remaining uncertain substantive passages one question at a time; include an updated omission report with each revision.
