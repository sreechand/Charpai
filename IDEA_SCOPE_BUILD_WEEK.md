# IDEA_SCOPE.md

> This document is the control plane for the build. You wrote it; your coding agent reads it before every session. If a proposed change does not improve the active milestone's acceptance test or the rubric strategy, it goes in the parking lot.

## 0. scope status

| Field | Value |
|---|---|
| Event | GrowthX Build Week · Season 03 |
| Builder | you, solo, plus your coding agent (Codex or Claude Code) |
| Build starts | Sat 29 Aug 2026, 11:00 AM IST |
| Submission deadline | Sat 5 Sep 2026, 11:00 AM IST |
| Demo | Sat 5 Sep 2026, 3:00 PM IST |
| Current milestone | M5 verification; private keyed buyer link flow live and verified |
| Live URL | https://agara-puce.vercel.app |
| Public repo | https://github.com/sreechand/agara |
| Last updated | Fri 4 Sep 2026 |

### status language

- **Specified:** described here but not implemented.
- **Implemented:** code exists.
- **Working locally:** the golden path runs in the development environment.
- **Live:** the golden path runs at the Vercel URL, logged out, on a phone.
- **Verified:** acceptance tests have passed on the live URL.
- **Demo-ready:** reset, fallback, timing and the numbers screenshot have been rehearsed.

## 1. idea lock

| Decision | Locked answer |
|---|---|
| One-sentence product | A family storybook maker that turns one grandparent or parent interview audio recording into an editable keepsake storybook and downloadable PDF. |
| The one person | A 30-45 year old parent/adult child who wants their child to know a grandparent's stories while the grandparent can still tell them. |
| The one moment | They can get one elder on a call or in person for 10 minutes and want to turn that conversation into a meaningful family keepsake this week. |
| Current workaround | The child asks questions informally, someone records a voice note, and the story stays buried in WhatsApp, memory, or scattered photos. |
| Core action (user does X -> gets Y) | Buyer pays outside the platform, opens a private keyed URL, uploads one audio recording plus optional family photos and names/places, then the product transcribes, drafts, structures, and renders an editable storybook with a downloadable PDF/export path. |
| The one outcome the product must deliver | A gift-worthy, short storybook PDF that a family can read, save, and share. |
| Hard input or hard case | A noisy 10-minute WhatsApp-style recording with mixed English/Hindi/Tamil/Telugu, family names, place names, and emotionally important details. |
| Primary track | Revenue |
| Riskiest assumption | People who say yes will pay Rs 400 and send usable audio quickly enough, and the automated transcription -> storybook draft -> PDF/export path is good enough that manual cleanup is quality control rather than the delivery mechanism. |
| The 30-minute no-code test for it | Collect payment from the two committed buyers outside the platform, send each a keyed URL, and ask each to upload one 3-10 minute recording. |
| First three users (names, where they are) | Buyer 1 from the seven messaged leads; Buyer 2 from the seven messaged leads; Buyer 3 from the remaining leads or one direct referral from Buyers 1-2. Replace with initials as soon as confirmed. |
| Tuesday channel (where those users already gather) | Direct WhatsApp/DM referrals from the first buyers, plus the family/parent circles where they can forward the link privately. |
| Personal artifact a user would screenshot | The storybook cover and first story page, with the grandparent's name, origin place, photograph if supplied, and a warm title. |
| Saturday numbers I expect to report | 2-5 paid buyers at Rs 400, 2-5 completed storybook runs, 5-15 signups/first-use events, 10-50 visitors, 2-3 customer quotes. |
| Library lineage (card or proven build, if any) | No library card. Original buyer-led gifting product from direct outreach. |

### why this idea

#### the pain I feel

Families lose stories because elders are more comfortable speaking than typing, and younger family members rarely convert those spoken memories into something durable. This is personally believable because the buyer is not buying generic AI writing; they are buying a finished family artifact from a moment that may not repeat. The first proof already exists: 2 of 7 people said they are ready to pay Rs 400.

#### decisive proof

A stranger with a private keyed URL can upload one interview audio file, add family details and optional photos, then watch the product automatically create an editable storybook draft with an exportable/downloadable PDF path. A reviewer sees the Saturday demo generate a storybook from a fresh recording without the builder rewriting it live, and then sees external payment proof, Convex first-use records, and completed PDF examples from real buyers.

## 2. user and job

### user

- Who (name, age, situation): Parent/adult child, 30-45, with living parents or grandparents and children or younger relatives who do not know the elder's life stories.
- Context: Can record a 5-10 minute conversation over phone, WhatsApp, or in person.
- Frequency: Occasional but emotionally urgent; birthdays, visits home, family gatherings, recovery periods, anniversaries, and moments when the family realizes stories are fading.
- Existing behaviour: Informal calls, WhatsApp voice notes, scattered photos, and forgotten family anecdotes.
- Existing cost, delay, risk or frustration: Stories are lost, children do not relate to grandparents, and the adult child feels guilty for not documenting family history.

