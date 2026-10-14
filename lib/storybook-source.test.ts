import {expect, test} from "vitest";
import {applyReviewAnswer, splitSourceBatches, validateCoverage, sourceLinks, type SourcePassage} from "./storybook-source";
const passage: SourcePassage = {id: "p0", text: "మా ఇంటి జ్ఞాపకం ".repeat(1200), speaker: "part0:A", narrator: true, start: 301.25, end: 345};
test("source batching preserves every character and original recording timing", () => {
  const batches = splitSourceBatches([passage]);
  expect(batches.length).toBeGreaterThan(1);
  expect(batches.flat().map(p => p.text).join("")).toBe(passage.text);
  expect(batches.flat().every(p => p.start === 301.25)).toBe(true);
});
test("coverage rejects missing passages and unexplained partial omissions", () => {
  expect(() => validateCoverage([], [passage])).toThrow(/every source/);
  expect(() => validateCoverage([{sourceId: "p0",status: "partial",reason: "",remaining: ""}], [passage])).toThrow(/unexplained/);
  expect(sourceLinks(["p0"], [passage], 0)).toEqual([{start: 301.25, end: 345, paragraph: 0}]);
});
test("answers create a revision without mutating original questions", () => {
  const review = {revision: 0, corrections: "", questions: [{id: "q0",question: "Who?", sourceIds: ["p0"], answer: "", status: "pending" as const}]};
  expect(applyReviewAnswer(review, "q0", "My grandfather", false)).toMatchObject({revision: 1,questions: [{answer: "My grandfather",status: "answered"}]});
  expect(review.questions[0].answer).toBe("");
});
