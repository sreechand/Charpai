// @vitest-environment node
import {afterEach,beforeEach,expect,test,vi} from "vitest";
import {ConvexError} from "convex/values";
const mocks=vi.hoisted(()=>({mutation:vi.fn(),create:vi.fn()}));
vi.mock("convex/browser",()=>({ConvexHttpClient:class{setAuth(){} mutation=mocks.mutation;}}));
vi.mock("openai",()=>({default:class{responses={create:mocks.create};}}));
vi.mock("sharp",()=>({default:()=>{const chain={rotate:()=>chain,resize:()=>chain,jpeg:()=>chain,toBuffer:async()=>Buffer.from("analysis-copy")};return chain;}}));
import {POST} from "../app/api/analyze-photo/route";
const input={storageId:"own-photo",title:"",description:"My first classroom",sections:[{id:"school",heading:"Teaching",body:"I began teaching in this classroom."}]};
const request=(body:unknown=input,auth=true)=>new Request("http://localhost/api/analyze-photo",{method:"POST",headers:{"Content-Type":"application/json",...(auth?{Authorization:"Bearer token"}:{})},body:JSON.stringify(body)});
beforeEach(()=>{
 vi.stubEnv("OPENAI_API_KEY","fictional-key");vi.stubEnv("NEXT_PUBLIC_CONVEX_URL","https://example.convex.cloud");
 mocks.mutation.mockReset();mocks.create.mockReset();
 vi.stubGlobal("fetch",vi.fn(async()=>new Response("unchanged original")));
 mocks.mutation.mockResolvedValue({url:"https://storage.example/owned",token:"lease",cached:null});
 mocks.create.mockResolvedValue({output_text:JSON.stringify({description:"A classroom.",sectionId:"school",confidence:"high",reason:"Fits the teaching chapter."})});
});
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});
test("no paid call for unsigned, malformed or another user's upload",async()=>{
 expect((await POST(request(input,false))).status).toBe(401);
 expect((await POST(request({url:"https://attacker.example"}))).status).toBe(400);
 mocks.mutation.mockRejectedValueOnce(new ConvexError({status:403,message:"You do not have access to this family photo."}));
 expect((await POST(request())).status).toBe(403);expect(mocks.create).not.toHaveBeenCalled();expect(fetch).not.toHaveBeenCalled();
});
test("cached analysis avoids the provider; successful analysis uses an owned image copy and stores the result",async()=>{
 const cached={contextKey:"cached",description:"Cached classroom",sectionId:"school",confidence:"high",reason:"Teaching"};
 mocks.mutation.mockResolvedValueOnce({url:"https://storage.example/owned",token:null,cached});
 expect(await (await POST(request())).json()).toEqual({analysis:cached});expect(mocks.create).not.toHaveBeenCalled();
 mocks.mutation.mockResolvedValueOnce({url:"https://storage.example/owned",token:"lease",cached:null}).mockResolvedValueOnce(true);
 const response=await POST(request());expect(response.status).toBe(200);
 const call=mocks.create.mock.calls[0][0];expect(call.store).toBe(false);expect(call.input[0].content[1].image_url).toMatch(/^data:image\/jpeg;base64,/);
 expect((await response.json()).analysis.sectionId).toBe("school");
});
test("unknown chapter, provider failure and expired save release the lease and leave manual editing available",async()=>{
 mocks.create.mockResolvedValueOnce({output_text:JSON.stringify({description:"A classroom.",sectionId:"invented",confidence:"high",reason:"Bad ID"})});
 expect((await POST(request())).status).toBe(502);
 expect(mocks.mutation.mock.calls.at(-1)?.[1]).toEqual({storageId:"own-photo",token:"lease"});
 mocks.create.mockRejectedValueOnce(new Error("Provider error with private details"));
 const failed=await POST(request());expect(failed.status).toBe(502);expect(await failed.text()).not.toContain("private details");
});
