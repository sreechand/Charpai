"use client";

import {SourceAudioPlayer, type AudioTarget} from "./source-audio-player";
import {formatSourceTime, type SourceLink} from "@/lib/storybook-source";
import type {CSSProperties} from "react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import QRCode from "qrcode";
import {downloadStorybookText} from "@/lib/storybook-text";
import type { StorySection, StoryPhoto } from "@/lib/storybook";
import { paginateStoryText } from "@/lib/storybook-pagination";
import {photoSection} from "@/lib/storybook-photos";
import {storybookScript} from "@/lib/storybook-typography";
import {planBook,groupContents,type BookReadingPage,type ContentsRow,type PhotoReadingPage,type NumberedLeaf} from "@/lib/storybook-book-layout";
import {Cover,BackCover,ImprintPage,TitlePage,DedicationPage,ContentsPage,ChapterOpening,PhotographPage} from "./storybook-book-pages";

export type ReaderStory = {
  title: string; subtitle: string; coverSubtitle?: string; dedication: string; closingNote: string;
  photos?: StoryPhoto[];
  sections: StorySection[]; stampSubject?: string; illustrationUrl?: string | null;
};
type ReadingPage = BookReadingPage;

export function StoryQrCode({ url }: { url: string }) {
  const qr = useMemo(() => QRCode.create(url, { errorCorrectionLevel: "M" }), [url]);
  const size = qr.modules.size;
  const cells: string[] = [];
  for (let row = 0; row < size; row++) for (let col = 0; col < size; col++) {
    if (qr.modules.get(row, col)) cells.push(`M${col + 4},${row + 4}h1v1h-1z`);
  }
  return <a href={url} className="folio-qr" aria-label="Open this story online">
    <svg viewBox={`0 0 ${size + 8} ${size + 8}`} role="img" aria-label="QR code for this story" shapeRendering="crispEdges">
      <rect width={size + 8} height={size + 8} fill="#f4f0e5" />
      <path d={cells.join("")} fill="#2e6c79" />
    </svg>
  </a>;
}