### job to be done

> When `I can get my parent or grandparent to talk for a few minutes`, they need to `turn that spoken memory into a finished family storybook`, so that `my child and family have something beautiful to read, save, and share`.

### definition of completion

The job is complete only when:

1. The uploaded recording has been transcribed into usable story material.
2. The buyer can edit the generated storybook text before finalizing.
3. The buyer can download a PDF that contains a cover, story sections, and optional uploaded photos or fallback illustrations.

Advice, a transcript, an extraction, search results or a chat response alone do not count unless they are themselves the final usable output.

## 3. product contract

### golden path

1. Buyer pays Rs 400 outside the platform and receives a private keyed product link.
2. Buyer enters their email, grandparent/parent name, relationship label, language mix, names and places to preserve, and optional notes.
3. Buyer uploads one audio file up to 10 minutes and optionally uploads 1-3 family photos.
4. Product automatically transcribes the audio, generates a short storybook draft, chooses a structure, suggests a title/dedication/captions, and stores the run in Convex.
5. Buyer edits the title, section text, captions, and dedication in the browser.
6. Buyer exports or downloads a PDF storybook.

### automation contract

The product must automate the core transformation. Manual work is allowed only to protect quality for first paid users, and must be visible as review/editing rather than hidden fulfillment.

| Step | Automated by product | Manual boundary | Demo requirement |
|---|---|---|---|
| Intake | Capture private key, buyer details, helper names/places, audio, and optional photos | Builder collects payment outside the platform before sending the key | Reviewer sees the keyed run recorded in Convex |
| Transcription | Convert uploaded audio into transcript text | Builder or buyer may correct names, places, and mistranscribed phrases | Fresh demo audio produces a transcript without manual typing |
| Story shaping | Turn transcript into title, dedication, 3-5 story sections, captions, and closing note | Buyer/builder may edit wording before export | Fresh demo transcript produces a coherent story draft automatically |
| Layout | Render a two-page aged-paper spread with illustration/photo material on the left and editable story text on the right | Builder can choose a simple fixed theme only | Storybook preview appears at the live URL |
| Export | Generate/download/print-to-PDF from the storybook preview | If server PDF fails, browser print-to-PDF is the fallback | Reviewer can obtain a PDF/exported artifact during demo |

Minimum automation for Revenue credibility:

1. A fresh audio upload creates a transcript.
2. The transcript creates a structured storybook draft.
3. The draft appears in an editable storybook UI.
4. The UI exports or downloads a PDF-like artifact.

If any of these require the builder to rewrite the story manually, the product becomes a service and the revenue claim weakens.

### interview prompts

These prompts are shown to the buyer before they record the conversation.

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

### inputs

| Input | Format/source | Hard characteristics | Validation |
|---|---|---|---|
| Access key | Query string or pasted key | Unique per buyer or story entry | Required before generation; saved with run |
| Payment proof | External screenshot or manual confirmation | Payment is outside the app and not shown to the buyer in-product | Builder matches payment proof to the private key |
| Buyer identity | Email and name | Must be real enough to identify the buyer | Required email field saved to Convex |
| Relationship details | Text fields | Nani/Dadu/Ajji/Thatha/Patti/Aaji/Ajoba/generic labels | Required grandparent or parent name and relationship |
| Audio recording | mp3, m4a, wav, mp4, webm where supported | Up to 10 minutes and 100 MB; mixed languages; background noise | File type check, size check, direct Convex storage upload before transcription |
| Names and places | Text area | Transcription may miss proper nouns | Required helper field before transcription |
| Photos | 0-3 image uploads | Family images may be low quality | Optional; max 3 files; visible preview before generation |

### outputs and state changes

| Output/state change | Consumer | Required format | Proof of completion |
|---|---|---|---|
| Signup/first-use row | Builder/reviewer | Convex table row with email, timestamp, status | Convex dashboard screenshot |
| Transcription | Buyer/builder | Automatically generated editable text or stored transcript | Run detail screen |
| Storybook draft | Buyer | Automatically generated editable title, dedication, sections, captions | Browser editor screenshot |
| PDF/export | Buyer/family/reviewer | Downloadable PDF or browser-exportable storybook | PDF/export opens from live URL after generation |
| Private key record | Builder/reviewer | Convex run with access key and buyer email | Convex dashboard screenshot filtered or inspected by key |

### what the product must remember

