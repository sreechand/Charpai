# Charpai

Planning draft · 10 October 2026

This describes the first complete Charpai experience. Product motivations and customer behavior below are working guesses, not findings from customer interviews. Existing checks come from project notes; they were not repeated while writing this document. Development features are not all released to production.

## 1. The job

When I hear a parent or grandparent tell a family story and realise I might lose it, I want to capture it and turn it into something my family can read, so I can pass that memory on.

Other moments it happens: a family visit, a birthday or anniversary, finding an old photograph, or hearing a story I have never heard before.

Who, by situation: someone who can spend time with a family storyteller and wants to preserve their memories, but has been putting it off because recording and writing a book feels like a big project.

Today they hire: phone recordings, WhatsApp voice messages, scattered notes and photos, their own writing, or nothing.

**The person we build for first:** the family member recording the conversation and making the keepsake.

Other people in the product:

- Storyteller: when someone asks about my life, I want to tell it in my own words, so my family understands what mattered to me.
- Reader: when someone shares a family memory, I want to open and read it easily, so I can feel connected to the person behind it.

What needs doing: record or upload one conversation, make an editable book, correct it, save it, and share or download it.

How they want to feel: relieved that they finally saved the story; close to the storyteller.

How they want to look to others: thoughtful and caring, without needing to be a writer or designer.

The one we serve first: the person making the book. Charpai starts as a family purchase, not a business purchase.

## 2. The switch

What they'd fire: leaving stories in a recording folder, trying to write and lay out a book themselves, or postponing the whole thing.

The forces that matter:

- **Push:** “I keep saying I'll do this later, but these stories could disappear.”
- **Pull:** “I want something our family can keep and return to.”
- **Anxiety:** “Will it get their words and memories wrong?”
- **Habit:** “I record things on my phone, then never do anything with them.”

What the product does about each:

- Push → makes one conversation enough to start one book.
- Pull → creates a readable keepsake with a saved link and PDF.
- Anxiety → lets the maker review and correct the draft before sharing; generated text and artwork must stay grounded in the recording.
- Habit → accepts an existing audio recording as well as recording in the app.

The one worry onboarding must remove: “Will this still sound like them, and can I fix anything it gets wrong?”

## 3. The core flow

Today:

1. I hear a family story I want to keep.
2. I record it on my phone.
3. I leave it among other files or send it in a family chat.
4. If I want a book, I listen again and write the story.
5. I find photos or decide how to illustrate it.
6. I format the pages.
7. I send or print it myself.

Where it often ends today: an audio file nobody revisits. This is a customer-behavior guess to check.

With Charpai:

1. I hear a family story I want to keep.
2. I open Charpai, sign in, and pay for one storybook.
3. I record the conversation or upload an existing recording, with the storyteller's agreement.
4. Charpai turns the recording into an illustrated storybook draft.
5. I read it and correct names, details, and wording.
6. I save it and share the link or download the PDF.
7. I reopen the book later, and the saved story is still there.

Things it takes to get the job done today: 7 broad steps · With Charpai: 7 broad steps, with writing and page layout handled by the product. These counts describe this draft flow; they are not measured effort. The intended gain is less work, not a claim of fewer clicks.

What must not happen:

- Step 2: a returning user must not pay again to access a book they already bought, or lose an unused payment after signing out.
- Step 3: a recording must not disappear without a clear recovery path.
- Step 4: the book must not invent family events or present guessed details as facts.
- Step 5: the maker must not have to share an unreviewed draft.
- Steps 6–7: saved corrections must not disappear; readers must not need an account to open the shared story.

Other flows: return to an unfinished paid book; reopen an existing book; retry failed generation using the same paid attempt; open a shared story from a link or QR code. Buying another book starts another purchase.

## 4. Onboarding

First value: “Here is our story, in a book I can read and correct.” The first generated draft delivers this; payment success alone does not.

