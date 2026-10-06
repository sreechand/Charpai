import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { paymentClient, paymentError } from "@/lib/payment-route";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const client = paymentClient(request);
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return NextResponse.json({ error: "Payment verification fields are required." }, { status: 400 });
    const fields = body as Record<string, unknown>;
    const keys = ["razorpay_payment_id", "razorpay_order_id", "razorpay_signature"] as const;
    if (keys.some(key => typeof fields[key] !== "string" || !fields[key] || (fields[key] as string).length > 256)) {
      return NextResponse.json({ error: "All three payment verification fields are required." }, { status: 400 });
    }
    return NextResponse.json(await client.action(api.razorpay.verifyPayment, {
      razorpay_payment_id: fields.razorpay_payment_id as string,
      razorpay_order_id: fields.razorpay_order_id as string,
      razorpay_signature: fields.razorpay_signature as string
    }));
  } catch (error) { return paymentError(error); }
}