- within one session: upload progress, transcript, generated storybook draft, edits before PDF export.
- across sessions (Convex tables): access key, buyer email, run status, uploaded file references, transcript text, storybook JSON if stored, PDF URL if stored, timestamps.
- what it must deliberately forget: raw audio can be deleted after successful PDF export unless the buyer asks for regeneration; do not expose one family's private story to another user.

### human review boundary

- What can be automated: transcription, first storybook draft, sectioning, title suggestions, dedication, caption suggestions, storybook preview, and PDF/export rendering.
- What requires confirmation: payment received outside the platform, final text approval by buyer, use of uploaded family photos, and whether optional illustrations are acceptable.
- What must be escalated: failed transcription, unsupported language/audio, sensitive content the product cannot safely rewrite, or a buyer asking for print delivery.
- How uncertainty is exposed: transcript screen highlights that names/places may need correction before story generation; storybook editor makes every generated section editable before export.
- What manual cleanup is allowed for Build Week: correcting transcript errors and light copy edits after the product has generated a draft. It must not be the main way the storybook is created.

## 4. what makes it different

### the obvious version

A generic AI tool that asks users to type memories into a form and returns a plain story or chat response.

### the non-obvious choice

The product starts from how grandparents actually communicate: spoken stories in mixed languages. It turns one real recording into an editable keepsake rather than asking the elder to learn a new writing workflow.

### the moment they screenshot

The personalized cover and first story page: grandparent/parent name, relationship label, origin place, family photo if supplied, and a title that feels like it belongs to that family.

### ideas deliberately rejected

| Rejected mechanic | Reason |
|---|---|
| Weekly interview archive | Too slow for Build Week; value appears over weeks, not by Saturday. |
| Printed storybook ordering | Operational risk and fulfillment are outside the week. |
| WhatsApp automation | Adds integration risk and is not needed for first revenue proof. |
| Fully automatic no-edit PDF | Family stories need correction of names, places, tone, and emotional detail. |
| Multi-person family archive | Too broad; one recording to one storybook is the v1. |

## 5. dependencies

### verified capability matrix

| Required capability | Product/API/model | Exact endpoint/access | Limits | Verified how |
|---|---|---|---|---|
| Audio transcription | OpenAI speech-to-text | Audio transcription API from official OpenAI documentation | Recorded audio uploads supported; exact file size/type limits must be rechecked before implementation | Official OpenAI docs checked Thu 3 Sep 2026 |
| Story generation | OpenAI text model | Responses/API call selected during implementation | Cost, latency, and model choice must be checked before build | Official OpenAI docs to verify at implementation time |
| Illustration generation | OpenAI image generation or fallback static cover | Image generation API only if account access works | Must not block delivery; access and cost unverified for this account | Treat as optional fallback until verified |
| PDF rendering | Browser/client or server PDF library | Implementation choice | Must render reliably on Vercel | Verify with live PDF download |
| Data persistence | Convex | Tables for users, runs, storybooks, payments | Fixed event stack | Event brief |
| Hosting | Vercel | Public deployment | Fixed event stack | Event brief |
| Payments | External/manual collection | Direct payment outside the product | Outside app; evidence is screenshot/manual confirmation matched to access key | Builder decision |

### unsupported assumptions

Capabilities that must not enter the critical path because they are unavailable, unverified, rate-limited or paid beyond what you will spend:

- Automatic WhatsApp ingestion.
- Long audio above 10 minutes.
- Print-ready physical book fulfillment.
- Fully automated transcript cleanup for mixed Indian languages.
- Guaranteed generated illustrations.
- In-app payment collection or automatic payment verification.

### secrets and access

Reference required credentials and where they live (Convex environment variables, Vercel environment variables). Never place secret values in this document or in the repo.

- OpenAI API key: Vercel and Convex environment variables if needed.
- Convex deployment credentials: local environment and Vercel integration.
- Analytics key: Vercel environment variable if required by selected analytics tool.

## 6. rubric strategy

Pick **one primary track**: Virality, Revenue or AI Agent as a Service. You are scored on that track's rubric (version 2.2.0, in full in the rubric source). Every row is scored L1 to L5 independently; points per row = (L - 1) x weight. Wins in the other two tracks count as bonus at 0.5x weight, capped at 50 points, with the same evidence requirement. Shipping is the floor: a product that is not live scores nothing. Record a separate current level, target and proof for every row. The same piece of evidence does not raise two rows.

### primary track

| Decision | Answer |
|---|---|
| Primary track | Revenue |
| Why this track fits the idea and my advantage | Two buyers have already said they are ready to pay Rs 400. The product creates a concrete paid artifact rather than chasing broad reach. |
| The one thing the track needs (a personal artifact people share / a named user who pays this week / a real task on a real surface unattended) | A named user who pays this week, submits audio, and receives a storybook PDF. |

