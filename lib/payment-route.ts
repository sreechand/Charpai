import { ConvexHttpClient } from "convex/browser";
import { ConvexError } from "convex/values";
import { NextResponse } from "next/server";

export function paymentClient(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) throw new ConvexError({ status: 401, message: "Sign in before paying." });
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new ConvexError({ status: 500, message: "Payment backend is not configured." });
  const client = new ConvexHttpClient(url);
  client.setAuth(token);
  return client;
}

export function paymentError(error: unknown) {
  if (error instanceof ConvexError) {
    let data: unknown = error.data;
    if (typeof data === "string") { try { data = JSON.parse(data); } catch { /* generic error below */ } }
    if (data && typeof data === "object" && "status" in data && "message" in data) {
      const status = Number(data.status);
      return NextResponse.json({ error: String(data.message) }, { status: [400, 401, 403, 500].includes(status) ? status : 500 });
    }
  }
  return NextResponse.json({ error: "Payment could not be completed. Please try again." }, { status: 500 });
}
