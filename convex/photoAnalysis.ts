import {getAuthUserId} from "@convex-dev/auth/server";
import {RateLimiter,HOUR} from "@convex-dev/rate-limiter";
import {ConvexError,v} from "convex/values";
import {mutation,type MutationCtx} from "./_generated/server";
import {components} from "./_generated/api";
import type {Id} from "./_generated/dataModel";
import {photoAnalysisRecord} from "./photoAnalysisFields";

const limiter=new RateLimiter(components.funnelRateLimiter,{photoAnalysis:{kind:"token bucket",rate:30,period:HOUR,capacity:10}});
async function owned(ctx:MutationCtx,storageId:Id<"_storage">) {
  const userId=await getAuthUserId(ctx);
  if(!userId)throw new ConvexError({status:401,message:"Sign in to analyze a photo."});
  const photo=await ctx.db.query("generationPhotos").withIndex("by_storage_id",q=>q.eq("storageId",storageId)).unique();
  if(!photo || photo.userId!==userId)throw new ConvexError({status:403,message:"You do not have access to this family photo."});
  return photo;
}
export const prepare=mutation({
  args:{storageId:v.id("_storage"),contextKey:v.string()},
  returns:v.object({url:v.string(),token:v.union(v.string(),v.null()),cached:v.union(photoAnalysisRecord,v.null())}),
  handler:async(ctx,args)=>{
    const photo=await owned(ctx,args.storageId);
    if(args.contextKey.length>100)throw new ConvexError({status:400,message:"Invalid photo context."});
    const url=await ctx.storage.getUrl(args.storageId);
    if(!url)throw new ConvexError({status:400,message:"This photograph is unavailable. Upload it again."});
    if(photo.analysis?.contextKey===args.contextKey)return {url,token:null,cached:photo.analysis};
    if(photo.analysisLease && photo.analysisLease.expiresAt>Date.now())throw new ConvexError({status:409,message:"This photo is already being analyzed. Try again in a moment."});
    const limit=await limiter.limit(ctx,"photoAnalysis",{key:photo.userId});
    if(!limit.ok)throw new ConvexError({status:429,message:"Please wait before analyzing more photos. You can still describe and place them yourself."});
    const token=crypto.randomUUID();
    await ctx.db.patch(photo._id,{analysisLease:{token,contextKey:args.contextKey,expiresAt:Date.now()+120000}});
    return {url,token,cached:null};
  }
});
export const complete=mutation({
  args:{storageId:v.id("_storage"),token:v.string(),analysis:photoAnalysisRecord},returns:v.boolean(),
  handler:async(ctx,args)=>{
    const photo=await owned(ctx,args.storageId);
    if(photo.analysisLease?.token!==args.token || photo.analysisLease.contextKey!==args.analysis.contextKey)return false;
    if(args.analysis.description.length>2000 || args.analysis.reason.length>800)throw new Error("Photo description is too long.");
    await ctx.db.patch(photo._id,{analysis:args.analysis,analysisLease:undefined});return true;
  }
});
export const release=mutation({args:{storageId:v.id("_storage"),token:v.string()},returns:v.null(),handler:async(ctx,args)=>{
  const photo=await owned(ctx,args.storageId);
  if(photo.analysisLease?.token===args.token)await ctx.db.patch(photo._id,{analysisLease:undefined});
  return null;
}});
export const updateDetails=mutation({args:{storageId:v.id("_storage"),title:v.string(),description:v.string()},returns:v.null(),handler:async(ctx,args)=>{
  const photo=await owned(ctx,args.storageId);
  if(args.title.length>120 || args.description.length>30000)throw new Error("Keep the title under 120 characters and description under 30,000 characters.");
  await ctx.db.patch(photo._id,{title:args.title,description:args.description});return null;
}});