### the track's rows

**Revenue (176 base + overflow)**

| Row | Weight | Max base | Current level | Target level | Target points (L-1)xweight | Observable proof | Work required | Milestone |
|---|---:|---:|---|---|---:|---|---|---|
| Signups | 20x | 80 | L1: 0 product signups; 2 committed buyers outside product | L2: 1 to 50 signups | 20 | Convex table count with buyer email + first-use event | Signup/upload flow writes to Convex | M1-M2 |
| Live product quality | 8x | 32 | L1: not built | L3: Working product, does what it claims | 16 | Stranger uploads audio, product auto-generates storybook draft, user edits and exports/downloads PDF at live URL | Build one complete automated flow with editor and PDF/export path | M1-M4 |
| Revenue generated (USD) | 4x | 16 | L1: $0 collected | L2: Up to $100 | 4 | External payment screenshots totaling Rs 800+ matched to private keys | Collect payment before sharing buyer URL; record key mapping | M0-M2 |
| Waitlist | 4x | 16 | L1: 0 | L2: 1 to 150 | 4 | Email/phone list in Convex or spreadsheet | Add "I want one" capture for unpaid interest | M3 |
| Pain point severity | 2x | 8 | L3 candidate: named users, 1-2 conversations if quotes captured | L4: Named user, 3+ conversations confirming pain, quotes in submission | 6 | 3 short buyer quotes/screenshots | Ask why they are paying and what moment triggered it | M2-M4 |
| SOM (bottoms-up math) | 2x | 8 | L1: not attempted | L3: Users x ACV correct, under Rs 10 cr | 4 | One written calculation in submission | Define beachhead and ACV using Rs 400 first-purchase price or realistic annual keepsake spend | M5 |
| Right to win | 2x | 8 | L2: personal interest and direct buyer access | L3: Some domain exposure | 4 | Founder note: direct buyer discovery and community access | Document why buyer-led scope changed the product | M5 |
| Why now | 1x | 4 | L2: general AI tailwind | L3: clear tailwind in last 2 years | 2 | Note: speech-to-text + AI layout make one-sitting storybooks feasible | Keep claim modest and tied to product | M5 |
| Moat and defensibility | 1x | 4 | L1: copyable in a weekend | L2: Thin, first-mover only | 1 | Honest self-score | Do not overclaim moat | M5 |
| **Revenue total** | | **176** | | | **61 target base points** | | | |

### bonus-eligible rows from the other tracks (0.5x, 50-point cap, same evidence)

| Source track | Row | Original weight | Bonus weight | Max bonus | Will I claim it? | Proof |
|---|---:|---:|---:|---:|---|---|
| Virality | Signups | 25x | 12.5x | 50 | Maybe, only if signups exceed 26 | Convex count; do not double-count as Revenue strategy |
| Virality | Visitors | 10x | 5x | 20 | Maybe, only if analytics installed | Read-only analytics access |
| Virality | Reactions + comments | 2x | 1x | 4 | No unless launch post performs | Platform screenshots |
| Revenue | Signups | 20x | 10x | 40 | Primary track, not bonus | Primary evidence |
| Revenue | Live product quality | 8x | 4x | 16 | Primary track, not bonus | Primary evidence |
| Revenue | Revenue generated | 4x | 2x | 8 | Primary track, not bonus | Primary evidence |
| AI Agent as a Service | Real output shipping | 20x | 10x | 40 | No | This is not positioned as an agent-as-a-service product |
| AI Agent as a Service | Observability | 7x | 3.5x | 14 | No | Basic logs only |

### level anchors (short form; the full ladders are in the rubric source)

- **Signups (Revenue)** (email + first-use event): L2 1-50 · L3 51+ · L4 251+ · L5 751+, then +20 per 100.
- **Live product quality:** L1 broken · L2 rough MVP, happy path only · L3 does what it claims · L4 polished, noticeably better than alternatives · L5 a user cannot tell it was built in a week.
- **Revenue generated** (product revenue only, not services): L2 up to $100 · L3 $100+ · L4 $500+ · L5 $2,000+, then +15 per $500.
- **Waitlist:** L2 1+ · L3 151+ · L4 751+ · L5 3,000+, then +4 per 500.
- **Pain point severity:** L2 vague persona · L3 named user, 1-2 conversations · L4 named user, 3+ conversations, quotes · L5 5+ conversations and a "can I pay for this now" moment.
- **SOM:** L2 math attempted but wrong · L3 users x ACV correct, under Rs 10 cr · L4 Rs 10 cr to Rs 1,000 cr · L5 over Rs 1,000 cr with a defensible beachhead. Use the GrowthX TAM/SAM/SOM calculator linked on the Scoring page.
- **Right to win:** L2 generic interest · L3 some domain exposure · L4 direct operator experience, clear insight · L5 deep founder-market fit visible in the build.
- **Why now:** L2 riding general trends · L3 clear tailwind in 2 years · L4 specific unlock in 12 months · L5 window opened under 6 months ago, visible in the product.
- **Moat and defensibility:** L2 thin, first-mover only · L3 workflow lock-in, integrations, taste · L4 data flywheel, network effects · L5 compounding moat.

