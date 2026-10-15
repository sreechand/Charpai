"use client";
import {useEffect, useRef, useState} from "react";
import {formatSourceTime} from "@/lib/storybook-source";

export type AudioTarget = {start: number; end: number; key: string};
export function SourceAudioPlayer({url, target, label = "Original recording"}: {url: string | null; target?: AudioTarget | null; label?: string}) {
  const player = useRef<HTMLAudioElement>(null), replayEnd = useRef<number | null>(null);
  const [error, setError] = useState(""), [retry, setRetry] = useState(0), [mediaReady,setMediaReady] = useState(false);
  const start = target?.start, end = target?.end, targetKey = target?.key;
  useEffect(() => {
    const audio = player.current;
    if (!audio) return;
    if (start === undefined) {audio.pause();replayEnd.current=null;return;}
    const seek = () => {audio.pause(); replayEnd.current = null; audio.currentTime = Math.max(0, Math.min(start, Number.isFinite(audio.duration) ? audio.duration : start));};
    if (audio.readyState >= 1) seek();
    else audio.addEventListener("loadedmetadata", seek, {once: true});
    return () => audio.removeEventListener("loadedmetadata", seek);
  }, [targetKey, start, end, url, retry]);

  async function replay() {
    const audio = player.current; if (!audio || !target) return;
    setError("");
    try {audio.currentTime = target.start; replayEnd.current = target.end;await audio.play();} catch {setError("The recording could not play. Try the player controls or retry loading it.");}
  }
  return <div className="source-audio-player screen-only">
    <strong>{label}</strong>
    {target ? <span>Listen at {formatSourceTime(target.start)}–{formatSourceTime(target.end)}</span> : null}
    {url ? <audio ref={player} key={`${url}:${retry}`} controls preload="metadata" src={url} aria-label={label}
      onLoadStart={() => setMediaReady(false)} onLoadedMetadata={() => setMediaReady(true)}
      onError={() => {setMediaReady(false);setError("The recording could not load. Your response is still here.");}}
      onSeeking={() => {const audio = player.current; if (audio && replayEnd.current !== null && target && Math.abs(audio.currentTime - target.start) > 0.5) replayEnd.current = null;}}
      onTimeUpdate={() => {const audio = player.current; if (audio && replayEnd.current !== null && audio.currentTime >= replayEnd.current) {audio.pause(); replayEnd.current = null;}}} /> : <p>The recording is unavailable. You can still read the excerpt and clarify it.</p>}
    {url && !mediaReady && !error ? <span role="status">Loading recording…</span> : null}
    {target && url ? <button className="session-button" type="button" disabled={!mediaReady} onClick={() => void replay()}>Replay this passage</button> : null}
    {error ? <p role="alert">{error} <button type="button" className="session-button" onClick={() => {setError(""); setRetry(n => n + 1);}}>Retry recording</button></p> : null}
  </div>;
}
