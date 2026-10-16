import {expect,test} from "vitest";
import {photoAnalysisKey,photoAnalysisPrompt,validatePhotoAnalysis} from "./photo-analysis";
import {photoSection,normalizePhotos} from "./storybook-photos";
const input={storageId:"original",title:"Family",description:"My first day teaching",sections:[{id:"home",heading:"Home",body:"The family home."},{id:"school",heading:"School",body:"I began teaching."}]};
test("AI chapter selection must match a real chapter and be confident; manual placement outranks it",()=>{
 const result=validatePhotoAnalysis({description:"A classroom with desks.",sectionId:"school",confidence:"high",reason:"Matches the teaching chapter."},input);
 expect(photoSection({id:"p",title:"",description:"",suggestedSectionId:result.sectionId!},input.sections)).toBe("school");
 expect(photoSection({id:"p",title:"",description:"",suggestedSectionId:"school",sectionId:"home"},input.sections)).toBe("home");
 expect(validatePhotoAnalysis({...result,confidence:"low"},input).sectionId).toBeNull();
 expect(()=>validatePhotoAnalysis({...result,sectionId:"invented"},input)).toThrow(/match a chapter/);
 expect(normalizePhotos([{id:"p",title:"",description:"",suggestedSectionId:"school"}])[0].suggestedSectionId).toBe("school");
});
test("changing a caption or any chapter wording invalidates a cached match; prompt retains user context",()=>{
 const key=photoAnalysisKey(input);
 expect(photoAnalysisKey({...input,description:"Actually my village home"})).not.toBe(key);
 expect(photoAnalysisKey({...input,sections:input.sections.map(s=>({...s,body:s.body+" A correction."}))})).not.toBe(key);
 expect(JSON.parse(photoAnalysisPrompt(input)).userDescription).toBe(input.description);
 expect(JSON.parse(photoAnalysisPrompt({...input,sections:[]})).chapters).toEqual([]);
});
