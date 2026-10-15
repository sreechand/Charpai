import type {StorySection} from "./storybook";

export type BookReadingPage = {key:string; section:StorySection; body:string; continued:boolean};
export type ChapterEntry = {id:string; heading:string; chapter:number; page:number; position:number};
export type ContentsRow = {id:string; heading:string; continued:boolean};

/** Both the reader position and PDF leaf number come from the same spread order. */
export function bookChapters(pages:BookReadingPage[], frontSpreads:number):ChapterEntry[] {
  const chapters:ChapterEntry[]=[];
  for (const [index,page] of pages.entries()) {
    if (page.continued) continue;
    const position=frontSpreads+index+1;
    chapters.push({id:page.section.id,heading:page.section.heading,chapter:chapters.length+1,page:position*2,position});
  }
  return chapters;
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
