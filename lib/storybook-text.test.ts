import {expect, test} from "vitest";
import {emptyDraft} from "./storybook";
import {applyStoryText, storybookText, storybookTextFilename} from "./storybook-text";

function fixture() {
  return {...emptyDraft(), title:"మా జ్ఞాపకాలు", subtitle:"Full edition", coverSubtitle:"Cover line", dedication:"For our family",
    transcript:"PRIVATE TRANSCRIPT", closingNote:"The end", sourceRevision:3,
    sections:[{id:"home", heading:"Our home", body:"First paragraph.\n\nLast paragraph.", illustrationUrl:"/stamp.png", sourceIds:["source1"], sourceLinks:[{paragraph:0,start:2,end:5}]}],
    photos:[{id:"photo",title:"School photo",description:"Unchanged original",url:"/original.png",sectionId:"home"}]};
}

test("text export preserves all final text and captions without leaking the private transcript",()=>{
  const story=fixture();
  const result=storybookText(story);
  for(const text of [story.title, story.subtitle, story.coverSubtitle, story.dedication, story.sections[0].heading, story.sections[0].body, story.closingNote, "School photo", "Unchanged original"]) expect(result).toContain(text);
  expect(result).not.toContain("PRIVATE TRANSCRIPT");
  expect(result).not.toContain("/original.png");
  expect(storybookTextFilename(story.title)).toBe("Charpai_మా_జ్ఞాపకాలు.txt");
  expect(storybookTextFilename("../../<> ")).toBe("Charpai_Storybook.txt");
});

test("regeneration retains exact edited text and current assets, invalidates changed paragraph timing and requires source review",()=>{
  const story={...fixture(),coverage:[]};
  const edited={...story,title:"Revised title",sections:[{...story.sections[0],body:"Updated wording.\n\nమా జ్ఞాపకాలు"}],photos:[]};
  const result=applyStoryText(story,edited);
  expect(result.title).toBe(edited.title);
  expect(result.sections[0].body).toBe(edited.sections[0].body);
  expect(result.sections[0].sourceLinks).toBeUndefined();
  expect(result.sections[0]).toMatchObject({sourceIds: story.sections[0].sourceIds});
  expect(result.sections[0].illustrationUrl).toBe("/stamp.png");
  expect(result).toMatchObject({photos: story.photos});
  expect(result.transcript).toBe(story.transcript);
  expect(result.sourceRevision).toBe(3);
  expect(result.coverageNeedsReview).toBe(true);
  expect(story.sections[0].body).toContain("First paragraph.");
});

test("title-only edits preserve timing and do not create an unnecessary review; unresolved review stays required",()=>{
  const story={...fixture(),coverage:[]};
  const result=applyStoryText(story,{...story,title:"New title"});
  expect(result.sections[0].sourceLinks).toEqual(story.sections[0].sourceLinks);
  expect(result.coverageNeedsReview).toBe(false);
  expect(applyStoryText({...story,coverageNeedsReview:true},story).coverageNeedsReview).toBe(true);
});
