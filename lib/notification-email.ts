export type NotificationKind = "waitlist_signup" | "account_signup" | "login" | "generation_started" | "generation_ready" | "generation_failed";

export function buildNotificationEmail(kind: NotificationKind, details: {
  email?: string; name?: string; phone?: string; note?: string; title?: string; createdAt: number; appUrl: string;
}) {
  const subjects: Record<NotificationKind, string> = {
    waitlist_signup: "New Charpai launch-update signup",
    account_signup: "New Charpai account",
    login: "New sign-in to Charpai",
    generation_started: "Your Charpai storybook is being prepared",
    generation_ready: "Your Charpai storybook is ready",
    generation_failed: "Your Charpai storybook needs another try"
  };
  const messages: Record<NotificationKind, string> = {
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
