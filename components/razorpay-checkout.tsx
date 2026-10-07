"use client";

import { useEffect, useRef, useState } from "react";
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
      fetch("/api/create-order", { headers: { Authorization: `Bearer ${auth.authToken}` }, signal: controller.signal })
        .then(async response => {
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Checkout is unavailable.");
          setDetails(result);
        }).catch(error => { if (!controller.signal.aborted) setMessage(error.message); });
    }
    return () => controller.abort();
  }, [auth.authToken]);

  async function verify(payment: PaymentResponse) {
    verifying.current = true;
    setBusy(true);
    setPending(payment);
    setMessage("Confirming your payment…");
    try {
      const response = await fetch("/api/verify-payment", { method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.authToken}` },
        body: JSON.stringify(payment) });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error(result.error || "Payment could not be verified.");
      setPending(null);
      setConfirmed(true);
      order.current = null;
      setMessage("Payment verified. You can start your storybook.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Payment could not be verified. Retry verification before paying again.");
    } finally { verifying.current = false; busyRef.current = false; setBusy(false); }
  }

  async function pay() {
    if (busyRef.current || disabled) return;
    busyRef.current = true;
    setBusy(true);
    setMessage("");
    try {
      await loadCheckout();
      if (!order.current) {
        const response = await fetch("/api/create-order", { method: "POST", headers: { Authorization: `Bearer ${auth.authToken}` } });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not start payment.");
        order.current = result;
      }
      const created = order.current!;
      const checkout = new window.Razorpay!({ key: created.key_id, amount: created.amount, currency: created.currency,
        order_id: created.order_id, name: "Charpai", description: "One family storybook with ongoing access",
        theme: { color: "#79452e" }, handler: payment => { void verify(payment); },
        modal: { ondismiss: () => {
          if (verifying.current) return;
          busyRef.current = false; setBusy(false); setMessage("Checkout closed. You can retry when ready.");
        } }
      });
      checkout.on("payment.failed", response => {
        setMessage(response.error?.description || "Payment failed. Try again in checkout or close it and retry.");
      });
      checkout.open();
    } catch (error) {
      busyRef.current = false; setBusy(false);
      setMessage(error instanceof Error ? error.message : "Could not open checkout.");
    }
  }

  const price = details?.amount ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(details.amount / 100) : null;
  return (
    <div className="field-section-heading payment-panel">
      <div>
        <p className="eyebrow">Storybook payment{details?.testMode ? " · Test mode" : ""}</p>
        <p>{evidence.paymentAvailable || confirmed ? "Payment verified." : price ? `Pay ${price} to create one storybook and keep access to it.` : "Checkout will be available once the price is set."}</p>
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
