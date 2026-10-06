import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { paymentClient, paymentError } from "@/lib/payment-route";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    return NextResponse.json(await paymentClient(request).action(api.razorpay.checkoutDetails, {}));
  } catch (error) { return paymentError(error); }
}

export async function POST(request: Request) {
  try {
    const client = paymentClient(request);
    // Price and currency come from the backend configuration, never the browser.
    return NextResponse.json(await client.action(api.razorpay.createOrder, {}));
  } catch (error) { return paymentError(error); }
}
