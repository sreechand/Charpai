// @vitest-environment node
import {createServer} from "node:http";
import {once} from "node:events";
import {expect,it,vi} from "vitest";
import {createGenerationOpenAI,GENERATION_REQUEST_TIMEOUT_MS} from "./generation-openai";
it("sends actual audio multipart with the matching fetch/dispatcher and no automatic paid retries", async () => {
  vi.stubEnv("OPENAI_API_KEY", "fixture-only");
  let body = "", contentType = "";
  const server = createServer(async (req,res) => {
    contentType = req.headers["content-type"] || "";
    for await (const bytes of req) body += bytes;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({task: "transcribe", text: "Fixture speech", segments: [], duration: 1}));
  });
  server.listen(0,"127.0.0.1"); await once(server,"listening");
  try {
    const address = server.address(); if (!address || typeof address === "string") throw Error("Missing test port");
    const client = createGenerationOpenAI(`http://127.0.0.1:${address.port}/v1`);
    expect(client.timeout).toBe(GENERATION_REQUEST_TIMEOUT_MS); expect(client.maxRetries).toBe(0);
    await client.audio.transcriptions.create({file: new File(["fixture audio bytes"],"fixture.mp3",{type:"audio/mpeg"}),model:"gpt-4o-transcribe-diarize"});
    expect(contentType).toMatch(/^multipart\/form-data; boundary=/); expect(body).toContain('filename="fixture.mp3"'); expect(body).toContain("fixture audio bytes"); expect(body).not.toContain("[object FormData]");
  } finally {server.closeAllConnections(); await new Promise<void>(resolve=>server.close(()=>resolve()));vi.unstubAllEnvs();}
});
