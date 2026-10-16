/// <reference types="vite/client" />
import {convexTest} from "convex-test";
import rateLimiter from "@convex-dev/rate-limiter/test";
import {expect,test} from "vitest";
import schema from "./schema";
import {api} from "./_generated/api";
const modules=import.meta.glob("./**/*.ts");
async function setup(){
 const t=convexTest(schema,modules);rateLimiter.register(t,"funnelRateLimiter");
 const ids=await t.run(async ctx=>{
  const owner=await ctx.db.insert("users",{}),other=await ctx.db.insert("users",{});
  const storageId=await ctx.storage.store(new Blob(["fictional photo"],{type:"image/png"}));
  await ctx.db.insert("generationPhotos",{userId:owner,storageId,fileName:"fictional.png",contentType:"image/png",size:14,createdAt:1});
  return {owner,other,storageId};
 });
 return {t,...ids,user:t.withIdentity({subject:`${ids.owner}|session`})};
}
test("only the owner can analyze, update or complete a photo; duplicate work is cached",async()=>{
 const {t,user,other,storageId}=await setup();
 await expect(t.mutation(api.photoAnalysis.prepare,{storageId,contextKey:"key"})).rejects.toThrow(/Sign in/);
 await expect(t.withIdentity({subject:`${other}|session`}).mutation(api.photoAnalysis.prepare,{storageId,contextKey:"key"})).rejects.toThrow(/access/);
 await expect(t.withIdentity({subject:`${other}|session`}).mutation(api.photoAnalysis.updateDetails,{storageId,title:"x",description:"x"})).rejects.toThrow(/access/);
 const start=await user.mutation(api.photoAnalysis.prepare,{storageId,contextKey:"key"});expect(start.url).toBeTruthy();
 await expect(user.mutation(api.photoAnalysis.prepare,{storageId,contextKey:"key"})).rejects.toThrow(/already/);
 const analysis={contextKey:"key",description:"A fictional classroom.",sectionId:"school",confidence:"high" as const,reason:"Matches the supplied chapter."};
 expect(await user.mutation(api.photoAnalysis.complete,{storageId,token:"stale",analysis})).toBe(false);
 await expect(t.withIdentity({subject:`${other}|session`}).mutation(api.photoAnalysis.complete,{storageId,token:start.token!,analysis})).rejects.toThrow(/access/);
 expect(await user.mutation(api.photoAnalysis.complete,{storageId,token:start.token!,analysis})).toBe(true);
 expect((await user.mutation(api.photoAnalysis.prepare,{storageId,contextKey:"key"})).cached).toEqual(analysis);
 await user.mutation(api.photoAnalysis.updateDetails,{storageId,title:"My title",description:"My correction"});
 const record=await t.run(ctx=>ctx.db.query("generationPhotos").withIndex("by_storage_id",q=>q.eq("storageId",storageId)).unique());
 expect(record?.description).toBe("My correction");expect(record?.analysis?.description).toBe(analysis.description);
});
test("failed analysis releases its lock and per-account limits bound paid requests",async()=>{
 const {user,storageId}=await setup();
 for(let i=0;i<10;i++){
  const start=await user.mutation(api.photoAnalysis.prepare,{storageId,contextKey:`key${i}`});
  await user.mutation(api.photoAnalysis.release,{storageId,token:start.token!});
 }
 await expect(user.mutation(api.photoAnalysis.prepare,{storageId,contextKey:"one-too-many"})).rejects.toThrow(/wait/);
});
