// Read ignored settings without echoing secrets or interpolating shell commands.
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const deployment = args[args.indexOf("--deployment") + 1];
if (!args.includes("--deployment") || !["elegant-mosquito-650", "qualified-bullfrog-386"].includes(deployment)) {
  throw new Error("Choose --deployment elegant-mosquito-650 (production) or qualified-bullfrog-386 (development).");
}
const settings = {};
for (const line of readFileSync(".env.resend.local", "utf8").split("\n")) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) settings[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
}
if (!settings.RESEND_API_KEY?.startsWith("re_")) throw new Error("Save the Resend API key in the ignored .env.resend.local file first.");
if (!settings.EMAIL_FROM || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(settings.EMAIL_OWNER_TO || "")) throw new Error("Configure the sender and owner inbox first.");
if (!["user", "owner", "both"].includes(settings.EMAIL_USER_EVENTS_TO || "user")) throw new Error("Email recipient mode must be user, owner or both.");
settings.EMAIL_ENABLED = args.includes("--enable") ? "true" : "false";
console.log(`Target: ${deployment === "elegant-mosquito-650" ? "production" : "development"} (${deployment}); sending ${settings.EMAIL_ENABLED === "true" ? "enabled" : "disabled"}.`);
const names = ["RESEND_API_KEY", "EMAIL_FROM", "EMAIL_OWNER_TO", "EMAIL_USER_EVENTS_TO", "RESEND_WEBHOOK_SECRET", "EMAIL_ENABLED"];
for (const name of names) {
  if (!settings[name]) continue;
  try {
    execFileSync("npx", ["convex", "env", "set", name, settings[name], "--deployment", deployment], { cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"] });
  } catch {
    throw new Error(`Could not save ${name}; its value has not been printed. Recheck deployment access.`);
  }
  console.log(`Saved ${name}.`);
}