### evidence caps and anti-spoof

L4 or L5 needs verifiable evidence or the row caps at L3. Virality visitors without read-only analytics access cap at L2. AI Agent as a Service output on a staged surface caps at L3. No evidence, no bonus. Virality anti-spoof: visitors above impressions / 10, or signups above visitors / 2, drop that row to L1 unless a direct source is proven.

### where the points are

The two rows of my track I will build for:

1. Signups: every paid or unpaid first-use event must write to Convex.
2. Live product quality: one buyer must be able to reach a useful storybook PDF from uploaded audio without the builder explaining the product.

### competence floor

Rows that must work adequately but will not get disproportionate build time:

- Revenue generated: collect Rs 400 payments outside the platform and screenshot proof matched to each private key.
- Pain severity: capture short buyer quotes.
- Waitlist: simple interest capture only.
- SOM/right to win/why now/moat: honest written claims, no overbuilding.

### rubric traps

Behaviours that look impressive without earning the level:

- Calling manual transcript cleanup the product; if the builder is the delivery mechanism, revenue risks looking like a service.
- Hiding manual story writing behind a "processing" screen; the live demo must show automated draft creation.
- Counting "yes, cute idea" as revenue.
- Counting test accounts as signups.
- Building illustration generation before upload -> draft -> edit -> PDF works.
- Spending time on weekly archives or print fulfillment.
- Claiming AI Agent as a Service points without real autonomous tasks on real surfaces.

## 7. gtm plan

### where the users already are

| Channel (group, feed, thread, office floor) | Who is there | How I reach them (post, DM, invite) | When (day) |
|---|---|---|---|
| Direct WhatsApp/DM list of seven leads | Parents/adult children already asked | Convert yeses to paid first users; ask each for one referral | Thu 3 Sep |
| Buyer family/referral circles | Similar buyers with parents/grandparents | Ask paid buyers to forward after seeing their draft | Fri 4 Sep |
| GrowthX channel | Builders and early adopters | Post honest build with first paid proof only if privacy-safe | Fri 4 Sep or Sat 5 Sep |
| Twitter | Broader audience | Optional post with anonymized cover/sample | Sat 5 Sep after submission |

### distribution posts, in my own words

- Monday, after the first three users: Event date has passed. Replace with Thu: "I am making a tiny paid Build Week product: send a 10-minute recording of a parent/grandparent answering warm questions, get back a short family storybook PDF. First version is Rs 400. I have 2 slots tonight."
- Tuesday, the launch post: Event date has passed. Replace with Fri: "I turned the first family interview recordings into editable storybooks. If you want one for your parent/grandparent, I have a few Rs 400 slots before Saturday."
- Wednesday to Friday, one update each evening (what changed, one number): Thu: paid commitments; Fri: completed storybooks and one quote.
- Saturday, the shipped post: "Shipped the first version: audio -> editable family storybook -> PDF. Built for families who want children to know their grandparents' stories before they disappear."

### targets, per band of my track's rows

Use the bands of your primary track (section 6). Keep only the rows your track scores, plus any bonus row you will claim.

| Row | Track | Floor I will hit (band) | Stretch (band) | How I will know (source) |
|---|---|---|---|---|
| Signups / first-use events | Revenue | L2: 1 to 50 | L3: 51 to 250 is unlikely | Convex table count, screenshot |
| Live product quality | Revenue | L2: rough MVP, happy path only | L3: working product, does what it claims | Buyer completes flow and downloads PDF |
| Revenue generated | Revenue | L2: up to $100 | L3: $100 to $500 if 20+ buyers at Rs 400 | External payment screenshots matched to private keys |
| Waitlist | Revenue | L2: 1 to 150 | L3: 151 to 750 unlikely | Convex/spreadsheet list |
| Pain point severity | Revenue | L3: named user, 1-2 conversations | L4: named user, 3+ conversations and quotes | Screenshots/notes from buyers |
| Visitors to product | Virality bonus | L1: under 50 | L2: 51 to 250 | PostHog / Plausible / GA4 / Datafast, read-only access shared |

### analytics setup (do this on Sunday, not Saturday)

