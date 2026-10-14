import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { randomUUID, createHash } from "node:crypto";
import { api } from "@/convex/_generated/api";
import { GenerationTelemetry, PROMPT_VERSION } from "@/lib/generation-telemetry";
import { generate, readRequest, readBearerToken } from "@/lib/storybook-generation-engine";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const startedAt = Date.now();
  const authToken = readBearerToken(request.headers.get("authorization"));
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl || !authToken) {
    return NextResponse.json({ error: "Sign in before generating a storybook." }, { status: 401 });
  }
  const client = new ConvexHttpClient(convexUrl);
  client.setAuth(authToken);
  const backendToken = process.env.PAYMENT_BACKEND_TOKEN;
  if (!backendToken) return NextResponse.json({ error: "Storybook checkout is not configured." }, { status: 503 });
  const generationId = request.headers.get("x-generation-id");
  if (!generationId) return NextResponse.json({ error: "A storybook identifier is required." }, { status: 400 });
  let parsed: Awaited<ReturnType<typeof readRequest>>;
  try { parsed = await readRequest(request, authToken); }
  catch { return NextResponse.json({ error: "The recording could not be read. Check your sign-in and upload." }, { status: 400 }); }
  const payloadHash = createHash("sha256").update(parsed.stage === "compose"
    ? JSON.stringify({ input: parsed.input, transcript: parsed.transcript })
    : parsed.audio ? Buffer.from(await parsed.audio.arrayBuffer()) : "missing-audio").digest("hex");
  const token = randomUUID();
  try {
    const grant = await client.mutation(api.payments.beginGeneration, { backendToken, generationId, stage: parsed.stage, payloadHash, token, inputJson: JSON.stringify(parsed.input) });
    if (grant.response) return NextResponse.json(JSON.parse(grant.response));
  } catch (error) {
    const data = error && typeof error === "object" && "data" in error ? error.data as { status?: number; message?: string } : null;
    return NextResponse.json({ error: data?.message || "This storybook cannot start. Check your payment and try again." }, { status: data?.status || 403 });
  }
  let response: NextResponse;
  try {
    const requestId = await client.mutation(api.telemetry.start, { generationId, stage: parsed.stage, promptVersion: PROMPT_VERSION });
    const telemetry = new GenerationTelemetry(client, requestId);
    response = await generate(parsed, request, authToken, telemetry, startedAt);
    const body = await response.json();
    await telemetry.finish(response.status, body, Date.now() - startedAt);
    const telemetryWarning = telemetry.warnings.join(" ");
    const result = { ...body, generationRequestId: telemetry.requestId, audioStorageId: parsed.audioStorageId || null,
      ...(telemetryWarning ? { warning: [body.warning, telemetryWarning].filter(Boolean).join(" ") } : {}) };
    await client.mutation(api.payments.finishGeneration, { backendToken, generationId, token,
      ...(response.ok ? { response: JSON.stringify(result) } : {}) });
    return NextResponse.json(result, { status: response.status });
  } catch {
    try { await client.mutation(api.payments.finishGeneration, { backendToken, generationId, token }); } catch { /* A timed-out attempt can be resumed after its lock expires. */ }
    return NextResponse.json({ error: "Your storybook could not be saved. Retry this story; your payment remains assigned to it." }, { status: 503 });
  }
}
