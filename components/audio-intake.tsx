"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square, Upload, Download } from "lucide-react";
import { maxAudioBytes, validateAudioFile } from "@/lib/files";

import type { ProductEventName, ProductEventDetails } from "@/lib/telemetry-events";

const MAX_SECONDS = 600;
const formats = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm", "audio/ogg;codecs=opus"];

// One local draft per account; audio leaves the device only when generation is requested.
async function draftStore(key: string, file?: File): Promise<File | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("charpai-audio", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("drafts");
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("drafts", file ? "readwrite" : "readonly");
      const store = transaction.objectStore("drafts");
      const operation = file ? store.put(file, key) : store.get(key);
      transaction.oncomplete = () => {
        db.close();
        resolve(file || (operation.result instanceof Blob
          ? new File([operation.result], (operation.result instanceof File ? operation.result.name : "interview.webm"), { type: operation.result.type })
          : null));
      };
      transaction.onerror = transaction.onabort = () => { db.close(); reject(transaction.error); };
    };
  });
}

function microphoneError(error: unknown) {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") return "Microphone access was blocked. Allow the microphone in your browser’s site settings, then try again. You can also upload a recording.";
  if (name === "NotFoundError") return "No microphone was found. Connect one or upload a recording.";
  if (name === "NotReadableError") return "Your microphone is busy or unavailable. Close other recording or calling apps and try again.";
  return "Recording could not start. Try again, or upload a recording instead.";
}