- Analytics tool installed on the live URL: PostHog, Plausible, GA4, or Datafast; choose the fastest available.
- Read-only access created and the link saved: Required only if claiming visitor bonus; otherwise screenshot is still useful.
- Signup or first-use event writes to Convex: Required for Revenue signups.
- Payment link, if any: No payment link for v1; payment collected personally outside the app and matched to the buyer's access key.

### the numbers I will report on Saturday

One line per row, with the screenshot or link that proves it.

- Signups: Convex screenshot showing non-test buyer rows with first-use event.
- Live product quality: live URL demo where fresh audio automatically becomes an editable storybook draft plus completed PDF/export from buyer input.
- Revenue generated: external payment screenshots and matching private access keys.
- Waitlist: count of unpaid interested leads, if any.
- Pain point severity: 2-3 buyer quotes about why they paid or what story they wanted preserved.
- Visitors bonus if claimed: analytics screenshot/read-only link.

## 8. the milestone ladder

Every milestone has a purpose, what is required, an acceptance test, and an "if I am behind, cut to this" fallback. Dates are fixed by the event.

### M0 - feasibility and setup (Sat 29 Aug, before 2:00 PM)

**Purpose:** kill the unknown critical dependency and the riskiest assumption early.

Required:
- Setup page complete: GitHub, Vercel, Convex accounts; Codex or Claude Code logged in; skills installed.
- The riskiest assumption tested with no code: collect external payment from the two committed buyers and get one sample recording.
- One representative hard input reaches the transcription API or model; response shape and latency understood.
- Repository created, empty app deployed to Vercel, URL opens.

Acceptance test:

> The empty app is live at a public URL, the repo exists, at least one Rs 400 payment is collected outside the platform, and one sample audio file has been transcribed.

Stop condition:

> If payment plus audio cannot be collected by 4:00 PM Saturday, switch to `manual paid concierge with productized editor only` or pick a different idea.

### M1 - one ugly complete flow (Sat 29 Aug evening -> Sun 30 Aug)

**Purpose:** the smallest end-to-end version of the core action, working without you explaining it. Milestone 02 of the week.

**Rubric intent:** Revenue live product quality L2-L3; signups begin writing to Convex.

Required:
- one real audio input up to 10 minutes;
- transcription;
- automated storybook draft generation;
- browser editor for title, dedication, sections, and captions;
- PDF download;
- data survives closing and reopening (Convex);
- deployed to Vercel, pushed to GitHub, every session.

Explicitly excluded: polished UI; multiple book themes; print ordering; automatic WhatsApp; long audio; guaranteed illustrations; multi-chapter archive.

Acceptance test:

> Someone who has never seen the product uploads one recording, receives an automatically generated storybook draft, edits it, and downloads/exports a PDF at the live URL, on their phone, without you talking.

If I am behind, cut to: `one upload screen, automated transcript, one generated story page, one editable text area, one browser print/download PDF action; hardcode cover styling and skip illustrations.`

### M2 - first users (Mon 31 Aug, evening)

**Purpose:** milestone 03. Three people who have the problem use it while you watch.

Required:
- three named users or buyers, reached directly;
- external payment proof recorded for paid buyers;
- one private key assigned to each buyer or story entry;
- a signup or first-use event recorded in Convex for each product user;
- notes on where each one stopped;
- the single biggest blocker named.

Acceptance test:

> At least three rows in the Convex table that are not you, payment screenshots matched to private keys for paid users, and one sentence per user on where they stopped.

If I am behind, cut to: `one paid user on a call, screen shared, completing the flow end to end.`

### M3 - distribute (Tue 1 Sep, evening)

**Purpose:** milestone 04. Share it where those users already spend time. Direct invites. Track who signs up or replies.

Required:
- analytics live with read-only access if claiming visitor bonus;
- direct-referral message written in your own words;
- direct invites sent, count recorded;
- signups, private-key runs, payments, and visitors checked that night.

Acceptance test:

> The direct invites are sent, and the visitors, signups, private-key run, payment, and waitlist counts for the day are written down with screenshots.

If I am behind, cut to: `ten direct messages, no public post.`

### M4 - build, user calls, build again (Wed 2 -> Fri 4 Sep, evenings)

**Purpose:** milestone 05. Speak to users, fix the biggest blocker, ship the next version. Repeat.

Required each evening:
- one user conversation;
- one blocker fixed and deployed;
- one update posted or sent with one number;
- the rubric table in section 6 re-scored.

Rubric intent, by track. Revenue: signups climb a band, payment proof is collected, pain-point conversations are quoted, and live product quality moves from rough MVP toward working product.

Acceptance test:

> Three deploys across three evenings, each with a CHANGELOG line saying what a user can now do that they could not before.

If I am behind, cut to: `fix only the blocker that stops audio upload, story generation, editing, or PDF download; no new features.`

