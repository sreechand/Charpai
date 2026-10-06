import assert from 'node:assert/strict';
import { GenerationTelemetry, diagnosticValue, instrumentOpenAI } from '../lib/generation-telemetry.ts';
import { start, record, finish, requireOwner, ownedArtifact, latestMine } from '../convex/telemetry.ts';

async function main() {
const events = [], completions = [];
const client = {
  action: async (_fn, args) => events.push({ ...args, artifact: JSON.parse(args.artifactJson) }),
  mutation: async (_fn, args) => completions.push(args)
};
const telemetry = new GenerationTelemetry(client, 'request-1');
const response = { model: 'test-model', _request_id: 'provider-1', usage: { input_tokens: 40, output_tokens: 20 }, output_text: '{"title":"A memory"}' };
const sdk = { responses: { create: async () => response }, audio: { transcriptions: { create: async () => ({ text: 'A memory', usage: { seconds: 60 } }) } }, images: { generate: async () => ({ data: [{ b64_json: 'image-content' }], usage: { output_tokens: 100 } }) } };
instrumentOpenAI(sdk, telemetry);
assert.equal(await sdk.responses.create({ model: 'test-model', input: 'Exact prompt', apiKey: 'secret' }), response);
assert.equal(events[1].artifact.input.input, 'Exact prompt');
assert.equal(events[1].artifact.output.output_text, response.output_text);
assert.deepEqual(events[1].artifact.output.usage, response.usage);
assert.equal(events[1].providerRequestId, 'provider-1');
assert.equal(events[1].artifact.input.apiKey, undefined);
await sdk.images.generate({ model: 'image-model', prompt: 'A village' });
assert.equal(events.at(-1).artifact.output.data[0].b64_json, undefined);
assert.equal(events.at(-1).artifact.output.usage.output_tokens, 100);
const failure = Object.assign(new Error('Provider timed out'), { status: 429, request_id: 'failed-request' });
await assert.rejects(telemetry.trace('text', { model: 'test-model' }, async () => { throw failure; }), error => error === failure);
assert.equal(events.at(-1).status, 'failed');
assert.equal(events.at(-1).artifact.error.status, 429);
await telemetry.finish(500, { error: 'Provider timed out' }, 500);
assert.equal(completions.at(-1).status, 'failed');
const sanitized = diagnosticValue({ nested: { authorization: 'Bearer secret', password: 'secret', b64_json: 'large', url: 'signed-url', text: 'sk-testsecret' }, audio: new File(['audio'], 'sample.wav', { type: 'audio/wav' }) });
assert.deepEqual(sanitized.nested, { text: '[redacted]' });
assert.equal(sanitized.audio.bytes, 5);

// Telemetry failures must not turn a successfully generated story into a failure.
const broken = new GenerationTelemetry({ action: async () => { throw new Error('offline'); }, mutation: async () => { throw new Error('offline'); } }, 'request-2');
assert.equal(await broken.trace('text', {}, async () => 'good output'), 'good output');
assert.equal(broken.warnings.length, 2);

const auth = userId => ({ getUserIdentity: async () => userId ? { subject: userId + '|session' } : null });
await assert.rejects(start._handler({ auth: auth(null) }, { generationId: 'g', stage: 'compose', promptVersion: 'v1' }), /Sign in/);
await assert.rejects(requireOwner._handler({ db: { get: async () => ({ userId: 'owner' }) } }, { requestId: 'r', userId: 'other' }), /not found/);
await assert.rejects(ownedArtifact._handler({ db: { get: async () => ({ userId: 'owner' }) } }, { eventId: 'e', userId: 'other' }), /not found/);
await assert.rejects(finish._handler({ auth: auth('other'), db: { get: async () => ({ userId: 'owner' }) } }, { requestId: 'r', status: 'failed', elapsedMs: 1, httpStatus: 500 }), /not found/);
assert.deepEqual(await latestMine._handler({ auth: auth(null) }, {}), []);
let storedBlob, inserted, deleted;
const ctx = { auth: auth('owner'), runQuery: async () => null, runMutation: async (_fn, args) => { inserted = args; }, storage: { store: async blob => { storedBlob = blob; return 'storage-1'; }, delete: async id => { deleted = id; } } };
const largeJson = JSON.stringify({ output: 'a'.repeat(350000) });
await record._handler(ctx, { requestId: 'r', name: 'text', status: 'succeeded', elapsedMs: 1, artifactJson: largeJson });
assert.equal(await storedBlob.text(), largeJson);
assert.equal(inserted.artifactStorageId, 'storage-1');
await assert.rejects(record._handler({ ...ctx, runMutation: async () => { throw new Error('write failed'); } }, { requestId: 'r', name: 'text', status: 'succeeded', elapsedMs: 1, artifactJson: '{}' }), /write failed/);
assert.equal(deleted, 'storage-1');
console.log('PASS: exact prompts/outputs and usage, image-byte/credential omission, failure capture, logging outage, private ownership checks, large JSON storage, orphan cleanup');

}
main().catch(error => { console.error(error); process.exitCode = 1; });
