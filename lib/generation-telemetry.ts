import OpenAI from "openai";
import { redactDiagnosticText } from "@/lib/telemetry-events";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export const PROMPT_VERSION = "2026-10-06.1";

export function diagnosticValue(value: unknown): unknown {
  if (value instanceof File) return { fileName: value.name, contentType: value.type, bytes: value.size };
  if (value instanceof Error) {
    const error = value as Error & { status?: number; code?: string; request_id?: string };
    return { name: error.name, message: diagnosticValue(error.message), status: error.status, code: error.code, requestId: error.request_id };
  }
  if (Array.isArray(value)) return value.map(diagnosticValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).filter(([key]) => !/^(authorization|apiKey|api_key|password|token|access_token|refresh_token|b64_json|url|illustrationUrl)$/i.test(key)).map(([key, item]) => [key, diagnosticValue(item)]));
  }
  if (typeof value === "string") return redactDiagnosticText(value);
  return value;
}

export class GenerationTelemetry {
  readonly warnings: string[] = [];
  constructor(private client: ConvexHttpClient, readonly requestId: Id<"generationRequests">) {}

  async record(name: string, artifact: unknown, metadata: {
    status?: "succeeded" | "failed"; model?: string; providerRequestId?: string; elapsedMs?: number;
  } = {}) {
    try {
      await this.client.action(api.telemetry.record, {
        requestId: this.requestId, name, status: metadata.status || "succeeded",
        elapsedMs: metadata.elapsedMs || 0,
        ...(metadata.model ? { model: metadata.model } : {}),
        ...(metadata.providerRequestId ? { providerRequestId: metadata.providerRequestId } : {}),
        artifactJson: JSON.stringify(diagnosticValue(artifact))
      });
    } catch {
      this.warnings.push(`Diagnostic event ${name} could not be saved.`);
      console.error(JSON.stringify({ event: "telemetry_write_failed", requestId: this.requestId, name }));
    }
  }

  async trace<T>(name: string, input: unknown, operation: () => Promise<T>): Promise<T> {
    await this.record(`${name}.started`, { input, startedAt: Date.now() });
    const startedAt = Date.now();
    try {
      const output = await operation();
      const details = output as { model?: string; _request_id?: string };
      const model = (input as { model?: string }).model;
      await this.record(name, { input, output }, {
        elapsedMs: Date.now() - startedAt, model: details.model || model,
        providerRequestId: details._request_id
      });
      return output;
    } catch (error) {
      await this.record(name, { input, error }, {
        status: "failed", elapsedMs: Date.now() - startedAt,
        model: (input as { model?: string }).model
      });
      throw error;
    }
  }

  async finish(httpStatus: number, body: unknown, elapsedMs: number) {
    await this.record("response", body, { status: httpStatus >= 400 ? "failed" : "succeeded", elapsedMs });
    const result = body as { error?: string; warning?: string };
    try {
      await this.client.mutation(api.telemetry.finish, {
        requestId: this.requestId, status: httpStatus >= 400 ? "failed" : "succeeded", elapsedMs, httpStatus,
        ...(result.error ? { error: String(diagnosticValue(result.error)).slice(0, 2000) } : {}),
        ...(result.warning || this.warnings.length ? { warning: [result.warning, ...this.warnings].filter(Boolean).join(" ").slice(0, 2000) } : {})
      });
    } catch {
      this.warnings.push("Generation completion diagnostics could not be saved.");
      console.error(JSON.stringify({ event: "telemetry_finish_failed", requestId: this.requestId }));
    }
  }
}

// Wrap only the three methods this application uses; preserve the SDK's original response.
export function instrumentOpenAI(openai: OpenAI, telemetry: GenerationTelemetry) {
  for (const [name, resource] of [
    ["text", openai.responses], ["transcription", openai.audio.transcriptions], ["illustration", openai.images]
  ] as const) {
    const methodName = name === "illustration" ? "generate" : "create";
    const target = resource as unknown as Record<string, (input: unknown) => Promise<unknown>>;
    const original = target[methodName].bind(resource);
    target[methodName] = (input: unknown) => telemetry.trace(name, input, () => original(input));
  }
  return openai;
}