### M5 - verify and submit (Fri 4 Sep night -> Sat 5 Sep, 11:00 AM)

**Purpose:** milestone 06. No new features.

Required:
- core action works at the live URL, logged out, on a phone;
- data survives closing and reopening;
- repo is public and opens in a private window;
- numbers written down with screenshots: payments, signups, waitlist, visitors if claimed;
- self-scored on every Revenue row and any bonus row claimed;
- one honest paragraph: what I built, who it is for, why they care, link;
- submitted before 11:00 AM IST.

Acceptance test:

> Two consecutive runs of the demo script (section 9) on the live URL, one of them on someone else's device.

### M6 - demo (Sat 5 Sep, 3:00 PM)

Show what you shipped. Reproduce the numbers live. Do not pitch what it could become.

## 9. demo contract (Saturday 3:00 PM)

### one-sentence setup

This turns a 10-minute family interview recording into an editable keepsake storybook PDF so children can know a grandparent's life story.

### the proof

| Time | What happens | What the reviewer sees | Rubric row it supports |
|---:|---|---|---|
| 0-15s | who has this problem and what they do today | Families have voice notes and fading stories, not finished keepsakes | pain point severity |
| 15-60s | the core action, live, on a fresh input | upload recording -> automated transcript -> automated story draft -> edit -> PDF/export | live product quality |
| 60-90s | the numbers, reproduced live | Convex keyed runs, external payment screenshots, completed buyer PDFs | signups, revenue generated |
| 90-120s | what broke this week and what you changed | audio cleanup, names/places field, editable draft before PDF | live product quality, pain point severity |

### live input

A 3-5 minute fallback family interview recording cleared for demo use, with names/places helper text and one optional image.

### fallback input

A short sample recording made by the builder that follows 3 of the 12 prompts and contains no private information.

### the number I lead with

Number of paid buyers and completed storybook PDFs, not impressions.

### claims I can prove

- Buyers paid Rs 400 outside the platform.
- The live product accepts audio and automatically generates an editable storybook draft.
- The product exports or provides a reliable PDF path.
- Convex recorded real first-use events.

### claims I must not make

- This is a fully automated archive platform.
- Printed books are supported.
- It handles all Indian languages perfectly.
- Generated illustrations are guaranteed.
- Manual cleanup is the core paid product.
- The storybook was written manually after upload.

## 10. test plan

### golden cases

| Case | Why representative | Expected final output | Status |
|---|---|---|---|
| 1 | English 5-minute grandparent story with clear audio | 2-4 section storybook PDF with correct names | Specified |
| 2 | Mixed Hindi-English 8-10 minute voice note with place names | Editable draft where names/places can be corrected before PDF | Specified |
| 3 | Tamil or Telugu best-effort recording plus one photo | Draft storybook with a warning to review transcript carefully and photo included in PDF | Specified |

### failure cases

| Failure | Expected behaviour | User recovery | Tested? |
|---|---|---|---|
| Ambiguous input | Product asks user to edit transcript/story before PDF | User corrects text in editor | No |
| Unsupported input | Clear error with accepted file types and max length | User uploads mp3/m4a/wav/mp4/webm if supported | No |
| API timeout or failure | Run marked failed; user can retry without losing details | Retry transcription/generation | No |
| Empty result | Product does not create fake story; asks for clearer audio or notes | User records again or adds manual notes | No |

## 11. risk register

| Risk | Probability | Damage | Earliest test | Mitigation | Fallback |
|---|---|---|---|---|---|
| Buyers say yes but do not pay | Medium | No Revenue proof | Before build | Collect payment before sending a keyed URL | Switch to unpaid signup/waitlist, but Revenue score weakens |
| Buyers pay but do not send audio | Medium | No completed storybook | Before build | Ask for audio immediately after payment | Use one paid buyer plus demo-safe fallback input |
| Transcription fails on mixed language | High | Poor product quality | M0 sample transcription | Add names/places field and editable transcript | Manual cleanup as QA, not core delivery |
| PDF export breaks on Vercel/mobile | Medium | Cannot complete job | M1 live test | Use simple HTML-to-PDF or browser print fallback | Download HTML page as printable story |
| Illustration generation unavailable | Medium | Less magical output | M0 capability check | Treat as optional | Use uploaded photos and designed cover |
| Privacy concern blocks sharing/demo | Medium | Cannot show evidence | M2 | Ask consent and anonymize | Use demo-safe input and private payment proof |
| Manual work consumes all time | High | Not demo-ready | M1 | Product must generate editable draft before any cleanup | Reduce to one-page automated storybook PDF |

### pre-mortem

It is Saturday 11:00 AM and the product is not submitted, or is submitted with no users, because:

