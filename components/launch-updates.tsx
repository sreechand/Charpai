"use client";

import { useState, type FormEvent } from "react";

export function LaunchUpdates() {
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/updates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), phone: data.get("phone") }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We couldn’t save your details. Please try again.");
      setSaved(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "We couldn’t save your details. Please try again."); }
    finally { setBusy(false); }
  }
  if (saved) return <div className="launch-updates-success" role="status"><h3>You’re on the list.</h3><p>We’ll let you know when Charpai launches, and share occasional updates along the way.</p></div>;
  return <form className="launch-updates" aria-label="Get Charpai launch updates" onSubmit={submit}>
    <label htmlFor="updates-email">Email address<input id="updates-email" name="email" type="email" autoComplete="email" maxLength={254} required placeholder="you@example.com" disabled={busy} /></label>
    <label htmlFor="updates-phone">Phone number (optional)<input id="updates-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder="Include your country code" disabled={busy} /></label>
    <p className="launch-updates-consent">By joining, you agree to receive Charpai launch and product updates at the contact details you provide.</p>
    {error ? <p className="launch-updates-error" role="alert">{error}</p> : null}
    <button className="btn" type="submit" disabled={busy}>{busy ? "Saving…" : "Keep me posted"}</button>
  </form>;
}
