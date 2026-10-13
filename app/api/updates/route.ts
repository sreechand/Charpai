import { ConvexHttpClient } from "convex/browser";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !("email" in body) || typeof body.email !== "string") {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if ("phone" in body && typeof body.phone !== "string") return Response.json({ error: "Enter a valid phone number." }, { status: 400 });
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return Response.json({ error: "Updates signup is temporarily unavailable. Please try again shortly." }, { status: 503 });
  try {
    await new ConvexHttpClient(url).mutation(api.waitlist.add, {
      name: "", email: body.email, phone: "phone" in body ? body.phone as string : undefined
    });
    return Response.json({ accepted: true });
  } catch (error) {
    if (error instanceof ConvexError && typeof error.data === "string") return Response.json({ error: error.data }, { status: 400 });
    return Response.json({ error: "We couldn’t save your details. Please try again." }, { status: 503 });
  }
}
