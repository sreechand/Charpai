import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createHash } from "node:crypto";

const account = "stories";
const accountId = "93cd459b-5f8d-49e9-befc-fd9cfbf06a39";
const label = "charpai";
const root = path.resolve("dist/herenow-landing");
const statePath = path.resolve(".herenow/landing-state.json");
const key = process.env.HERENOW_API_KEY || (await fs.readFile(path.join(os.homedir(), ".herenow/credentials"), "utf8")).trim();
const headers = { Authorization: `Bearer ${key}`, "X-HereNow-Account": account, "X-HereNow-Client": "codex/charpai-landing", "Content-Type": "application/json" };
async function api(endpoint, method = "GET", body) {
  const response = await fetch(`https://here.now${endpoint}`, { method, headers, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(30000) });
  const data = await response.json();
  if (!response.ok) throw new Error(`${method} ${endpoint}: ${data.error || data.message || response.status}`);
  return data;
}
const before = (await api(`/api/v1/accounts/${accountId}/site-labels`)).siteLabels;
const existing = before.find(site => site.label === label);
let previous;
try { previous = JSON.parse(await fs.readFile(statePath, "utf8")); } catch (error) { if (error.code !== "ENOENT") throw error; }
let current;
if (existing) {
  current = await api(`/api/v1/publish/${existing.slug}`);
  if (!previous || previous.slug !== existing.slug || previous.versionId !== current.currentVersionId) {
    throw new Error("The existing homepage has changed or was published elsewhere. Read its current owner files before replacing it.");
  }
}
async function filesIn(directory, prefix = "") {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) result.push(...await filesIn(path.join(directory, entry.name), relative));
    else {
      const bytes = await fs.readFile(path.join(directory, entry.name));
      const contentType = relative.endsWith(".html") ? "text/html; charset=utf-8" : relative.endsWith(".js") ? "text/javascript; charset=utf-8" : relative.endsWith(".css") ? "text/css; charset=utf-8" : relative.endsWith(".woff2") ? "font/woff2" : relative.endsWith(".json") ? "application/json" : "image/png";
      result.push({ path: relative, bytes, contentType, hash: createHash("sha256").update(bytes).digest("hex") });
    }
  }
  return result;
}
const files = await filesIn(root);
const created = await api(existing ? `/api/v1/publish/${existing.slug}` : "/api/v1/publish", existing ? "PUT" : "POST", {
  account, displayName: "Charpai", displayDescription: "Family stories, in their own words. Launching October 15.",
  ...(current ? { baseVersionId: current.currentVersionId } : {}),
  files: files.map(({ bytes, ...file }) => ({ ...file, size: bytes.byteLength }))
});
console.log(`Uploading ${created.upload.uploads.length} homepage files to the stories workspace.`);
for (let start = 0; start < created.upload.uploads.length; start += 6) {
  await Promise.all(created.upload.uploads.slice(start, start + 6).map(async upload => {
    const target = new URL(upload.url);
    if (!target.hostname.endsWith(".r2.cloudflarestorage.com") || target.protocol !== "https:") throw new Error("Unexpected upload destination.");
    const file = files.find(file => file.path === upload.path);
    if (!file) throw new Error("Unexpected upload file.");
    const response = await fetch(target, { method: "PUT", headers: upload.headers, body: file.bytes, signal: AbortSignal.timeout(60000) });
    if (!response.ok) throw new Error(`Upload failed for ${file.path}: ${response.status}`);
  }));
}
const finalizeUrl = new URL(created.upload.finalizeUrl);
if (finalizeUrl.origin !== "https://here.now") throw new Error("Unexpected finalize host.");
const finalized = await api(finalizeUrl.pathname, "POST", { versionId: created.upload.versionId, account, workspaceLabel: label });
await fs.mkdir(path.dirname(statePath), { recursive: true });
await fs.writeFile(statePath, JSON.stringify({ slug: created.slug, versionId: finalized.currentVersionId, siteUrl: finalized.siteUrl, primaryUrl: finalized.primaryUrl || finalized.accountUrl }, null, 2), { mode: 0o600 });
if (finalized.warnings?.length) throw new Error(`Publication warnings: ${finalized.warnings.join("; ")}`);
await api(`/api/v1/publish/${created.slug}/access`, "PATCH", { mode: "anyone_with_link" });
const details = await api(`/api/v1/publish/${created.slug}`);
if (details.expiresAt) throw new Error("The published site unexpectedly has an expiry.");
const after = (await api(`/api/v1/accounts/${accountId}/site-labels`)).siteLabels;
for (const story of before.filter(site => site.label !== label)) {
  if (!after.some(site => site.label === story.label && site.slug === story.slug)) throw new Error("An existing story label changed unexpectedly.");
}
console.log(JSON.stringify({ slug: created.slug, versionId: finalized.currentVersionId, siteUrl: finalized.siteUrl, primaryUrl: finalized.primaryUrl || finalized.accountUrl, permanent: true, existingStoriesUnchanged: true }));
