import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
const env = await readFile('.env.local', 'utf8');
if (!env.includes('CONVEX_DEPLOYMENT=dev:qualified-bullfrog-386')) throw new Error('Development deployment required.');
const client = new ConvexHttpClient('https://qualified-bullfrog-386.convex.cloud');
const login = await client.action(api.auth.signIn, { provider: 'password', params: { flow: 'signUp', email: `route-check-${randomUUID()}@example.invalid`, password: randomUUID() + randomUUID() } });
client.setAuth(login.tokens.token);
let failWriting = false;
let singleSpeaker = false;
const ai = createServer(async (req, res) => {
  let raw = ''; for await (const chunk of req) raw += chunk;
  res.setHeader('Content-Type', 'application/json'); res.setHeader('x-request-id', 'mock-provider-id');
  if (req.url === '/v1/audio/transcriptions') {
    if (!raw.includes('diarized_json')) {
      res.end(JSON.stringify({ text: 'I remember our village.', usage: { type: 'duration', seconds: 1 } })); return;
    }
    res.end(JSON.stringify({ text: 'What do you remember? I remember our village.', duration: 1,
      segments: singleSpeaker ? [{ speaker: 'A', start: 0, end: 1, text: 'I remember our village.' }] : [
        { speaker: 'A', start: 0, end: 0.4, text: 'What do you remember?' },
        { speaker: 'B', start: 0.4, end: 1, text: 'I remember our village.' }
      ], usage: { type: 'duration', seconds: 1 }
    })); return;
  }
  const body = JSON.parse(raw);
  if (req.url === '/v1/images/generations') {
    res.end(JSON.stringify({ created: 1, data: [{ b64_json: Buffer.from('synthetic-image').toString('base64') }], usage: { input_tokens: 10, output_tokens: 20, total_tokens: 30 } })); return;
  }
  const extraction = body.instructions.includes('extract structured');
  if (!extraction && failWriting) { res.statusCode = 400; res.end(JSON.stringify({ error: { message: 'Synthetic writing failure', type: 'invalid_request_error', code: 'mock_failure' } })); return; }
  const result = body.instructions.includes('Identify the interviewee') ? { speaker: 'B' } : extraction ? { elderName: 'Test elder', languageMix: 'English', originPlace: 'Test village' } : { title: 'A synthetic memory', subtitle: 'Test only', sections: [{ id: 'memory', heading: 'A memory', body: 'I remember our village.' }], closingNote: 'I remember it.', illustrationBrief: 'A village', stampSubject: 'Village', stampMotifs: ['House'], photoCaptions: [] };
  res.end(JSON.stringify({ id: 'resp_mock', object: 'response', status: 'completed', model: 'mock-text', output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: JSON.stringify(result), annotations: [] }] }], usage: { input_tokens: 100, input_tokens_details: { cached_tokens: 10 }, output_tokens: 40, output_tokens_details: { reasoning_tokens: 5 }, total_tokens: 140 } }));
});
await new Promise(resolve => ai.listen(0, '127.0.0.1', resolve));
const port = 3014;
const child = spawn('npm', ['run', 'dev', '--', '--port', String(port)], { env: { ...process.env, OPENAI_API_KEY: 'mock-test-key', OPENAI_BASE_URL: `http://127.0.0.1:${ai.address().port}/v1` }, stdio: ['ignore', 'pipe', 'pipe'] });
let logs = ''; child.stdout.on('data', c => { logs += c; }); child.stderr.on('data', c => { logs += c; });
try {
  const readyBy = Date.now() + 20000;
  while (!logs.includes('Ready')) {
    if (child.exitCode !== null || Date.now() > readyBy) throw new Error('Test server failed to start: ' + logs);
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  const endpoint = `http://127.0.0.1:${port}/api/generate-storybook`;
  assert.equal((await fetch(endpoint, { method: 'POST', body: '{}' })).status, 401);
  const generationId = randomUUID();
  const wav = Buffer.alloc(44 + 16000 * 2);
  wav.write('RIFF', 0); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(16000, 24); wav.writeUInt32LE(32000, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
  wav.write('data', 36); wav.writeUInt32LE(wav.length - 44, 40);
  for (let i = 0; i < 16000; i++) wav.writeInt16LE(Math.round(Math.sin(i * 0.15) * 2000), 44 + i * 2);
  const transcribe = async () => {
    const form = new FormData(); form.set('stage', 'transcribe'); form.set('elderName', 'Test elder');
    form.set('audio', new Blob([wav], { type: 'audio/wav' }), 'synthetic.wav');
    const result = await fetch(endpoint, { method: 'POST', headers: { Authorization: 'Bearer ' + login.tokens.token, 'X-Generation-Id': generationId, 'X-Generation-Stage': 'transcribe' }, body: form });
    const payload = await result.json(); assert.equal(result.status, 200, JSON.stringify(payload));
    assert.equal(payload.transcript, 'I remember our village.');
    return await client.query(api.telemetry.eventsMine, { requestId: payload.generationRequestId });
  };
  const transcriptionEvents = await transcribe();
  assert.ok(transcriptionEvents.some(e => e.name === 'audio_preparation'));
  assert.equal(transcriptionEvents.filter(e => e.name === 'transcription').length, 1);
  singleSpeaker = true;
  const fallbackEvents = await transcribe();
  assert.equal(fallbackEvents.filter(e => e.name === 'transcription').length, 2);
  assert.ok(fallbackEvents.some(e => e.model === 'gpt-4o-mini-transcribe'));
  const request = () => fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + login.tokens.token, 'X-Generation-Id': generationId, 'X-Generation-Stage': 'compose' }, body: JSON.stringify({ stage: 'compose', input: { elderName: 'Test elder', languageMix: 'English' }, transcript: 'I remember our village.' }) });
  const response = await request(); const body = await response.json();
  assert.equal(response.status, 200, JSON.stringify(body)); assert.equal(body.draft.title, 'A synthetic memory');
  assert.ok(body.draft.illustrationStorageId); assert.equal(body.warning, '');
  const events = await client.query(api.telemetry.eventsMine, { requestId: body.generationRequestId });
  assert.equal(events.filter(e => e.name === 'text').length, 2);
  assert.ok(events.some(e => e.name === 'illustration'));
  const textEvent = events.find(e => e.name === 'text');
  const artifact = JSON.parse(await client.action(api.telemetry.artifactMine, { eventId: textEvent._id }));
  assert.equal(artifact.output.usage.input_tokens, 100); assert.equal(textEvent.providerRequestId, 'mock-provider-id');
  assert.match(artifact.input.input, /I remember our village/);
  failWriting = true;
  const failed = await request(); const failedBody = await failed.json();
  assert.equal(failed.status, 500); assert.match(failedBody.error, /Synthetic writing failure/);
  const failedEvents = await client.query(api.telemetry.eventsMine, { requestId: failedBody.generationRequestId });
  assert.ok(failedEvents.some(e => e.name === 'text' && e.status === 'failed'));
  const latest = await client.query(api.telemetry.latestMine, {});
  assert.equal(latest[0].status, 'failed'); assert.equal(latest[1].status, 'succeeded'); assert.equal(latest[0].generationId, latest[1].generationId);
  console.log('PASS: real generation route saved audio preparation, speaker selection, transcription fallback, prompts, original JSON, usage, provider ID, illustration metadata, successful completion and provider failure in development. No paid AI requests.');
} finally {
  child.kill('SIGTERM');
  await new Promise(resolve => child.once('exit', resolve));
  ai.close();
}
