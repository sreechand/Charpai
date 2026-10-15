import {expect,test} from "vitest";
import {bookChapters,groupContents,type BookReadingPage} from "./storybook-book-layout";
const page=(id:string,continued=false):BookReadingPage=>({key:id+continued,section:{id,heading:id,body:"Full memory"},body:"Full memory",continued});
test("contents destinations follow actual exported leaves, including long chapters",()=>{
 const chapters=bookChapters([page("school"),page("school",true),page("home")],2);
 expect(chapters).toEqual([{id:"school",heading:"school",chapter:1,page:6,position:3},{id:"home",heading:"home",chapter:2,page:10,position:5}]);
});
test("extra contents/dedication spreads move every chapter destination consistently",()=>{
 expect(bookChapters([page("school")],4)[0]).toMatchObject({page:10,position:5});
});
test("contents pagination retains every chapter and continuation heading in order",()=>{
 const rows=Array.from({length:23},(_,i)=>({id:String(i),heading:`Memory ${i}`,continued:false}));
 const groups=groupContents(rows,()=>100,560);
 expect(groups.map(g=>g.length)).toEqual([5,5,5,5,3]);expect(groups.flat()).toEqual(rows);
});
