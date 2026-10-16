import {expect,test} from "vitest";
import {normalizePhotos,photoSection} from "./storybook-photos";
const sections=[{id:"home",heading:"Life at home",body:"Family memories."},{id:"school",heading:"Besant School",body:"I taught the UKG class."},{id:"village",heading:"A new village",body:"My next posting."}];
test("a unique caption match places an original near the related chapter; the user can override it",()=>{
 const photo={id:"p",title:"Besant School",description:"",url:"/unchanged.png"};
 expect(photoSection(photo,sections)).toBe("school");
 expect(photoSection({...photo,sectionId:"home"},sections)).toBe("home");
 expect(photoSection({...photo,title:"Our photograph"},sections)).toBe("village");
 expect(photoSection(photo,[])).toBeUndefined();
});
test("long descriptions and original URLs survive normalization without truncation",()=>{
 const photo={id:"p",title:"My school",description:"Every detail. ".repeat(1000),url:"/original.png",storageId:"storage",sectionId:"school"};
 expect(normalizePhotos([photo])).toEqual([photo]);
 expect(()=>normalizePhotos([photo,photo])).toThrow(/different ID/);
 expect(()=>normalizePhotos([{...photo,title:"x".repeat(121)}])).toThrow(/120/);
});
