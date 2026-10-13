// Uses only the named development backend and fictional memories. Real AI calls.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
const deployment = 'qualified-bullfrog-386';
const envText = await readFile('.env.local', 'utf8');
assert.match(envText, /CONVEX_DEPLOYMENT=dev:qualified-bullfrog-386/);
const env = {};
for (const file of ['.env', '.env.local']) {
  for (const line of (await readFile(file, 'utf8')).split('\n')) {
    const match = line.match(/^([A-Z_0-9]+)=(.*)$/);
    if (match) env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}
const client = new ConvexHttpClient(`https://${deployment}.convex.cloud`);
const email = `storybook-check-${randomUUID()}@example.invalid`;
const password = randomUUID() + randomUUID();
const login = await client.action(api.auth.signIn, { provider: 'password', params: { flow: 'signUp', email, password } });
assert.ok(login.tokens?.token);
client.setAuth(login.tokens.token);
const userId = JSON.parse(Buffer.from(login.tokens.token.split('.')[1], 'base64url').toString()).sub.split('|')[0];
const orderId = `order_storybook_${randomUUID()}`;
for (const [fn, args] of [['payments:saveOrder', { userId, orderId, amount: 50000, currency: 'INR' }], ['payments:markPaid', { userId, orderId, paymentId: `synthetic_${randomUUID()}` }]]) {
  execFileSync('npx', ['convex', 'run', '--deployment', deployment, fn, JSON.stringify(args)], { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] });
}
const generationId = randomUUID();
const transcript = 'This is a fictional interview for a software test. I remember carrying my copper coffee tumbler to the kitchen each morning. It had a rolled rim and a dent near its base. My mother would pour coffee into it and I would sit by the doorway. That tumbler is the object I remember from home. At school I had a wooden ruler. I used it to draw straight lines in my notebook. Its edge had small pencil marks. I kept it in my school bag and used it for years. I remember those two objects clearly.';
const input = { elderName: 'Test storyteller', originPlace: 'Mysuru', relationship: 'Grandparent', languageMix: 'English', notes: 'Fictional test. Two memories only: coffee tumbler and wooden ruler. Make exactly two sections, one for each memory.' };
await client.mutation(api.payments.beginGeneration, { backendToken: env.PAYMENT_BACKEND_TOKEN, generationId, stage: 'transcribe', payloadHash: 'synthetic-transcript', token: 'synthetic-preparation', inputJson: JSON.stringify(input) });
await client.mutation(api.payments.finishGeneration, { backendToken: env.PAYMENT_BACKEND_TOKEN, generationId, token: 'synthetic-preparation', response: JSON.stringify({ transcript }) });
console.log('Development account and synthetic credit prepared; generating two memory artifacts.');
const response = await fetch('http://localhost:3017/api/generate-storybook', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${login.tokens.token}`, 'X-Generation-Id': generationId, 'X-Generation-Stage': 'compose' }, body: JSON.stringify({ stage: 'compose', input, transcript }) });
const result = await response.json();
assert.equal(response.status, 200, result.error || 'generation failed');
assert.equal(result.draft.sections.length, 2);
assert.ok(result.draft.sections.every(section => section.illustrationStorageId && section.illustrationUrl), result.warning);
const runId = await client.mutation(api.runs.createRun, { generationId, elderName: input.elderName, relationship: input.relationship, originPlace: input.originPlace, languageMix: 'English', hasAudio: false, photoCount: 0 });
const { illustrationUrl, illustrationStorageId, ...draft } = result.draft;
void illustrationUrl;
draft.illustrationStorageId = illustrationStorageId || undefined;
draft.sections = draft.sections.map(({ illustrationUrl, illustrationStorageId, ...section }) => {
  void illustrationUrl;
  return { ...section, illustrationStorageId: illustrationStorageId || undefined };
});
const page = await client.mutation(api.storybookPages.publish, { runId, draft });
await writeFile('/private/tmp/charpai-storybook-test.json', JSON.stringify({ page, generated: result.draft }, null, 2));
console.log(`PASS: two independently generated, stored and published artifacts. Preview: http://localhost:3017/s/${page.slug}`);