The smallest commitment we ask for: an account, one payment, and one recording. Payment before creation is the existing product decision. The development checkout price is ₹500 per book; live checkout configuration remains unfinished in the latest notes.

The worry it removes: “Will this still sound like them, and can I fix anything it gets wrong?”

From opening the link to first value:

1. I open the landing page from a shared link and see an example keepsake and a clear explanation that I can edit the draft. Removes: “What will I actually get?”
2. I sign in and see that one payment buys one book with ongoing access. Removes: “Will I have to pay again to read it?”
3. I pay; Charpai confirms payment before opening creation. Removes: “Did my payment count?”
4. I choose Record here or Upload audio. A brief prompt should explain getting the storyteller's agreement. Removes: “Do I need to prepare a written story?”
5. I provide one recording and see clear progress while Charpai prepares the draft. Removes: “Is it working?”
6. I see the editable storybook. First value: the conversation has become something my family can keep.

Login: before payment, because purchases, unfinished work, and saved books belong to the account and must survive signing out.

What we don't ask on day one: a full profile, a family tree, a long tour, mandatory photos, or microphone permission when uploading an existing recording.

What we ask later, and when: confirm the storyteller's name, relationship, place, and language after a draft exists; correct uncertain details during review. Ask for another payment only when starting another book.

The example, editing reassurance, consent prompt, and progress wording above are requirements to review against the app, not claims that every onboarding detail is already implemented.

## 5. v1

Does:

- One family member can sign in and buy one storybook.
- Record in the app or upload existing audio.
- Turn one recording into an editable, illustrated storybook.
- Correct the story and save it.
- Resume unfinished paid work and retry failed generation without another payment for that attempt.
- Reopen saved books after signing out and back in.
- Share a readable story link without requiring the reader to sign in.
- Download a readable PDF; QR codes connect its stories to their shared pages.

Doesn't — parked for later:

- Live follow-up questions based on what the storyteller is saying.
- Audio playback alongside the saved/shared storybook.
- Combining multiple interviews into one book.
- Physical printing and delivery.
- Family trees, collaborative editing, or a social feed.

Live interview guidance remains the highest-priority next feature in the existing action list; this draft puts it after the complete recording-to-keepsake flow, not inside the first release requirements.

Nice to have, only after the must haves work: optional family photos and more choices for the book's appearance.

How I'll know it worked: a maker completes and shares a book, then returns to read it or makes another one; family readers reopen the shared story. These are proposed success signals, not measured results.

## 6. The riskiest guess

If this is false, the product is pointless: people who want to preserve family memories will actually arrange or upload a conversation and value the resulting book enough to pay for it. Wanting to preserve memories alone is not enough.

Thirty-minute check, no code:

1. Find someone who recently wanted to save a parent or grandparent's story.
2. Ask about the last time it happened and what they actually did.
3. Show a sample book and explain the one-book price.
4. Ask them to choose a real existing recording or arrange a conversation with a specific person at a specific time.
5. Record whether they take that next step, what stops them, and whether they would pay before seeing their own draft.

What happened: no customer check is documented in the notes reviewed. The fictional-audio development test proves the creation flow can work; it does not prove demand, willingness to pay, or accuracy on real family interviews.

## 7. Milestones

1. I can turn one recording into a readable draft that preserves the storyteller's meaning. Real generation with fictional test audio is documented; fidelity on real family interviews still needs checking.
2. I can pay once and reach creation. ₹500 test checkout is documented; live payment setup remains unfinished.
3. I can record or upload and recover unfinished work. Local recording, upload, and recovery checks are documented.
4. I can correct and save my book. Development save and reopen checks are documented.
5. I can download a readable book and share a story without asking readers to sign in. Local PDF review, QR decoding, and shared-page access are documented; scanning a released PDF on a phone still needs checking.
6. I can complete the full journey on the live site. Production checkout and the latest book-design release still need verification.
7. I can close it, reopen it, and my data is still there. Verified for a saved development book after sign-out, sign-in, and a full reload; repeat this as the final live release check.
