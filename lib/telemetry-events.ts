export const productEventNames = [
  "recording_started", "recording_saved", "recording_failed", "recording_interrupted",
  "upload_started", "upload_succeeded", "upload_failed", "generation_started",
  "preview_ready", "generation_failed", "preview_accepted", "preview_rejected",
  "publish_succeeded", "publish_failed", "export_requested", "browser_error"
] as const;
export type ProductEventName = typeof productEventNames[number];
export type ProductEventDetails = { generationId?: string; elapsedMs?: number; bytes?: number; contentType?: string; error?: string };

export function redactDiagnosticText(text: string) {
  return text.replace(/sk-[a-zA-Z0-9_-]+/g, "[redacted]")
    .replace(/Bearer\s+[a-zA-Z0-9._~-]+/gi, "Bearer [redacted]")
    .replace(/https?:\/\/[^\s"<>]+\?[^\s"<>]+/g, "[URL query redacted]");
}
