"use client";

import {useId, useRef, useState} from "react";
import {Pencil, RefreshCw} from "lucide-react";
import type {StorybookDraft} from "@/lib/storybook";
import {StorybookReader} from "./storybook-reader";

export function StorybookEditor({draft, onRegenerate, onSave, allowRecordingSharing = true, disabled = false, storyUrl, audioUrl, allowExport, onBeforeExport, onAfterExport}: {
  draft: StorybookDraft;
  onRegenerate: (edited: StorybookDraft) => void;
  onSave?: () => Promise<void>;
  allowRecordingSharing?: boolean;
  disabled?: boolean;
  storyUrl?: string;
  audioUrl?: string | null;
  allowExport: boolean;
  onBeforeExport?: () => Promise<void>;
  onAfterExport?: () => Promise<void>;
}) {
  const [edited, setEdited] = useState<StorybookDraft | null>(null);
  const [regenerated, setRegenerated] = useState(false);
  const editButton = useRef<HTMLButtonElement>(null);
  const editorId = useId();
  const update = (key: keyof StorybookDraft, value: string | boolean) => setEdited(current => current ? {...current, [key]: value} : current);
  function finish() {setEdited(null); requestAnimationFrame(() => editButton.current?.focus());}

  return <>
    <div className="folio-text-actions screen-only">
      <button ref={editButton} type="button" className="secondary-button" disabled={disabled || Boolean(edited)}
        aria-expanded={Boolean(edited)} aria-controls={editorId}
        onClick={() => {setEdited(draft); setRegenerated(false);}}><Pencil size={17} aria-hidden />Edit story text</button>
      {onSave && !edited ? <button type="button" className="secondary-button" disabled={disabled || draft.coverageNeedsReview} onClick={() => void onSave()}>Save changes</button> : null}
      <p role="status">{edited ? "Your book keeps its current text until you regenerate it." : regenerated ? "Storybook regenerated. Your wording is preserved." : "Refine the wording, then regenerate the book. No extra credit needed."}</p>
    </div>
    {edited ? <form id={editorId} className="folio-edit-fields screen-only" onSubmit={event => {
      event.preventDefault();
      onRegenerate(edited); setRegenerated(true); finish();
    }}>
      <h3>Edit story text</h3>
      <p>Update any wording below. Regenerate storybook uses your exact text and keeps your photographs and illustrations.</p>
      <fieldset disabled={disabled}>
        <label>Book title<input autoFocus required value={edited.title} onChange={event => update("title", event.target.value)} /></label>
        <label>Short cover subtitle (optional)<input value={edited.coverSubtitle || ""} onChange={event => update("coverSubtitle", event.target.value)} /></label>
        <label>Subtitle<textarea value={edited.subtitle} onChange={event => update("subtitle", event.target.value)} rows={3} /></label>
        <label>Dedication<textarea value={edited.dedication} onChange={event => update("dedication", event.target.value)} rows={3} /></label>
        {edited.sections.map((section, index) => <div className="folio-edit-chapter" key={section.id}>
          <label>Chapter {index + 1} heading<input required value={section.heading} onChange={event => setEdited(current => current ? {...current, sections: current.sections.map(item => item.id === section.id ? {...item, heading: event.target.value} : item)} : current)} /></label>
          <label>Chapter {index + 1} text<textarea required value={section.body} onChange={event => setEdited(current => current ? {...current, sections: current.sections.map(item => item.id === section.id ? {...item, body: event.target.value} : item)} : current)} rows={10} /></label>
        </div>)}
        <label>Closing note<textarea value={edited.closingNote} onChange={event => update("closingNote", event.target.value)} rows={4} /></label>
        {allowRecordingSharing ? <><label className="folio-recording-choice"><input type="checkbox" checked={edited.shareRecording === true} onChange={event => update("shareRecording", event.target.checked)} />Include recording in shared story</label>
        <p>The recording stays private unless you enable this and save the book.</p></> : null}
        <div className="folio-text-actions">
          <button type="submit" className="primary-button"><RefreshCw size={17} aria-hidden />Regenerate storybook</button>
          <button type="button" className="secondary-button" onClick={finish}>Cancel edits</button>
        </div>
      </fieldset>
    </form> : null}
    <StorybookReader story={draft} storyUrl={storyUrl} audioUrl={audioUrl} showExport={allowExport && !edited && !disabled}
      showTextDownload={!edited && !disabled} onBeforeExport={onBeforeExport} onAfterExport={onAfterExport} />
  </>;
}