1. The first buyers paid or agreed but did not send usable audio in time.
2. The team tried to make illustrations, print layout, and language handling perfect before the core flow worked.
3. The product relied on manual cleanup so heavily that the live demo could not prove a product-generated artifact.

## 12. non-goals

Explicitly outside this week's build:

1. Printed physical storybooks.
2. Weekly question drip/archive.
3. WhatsApp automation or ingestion.
4. Long-form biography over multiple interviews.
5. Fully automated perfect transcript cleanup.
6. Guaranteed generated illustrations.
7. Family tree, timeline, map, or genealogy features.

Any change to these requires a written scope decision in section 15.

## 13. parking lot

| Idea | Potential value | Why not now | Revisit after |
|---|---|---|---|
| Printed storybook | Higher willingness to pay | Fulfillment risk | After 5 completed PDFs |
| Weekly archive | Recurring engagement | Too slow for Build Week | After first paid cohort |
| WhatsApp bot | Easier recording collection | Integration risk | After manual upload works |
| Multi-language polished translation | Better family readability | Quality risk | After validating demand |
| Generated illustrations per chapter | More gift-worthy | API/access/time risk | After PDF flow is stable |
| Family photo restoration | Higher perceived value | Separate product | After storybook payments |

## 14. current state

### active milestone

M5 verification. Private keyed buyer URL flow is live and verified. Next: collect external payment proof and real buyer audio.

### implemented

- Next.js app scaffold with upload/intake workbench.
- OpenAI-backed generation API route with demo fallback when `OPENAI_API_KEY` is missing.
- Convex schema and mutations for keyed runs and waitlist evidence.
- Convex storage upload path for audio before transcription.
- Local evidence fallback when `NEXT_PUBLIC_CONVEX_URL` is missing.
- Editable storybook preview with transcript review and PDF/export path.

### working locally

- `npm run build` passes.
- `npm run lint` passes.
- Demo-mode API upload returns a storybook draft.
- Real OpenAI API upload transcribes sample audio and generates a storybook draft.
- Browser flow passes: fill intake, attach audio, generate draft, edit preview, export enabled.
- Local browser flow passes through Convex storage upload before transcription.
- Chromium PDF export creates a PDF from the storybook view.

### live

- Production URL: https://agara-puce.vercel.app
- Public GitHub repo: https://github.com/sreechand/agara
- Live Vercel test generated a storybook from sample audio with `gpt-5-mini`.

### verified

- Desktop and mobile screenshots have no horizontal overflow.
- Generated storybook editor renders with export enabled.
- Previous live URL generated a storybook from sample audio in 16s and enabled export.
- Local private-key flow hides backend/payment controls and generated a storybook from sample audio.
- Live private-key flow at `/?key=buyer-kk-001` hides backend/payment controls, generated a storybook from sample audio, and enabled export.
- Live 6.4 MB audio upload at `/?key=buyer-6mb-live` generated a storybook through Convex storage and did not hit the JSON parse/request-size error.
- Local Hindi audio generated a Devanagari storybook, and desktop/mobile visual QA passed for the two-page aged-paper spread with stamp illustration and Polaroid photo treatment.

### current blocker

Need first external payment proof and first usable buyer audio sample. OpenAI, Convex, and the private-key live URL are working.

### next single action

Collect Rs 400 from one committed buyer outside the app, send a unique link such as `https://agara-puce.vercel.app/?key=buyer-kk-001`, and ask them to upload a 3-10 minute recording using the 12 prompts.

## 15. decision log

| Time | Decision | Evidence/reason | Scope impact |
|---|---|---|---|
| Thu 3 Sep 2026 | Chose Revenue as primary track | Builder changed from Virality to Revenue | Optimize for paid buyers, signups, product quality |
| Thu 3 Sep 2026 | Rejected water/non-profit as initial Revenue market | Builder believes sector is unlikely to pay this week | Search shifted to paid gifting product |
| Thu 3 Sep 2026 | Locked family storybook from grandparent interview | 2 of 7 messaged leads said yes and are ready to pay Rs 400 | Build one paid audio-to-storybook flow |
| Thu 3 Sep 2026 | Payment happens outside the app before upload | Builder decision | App records the private key and run; no payment UI or payment integration |
| Thu 3 Sep 2026 | Audio upload is required; typed answers are not the core | Grandparents may not type comfortably | Build transcription and edit flow |
| Thu 3 Sep 2026 | Illustrations are optional fallback | API/access/time risk | PDF must still be valuable without generated images |
| Fri 4 Sep 2026 | Hide backend/payment controls and use private keyed buyer URLs | Builder decision to collect payment outside the platform | No login, no in-app payment fields; each run saves an access key for evidence |