export function AudioIntake({ audio, onChange, disabled, onBusyChange, recoveryKey, onEvent }: {
  onEvent?: (name: ProductEventName, details?: ProductEventDetails) => void;
  recoveryKey: string;
  audio: File | null;
  onChange: (file: File) => void;
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
}) {
  const [mode, setMode] = useState<"record" | "upload">("record");
  const [state, setState] = useState<"idle" | "requesting" | "recording" | "stopping">("idle");
  const [seconds, setSeconds] = useState(0);
  const [notice, setNotice] = useState("");
  const [url, setUrl] = useState("");
  const preview = useRef<HTMLAudioElement | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const mounted = useRef(false);
  const busy = useRef(false);
  const callbacks = useRef({ onChange, onBusyChange, onEvent });
  const initialAudio = useRef(audio);
  const changed = useRef(false);
  const requestId = useRef(0);
  const stop = useCallback((reason?: string) => {
    const current = recorder.current;
    if (!current || current.state === "inactive") return;
    if (mounted.current) { setState("stopping"); if (reason) setNotice(reason); }
    if (reason) callbacks.current.onEvent?.("recording_interrupted", { error: reason });
    current.stop();
  }, []);
  const active = state !== "idle";
  useEffect(() => { callbacks.current = { onChange, onBusyChange, onEvent }; }, [onChange, onBusyChange, onEvent]);

  useEffect(() => {
    mounted.current = true;
    void draftStore(recoveryKey).then((file) => {
      if (file && mounted.current && !changed.current && !busy.current && !initialAudio.current && !validateAudioFile(file)) {
        callbacks.current.onChange(file);
        setNotice("Your last recording was recovered from this browser. Listen before using it.");
      }
    }).catch(() => {});
    const hidden = () => { if (document.hidden) stop("Recording stopped when you left this screen. Listen to the saved take before continuing."); };
    const leave = (event: BeforeUnloadEvent) => { if (busy.current) { event.preventDefault(); event.returnValue = ""; } };
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("beforeunload", leave);
    return () => {
      mounted.current = false;
      requestId.current += 1;
      callbacks.current.onBusyChange(false);
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("beforeunload", leave);
      const current = recorder.current;
      if (current && current.state !== "inactive") current.stop();
      stream.current?.getTracks().forEach((track) => track.stop());
    };
  }, [stop, recoveryKey]);

  useEffect(() => {
    if (!audio) return;
    const objectUrl = URL.createObjectURL(audio);
    // The URL owns a browser resource and must be created/released with this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [audio]);

  function finishBusy() {
    busy.current = false;
    if (mounted.current) { setState("idle"); callbacks.current.onBusyChange(false); }
  }

  async function start() {
    if (busy.current || disabled) return;
    if (audio && !window.confirm("Start a new take? Your current audio will be replaced only after the new take is saved. Download it first if you want to keep both.")) return;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setNotice("This browser cannot record here. Open the secure HTTPS website in Safari or Chrome, or upload a recording.");
      return;
    }
    preview.current?.pause();
    const thisRequest = ++requestId.current;
    busy.current = true;
    changed.current = true;
    setState("requesting");
    callbacks.current.onBusyChange(true);
    setNotice("");
    let timer: ReturnType<typeof setInterval> | undefined;
    try {
      const source = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: false });
      if (!mounted.current || document.hidden || thisRequest !== requestId.current) {
        source.getTracks().forEach((track) => track.stop());
        if (thisRequest === requestId.current) finishBusy();
        return;
      }
      stream.current = source;
      const mimeType = formats.find((format) => MediaRecorder.isTypeSupported(format));
      const current = new MediaRecorder(source, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 64000 });
      recorder.current = current;
      const chunks: Blob[] = [];
      let bytes = 0;
      current.ondataavailable = (event) => {
        if (event.data.size) { chunks.push(event.data); bytes += event.data.size; }
        if (bytes >= maxAudioBytes && current.state !== "inactive") stop("The recording reached the size limit and was stopped. Download the take before making a shorter recording.");
      };
      current.onerror = () => stop("The microphone was interrupted. Any captured audio has been kept; listen before using it.");
      current.onstop = () => {
        clearInterval(timer);
        source.getTracks().forEach((track) => track.stop());
        stream.current = null;
        recorder.current = null;
        const type = current.mimeType || chunks[0]?.type || "audio/webm";
        const extension = type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm";
        const file = new File(chunks, `interview-${new Date().toISOString().replace(/[:.]/g, "-")}.${extension}`, { type });
        if (file.size > 0) {
          callbacks.current.onEvent?.("recording_saved", { bytes: file.size, contentType: file.type });
          if (mounted.current) callbacks.current.onChange(file);
          void draftStore(recoveryKey, file).catch(() => {
            if (mounted.current) setNotice("Your recording is ready, but this browser could not save a recovery copy. Download it before leaving.");
          });
        } else if (mounted.current) setNotice("No audio was captured. Your previous audio is still available. Try recording again.");
        finishBusy();
      };
      source.getAudioTracks().forEach((track) => {
        track.onended = () => stop("The microphone disconnected. Listen to the saved recording before continuing.");
        track.onmute = () => stop("The microphone was interrupted. Listen to the saved recording before continuing.");
      });
      current.start(1000);
      callbacks.current.onEvent?.("recording_started");
      const started = Date.now();
      setSeconds(0);
      setState("recording");
      timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - started) / 1000);
        if (mounted.current) setSeconds(Math.min(elapsed, MAX_SECONDS));
        if (elapsed >= MAX_SECONDS) stop("Your 10-minute recording is ready. Listen before generating your storybook.");
      }, 250);
    } catch (error) {
      if (thisRequest !== requestId.current) return;
      clearInterval(timer);
      stream.current?.getTracks().forEach((track) => track.stop());
      stream.current = null;
      recorder.current = null;
      callbacks.current.onEvent?.("recording_failed", { error: microphoneError(error) });
      if (mounted.current) setNotice(microphoneError(error));
      finishBusy();
    }
  }

  return (
    <section className="audio-intake" aria-label="Interview recording">
      <div className="audio-modes" role="group" aria-label="Choose audio source">
        <button type="button" aria-pressed={mode === "record"} disabled={active || disabled} onClick={() => setMode("record")}><Mic size={17} aria-hidden /> Record here</button>
        <button type="button" aria-pressed={mode === "upload"} disabled={active || disabled} onClick={() => setMode("upload")}><Upload size={17} aria-hidden /> Upload audio</button>
      </div>
      {mode === "record" ? (
        <div className="recorder-card">
          <p className="eyebrow">A conversation worth keeping</p>
          <p>Record your family interview right here. Allow microphone access when asked.</p>
          <small>Up to 10 minutes. Keep this screen open and your phone unlocked. Switching apps stops and saves the take.</small>
          <div className="recorder-actions">
            {state === "recording" || state === "stopping" ? (
              <button type="button" className="primary-button" disabled={state === "stopping"} onClick={() => stop()}><Square size={17} aria-hidden />{state === "stopping" ? "Saving recording…" : "Stop and save"}</button>
            ) : (
              <button type="button" className="primary-button" disabled={disabled || active} onClick={() => void start()}><Mic size={17} aria-hidden />{state === "requesting" ? "Waiting for microphone…" : audio ? "Record a new take" : "Start recording"}</button>
            )}
            <span className={state === "recording" ? "recording-clock is-recording" : "recording-clock"} role="timer" aria-label="Recording duration">{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</span>
          </div>
          {state === "requesting" ? <>
            <small>Use the browser’s microphone prompt to allow or deny access.</small>
            <button className="session-button" type="button" onClick={() => { requestId.current += 1; finishBusy(); setNotice("Recording cancelled. You can try again or upload audio."); }}>Cancel</button>
          </> : null}
        </div>
      ) : (
        <label className="upload-card">
          <Upload size={22} aria-hidden /><span>Upload interview audio</span>
          <small>mp3, m4a, wav, mp4, webm or ogg. Keep it under 100 MB.</small>
          <input type="file" disabled={disabled || active} accept="audio/*,video/mp4,.m4a,.mp3,.wav,.webm,.ogg" onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const error = validateAudioFile(file);
            if (error) { setNotice(error); event.target.value = ""; return; }
            changed.current = true;
            onChange(file);
            setNotice("");
          }} />
        </label>
      )}
      {notice ? <p className="recorder-notice" role="status">{notice}</p> : null}
      {audio && url ? (
        <div className="recording-preview">
          <span>{audio.name}</span>
          <small>{audio.size < 1024 * 1024 ? `${Math.ceil(audio.size / 1024)} KB` : `${(audio.size / 1024 / 1024).toFixed(1)} MB`} · Listen before generating</small>
          <audio ref={preview} key={url} src={url} controls preload="metadata" aria-label="Review interview recording" />
          <a className="session-button" href={url} download={audio.name}><Download size={16} aria-hidden /> Download recording</a>
        </div>
      ) : null}
    </section>
  );
}
