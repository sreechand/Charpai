"use client";

import { useEffect, useRef, useState } from "react";
import {useJourney} from "./journey-provider";
import {journeyHeaders} from "@/lib/funnel-client";
import {funnelErrorCode} from "@/lib/funnel-events";
import { useAuthSession, useEvidence } from "@/app/providers";

type PaymentResponse = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };
type Order = { order_id: string; amount: number; currency: string; key_id: string };
type Checkout = { open: () => void; on: (event: "payment.failed", handler: (response: { error?: { description?: string } }) => void) => void };
type CheckoutOptions = {
  key: string; amount: number; currency: string; order_id: string; name: string; description: string;
  handler: (response: PaymentResponse) => void;
  modal: { ondismiss: () => void }; theme: { color: string };
};
declare global { interface Window { Razorpay?: new (options: CheckoutOptions) => Checkout } }

function loadCheckout(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const previous = document.getElementById("razorpay-checkout-script");
    previous?.remove();
    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    const timer = setTimeout(() => { script.remove(); reject(new Error("Checkout took too long to load. Please try again.")); }, 20000);
    script.onload = () => { clearTimeout(timer); if (window.Razorpay) resolve(); else reject(new Error("Checkout could not load.")); };
    script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error("Checkout could not load. Check your connection and try again.")); };
    document.head.appendChild(script);
  });
}

export function RazorpayCheckout({ disabled = false }: { disabled?: boolean }) {
  const auth = useAuthSession();
  const journey=useJourney();
  const checkoutAttempt=useRef<string | null>(null);
  const verificationCount=useRef(0);
  const viewed=useRef(false);
  const evidence = useEvidence();
  const [details, setDetails] = useState<{ amount: number | null; testMode: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<PaymentResponse | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const order = useRef<Order | null>(null);
  const verifying = useRef(false);
  const busyRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    if (auth.authToken) {
      checkoutAttempt.current ??= crypto.randomUUID();
      const context={...journey.context(),attemptId:checkoutAttempt.current};
      if (!viewed.current) {viewed.current=true;journey.track("checkout_viewed",context);}
      fetch("/api/create-order", { headers: { Authorization: `Bearer ${auth.authToken}`, ...journeyHeaders(context) }, signal: controller.signal })
        .then(async response => {
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Checkout is unavailable.");
          setDetails(result);
        }).catch(error => { if (!controller.signal.aborted) {journey.track("checkout_details_failed",{...context,errorCode:funnelErrorCode(error)});setMessage(error.message);} });
    }
    return () => controller.abort();
  }, [auth.authToken,journey]);

  async function verify(payment: PaymentResponse) {
    verifying.current = true;
    checkoutAttempt.current ??= crypto.randomUUID();
    const context={...journey.context(),attemptId:checkoutAttempt.current,orderId:payment.razorpay_order_id};
    const startedAt=Date.now();
    journey.track("verification_started",{...context,retry:verificationCount.current++>0});
    setBusy(true);
    setPending(payment);
    setMessage("Confirming your payment…");
    try {
      const response = await fetch("/api/verify-payment", { method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.authToken}`, ...journeyHeaders(context) },
        body: JSON.stringify(payment) });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error(result.error || "Payment could not be verified.");
      journey.track("verification_succeeded",{...context,httpStatus:response.status,elapsedMs:Date.now()-startedAt});
      setPending(null);
      setConfirmed(true);
      order.current = null;
      setMessage("Payment verified. Your 4 generation credits are ready.");
    } catch (error) {
      journey.track("verification_failed",{...context,errorCode:funnelErrorCode(error),elapsedMs:Date.now()-startedAt});
      setMessage(error instanceof Error ? error.message : "Payment could not be verified. Retry verification before paying again.");
    } finally { verifying.current = false; busyRef.current = false; setBusy(false); }
  }

  async function pay() {
    if (busyRef.current || disabled) return;
    busyRef.current = true;
    setBusy(true);
    setMessage("");
    checkoutAttempt.current=crypto.randomUUID();verificationCount.current=0;
    const context={...journey.context(),attemptId:checkoutAttempt.current};
    journey.track("checkout_clicked",context);
    let phase: "script" | "order" | "open"="script";
    try {
      await loadCheckout();
      journey.track("checkout_script_ready",context);phase="order";
      if (!order.current) {
        const response = await fetch("/api/create-order", { method: "POST", headers: { Authorization: `Bearer ${auth.authToken}`, ...journeyHeaders(context) } });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not start payment.");
        order.current = result;
      }
      const created = order.current!;
      phase="open";
      const checkout = new window.Razorpay!({ key: created.key_id, amount: created.amount, currency: created.currency,
        order_id: created.order_id, name: "Charpai", description: "One family storybook · 4 generation credits",
        theme: { color: "#79452e" }, handler: payment => {journey.track("payment_callback_received",{...context,orderId:payment.razorpay_order_id});void verify(payment);},
        modal: { ondismiss: () => {
          if (verifying.current) return;
          journey.track("checkout_closed",{...context,orderId:created.order_id});
          busyRef.current = false; setBusy(false); setMessage("Checkout closed. You can retry when ready.");
        } }
      });
      checkout.on("payment.failed", response => {
        journey.track("checkout_failed",{...context,orderId:created.order_id,errorCode:"provider_failed"});
        setMessage(response.error?.description || "Payment failed. Try again in checkout or close it and retry.");
      });
      checkout.open();journey.track("checkout_opened",{...context,orderId:created.order_id});
    } catch (error) {
      journey.track(phase==="script"?"checkout_script_failed":"checkout_failed",{...context,errorCode:funnelErrorCode(error)});
      busyRef.current = false; setBusy(false);
      setMessage(error instanceof Error ? error.message : "Could not open checkout.");
    }
  }

  const price = details?.amount ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(details.amount / 100) : null;
  return (
    <div className="field-section-heading payment-panel">
      <div>
        <p className="eyebrow">Storybook payment{details?.testMode ? " · Test mode" : ""}</p>
        <p>{evidence.paymentAvailable || confirmed ? "Payment verified." : price ? `Pay ${price} for 4 generation credits to make your storybook.` : "Payments are being set up. Please try again shortly."}</p>
        {pending ? (
          <button className="primary-button" type="button" disabled={busy || disabled} onClick={() => { void verify(pending); }}>
            {busy ? "Verifying…" : "Retry payment verification"}
          </button>
        ) : evidence.paymentAvailable || confirmed ? null : (
          <button className="primary-button" type="button" disabled={busy || disabled || !price} onClick={() => { void pay(); }}>
            {busy ? "Opening checkout…" : price ? `Pay ${price}` : "Checkout unavailable"}
          </button>
        )}
        {message ? <p role="status" aria-live="polite">{message}</p> : null}
      </div>
    </div>
  );
}
