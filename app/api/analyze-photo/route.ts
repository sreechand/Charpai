import {NextResponse} from "next/server";
import {ConvexHttpClient} from "convex/browser";
import {ConvexError} from "convex/values";
import OpenAI from "openai";
import sharp from "sharp";
import {api} from "@/convex/_generated/api";
import type {Id} from "@/convex/_generated/dataModel";
import {photoAnalysisInput,photoAnalysisKey,photoAnalysisPrompt,validatePhotoAnalysis,PHOTO_ANALYSIS_INSTRUCTIONS,PHOTO_ANALYSIS_SCHEMA} from "@/lib/photo-analysis";

export const runtime="nodejs";
export const maxDuration=120;

export async function POST(request:Request) {
  const token=request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if(!token)return NextResponse.json({error:"Sign in to analyze a photo."},{status:401});
  const url=process.env.NEXT_PUBLIC_CONVEX_URL;
  if(!url || !process.env.OPENAI_API_KEY)return NextResponse.json({error:"Photo analysis is unavailable. You can describe and place the photo yourself."},{status:503});
  const text=await request.text();
  if(text.length>1000000)return NextResponse.json({error:"This book is too large for automatic photo placement. Choose a chapter yourself."},{status:413});
  let raw:unknown;try{raw=JSON.parse(text);}catch{return NextResponse.json({error:"Invalid photo details."},{status:400});}
  const parsed=photoAnalysisInput.safeParse(raw);
  if(!parsed.success)return NextResponse.json({error:"Check the photo details and try again."},{status:400});
  const input=parsed.data,storageId=input.storageId as Id<"_storage">;
  const client=new ConvexHttpClient(url);client.setAuth(token);
  let lease:string|null=null;
  try {
    const prepared=await client.mutation(api.photoAnalysis.prepare,{storageId,contextKey:photoAnalysisKey(input)});
    if(prepared.cached)return NextResponse.json({analysis:prepared.cached});
    lease=prepared.token;
    if(!lease)throw new Error("Photo analysis could not start.");
    const original=await fetch(prepared.url,{signal:AbortSignal.timeout(20000),cache:"no-store"});
    if(!original.ok)throw new Error("The original photo could not be loaded.");
    const bytes=Buffer.from(await original.arrayBuffer());
    if(bytes.length>10*1024*1024)throw new Error("The photo is too large.");
    // Analysis copy only. The stored original and book rendering stay unchanged.
    const preview=await sharp(bytes,{limitInputPixels:64000000,animated:false}).rotate().resize({width:1600,height:1600,fit:"inside",withoutEnlargement:true}).jpeg({quality:85}).toBuffer();
    const openai=new OpenAI({timeout:75000,maxRetries:0});
    const response=await openai.responses.create({
      model:process.env.OPENAI_PHOTO_MODEL || "gpt-5-mini",store:false,max_output_tokens:4000,
      reasoning:{effort:"low"},instructions:PHOTO_ANALYSIS_INSTRUCTIONS,
      input:[{role:"user",content:[{type:"input_text",text:photoAnalysisPrompt(input)},{type:"input_image",image_url:`data:image/jpeg;base64,${preview.toString("base64")}`,detail:"high"}]}],
      text:{format:{type:"json_schema",name:"photo_analysis",strict:true,schema:PHOTO_ANALYSIS_SCHEMA}}
    });
    if(!response.output_text)throw new Error("No photo description was returned.");
    const analysis=validatePhotoAnalysis(JSON.parse(response.output_text),input);
    const saved=await client.mutation(api.photoAnalysis.complete,{storageId,token:lease,analysis});
    if(!saved)throw new Error("This photo analysis was replaced by a newer request.");
    lease=null;
    return NextResponse.json({analysis});
  }catch(error){
    if(error instanceof ConvexError){
      let data:unknown=error.data;
      if(typeof data==="string"){try{data=JSON.parse(data);}catch{/* generic response */}}
      if(data && typeof data==="object" && "status" in data && "message" in data){
        const status=Number(data.status);
        if([400,401,403,409,429].includes(status))return NextResponse.json({error:String(data.message)},{status});
      }
    }
    return NextResponse.json({error:"The photo could not be analyzed. Try again, or add a description and choose a chapter yourself."},{status:502});
  }finally{
    if(lease)await client.mutation(api.photoAnalysis.release,{storageId,token:lease}).catch(()=>{});
  }
}
