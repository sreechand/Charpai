import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { trackedWorkerRequest } from "./generationWorkerRequest";
export const step = internalAction({
  args: { draftId: v.id("generationDrafts"), attemptId: v.string(), operation: v.union(v.literal("prepare"), v.literal("transcribe"), v.literal("extract"), v.literal("write"), v.literal("image"), v.literal("finalize")), partIndex: v.optional(v.number()) },
  returns: v.object({ ok: v.boolean(), parts: v.optional(v.number()), sections: v.optional(v.number()) }),
  handler: async (ctx, args): Promise<{ ok: boolean; parts?: number; sections?: number }> => trackedWorkerRequest(ctx, args, data => {
    if (!data || typeof data !== "object" || !("ok" in data) || data.ok !== true) throw new Error("Generation step did not complete.");
    const result = data as { ok: true; parts?: unknown; sections?: unknown };
    for (const [key, n] of [["parts", result.parts], ["sections", result.sections]] as const) if (n !== undefined && (typeof n !== "number" || !Number.isInteger(n) || n < 1 || n > 100)) throw new Error(`Invalid ${key} count.`);
    if (args.operation === "prepare" && result.parts === undefined) throw new Error("Audio preparation returned no parts.");
    if (args.operation === "write" && result.sections === undefined) throw new Error("Story writing returned no sections.");
    return { ok: true, ...(typeof result.parts === "number" ? { parts: result.parts } : {}), ...(typeof result.sections === "number" ? { sections: result.sections } : {}) };
  })
});
