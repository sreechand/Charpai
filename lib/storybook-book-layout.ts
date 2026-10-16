import type {StorySection, StoryPhoto} from "./storybook";

export type BookReadingPage = {key:string; section:StorySection; body:string; continued:boolean};
export type ChapterEntry = {id:string; heading:string; chapter:number; page:number; position:number};
export type ContentsRow = {id:string; heading:string; continued:boolean};
export type PhotoReadingPage = {key:string; photo:StoryPhoto; body:string; continued:boolean; sectionId:string};
export type BookLeaf =
  | {kind:"imprint";key:string}
  | {kind:"title";key:string}
  | {kind:"dedication";key:string;text:string;continued:boolean}
  | {kind:"contents";key:string;rows:ContentsRow[];continued:boolean}
  | {kind:"chapter";key:string;page:BookReadingPage}
  | {kind:"photo";key:string;page:PhotoReadingPage;opensChapter:boolean}
  | {kind:"story";key:string;page:BookReadingPage;first:boolean;opensChapter:boolean};
export type NumberedLeaf = {leaf:BookLeaf;number:number};

/** Every leaf contains content. Missing artwork and continuations create no blank slot. */
export function planBook(pages:BookReadingPage[], dedication:string[], contents:ContentsRow[][], photos:PhotoReadingPage[] = []) {
  const leaves:BookLeaf[]=[{kind:"imprint",key:"imprint"},{kind:"title",key:"title"}];
  dedication.filter(text=>text.trim()).forEach((text,index)=>leaves.push({kind:"dedication",key:`dedication-${index}`,text,continued:index>0}));
  contents.filter(rows=>rows.length).forEach((rows,index)=>leaves.push({kind:"contents",key:`contents-${index}`,rows,continued:index>0}));
  let first=true;
  for (const page of pages) {
    const artwork=!page.continued && Boolean(page.section.illustrationUrl);
    if (artwork) leaves.push({kind:"chapter",key:`chapter-${page.key}`,page});
    const chapterPhotos=page.continued?[]:photos.filter(photo=>photo.sectionId===page.section.id);
    chapterPhotos.forEach((photo,index)=>leaves.push({kind:"photo",key:photo.key,page:photo,opensChapter:!artwork && index===0}));
    leaves.push({kind:"story",key:`story-${page.key}`,page,first,opensChapter:!page.continued && !artwork && !chapterPhotos.length});
    first=false;
  }
  const numbered=leaves.map((leaf,index)=>({leaf,number:index+2}));
  const spreads:NumberedLeaf[][]=[];
  for(let index=0;index<numbered.length;index+=2)spreads.push(numbered.slice(index,index+2));
  const chapters:ChapterEntry[]=[];
  for(const {leaf,number} of numbered) {
    const section=leaf.kind==="chapter"?leaf.page.section:leaf.kind==="story"&&leaf.opensChapter?leaf.page.section:leaf.kind==="photo"&&leaf.opensChapter?pages.find(page=>page.section.id===leaf.page.sectionId)?.section:undefined;
    if(section)chapters.push({id:section.id,heading:section.heading,chapter:chapters.length+1,page:number,position:Math.floor((number-2)/2)+1});
  }
  return {leaves:numbered,spreads,chapters,backCoverNumber:numbered.length+2};
}

/** Keep contents rows whole, with the same measured height budget as their printed page. */
export function groupContents(rows:ContentsRow[], measure:(row:ContentsRow)=>number, height=560):ContentsRow[][] {
  const groups:ContentsRow[][]=[];
  let group:ContentsRow[]=[], used=0;
  for(const row of rows) {
    const size=measure(row);
    if(group.length && used+size>height) {groups.push(group);group=[];used=0;}
    group.push(row);used+=size;
  }
  if(group.length)groups.push(group);
  return groups.length?groups:[[]];
}
