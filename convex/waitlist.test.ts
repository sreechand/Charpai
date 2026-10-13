/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test, vi, afterEach } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";
import { isCharpaiLaunched } from "../lib/launch";
const modules = import.meta.glob("./**/*.ts");
afterEach(() => vi.unstubAllEnvs());
test("launch access is closed by default and opens only with the explicit switch", () => {
  vi.stubEnv("CHARPAI_LAUNCHED", undefined); expect(isCharpaiLaunched()).toBe(false);
  vi.stubEnv("CHARPAI_LAUNCHED", "false"); expect(isCharpaiLaunched()).toBe(false);
  vi.stubEnv("CHARPAI_LAUNCHED", "true"); expect(isCharpaiLaunched()).toBe(true);
});
test("anonymous update requests normalize email, record consent and do not overwrite duplicate contacts", async () => {
  const t = convexTest(schema, modules);
  const id = await t.mutation(api.waitlist.add, { name: "", email: " Reader@Example.invalid ", phone: "+1 202 555 0100" });
  expect(await t.mutation(api.waitlist.add, { name: "", email: "reader@example.invalid", phone: "+1 202 555 0199" })).toBe(id);
  const rows = await t.run(ctx => ctx.db.query("waitlist").collect());
  expect(rows).toHaveLength(1);
  expect(rows[0]).toMatchObject({ email: "reader@example.invalid", phone: "+1 202 555 0100" });
  expect(rows[0].consentAt).toBeGreaterThan(0);
});
test("email alone works and invalid contacts are rejected", async () => {
  const t = convexTest(schema, modules);
  await t.mutation(api.waitlist.add, { name: "", email: "reader@example.invalid" });
  await expect(t.mutation(api.waitlist.add, { name: "", email: "broken" })).rejects.toThrow("valid email");
  await expect(t.mutation(api.waitlist.add, { name: "", email: "other@example.invalid", phone: "abc" })).rejects.toThrow("phone number");
  expect(await t.run(ctx => ctx.db.query("waitlist").collect())).toHaveLength(1);
});
