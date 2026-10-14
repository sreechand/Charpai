/** Private source material stays separate from approved story prose. */
export type SourcePassage = { id: string; text: string; speaker: string | null; start: number | null; end: number | null; narrator: boolean | null };
export type SourceDocument = { version: 1; passages: SourcePassage[]; transcript: string };
export type SourceLink = { start: number; end: number; paragraph: number };
export type Clarification = { id: string; question: string; sourceIds: string[]; answer: string; status: "pending" | "answered" | "unresolved" };
export type SourceReview = { revision: number; corrections: string; questions: Clarification[] };
export type CoverageEntry = { sourceId: string; status: "included" | "partial" | "unresolved" | "outside"; reason: string; remaining: string };

export function formatSourceTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return s >= 3600 ? `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function splitSourceBatches(passages: SourcePassage[], size = 8000): SourcePassage[][] {
  const batches: SourcePassage[][] = []; let batch: SourcePassage[] = [], length = 0;
  for (const passage of passages) {
    // Passage continuations retain their original range; no invented word timing.
    let offset = 0, part = 0;
    while (offset < passage.text.length) {
      let end = Math.min(offset + size, passage.text.length);
      if (end < passage.text.length) {
        const boundary = passage.text.lastIndexOf(" ", end);
        if (boundary > offset + size / 2) end = boundary + 1;
      }
      const text = passage.text.slice(offset, end);
      const item = { ...passage, id: passage.text.length > size ? `${passage.id}.${part++}` : passage.id, text };
      if (batch.length && length + text.length > size) { batches.push(batch); batch = []; length = 0; }
      batch.push(item); length += text.length; offset = end;
    }
  }
  if (batch.length) batches.push(batch);
  return batches;
}

export function validateQuestions(value: unknown, passages: SourcePassage[], batchIndex: number): Clarification[] {
  const source = value as { questions?: unknown };
  if (!source || !Array.isArray(source.questions)) throw new Error("The clarification response is incomplete.");
  const ids = new Set(passages.map(p => p.id));
  return source.questions.map((raw, i) => {
    const q = raw as {question?: unknown; sourceIds?: unknown};
    if (typeof q.question !== "string" || !q.question.trim() || !Array.isArray(q.sourceIds) || !q.sourceIds.length || q.sourceIds.some(id => typeof id !== "string" || !ids.has(id))) throw new Error("A clarification has no valid source passage.");
    return { id: `q-${batchIndex}-${i}`, question: q.question.trim(), sourceIds: q.sourceIds as string[], answer: "", status: "pending" as const };
  });
}

export function validateCoverage(value: unknown, passages: SourcePassage[]): CoverageEntry[] {
  if (!Array.isArray(value)) throw new Error("The story has no coverage report.");
  const entries = value as CoverageEntry[];
  const ids = new Set(passages.map(p => p.id));
  if (entries.length !== ids.size || new Set(entries.map(e => e.sourceId)).size !== ids.size) throw new Error("The coverage report does not account for every source passage.");
  for (const entry of entries) {
    if (!ids.has(entry.sourceId) || !["included", "partial", "unresolved", "outside"].includes(entry.status) || typeof entry.reason !== "string" || typeof entry.remaining !== "string" || (entry.status !== "included" && (!entry.reason.trim() || !entry.remaining.trim()))) throw new Error("The coverage report contains an unexplained omission.");
  }
  return entries;
}

export function sourceLinks(ids: string[], passages: SourcePassage[], paragraph: number): SourceLink[] {
  return ids.map(id => {
    const p = passages.find(p => p.id === id);
    if (!p) throw new Error("The story references an unknown source passage.");
    return p.start !== null && p.end !== null ? {start: p.start, end: p.end, paragraph} : null;
  }).filter((p): p is SourceLink => p !== null);
}

export function applyReviewAnswer(review: SourceReview, questionId: string, answer: string, unresolved: boolean): SourceReview {
  if (!review.questions.some(q => q.id === questionId)) throw new Error("This question is no longer available.");
  if (!unresolved && !answer.trim()) throw new Error("Enter an answer or leave this question unresolved.");
  return { ...review, revision: review.revision + 1, questions: review.questions.map(q => q.id === questionId ? {...q, answer: unresolved ? "" : answer.trim(), status: unresolved ? "unresolved" : "answered"} : q) };
}
