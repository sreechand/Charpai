import type OpenAI from "openai";
import { normalizeDraft, type IntakePayload, type StorybookDraft } from "./storybook";
import { sourceLinks, validateCoverage, validateQuestions, type SourcePassage, type SourceReview } from "./storybook-source";

async function ask(client: OpenAI, instruction: string, input: unknown) {
  const result = await client.responses.create({model: process.env.OPENAI_TEXT_MODEL || "gpt-5-mini", instructions: instruction, input: JSON.stringify(input)});
  if (!result.output_text || (result.status && result.status !== "completed")) throw new Error("The story response is incomplete. Completed work remains saved.");
  const text = result.output_text.trim().replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  return JSON.parse(text) as unknown;
}

export async function findClarifications(client: OpenAI, passages: SourcePassage[], intake: IntakePayload, batch: number) {
  const value = await ask(client, `Read this family interview. Return only JSON {"questions":[{"question":"one concrete question","sourceIds":["passage id"]}]}.
Ask only about ambiguity that changes the narrator's story: uncertain names, relationships from the narrator's point of view, places, dates, contradictory accounts, or unclear transcription. Do not ask about facts already established in these passages or supplied intake. A question must quote or refer to its actual source passage. Keep the narrator's language. Do not infer that an interviewer label establishes a relationship. Questions must be specific and answerable after listening. Return an empty array when no clarification is needed. Never invent details or ask generic interview prompts.`, {intake, passages});
  return validateQuestions(value, passages, batch);
}

export async function composeSourceBatch(client: OpenAI, passages: SourcePassage[], intake: IntakePayload, review: SourceReview, batch: number, last: boolean): Promise<StorybookDraft> {
  const result = await ask(client, `Create a complete first-person family story from these source passages and confirmed clarifications. Return only JSON:
{"title":"book title","subtitle":"","dedication":"","languageNote":"","closingNote":"","sections":[{"heading":"distinct memory","paragraphs":[{"text":"full readable narration","sourceIds":["supporting passage id"]}],"artifactSubject":"one supported object or empty","artifactBrief":"one isolated object's shape/material or empty"}],"coverage":[{"sourceId":"passage id","status":"included|partial|unresolved|outside","reason":"","remaining":""}]}.
Preserve ALL narrations and details; there is no editorial word, chapter or book-length limit. Do not shorten for layout. Distinct memories determine section count. Keep the original language, script, mixed-language expressions, uncertainty, and narrator-relative relationships. Separate interviewer contributions from narrator speech; preserve them as sources even when they stay outside readable narration.
Each paragraph must identify its supporting source IDs. Do not fabricate dialogue, dates, motives, feelings, sensory detail, relationships, handwriting, or conclusions. Confirmed answers may correct or clarify these passages, but must not be presented as words spoken in the recording. Unanswered or unresolved questions remain uncertain; include faithful uncertainty where readable, otherwise name the exact excluded text/detail and why in coverage.
Account for EVERY supplied passage exactly once in coverage. Included means all its relevant narration/details were retained; partial/unresolved/outside require the exact remaining detail and an explanation. Do not mark a passage included just because one detail was used. Do not duplicate narrative merely to pad it. Only the final batch may include closingNote, and only if reflection was explicitly spoken there. Pick artwork only from explicitly supported physical objects; empty artwork is acceptable.`, {intake, passages, corrections: review.corrections, clarifications: review.questions.filter(q => q.sourceIds.some(id => passages.some(p => p.id === id))), lastBatch: last});
  const raw = result as {sections?: unknown[]; coverage?: unknown; title?: string; closingNote?: string};
  if (!raw || !Array.isArray(raw.sections)) throw new Error("The generated story is incomplete.");
  const coverage = validateCoverage(raw.coverage, passages);
  const used = new Set<string>();
  const sections = raw.sections.map((value, index) => {
    const section = value as {heading: string; paragraphs: {text: string; sourceIds: string[]}[]; artifactSubject?: string; artifactBrief?: string};
    if (!Array.isArray(section.paragraphs) || !section.paragraphs.length) throw new Error("A story memory has no source-linked paragraphs.");
    const links = section.paragraphs.flatMap((p, paragraph) => {
      if (typeof p.text !== "string" || !p.text.trim() || !Array.isArray(p.sourceIds) || !p.sourceIds.length) throw new Error("A story paragraph has no source.");
      p.sourceIds.forEach(id => used.add(id));
      return sourceLinks(p.sourceIds, passages, paragraph);
    });
    return {id: `memory-${batch}-${index}`, heading: section.heading, body: section.paragraphs.map(p => p.text).join("\n\n"), artifactSubject: section.artifactSubject || "", artifactBrief: section.artifactBrief || "", sourceLinks: links};
  });
  if (coverage.some(e => ["included", "partial"].includes(e.status) && !used.has(e.sourceId))) throw new Error("A covered source passage is missing from the readable story.");
  // A batch of only interviewer material is still accounted for without inventing prose.
  if (!sections.length) {
    if (coverage.some(e => e.status === "included" || e.status === "partial")) throw new Error("The source report claims a story that was not written.");
    return { ...normalizeDraft({title: raw.title || "Family memories", sections: [{id: "empty", heading: "Source review", body: "Source review"}]}), sections: [], coverage, sourceRevision: review.revision };
  }
  return normalizeDraft({...raw, sections, closingNote: last ? raw.closingNote || "" : "", coverage, sourceRevision: review.revision}, intake);
}
