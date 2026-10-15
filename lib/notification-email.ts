export type NotificationKind = "waitlist_signup" | "account_signup" | "login" | "generation_started" | "generation_ready" | "generation_failed" | "payment_receipt";

export type ReceiptDetails = { amount: number; currency: string; credits: number; orderId: string; paymentId: string; testMode: boolean };

export function buildNotificationEmail(kind: NotificationKind, details: {
  email?: string; name?: string; phone?: string; note?: string; title?: string; createdAt: number; appUrl: string;
  payment?: ReceiptDetails;
}) {
  if (kind === "payment_receipt") {
    if (!details.payment) throw new Error("Verified payment details are required for a receipt.");
    const p = details.payment;
    const amount = new Intl.NumberFormat("en-IN", { style: "currency", currency: p.currency }).format(p.amount / 100);
    const date = new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(details.createdAt)) + " IST";
    const subject = `${p.testMode ? "[TEST] " : ""}Your Charpai payment receipt`;
    const message = p.testMode ? "This is a test payment receipt. No real money was charged." : "Thank you for keeping your family’s stories with Charpai. Your payment is confirmed.";
    const fields = [["Amount paid", amount], ["Storybook credits added", String(p.credits)], ["Paid on", date], ["Order ID", p.orderId], ["Payment ID", p.paymentId]];
    const website = new URL(details.appUrl).origin;
    const logoUrl = new URL("/landing/charpai-logo.png", website).href;
    const text = [subject, "", "Hi,", message, "", ...fields.map(([label, value]) => `${label}: ${value}`), "", `Open Charpai: ${details.appUrl}`, "Questions about this payment? Reply to this email.", website].join("\n");
    const html = `<div style="background:#f3efe4;padding:32px 16px"><div style="max-width:560px;margin:auto;background:#fffdf7;padding:32px;color:#264c3e;font-family:Georgia,serif;line-height:1.6"><img src="${escapeHtml(logoUrl)}" alt="Charpai" width="156" style="display:block;width:156px;height:auto;margin-bottom:24px"><h1 style="font-size:28px">${escapeHtml(subject)}</h1><p>Hi,</p><p>${escapeHtml(message)}</p><table style="width:100%;border-collapse:collapse">${fields.map(([label, value]) => `<tr><td style="padding:12px 8px 12px 0;border-bottom:1px solid #ddd7ca">${escapeHtml(label)}</td><td style="padding:12px 0;border-bottom:1px solid #ddd7ca;text-align:right;overflow-wrap:anywhere">${escapeHtml(value)}</td></tr>`).join("")}</table><p style="margin-top:28px"><a href="${escapeHtml(details.appUrl)}" style="background:#264c3e;color:white;padding:12px 20px;text-decoration:none;display:inline-block">Open Charpai</a></p><p style="font-size:14px">Questions about this payment? Reply to this email.</p><p style="font-size:14px"><a href="${escapeHtml(website)}" style="color:#264c3e">${escapeHtml(website)}</a></p></div></div>`;
    return { subject, text, html };
  }
  const subjects: Record<Exclude<NotificationKind, "payment_receipt">, string> = {
    waitlist_signup: "New Charpai launch-update signup",
    account_signup: "New Charpai account",
    login: "New sign-in to Charpai",
    generation_started: "Your Charpai storybook is being prepared",
    generation_ready: "Your Charpai storybook is ready",
    generation_failed: "Your Charpai storybook needs another try"
  };
  const messages: Record<Exclude<NotificationKind, "payment_receipt">, string> = {
    waitlist_signup: "Someone joined the launch-update list.",
    account_signup: "Someone created a Charpai account.",
    login: "A new sign-in was completed for this Charpai account. If this wasn't you, reply to this email.",
    generation_started: "We have started preparing your storybook. You can return to Charpai to follow its progress.",
    generation_ready: "Your storybook draft is ready to review in Charpai.",
    generation_failed: "This attempt could not finish. Open Charpai to retry the same storybook; its credit remains assigned to it."
  };
  const isSignup = kind === "waitlist_signup" || kind === "account_signup";
  const lines = [messages[kind], "",
    details.name ? `Name: ${details.name}` : "",
    details.email ? `Email: ${details.email}` : "",
    isSignup && details.phone ? `Phone: ${details.phone}` : "",
    isSignup && details.note ? `Note: ${details.note}` : "",
    details.title ? `Storybook: ${details.title}` : "",
    `Time: ${new Date(details.createdAt).toISOString()}`, "", `Open Charpai: ${details.appUrl}`
  ].filter((line, index, all) => line || (index > 0 && all[index - 1]));
  const text = lines.join("\n");
  return { subject: subjects[kind], text,
    html: `<div style="font-family:Georgia,serif;color:#264c3e;line-height:1.6"><h1 style="font-size:24px">${escapeHtml(subjects[kind])}</h1>${lines.slice(0, -1).map(line => `<p>${escapeHtml(line)}</p>`).join("")}<p><a href="${escapeHtml(details.appUrl)}" style="color:#264c3e">Open Charpai</a></p></div>` };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}