export function StorybookReader({ story, storyUrl, showExport = true, showTextDownload = true, audioUrl, onBeforeExport, onAfterExport }: {
  story: ReaderStory; storyUrl?: string; showExport?: boolean; showTextDownload?: boolean; audioUrl?: string | null; onBeforeExport?: () => Promise<void>; onAfterExport?: () => Promise<void>;
}) {
  const [audioTarget, setAudioTarget] = useState<AudioTarget | null>(null);
  const script = useMemo(() => storybookScript(story), [story]);
  const seekSource = (link: SourceLink) => setAudioTarget({...link,key:`story:${link.start}:${Date.now()}`});
  const search = useSyncExternalStore(subscribeOrigin, () => window.location.search, () => "");
  const queryTime = new URLSearchParams(search).get("t");
  const linkedTime = queryTime !== null && Number.isFinite(Number(queryTime)) && Number(queryTime) >= 0 ? Number(queryTime) : null;
  const playerTarget = audioTarget || (linkedTime !== null ? {start:linkedTime,end:linkedTime+30,key:`link:${linkedTime}`} : null);
  const [layout,setLayout] = useState<{pages:ReadingPage[];dedication:string[];contents:ContentsRow[][];photos:PhotoReadingPage[]}>({pages:[],dedication:[],contents:[],photos:[]});
  const {pages}=layout;
  const [position, setPosition] = useState(0);
  const origin = useSyncExternalStore(subscribeOrigin, () => window.location.origin, () => "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const missingPhoto=Boolean(story.photos?.some(photo=>!photo.url));
  const exportRef = useRef<HTMLDivElement>(null);
  const readerRef=useRef<HTMLElement>(null);
  const [readerWidth,setReaderWidth]=useState(0);
  useEffect(()=>{
    const node=readerRef.current;if(!node)return;
    const observer=new ResizeObserver(entries=>setReaderWidth(entries[0].contentRect.width));
    observer.observe(node);return()=>observer.disconnect();
  },[]);
  const absoluteUrl = storyUrl ? (/^https?:\/\//.test(storyUrl) ? storyUrl : origin ? new URL(storyUrl, origin).href : "") : "";

  useEffect(() => {
    let cancelled = false;
    async function paginate() {
      await document.fonts.ready;
      if (cancelled) return;
      const probe = document.createElement("div");
      probe.className = "folio-measure";
      probe.dataset.storyScript = script;
      document.body.appendChild(probe);
      const paragraphNodes=(text:string,section?:StorySection)=>text.split(/\n\s*\n/).map((paragraph,paragraphIndex)=>{
        const node=document.createElement("p");node.textContent=paragraph;
        if(section && paragraphIndex===0 && /^[A-Za-zÀ-ÖØ-öø-ÿ]/.test(paragraph))node.className="folio-opening-paragraph";
        if(section){
          const index=section.body.split(/\n\s*\n/).findIndex(original=>original.replace(/\s+/g," ").includes(paragraph.replace(/\s+/g," ")));
          for(const link of section.sourceLinks?.filter(l=>l.paragraph===index)||[]){const a=document.createElement("a");a.className="source-time";a.textContent=`Source at ${formatSourceTime(link.start)}–${formatSourceTime(link.end)}`;node.append(a);}
        }
        return node;
      });
      try {
        const output:ReadingPage[]=[];
        for(const [index,source] of story.sections.entries()){
          const section={...source,artifactSubject:source.artifactSubject||(index===0?story.stampSubject:""),illustrationUrl:source.illustrationUrl||(index===0?story.illustrationUrl:null)};
          probe.className="folio-measure folio-measure-heading";probe.textContent=section.heading;
          const headingHeight=probe.getBoundingClientRect().height;
          probe.className="folio-measure folio-measure-chapter-title";
          const chapterHeadingHeight=probe.getBoundingClientRect().height;
          probe.className="folio-measure";
          const measure=(text:string)=>{probe.replaceChildren(...paragraphNodes(text,section));return probe.getBoundingClientRect().height;};
          const content=[section.body,index===story.sections.length-1?story.closingNote:""].filter(Boolean).join("\n\n");
          const height=Math.max(160,670-headingHeight-(section.hasClarifications?50:0));
          const firstHeight=section.illustrationUrl?height:Math.max(100,height-chapterHeadingHeight-49);
          const chunks=paginateStoryText(content,height,measure,index===0?Math.max(100,firstHeight-82):firstHeight);
          for(const [part,body] of chunks.entries())output.push({key:`${index}-${part}`,section,body,continued:part>0});
        }
        probe.className="folio-measure folio-measure-dedication";
        const dedication=paginateStoryText(story.dedication,600,text=>{probe.replaceChildren(...paragraphNodes(text));return probe.getBoundingClientRect().height;});
        const rows:ContentsRow[]=[];
        for(const section of story.sections){
          probe.className="folio-measure folio-measure-toc-heading";
          const fragments=paginateStoryText(section.heading,440,text=>{probe.textContent=text;return probe.getBoundingClientRect().height;});
          for(const [index,heading] of fragments.entries())rows.push({id:section.id,heading,continued:index>0});
        }
        probe.className="folio-measure folio-measure-contents";
        const contents=groupContents(rows,row=>{
          const list=document.createElement("ol");list.className="folio-contents-list";
          const item=document.createElement("li"),link=document.createElement("a"),title=document.createElement("span"),small=document.createElement("small"),heading=document.createElement("span"),number=document.createElement("span");
          small.textContent="Chapter 01";heading.textContent=row.heading;number.className="folio-contents-number";number.textContent="999";
          title.append(small,heading);link.append(title,number);item.append(link);list.append(item);probe.replaceChildren(list);
          return probe.getBoundingClientRect().height;
        });
        const photos:PhotoReadingPage[]=[];
        for(const photo of story.photos || []) {
          const sectionId=photoSection(photo,story.sections);
          if(!photo.url || !sectionId)continue;
          probe.className="folio-measure folio-measure-photo-title";probe.textContent=photo.title;
          const titleHeight=photo.title?probe.getBoundingClientRect().height+16:0;
          probe.className="folio-measure folio-measure-photo-caption";
          const measure=(text:string)=>{probe.replaceChildren(...paragraphNodes(text));return probe.getBoundingClientRect().height;};
          const chunks=photo.description.trim()?paginateStoryText(photo.description,680-titleHeight,measure,Math.max(40,680-titleHeight-416)):[""];
          chunks.forEach((body,index)=>photos.push({key:`photo-${photo.id}-${index}`,photo,body,continued:index>0,sectionId}));
        }
        if(!cancelled)setLayout({pages:output,dedication,contents,photos});
      } finally {probe.remove();}
    }
    void paginate();
    return () => { cancelled = true; };
  }, [story, script]);

  const plan=planBook(pages,layout.dedication,layout.contents,layout.photos);
  const lastPosition=plan.spreads.length+1;
  const current=Math.min(position,lastPosition);
  const isBackCover=current===lastPosition;
  const visibleSpread=plan.spreads[current-1];
  const pageLabel=current===0?"Front cover":isBackCover?"Back cover":`Pages ${visibleSpread?.map(page=>page.number).join("–")||""}`;
  const move=(direction:number)=>setPosition(Math.max(0,Math.min(lastPosition,current+direction)));
  const renderLeaf=({leaf,number}:NumberedLeaf,exporting=false)=>{
    switch(leaf.kind){
      case "imprint":return <ImprintPage key={leaf.key} exporting={exporting}/>;
      case "title":return <TitlePage key={leaf.key} story={story} exporting={exporting}/>;
      case "dedication":return <DedicationPage key={leaf.key} text={leaf.text} continued={leaf.continued} exporting={exporting}/>;
      case "contents":return <ContentsPage key={leaf.key} rows={leaf.rows} chapters={plan.chapters} continued={leaf.continued} onNavigate={exporting?undefined:setPosition} exporting={exporting}/>;
      case "chapter":return <ChapterOpening key={leaf.key} page={leaf.page} chapter={plan.chapters.find(c=>c.id===leaf.page.section.id)!} number={number} exporting={exporting}/>;
      case "photo":return <PhotographPage key={leaf.key} page={leaf.page} chapter={plan.chapters.find(c=>c.id===leaf.page.sectionId)} number={number} opensChapter={leaf.opensChapter} exporting={exporting}/>;
      case "story":return <StoryPage key={leaf.key} page={leaf.page} chapter={plan.chapters.find(c=>c.id===leaf.page.section.id)!} opensChapter={leaf.opensChapter} url={absoluteUrl} number={number} first={leaf.first} exporting={exporting} onSeek={exporting||!audioUrl?undefined:seekSource}/>;
    }
  };

  async function exportBook() {
    setBusy(true); setError("");
    try {
      if(missingPhoto)throw new Error("A family photograph is unavailable. Upload it again before exporting.");
      await onBeforeExport?.();
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      if (!exportRef.current) throw new Error("The storybook is still loading.");
      const { downloadStorybookPdf } = await import("@/lib/storybook-pdf");
      await downloadStorybookPdf(exportRef.current, story.title);
      await onAfterExport?.();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The PDF could not be created. Try again."); }
    finally { setBusy(false); }
  }

  return <section ref={readerRef} className="folio-reader" data-story-script={script} aria-label="Storybook reader">
    <div className="folio-toolbar screen-only">
      <span>{pageLabel}</span>
      <div className="folio-download-actions">
      {showTextDownload ? <button type="button" className="folio-export" disabled={busy || !story.sections.length} onClick={() => {
        try {downloadStorybookText(story); setError("");}
        catch {setError("The text could not be downloaded. Try again.");}
      }}><Download size={17} aria-hidden />Download text</button> : null}
      {showExport ? <button type="button" className="folio-export" disabled={busy || !pages.length || missingPhoto} onClick={exportBook}>
        <Download size={17} aria-hidden />{busy ? "Creating PDF…" : "Export PDF"}
      </button> : null}
      </div>
    </div>
    {!storyUrl ? <p className="folio-unsaved screen-only">Save the story to add its QR code and online link.</p> : null}
    {missingPhoto?<p role="alert" className="folio-export-error screen-only">A family photograph is unavailable. It needs to be uploaded again before PDF export.</p>:null}
    {error ? <p role="alert" className="folio-export-error screen-only">{error}</p> : null}
    {audioUrl ? <div className="reader-recording"><SourceAudioPlayer url={audioUrl} target={playerTarget} label="Story recording" /></div> : null}
    <div className={`folio-spread-viewport screen-only${readerWidth>=760 && current>0 && !isBackCover && visibleSpread?.length===2?" is-spread":""}`} style={{"--book-scale":Math.min(readerWidth,1280)/1280} as CSSProperties}>
    <div className={`folio-stage${current===0||isBackCover||visibleSpread?.length===1?" folio-closed":""}`}>
      {current===0?<Cover story={story}/>:isBackCover?<BackCover story={story}/>:visibleSpread?.map(page=>renderLeaf(page))}
    </div>
    </div>
    <nav className="folio-navigation screen-only" aria-label="Turn storybook pages">
      <button type="button" onClick={() => move(-1)} disabled={current === 0} aria-label="Previous pages"><ChevronLeft aria-hidden /></button>
      <span aria-live="polite">{current === 0 ? "Open the book" : pageLabel}</span>
      <button type="button" onClick={() => move(1)} disabled={current >= lastPosition || !pages.length} aria-label="Next pages"><ChevronRight aria-hidden /></button>
    </nav>
    <div className="folio-export-pages" ref={exportRef} aria-hidden="true" inert data-pagination-ready={pages.length > 0}>
      <Cover story={story} exporting />
      {plan.leaves.map(page=>renderLeaf(page,true))}
      <BackCover story={story} exporting/>
    </div>
  </section>;
}

function StoryPage({ page, chapter, opensChapter, url, number, first, exporting = false, onSeek }: { page: ReadingPage; chapter: import("@/lib/storybook-book-layout").ChapterEntry; opensChapter:boolean; url: string; number: number; first:boolean; exporting?: boolean; onSeek?: (link: SourceLink) => void }) {
  return <article className="folio-page folio-story-page" id={!exporting&&opensChapter?`chapter-${chapter.chapter}`:undefined} data-export-page={exporting || undefined}>
    {first && url ? <div className="folio-story-qr-header"><StoryQrCode url={url} /></div> : null}
    {!page.continued&&!page.section.illustrationUrl?<div className="folio-prose-chapter-heading"><p className="folio-book-label">Chapter {String(chapter.chapter).padStart(2,"0")}</p><h2>{page.section.heading}</h2></div>:<header className="folio-running-head">{page.section.heading}</header>}
    {page.section.hasClarifications ? <p className="source-clarification-note">Includes confirmed family clarifications. The recording keeps the original wording.</p> : null}
    <div className="folio-prose">{page.body.split(/\n\s*\n/).map((paragraph, index) => {
      const originalIndex = page.section.body.split(/\n\s*\n/).findIndex(original => original.replace(/\s+/g," ").includes(paragraph.replace(/\s+/g," ")));
      const links = page.section.sourceLinks?.filter(link => link.paragraph === originalIndex) || [];
      return <p key={index} className={!page.continued && index===0 && /^[A-Za-zÀ-ÖØ-öø-ÿ]/.test(paragraph)?"folio-opening-paragraph":undefined}>{paragraph}{links.map((link, linkIndex) => <a key={`${link.start}:${link.end}:${linkIndex}`} className="source-time" data-source-link href={url ? `${url}?t=${link.start}` : undefined} onClick={exporting || !onSeek ? undefined : e => {e.preventDefault();onSeek(link);}}>{onSeek ? "Listen at" : "Source at"} {formatSourceTime(link.start)}–{formatSourceTime(link.end)}</a>)}</p>;
    })}</div>
    <footer><span /><span>{page.continued ? "Continued · " : ""}{number}</span></footer>
  </article>;
}

const subscribeOrigin = () => () => {};
