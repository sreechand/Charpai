"use client";
import {useCallback,useEffect,useRef,useState,type Dispatch,type SetStateAction} from "react";
import type {PhotoPreview} from "@/lib/files";
import type {StorySection} from "@/lib/storybook";
import {photoAnalysisKey,type PhotoAnalysis} from "@/lib/photo-analysis";

export function usePhotoAnalysis({photos,setPhotos,sections,authToken,bookKey}:{photos:PhotoPreview[];setPhotos:Dispatch<SetStateAction<PhotoPreview[]>>;sections:StorySection[];authToken:string|null;bookKey:string|null}) {
  const latest=useRef({photos,setPhotos,sections,authToken,bookKey});
  useEffect(()=>{latest.current={photos,setPhotos,sections,authToken,bookKey};});
  const inflight=useRef(new Map<string,symbol>());
  const attempted=useRef(new Set<string>());
  const [epoch,setEpoch]=useState(0);
  const analyze=useCallback(async(id:string)=>{
    const snapshot=latest.current;
    const photo=snapshot.photos.find(p=>p.id===id);
    if(!photo?.storageId || !snapshot.authToken || inflight.current.has(photo.storageId))return;
    const marker=Symbol();inflight.current.set(photo.storageId,marker);
    const input={storageId:photo.storageId,title:photo.title||"",description:photo.description||"",sections:snapshot.sections.map(({id,heading,body})=>({id,heading,body}))};
    const contextKey=photoAnalysisKey(input);
    snapshot.setPhotos(current=>current.map(p=>p.id===id?{...p,analysisStatus:"analyzing",analysisError:undefined,suggestedSectionId:p.analysis?.contextKey===contextKey?p.suggestedSectionId:undefined}:p));
    try {
      const response=await fetch("/api/analyze-photo",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${snapshot.authToken}`},body:JSON.stringify(input)});
      const result=await response.json() as {analysis?:PhotoAnalysis;error?:string};
      if(!response.ok || !result.analysis)throw new Error(result.error||"The photo could not be analyzed.");
      if(latest.current.bookKey!==snapshot.bookKey)return;
      snapshot.setPhotos(current=>current.map(p=>{
        if(p.id!==id)return p;
        const nowKey=photoAnalysisKey({title:p.title||"",description:p.description||"",sections:latest.current.sections});
        if(nowKey!==contextKey)return {...p,analysisStatus:undefined,analysisError:"The photo details or chapters changed. Analyze again to update the suggestion."};
        return {...p,analysis:result.analysis,analysisStatus:undefined,analysisError:undefined,suggestedSectionId:result.analysis?.sectionId||undefined};
      }));
    }catch(error){
      if(latest.current.bookKey===snapshot.bookKey)snapshot.setPhotos(current=>current.map(p=>p.id===id?{...p,analysisStatus:"failed",analysisError:error instanceof Error?error.message:"Photo analysis failed. Add your own description or retry."}:p));
    }finally{if(inflight.current.get(photo.storageId)===marker)inflight.current.delete(photo.storageId);setEpoch(value=>value+1);}
  },[]);
  const chapterKey=photoAnalysisKey({title:"",description:"",sections});
  const uploads=photos.map(p=>p.storageId||"").join(":");
  useEffect(()=>{
    for(const photo of latest.current.photos){
      if(!photo.storageId || !latest.current.authToken || inflight.current.has(photo.storageId))continue;
      const key=`${bookKey}:${photo.storageId}:${chapterKey}`;
      if(attempted.current.has(key))continue;
      attempted.current.add(key);
      const expected=photoAnalysisKey({title:photo.title||"",description:photo.description||"",sections:latest.current.sections});
      if(photo.analysis?.contextKey===expected)continue;
      void analyze(photo.id);
    }
  },[bookKey,chapterKey,uploads,authToken,epoch,analyze]);
  return analyze;
}
