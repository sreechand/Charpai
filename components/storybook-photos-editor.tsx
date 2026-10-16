"use client";
import type {PhotoPreview} from "@/lib/files";
import type {StorySection} from "@/lib/storybook";
import {MAX_PHOTO_TITLE,photoSection} from "@/lib/storybook-photos";

export function StorybookPhotosEditor({photos,sections,onChange,onRemove,onRetry,onAnalyze,disabled=false}:{photos:PhotoPreview[];sections:StorySection[];onChange:(id:string,patch:Partial<PhotoPreview>)=>void;onRemove:(id:string)=>void;onRetry?:(id:string)=>void;onAnalyze?:(id:string)=>void;disabled?:boolean}) {
  if(!photos.length)return null;
  return <section className="storybook-photo-editor" aria-label="Family photographs"><header><h3>Your photographs</h3><p>AI looks at each original and suggests a place in your book. Add names, places or dates you know to help it. You can change every description and chapter choice.</p><p>Your original colours and proportions stay unchanged. Photo analysis uses OpenAI.</p></header>
    {photos.map((photo,index)=>{
      const placed=photoSection({id:photo.id,title:photo.title||"",description:photo.description||"",sectionId:photo.sectionId,suggestedSectionId:photo.suggestedSectionId},sections);
      return <div className="storybook-photo-card" key={photo.id}>
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.url} alt={photo.title||`Family photograph ${index+1}`}/>
        </figure>
        <small>{photo.name}</small>
        {photo.uploadError?<div role="alert"><p>{photo.uploadError}</p>{onRetry?<button className="session-button" type="button" disabled={disabled} onClick={()=>onRetry(photo.id)}>Retry photo upload</button>:null}</div>:null}
        <label>Photo title (optional)<input value={photo.title||""} maxLength={MAX_PHOTO_TITLE} disabled={disabled} aria-label={`Title for photo ${index+1}`} onChange={e=>onChange(photo.id,{title:e.target.value,suggestedSectionId:undefined})}/></label>
        <label>Description (optional)<textarea value={photo.description||""} maxLength={30000} placeholder="Who or what is shown? Where and when was this taken?" rows={3} disabled={disabled} aria-label={`Description for photo ${index+1}`} onChange={e=>onChange(photo.id,{description:e.target.value,suggestedSectionId:undefined})}/></label>
        {photo.analysis?<div className="photo-analysis-note"><h4>AI suggestion · review before using</h4><p>{photo.analysis.description}</p><button className="session-button" type="button" disabled={disabled || photo.analysisStatus==="analyzing"} onClick={()=>onChange(photo.id,{description:photo.analysis!.description,suggestedSectionId:photo.analysis!.sectionId||undefined})}>Use this description</button><p>{photo.analysis.reason}</p>{photo.analysis.confidence==="low" && sections.length?<p>No clear chapter match. Add more details or choose a chapter below.</p>:null}</div>:null}
        {photo.analysisError?<p role="alert" className="photo-analysis-error">{photo.analysisError}</p>:null}
        {onAnalyze?<div className="photo-analysis-actions"><button className="session-button" type="button" disabled={disabled || !photo.storageId || photo.analysisStatus==="analyzing"} onClick={()=>onAnalyze(photo.id)}>{photo.analysisStatus==="analyzing"?"Analyzing photo…":photo.analysis?"Update AI suggestion":"Analyze photo"}</button>{photo.analysisStatus==="analyzing"?<p role="status">Looking at the original{sections.length?" and finding the closest chapter":". Chapter placement follows when your story is ready"}.</p>:null}</div>:null}
        {sections.length?<><label>Place in book<select value={photo.sectionId||""} disabled={disabled} aria-label={`Chapter for photo ${index+1}`} onChange={e=>onChange(photo.id,{sectionId:e.target.value||undefined})}><option value="">Automatic placement</option>{sections.map((section,index)=><option key={section.id} value={section.id}>Chapter {index+1}: {section.heading}</option>)}</select></label>{!photo.sectionId?<small>{photo.suggestedSectionId?"AI-selected chapter":"Current chapter"}: {sections.find(section=>section.id===placed)?.heading}</small>:<small>Your chapter choice takes priority over AI.</small>}</>:<small>You can choose a chapter once your story is ready.</small>}
        <button className="session-button" type="button" disabled={disabled} onClick={()=>onRemove(photo.id)} aria-label={`Remove photo ${index+1}`}>Remove photo</button>
      </div>;
    })}
  </section>;
}
