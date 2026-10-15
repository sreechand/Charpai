// @vitest-environment node
import {afterEach,expect,test,vi} from "vitest";
import {PDFDocument,PDFArray,PDFDict,PDFName} from "pdf-lib";
import {toPng} from "html-to-image";
import {createStorybookPdf,storybookPdfFilename,STORYBOOK_WEBSITE} from "./storybook-pdf";
vi.mock("html-to-image",()=>({getFontEmbedCSS:vi.fn(async()=>""),toPng:vi.fn(async()=>"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=")}));
afterEach(()=>{vi.unstubAllGlobals();vi.clearAllMocks();});
function fixture(destination="6") {
 const rect={left:10,top:10,right:40,bottom:40};
 const pages=Array.from({length:8},(_,index)=>({color:index===0||index===5?"rgb(46, 108, 121)":"rgb(244, 240, 229)",scrollHeight:908,clientHeight:908,querySelector:()=>null,getBoundingClientRect:()=>({left:0,top:0}),querySelectorAll:()=>index===4?[{dataset:{bookPage:destination},href:"#chapter-1",getBoundingClientRect:()=>rect}]:index===6?[{dataset:{},href:"https://example.test/story?t=2.5",getBoundingClientRect:()=>rect}]:[]}));
 vi.stubGlobal("document",{fonts:{ready:Promise.resolve()}});
 vi.stubGlobal("getComputedStyle",(node:{color:string})=>({backgroundColor:node.color}));
 return {pages,container:{dataset:{paginationReady:"true"},querySelectorAll:(selector:string)=>selector==="img"?[]:pages} as unknown as HTMLElement};
}
test.each([
 ["చేతిలో ఒక డిగ్రీ ఉండాలి", "Charpai_చేతిలో_ఒక_డిగ్రీ_ఉండాలి.pdf"],
 ["  Family / memories: 1980?  ", "Charpai_Family_memories_1980.pdf"],
 ["", "Charpai_Storybook.pdf"],
])("download filename preserves the story name and Charpai prefix: %s",(title,expected)=>{
 expect(storybookPdfFilename(title)).toBe(expected);
});
test("exported PDF metadata includes the website and original Telugu title",async()=>{
 const {container}=fixture();const title="చేతిలో ఒక డిగ్రీ ఉండాలి";
 const pdf=await PDFDocument.load(await createStorybookPdf(container,title));
 expect(pdf.getTitle()).toBe(title);
 expect(pdf.getCreator()).toBe(`Charpai (${STORYBOOK_WEBSITE})`);
 expect(pdf.getSubject()).toBe(STORYBOOK_WEBSITE);
 expect(pdf.getKeywords()).toContain(STORYBOOK_WEBSITE);
});
test("PDF export preserves each page's actual cover/chapter/paper color",async()=>{
 const {container}=fixture();await createStorybookPdf(container,"Family memories");
 expect(vi.mocked(toPng).mock.calls[0][1]?.backgroundColor).toBe("rgb(46, 108, 121)");
 expect(vi.mocked(toPng).mock.calls[1][1]?.backgroundColor).toBe("rgb(244, 240, 229)");
 expect(vi.mocked(toPng).mock.calls[5][1]?.backgroundColor).toBe("rgb(46, 108, 121)");
});
test("contents link to the actual future PDF chapter leaf while timestamps stay external",async()=>{
 const {container}=fixture();const pdf=await PDFDocument.load(await createStorybookPdf(container,"Family memories"));
 const contents=pdf.getPage(4).node.lookup(PDFName.of("Annots"),PDFArray).lookup(0,PDFDict);
 expect(contents.lookup(PDFName.of("Dest"),PDFArray).get(0).toString()).toBe(pdf.getPage(5).ref.toString());
 const source=pdf.getPage(6).node.lookup(PDFName.of("Annots"),PDFArray).lookup(0,PDFDict);
 expect(source.lookup(PDFName.of("A"),PDFDict).get(PDFName.of("URI"))?.toString()).toContain("https://example.test/story?t=2.5");
});
test("invalid contents destinations and overflowing front matter block export",async()=>{
 const bad=fixture("90");await expect(createStorybookPdf(bad.container,"Family")).rejects.toThrow(/outside this book/);
 const overflow=fixture();overflow.pages[2].scrollHeight=1000;await expect(createStorybookPdf(overflow.container,"Family")).rejects.toThrow(/needs more room/);
});
