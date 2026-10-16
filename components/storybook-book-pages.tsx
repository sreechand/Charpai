import type {StorySection} from "@/lib/storybook";
import type {BookReadingPage,ChapterEntry,ContentsRow,PhotoReadingPage} from "@/lib/storybook-book-layout";
import {ArtifactImage} from "./storybook-artwork";

type BookIdentity={title:string;subtitle:string;coverSubtitle?:string;sections:StorySection[];illustrationUrl?:string|null;stampSubject?:string};
export function BookLogo({className=""}:{className?:string}) {
 // eslint-disable-next-line @next/next/no-img-element
 return <img className={`folio-book-logo ${className}`} src="/landing/charpai-back-cover-logo.png" alt="Charpai" width="601" height="161"/>;
}
export function Cover({story,exporting=false}:{story:BookIdentity;exporting?:boolean}) {
 const subtitle=story.coverSubtitle??story.subtitle;
 const image=story.sections.find(s=>s.illustrationUrl)?.illustrationUrl||story.illustrationUrl;
 const subject=story.sections.find(s=>s.illustrationUrl)?.artifactSubject||story.stampSubject||"Story artifact";
 return <article className={`folio-page folio-cover${story.title.length>70||subtitle.length>100?" folio-cover-compact":""}`} aria-label="Front cover" data-export-page={exporting||undefined}>
  <div className="folio-cover-frame"><p className="folio-book-label">A family story</p>
   {image?<div className="folio-cover-medallion"><ArtifactImage src={image} alt={subject}/></div>:<div className="folio-cover-rule" aria-hidden="true"/>}
   <div className="folio-cover-title"><h2>{story.title}</h2>{subtitle?<p>{subtitle}</p>:null}</div><BookLogo className="folio-book-logo-light"/>
  </div></article>;
}
export function ImprintPage({exporting=false}:{exporting?:boolean}) {
 return <article className="folio-page folio-imprint-page" aria-label="About this edition" data-export-page={exporting||undefined}><div><BookLogo/><p>A family story, kept in words.</p><p>This edition brings together the memories in this storybook. Source timestamps, where available, refer to the original recording.</p></div></article>;
}
export function TitlePage({story,exporting=false}:{story:BookIdentity;exporting?:boolean}) {
 return <article className={`folio-page folio-title-page${story.title.length>70||story.subtitle.length>100?" folio-title-compact":""}`} aria-label="Title page" data-export-page={exporting||undefined}><p className="folio-book-label">Family memories</p><div><h2>{story.title}</h2>{story.subtitle?<p className="folio-title-subtitle">{story.subtitle}</p>:null}<span className="folio-title-rule" aria-hidden="true"/></div><BookLogo/></article>;
}
export function DedicationPage({text,continued=false,exporting=false}:{text?:string;continued?:boolean;exporting?:boolean}) {
 return <article className="folio-page folio-dedication-page" aria-label={text?"Dedication":"Blank facing page"} data-export-page={exporting||undefined}>{text?<div><p className="folio-book-label">{continued?"Dedication · continued":"Dedication"}</p><div className="folio-dedication-copy">{text.split(/\n\s*\n/).map((p,i)=><p key={i}>{p}</p>)}</div></div>:null}</article>;
}
export function ContentsPage({rows,chapters,continued=false,onNavigate,exporting=false}:{rows:ContentsRow[];chapters:ChapterEntry[];continued?:boolean;onNavigate?:(position:number)=>void;exporting?:boolean}) {
 return <article className="folio-page folio-contents-page" aria-label="Contents" data-export-page={exporting||undefined}><h2>Contents{continued?<small>continued</small>:null}</h2><ol className="folio-contents-list">{rows.map((row,index)=>{
 const chapter=chapters.find(c=>c.id===row.id)!;
 return <li key={`${row.id}:${index}`}><a href={`#chapter-${chapter.chapter}`} data-book-page={chapter.page} onClick={!onNavigate?undefined:e=>{e.preventDefault();onNavigate(chapter.position);}}><span><small>Chapter {String(chapter.chapter).padStart(2,"0")}{row.continued?" · continued":""}</small><span>{row.heading}</span></span><span className="folio-contents-number">{chapter.page}</span></a></li>;
 })}</ol></article>;
}
export function ChapterOpening({page,chapter,number=chapter.page,exporting=false}:{page:BookReadingPage;chapter:ChapterEntry;number?:number;exporting?:boolean}) {
 return <article className="folio-page folio-chapter-opening" id={exporting?undefined:`chapter-${chapter.chapter}`} aria-label={`Chapter ${chapter.chapter}: ${chapter.heading}`} data-export-page={exporting||undefined}>
 <p className="folio-book-label">Chapter {String(chapter.chapter).padStart(2,"0")}</p>
 {page.section.illustrationUrl?<figure className="folio-chapter-art"><ArtifactImage src={page.section.illustrationUrl} alt={page.section.artifactSubject||"Story artifact"}/></figure>:<div className="folio-chapter-rule" aria-hidden="true"/>}
 <h2>{chapter.heading}</h2><footer><span/><span>{number}</span></footer></article>;
}
export function PhotographPage({page,number,chapter,opensChapter=false,exporting=false}:{page:PhotoReadingPage;number:number;chapter?:ChapterEntry;opensChapter?:boolean;exporting?:boolean}) {
 return <article className={`folio-page folio-photo-page${page.continued?" folio-photo-caption-page":""}`} id={!exporting&&opensChapter&&chapter?`chapter-${chapter.chapter}`:undefined} aria-label={`Photograph: ${page.photo.title||"Family photograph"}${page.continued?" · continued":""}`} data-export-page={exporting||undefined}>
  <figure>{!page.continued?<div className="folio-photo-mount">
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img src={page.photo.url||undefined} alt={page.photo.title||page.photo.description||"Family photograph"} crossOrigin="anonymous"/>
  </div>:null}<figcaption>{page.photo.title?<h2>{page.photo.title}</h2>:null}<div className="folio-photo-caption-copy">{page.body.split(/\n\s*\n/).filter(Boolean).map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div></figcaption></figure>
  <footer><span>{page.continued?"Photograph · continued":chapter?.heading}</span><span>{number}</span></footer>
 </article>;
}
export function BackCover({story,exporting=false}:{story:BookIdentity;exporting?:boolean}) {
 return <article className="folio-page folio-back-cover" aria-label="Back cover" data-export-page={exporting||undefined}><div className="folio-back-frame"><p className="folio-book-label">Family memories</p><h2>{story.title}</h2><span className="folio-title-rule" aria-hidden="true"/><div className="folio-back-brand"><a className="folio-back-website" href="https://charpai.stories.here.now">charpai.stories.here.now</a><BookLogo className="folio-book-logo-light"/></div></div></article>;
}
