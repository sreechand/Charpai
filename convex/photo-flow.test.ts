/// <reference types="vite/client" />
import {convexTest} from "convex-test";
import {expect,test} from "vitest";
import schema from "./schema";
import {api} from "./_generated/api";
import {demoDraft} from "../lib/storybook";
const modules=import.meta.glob("./**/*.ts");
test("photos retain originals, captions and placement across public read and owner reopening",async()=>{
 const t=convexTest(schema,modules);
 const {owner,other,run,photo,foreign}=await t.run(async ctx=>{
  const owner=await ctx.db.insert("users",{}),other=await ctx.db.insert("users",{});
  const run=await ctx.db.insert("runs",{userId:owner,buyerName:"",email:"",elderName:"Fictional",relationship:"Parent",originPlace:"Home",languageMix:"English",hasAudio:false,photoCount:1,status:"draft_ready",createdAt:1,updatedAt:1});
  const photo=await ctx.storage.store(new Blob(["original photo"],{type:"image/png"}));
  const foreign=await ctx.storage.store(new Blob(["other original"],{type:"image/png"}));
  for(const [userId,storageId] of [[owner,photo],[other,foreign]] as const)await ctx.db.insert("generationPhotos",{userId,storageId,fileName:"fictional.png",contentType:"image/png",size:14,createdAt:1});
  return {owner,other,run,photo,foreign};
 });
 const user=t.withIdentity({subject:`${owner}|session`});
 const {illustrationUrl,photos,...source}=demoDraft();void illustrationUrl;void photos;
 const draft={...source,illustrationStorageId:undefined,sections:source.sections.map(({id,heading,body})=>({id,heading,body})),photos:[{id:"photo",storageId:photo,title:"School",description:"My own caption.",sectionId:source.sections[1].id,suggestedSectionId:source.sections[0].id}]};
 await expect(user.mutation(api.storybookPages.publish,{runId:run,draft:{...draft,photos:[{...draft.photos[0],storageId:foreign}]}})).rejects.toThrow(/access/);
 const saved=await user.mutation(api.storybookPages.publish,{runId:run,draft});
 const publicBook=await t.query(api.storybookPages.getPublicBySlug,{slug:saved.slug});
 expect(publicBook?.photos?.[0]).toMatchObject({title:"School",description:"My own caption.",sectionId:source.sections[1].id});
 expect(publicBook?.photos?.[0].url).toBeTruthy();
 expect(publicBook?.photos?.[0]).not.toHaveProperty("storageId");
 const reopened=await user.query(api.storybookPages.getOwnedByPage,{pageId:saved._id});
 expect(JSON.parse(reopened!.draftJson).photos[0]).toMatchObject(draft.photos[0]);
 expect(await t.withIdentity({subject:`${other}|session`}).query(api.storybookPages.getOwnedByPage,{pageId:saved._id})).toBeNull();
 await expect(t.query(api.storybookPages.getOwnedByPage,{pageId:saved._id})).rejects.toThrow(/Sign in/);
 const updated=await user.mutation(api.storybookPages.publish,{runId:run,draft:{...draft,photos:[{...draft.photos[0],description:"A corrected memory."}]}});
 expect(updated.slug).toBe(saved.slug);
 expect(updated.photos?.[0].description).toBe("A corrected memory.");
 expect(await t.run(async ctx=>await (await ctx.storage.get(photo))!.text())).toBe("original photo");
});
