import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const harnessDirectory = fileURLToPath(new URL('../app/recording-check', import.meta.url));
const harness = `"use client";
import { useState } from "react";
import { AudioIntake } from "@/components/audio-intake";
export default function RecordingCheck() {
  const [audio, setAudio] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  return <main className="app-shell"><aside className="intake-panel" style={{ maxWidth: 430 }}><h2>Record an interview</h2><div className="upload-zone"><AudioIntake recoveryKey="test" audio={audio} onChange={setAudio} onBusyChange={setBusy} disabled={false}/><label className="upload-card">Optional photos</label></div><button className="primary-button" disabled={!audio || busy}>Generate preview</button><output data-testid="file">{audio ? String(audio.type) + "|" + String(audio.size) : "none"}</output></aside></main>;
}
`;
if (existsSync(harnessDirectory)) throw new Error('Remove the temporary recording-check route before running this script.');
await mkdir(harnessDirectory);
await writeFile(harnessDirectory + '/page.tsx', harness);
let browser;
try {

// Creates and removes its temporary route; run with npm run dev already running.
browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
const context = await browser.newContext({ permissions: ['microphone'], viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const base = process.env.RECORDING_TEST_URL || 'http://localhost:3000/recording-check';
await page.goto(base);
await page.getByRole('button', { name: 'Start recording', exact: true }).click();
await page.getByRole('button', { name: 'Stop and save', exact: true }).waitFor();
assert.equal(await page.getByRole('button', { name: 'Generate preview' }).isDisabled(), true);
await page.waitForTimeout(1500);
await page.getByRole('button', { name: 'Stop and save', exact: true }).click();
await page.getByRole('link', { name: 'Download recording' }).waitFor();
assert.match(await page.getByTestId('file').innerText(), /audio\/webm.*\|[1-9]\d*/);
assert.equal(await page.getByRole('button', { name: 'Generate preview' }).isEnabled(), true);
await page.locator('audio').evaluate(async audio => { await audio.play(); });
assert.equal(await page.locator('audio').evaluate(audio => audio.paused), false);
await page.locator('audio').evaluate(audio => audio.pause());
const downloadEvent = page.waitForEvent('download');
await page.getByRole('link', { name: 'Download recording' }).click();
const download = await downloadEvent;
assert.match(download.suggestedFilename(), /interview-.*\.webm/);
await page.screenshot({ path: '/tmp/charpai-recording-mobile.png', fullPage: true });
assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
await page.waitForFunction(async () => {
  const db = await new Promise(resolve => { const r = indexedDB.open('charpai-audio', 1); r.onsuccess = () => resolve(r.result); });
  return new Promise(resolve => { const tx = db.transaction('drafts'); const r = tx.objectStore('drafts').get('test'); r.onsuccess = () => { resolve(Boolean(r.result)); db.close(); }; });
});
await page.reload();
await page.getByText(/Your last recording was recovered/).waitFor();
await page.getByRole('link', { name: 'Download recording' }).waitFor();
await page.getByRole('button', { name: 'Upload audio', exact: true }).click();
await page.locator('input[type=file]').setInputFiles({ name: 'empty.wav', mimeType: 'audio/wav', buffer: Buffer.alloc(0) });
await page.getByText(/The recording is empty/).waitFor();
await page.locator('input[type=file]').setInputFiles({ name: 'uploaded.wav', mimeType: 'audio/wav', buffer: Buffer.from('upload-test') });
await page.getByText('uploaded.wav', { exact: true }).waitFor();
await page.getByRole('button', { name: 'Record here', exact: true }).click();
page.once('dialog', dialog => dialog.dismiss());
await page.getByRole('button', { name: 'Record a new take' }).click();
assert.equal(await page.getByText('uploaded.wav', { exact: true }).isVisible(), true);
page.once('dialog', dialog => dialog.accept());
await page.getByRole('button', { name: 'Record a new take' }).click();
await page.getByRole('button', { name: 'Stop and save', exact: true }).waitFor();
await page.waitForTimeout(1100);
await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
await page.getByText(/Recording stopped when you left this screen/).waitFor();
await page.getByRole('button', { name: 'Record a new take' }).waitFor();
await page.evaluate(() => Object.defineProperty(document, 'hidden', { configurable: true, value: false }));
await page.setViewportSize({ width: 320, height: 700 });
assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
await page.setViewportSize({ width: 1440, height: 1000 });
await page.screenshot({ path: '/tmp/charpai-recording-desktop.png', fullPage: true });
assert.deepEqual(errors, []);
console.log('PASS: real capture, valid playback, download, busy guard, mobile layout, local recovery, upload validation, replacement cancellation, background interruption');

const denied = await browser.newContext();
await denied.addInitScript(() => {
  navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('Denied', 'NotAllowedError'); };
});
const deniedPage = await denied.newPage();
await deniedPage.goto(base);
await deniedPage.getByRole('button', { name: 'Start recording', exact: true }).click();
await deniedPage.getByText(/Microphone access was blocked/).waitFor();
assert.equal(await deniedPage.getByRole('button', { name: 'Upload audio', exact: true }).isEnabled(), true);
console.log('PASS: permission denial retains upload fallback');
const mp4Context = await browser.newContext({ permissions: ['microphone'] });
await mp4Context.addInitScript(() => {
  const supported = MediaRecorder.isTypeSupported.bind(MediaRecorder);
  MediaRecorder.isTypeSupported = type => type === 'audio/mp4' && supported(type);
});
const mp4Page = await mp4Context.newPage();
await mp4Page.goto(base);
assert.equal(await mp4Page.evaluate(() => MediaRecorder.isTypeSupported('audio/mp4')), true);
await mp4Page.getByRole('button', { name: 'Start recording', exact: true }).click();
await mp4Page.getByRole('button', { name: 'Stop and save', exact: true }).waitFor();
await mp4Page.waitForTimeout(1500);
await mp4Page.getByRole('button', { name: 'Stop and save', exact: true }).click();
await mp4Page.getByRole('link', { name: 'Download recording' }).waitFor();
assert.match(await mp4Page.getByTestId('file').innerText(), /audio\/mp4.*\|[1-9]\d*/);
await mp4Page.locator('audio').evaluate(async audio => { await audio.play(); });
assert.equal(await mp4Page.locator('audio').evaluate(audio => audio.paused), false);
console.log('PASS: real MP4 capture and playback with Safari-style format support');

const pendingContext = await browser.newContext();
await pendingContext.addInitScript(() => {
  window.releaseMicrophone = null;
  window.cancelledTrackStopped = false;
  navigator.mediaDevices.getUserMedia = () => new Promise(resolve => {
    window.releaseMicrophone = () => resolve({ getTracks: () => [{ stop: () => { window.cancelledTrackStopped = true; } }] });
  });
});
const pendingPage = await pendingContext.newPage();
await pendingPage.goto(base);
await pendingPage.getByRole('button', { name: 'Start recording', exact: true }).click();
await pendingPage.getByRole('button', { name: 'Cancel', exact: true }).click();
await pendingPage.evaluate(() => window.releaseMicrophone());
await pendingPage.waitForFunction(() => window.cancelledTrackStopped);
assert.equal(await pendingPage.getByRole('button', { name: 'Upload audio', exact: true }).isEnabled(), true);
console.log('PASS: pending permission cancellation releases a late microphone stream');

// Advance wall-clock time after real capture to exercise the ten-minute cap.
const limited = await browser.newContext({ permissions: ['microphone'] });
const limitedPage = await limited.newPage();
await limitedPage.goto(base);
await limitedPage.getByRole('button', { name: 'Start recording', exact: true }).click();
await limitedPage.getByRole('button', { name: 'Stop and save', exact: true }).waitFor();
await limitedPage.waitForTimeout(1100);
await limitedPage.evaluate(() => { const original = Date.now; Date.now = () => original() + 601000; });
await limitedPage.getByText(/Your 10-minute recording is ready/).waitFor();
await limitedPage.getByRole('link', { name: 'Download recording' }).waitFor();
assert.equal(await limitedPage.getByRole('button', { name: 'Generate preview' }).isEnabled(), true);
console.log('PASS: automatic duration limit preserves playable capture');

for (const name of ['NotFoundError', 'NotReadableError', 'unsupported', 'storage']) {
  const errorContext = await browser.newContext({ permissions: ['microphone'] });
  await errorContext.addInitScript(name => {
    if (name === 'unsupported') {
      window.MediaRecorder = undefined;
    } else if (name === 'storage') {
      indexedDB.open = () => { throw new DOMException('Storage blocked', 'SecurityError'); };
    } else {
      navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('Test error', name); };
    }
  }, name);
  const errorPage = await errorContext.newPage();
  await errorPage.goto(base);
  await errorPage.getByRole('button', { name: 'Start recording', exact: true }).click();
  if (name === 'storage') {
    await errorPage.getByRole('button', { name: 'Stop and save', exact: true }).waitFor();
    await errorPage.waitForTimeout(1100);
    await errorPage.getByRole('button', { name: 'Stop and save', exact: true }).click();
    await errorPage.getByText(/could not save a recovery copy/).waitFor();
    await errorPage.getByRole('link', { name: 'Download recording' }).waitFor();
    assert.equal(await errorPage.getByRole('button', { name: 'Generate preview' }).isEnabled(), true);
  } else {
    await errorPage.getByText(name === 'NotFoundError' ? /No microphone was found/ : name === 'NotReadableError' ? /microphone is busy/ : /This browser cannot record/).waitFor();
  }
  assert.equal(await errorPage.getByRole('button', { name: 'Upload audio', exact: true }).isEnabled(), true);
  await errorContext.close();
}
console.log('PASS: missing or busy microphone, unsupported browser, and blocked local storage');

} finally {
  await browser?.close();
  await rm(harnessDirectory, { recursive: true, force: true });
}
