import {v,type Infer} from "convex/values";
import type {MutationCtx,QueryCtx} from "./_generated/server";
import type {Id} from "./_generated/dataModel";
import {MAX_PHOTO_TITLE,MAX_STORY_PHOTOS} from "../lib/storybook-photos";

export const storedStoryPhoto=v.object({id:v.string(),storageId:v.id("_storage"),title:v.string(),description:v.string(),sectionId:v.optional(v.string()),suggestedSectionId:v.optional(v.string())});
export const publicStoryPhoto=v.object({id:v.string(),url:v.union(v.string(),v.null()),title:v.string(),description:v.string(),sectionId:v.optional(v.string()),suggestedSectionId:v.optional(v.string())});
export type StoredStoryPhoto=Infer<typeof storedStoryPhoto>;

export async function requireOwnedPhoto(ctx:QueryCtx|MutationCtx,storageId:Id<"_storage">,ownerId:Id<"users">) {
  const photo=await ctx.db.query("generationPhotos").withIndex("by_storage_id",q=>q.eq("storageId",storageId)).unique();
  if(!photo || photo.userId!==ownerId)throw new Error("You do not have access to this family photo.");
}
export async function requireOwnedPhotos(ctx:QueryCtx|MutationCtx,photos:StoredStoryPhoto[],sections:{id:string}[],ownerId:Id<"users">) {
  if(photos.length>MAX_STORY_PHOTOS || new Set(photos.map(p=>p.id)).size!==photos.length || new Set(photos.map(p=>p.storageId)).size!==photos.length)throw new Error("Choose up to three different family photos.");
  for(const photo of photos) {
    if(!photo.id || photo.title.length>MAX_PHOTO_TITLE)throw new Error(`Keep photo titles within ${MAX_PHOTO_TITLE} characters.`);
    if(photo.sectionId && !sections.some(section=>section.id===photo.sectionId))throw new Error("Choose an existing chapter for the photo.");
    if(photo.suggestedSectionId && !sections.some(section=>section.id===photo.suggestedSectionId))throw new Error("Update the photo suggestion or choose an existing chapter.");
    await requireOwnedPhoto(ctx,photo.storageId,ownerId);
  }
}
export async function resolvePhotos(ctx:QueryCtx|MutationCtx,photos:StoredStoryPhoto[]) {
  return await Promise.all(photos.map(async({storageId,...photo})=>({...photo,url:await ctx.storage.getUrl(storageId)})));
}
