import {expect,test} from "vitest";
import {planBook,groupContents,type BookReadingPage,type PhotoReadingPage} from "./storybook-book-layout";
const page=(id:string,continued=false,art=false):BookReadingPage=>({key:id+continued,section:{id,heading:id,body:"Full memory",...(art?{illustrationUrl:"/stamp.png"}:{})},body:"Full memory",continued});
test("chapters without artwork and their continuations occupy real prose leaves only",()=>{
 const plan=planBook([page("school"),page("school",true),page("home")],[],[[{id:"school",heading:"school",continued:false},{id:"home",heading:"home",continued:false}]]);
 expect(plan.leaves.map(({leaf})=>leaf.kind)).toEqual(["imprint","title","contents","story","story","story"]);
 expect(plan.chapters).toEqual([{id:"school",heading:"school",chapter:1,page:5,position:2},{id:"home",heading:"home",chapter:2,page:7,position:3}]);
 expect(plan.leaves.filter(({leaf})=>leaf.kind==="story").map(({leaf})=>leaf.kind==="story"&&leaf.page.body)).toEqual(["Full memory","Full memory","Full memory"]);
 expect(plan.spreads.flat()).toEqual(plan.leaves);
});
test("artwork, caption continuations and long front matter determine contents destinations",()=>{
 const photo:PhotoReadingPage={key:"photo",photo:{id:"p",url:"/original.png",title:"School",description:"Full caption"},body:"Full caption",continued:false,sectionId:"home"};
 const plan=planBook([page("school",false,true),page("school",true),page("home")],["Dedication","More dedication"],[[{id:"school",heading:"school",continued:false}],[{id:"home",heading:"home",continued:false}]],[photo,{...photo,key:"photo2",continued:true,body:"Continued caption"}]);
 expect(plan.leaves.map(({leaf})=>leaf.kind)).toEqual(["imprint","title","dedication","dedication","contents","contents","chapter","story","story","photo","photo","story"]);
 expect(plan.chapters).toEqual([{id:"school",heading:"school",chapter:1,page:8,position:4},{id:"home",heading:"home",chapter:2,page:11,position:5}]);
 expect(plan.backCoverNumber).toBe(14);
});
test("an odd leaf count never pads the last spread with an empty page",()=>{
 const plan=planBook([page("school")],[],[]);
 expect(plan.spreads.map(spread=>spread.length)).toEqual([2,1]);
 expect(plan.backCoverNumber).toBe(5);
});
test("contents pagination retains every chapter and continuation heading in order",()=>{
 const rows=Array.from({length:23},(_,i)=>({id:String(i),heading:`Memory ${i}`,continued:false}));
 const groups=groupContents(rows,()=>100,560);
 expect(groups.map(g=>g.length)).toEqual([5,5,5,5,3]);expect(groups.flat()).toEqual(rows);
});
