import { NextResponse } from "next/server";
import { runGenerationStep, type GenerationStep } from "@/lib/generation-step";

export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return NextResponse.json({error: "Server authorization required."}, {status: 401});
  try {
    const input = await request.json() as GenerationStep;
    if (!input.draftId || !input.attemptId || !input.operation || !input.convexUrl) return NextResponse.json({error: "Incomplete story step."}, {status: 400});
    return NextResponse.json(await runGenerationStep(input, authorization.slice(7)));
  } catch (error) {
    console.error("Saved story step stopped:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({error: "This step could not finish. Your completed work is saved."}, {status: 500});
  }
}
