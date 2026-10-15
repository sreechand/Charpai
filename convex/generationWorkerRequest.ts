import { internal } from "./_generated/api";
import { env, type ActionCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

type Step = { draftId: Id<"generationDrafts">; attemptId: string; operation: string; partIndex?: number };
type ErrorCode = "configuration" | "worker_http" | "network" | "deadline_exceeded" | "invalid_response";

// All records originate in the backend: the browser cannot report a successful
// paid step. Never save a worker response/error body here; it can contain family data.
export async function trackedWorkerRequest<T>(ctx: ActionCtx, args: Step, parse: (data: unknown) => T): Promise<T> {
  const stepId: Id<"generationStepRuns"> = await ctx.runMutation(internal.generationTelemetry.begin, args);
  let errorCode: ErrorCode = "configuration", httpStatus: number | undefined, appRelease: string | undefined;
  try {
    if (!env.GENERATION_WORKER_URL || !env.GENERATION_BACKEND_URL || !env.PAYMENT_BACKEND_TOKEN) throw new Error("Generation worker is not configured.");
    errorCode = "network";
    const res = await fetch(env.GENERATION_WORKER_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.PAYMENT_BACKEND_TOKEN}` }, body: JSON.stringify({ ...args, convexUrl: env.GENERATION_BACKEND_URL }), signal: AbortSignal.timeout(280000) });
    httpStatus = res.status;
    appRelease = res.headers.get("X-Charpai-Release") ?? undefined;
    errorCode = "worker_http";
    if (!res.ok) throw new Error(`Generation ${args.operation} paused (${res.status}).`);
    errorCode = "invalid_response";
    const result = parse(await res.json());
    const saved: boolean = await ctx.runMutation(internal.generationTelemetry.finish, { stepId, status: "succeeded", httpStatus, ...(appRelease ? { appRelease } : {}) });
    if (!saved) throw new Error("This generation step has already stopped. Resume the saved draft.");
    return result;
  } catch (error) {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) errorCode = "deadline_exceeded";
    await ctx.runMutation(internal.generationTelemetry.finish, { stepId, status: errorCode === "deadline_exceeded" ? "timed_out" : "failed", errorCode, ...(httpStatus === undefined ? {} : { httpStatus }), ...(appRelease ? { appRelease } : {}) });
    throw error;
  }
}
