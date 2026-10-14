import { WorkflowManager } from "@convex-dev/workflow";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";

export const workflow = new WorkflowManager(components.workflow, { workpoolOptions: { maxParallelism: 2, retryActionsByDefault: false } });
export const run = workflow.define({
  args: { draftId: v.id("generationDrafts"), attemptId: v.string() }, returns: v.null(),
  handler: async (step, args): Promise<null> => {
    try {
      const prepared: { ok: boolean; parts?: number; sections?: number } = await step.runAction(internal.generationWorker.step, { ...args, operation: "prepare" }, { retry: false });
      for (let first = 0; first < (prepared.parts ?? 0); first += 2) {
        const results = await Promise.allSettled(Array.from({ length: Math.min(2, (prepared.parts ?? 0) - first) }, (_, offset) => step.runAction(internal.generationWorker.step, { ...args, operation: "transcribe", partIndex: first + offset }, { retry: false })));
        const failed = results.find(result => result.status === "rejected");
        if (failed?.status === "rejected") throw failed.reason;
      }
      await step.runAction(internal.generationWorker.step, { ...args, operation: "extract" }, { retry: false });
      const written: { ok: boolean; parts?: number; sections?: number } = await step.runAction(internal.generationWorker.step, { ...args, operation: "write" }, { retry: false });
      for (let first = 0; first < (written.sections ?? 0); first += 2) {
        const results = await Promise.allSettled(Array.from({ length: Math.min(2, (written.sections ?? 0) - first) }, (_, offset) => step.runAction(internal.generationWorker.step, { ...args, operation: "image", partIndex: first + offset }, { retry: false })));
        const failed = results.find(result => result.status === "rejected");
        if (failed?.status === "rejected") throw failed.reason;
      }
      await step.runAction(internal.generationWorker.step, { ...args, operation: "finalize" }, { retry: false });
    } catch (e) {
      await step.runMutation(internal.generation.fail, { ...args, error: e instanceof Error ? e.message : "Generation paused" }, { unstableArgs: true });
    }
    return null;
  }
});
