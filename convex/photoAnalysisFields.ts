import {v} from "convex/values";
export const photoAnalysisRecord=v.object({contextKey:v.string(),description:v.string(),sectionId:v.union(v.string(),v.null()),confidence:v.union(v.literal("high"),v.literal("low")),reason:v.string()});
