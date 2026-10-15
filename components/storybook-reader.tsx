"use client";

import {SourceAudioPlayer, type AudioTarget} from "./source-audio-player";
import {formatSourceTime, type SourceLink} from "@/lib/storybook-source";
import type {CSSProperties} from "react";
import { Fragment, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import QRCode from "qrcode";
import type { StorySection } from "@/lib/storybook";
import { paginateStoryText } from "@/lib/storybook-pagination";
import {storybookScript} from "@/lib/storybook-typography";
import {bookChapters,groupContents,type BookReadingPage,type ContentsRow} from "@/lib/storybook-book-layout";
import {Cover,BackCover,ImprintPage,TitlePage,DedicationPage,ContentsPage,ChapterOpening} from "./storybook-book-pages";

export type ReaderStory = {
  title: string; subtitle: string; coverSubtitle?: string; dedication: string; closingNote: string;
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

export function StorybookReader({ story, storyUrl, showExport = true, audioUrl, onBeforeExport, onAfterExport }: {
  story: ReaderStory; storyUrl?: string; showExport?: boolean; audioUrl?: string | null; onBeforeExport?: () => Promise<void>; onAfterExport?: () => Promise<void>;
}) {
  const [audioTarget, setAudioTarget] = useState<AudioTarget | null>(null);
  const script = useMemo(() => storybookScript(story), [story]);
  const seekSource = (link: SourceLink) => setAudioTarget({...link,key:`story:${link.start}:${Date.now()}`});
  const search = useSyncExternalStore(subscribeOrigin, () => window.location.search, () => "");
  const queryTime = new URLSearchParams(search).get("t");
  const linkedTime = queryTime !== null && Number.isFinite(Number(queryTime)) && Number(queryTime) >= 0 ? Number(queryTime) : null;
  const playerTarget = audioTarget || (linkedTime !== null ? {start:linkedTime,end:linkedTime+30,key:`link:${linkedTime}`} : null);
  const [layout,setLayout] = useState<{pages:ReadingPage[];dedication:string[];contents:ContentsRow[][]}>({pages:[],dedication:[],contents:[]});
  const {pages}=layout;
  const [position, setPosition] = useState(0);
  const origin = useSyncExternalStore(subscribeOrigin, () => window.location.origin, () => "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
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
          probe.className="folio-measure";
          const measure=(text:string)=>{probe.replaceChildren(...paragraphNodes(text,section));return probe.getBoundingClientRect().height;};
          const content=[section.body,index===story.sections.length-1?story.closingNote:""].filter(Boolean).join("\n\n");
          const height=Math.max(160,670-headingHeight-(section.hasClarifications?50:0));
          const chunks=paginateStoryText(content,height,measure,index===0?Math.max(160,height-82):height);
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
        if(!cancelled)setLayout({pages:output,dedication,contents});
      } finally {probe.remove();}
    }
    void paginate();
    return () => { cancelled = true; };
  }, [story, script]);

  const frontPairs=Math.max(1,layout.contents.length,layout.dedication.length);
  const frontSpreads=1+frontPairs;
  const chapters=bookChapters(pages,frontSpreads);
  const lastPosition=frontSpreads+pages.length+1;
  const current=Math.min(position,lastPosition);
  const isBackCover=current===lastPosition;
  const bodyIndex=current-frontSpreads-1;
  const visiblePage=bodyIndex>=0?pages[bodyIndex]:undefined;
  const chapter=visiblePage?chapters.find(c=>c.id===visiblePage.section.id):undefined;
  const pageLabel=current===0?"Front cover":isBackCover?"Back cover":current===1?"Title page":current<=frontSpreads?"Contents & dedication":`Chapter ${chapter?.chapter} · pages ${current*2}–${current*2+1}`;
  const move=(direction:number)=>setPosition(Math.max(0,Math.min(lastPosition,current+direction)));
  const frontMatter=(pair:number,exporting=false)=><Fragment>
    <DedicationPage text={layout.dedication[pair]} continued={pair>0} exporting={exporting}/>
    {layout.contents[pair]?<ContentsPage rows={layout.contents[pair]} chapters={chapters} continued={pair>0} onNavigate={exporting?undefined:setPosition} exporting={exporting}/>:<DedicationPage exporting={exporting}/>}
  </Fragment>;

  async function exportBook() {
    setBusy(true); setError("");
    try {
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
      {showExport ? <button type="button" className="folio-export" disabled={busy || !pages.length} onClick={exportBook}>
        <Download size={17} aria-hidden />{busy ? "Creating PDF…" : "Export PDF"}
      </button> : null}
    </div>
    {!storyUrl ? <p className="folio-unsaved screen-only">Save the story to add its QR code and online link.</p> : null}
    {error ? <p role="alert" className="folio-export-error screen-only">{error}</p> : null}
    {audioUrl ? <div className="reader-recording"><SourceAudioPlayer url={audioUrl} target={playerTarget} label="Story recording" /></div> : null}
    <div className={`folio-spread-viewport screen-only${readerWidth>=760 && current>0 && !isBackCover?" is-spread":""}`} style={{"--book-scale":Math.min(readerWidth,1280)/1280} as CSSProperties}>
    <div className={`folio-stage${current === 0 || isBackCover ? " folio-closed" : ""}`}>
      {current === 0 ? <Cover story={story}/> : isBackCover ? <BackCover story={story}/> : current===1 ? <><ImprintPage/><TitlePage story={story}/></> : current<=frontSpreads ? frontMatter(current-2) : visiblePage && chapter ? <Fragment key={visiblePage.key}>
        <ChapterOpening page={visiblePage} chapter={chapter}/>
        <StoryPage page={visiblePage} url={absoluteUrl} number={current*2+1} first={bodyIndex===0} onSeek={audioUrl?seekSource:undefined}/>
      </Fragment> : null}
    </div>
    </div>
    <nav className="folio-navigation screen-only" aria-label="Turn storybook pages">
      <button type="button" onClick={() => move(-1)} disabled={current === 0} aria-label="Previous pages"><ChevronLeft aria-hidden /></button>
      <span aria-live="polite">{current === 0 ? "Open the book" : pageLabel}</span>
      <button type="button" onClick={() => move(1)} disabled={current >= lastPosition || !pages.length} aria-label="Next pages"><ChevronRight aria-hidden /></button>
    </nav>
    <div className="folio-export-pages" ref={exportRef} aria-hidden="true" inert data-pagination-ready={pages.length > 0}>
      <Cover story={story} exporting />
      <ImprintPage exporting/><TitlePage story={story} exporting/>
      {Array.from({length:frontPairs},(_,index)=><Fragment key={`front-${index}`}>{frontMatter(index,true)}</Fragment>)}
      {pages.map((page,index)=><Fragment key={page.key}>
        <ChapterOpening page={page} chapter={chapters.find(c=>c.id===page.section.id)!} exporting/>
        <StoryPage page={page} url={absoluteUrl} number={(frontSpreads+index+1)*2+1} first={index===0} exporting/>
      </Fragment>)}
      <BackCover story={story} exporting/>
    </div>
  </section>;
}

function StoryPage({ page, url, number, first, exporting = false, onSeek }: { page: ReadingPage; url: string; number: number; first:boolean; exporting?: boolean; onSeek?: (link: SourceLink) => void }) {
  return <article className="folio-page folio-story-page" data-export-page={exporting || undefined}>
    {first && url ? <div className="folio-story-qr-header"><StoryQrCode url={url} /></div> : null}
    <header className="folio-running-head">{page.section.heading}</header>
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
