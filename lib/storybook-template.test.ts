// @vitest-environment node
import {expect,test} from "vitest";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {Cover,TitlePage,BackCover} from "../components/storybook-book-pages";
import {storybookScript} from "./storybook-typography";

test("the short cover line does not replace the full inner-title details",()=>{
  const story={title:"చేతిలో ఒక డిగ్రీ ఉండాలి",subtitle:"Full edition details\n4 September 2026",coverSubtitle:"నారాయణం రమాదేవి జ్ఞాపకాలు",sections:[]};
  const cover=renderToStaticMarkup(createElement(Cover,{story}));
  const title=renderToStaticMarkup(createElement(TitlePage,{story}));
  expect(cover).toContain(story.coverSubtitle);
  expect(cover).not.toContain("4 September 2026");
  expect(title).toContain(story.subtitle);
  const back=renderToStaticMarkup(createElement(BackCover,{story}));
  expect(back).toContain('href="https://charpai.stories.here.now"');
  const brand=back.slice(back.indexOf('class="folio-back-brand"'));
  expect(brand.indexOf('folio-back-website')).toBeLessThan(brand.indexOf('folio-book-logo'));
});

test("Telugu prose selects the reference font even with an English title",()=>{
  expect(storybookScript({title:"My story",sections:[{heading:"School",body:"మా జ్ఞాపకాలు"}]})).toBe("telugu");
  expect(storybookScript({title:"My story",sections:[{heading:"School",body:"I remember school."}]})).toBe("default");
});
