import OpenAI from "openai";
import { Agent, FormData as UndiciFormData, fetch as undiciFetch } from "undici";

// Keep each paid call within the worker's 300-second request budget.
export const GENERATION_REQUEST_TIMEOUT_MS = 220_000;
const dispatcher = new Agent({
  headersTimeout: GENERATION_REQUEST_TIMEOUT_MS + 10_000,
  bodyTimeout: GENERATION_REQUEST_TIMEOUT_MS + 10_000,
  connectTimeout: 20_000
});

const generationFetch = Object.assign(async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
  let body = init?.body;
  if (body instanceof FormData && !(body instanceof UndiciFormData)) {
    const form = new UndiciFormData();
    for (const [key, value] of body.entries()) {
      if (typeof value === "string") form.append(key, value);
      else form.append(key, value, value.name);
    }
    body = form as unknown as BodyInit;
  }
  return await undiciFetch(input as Parameters<typeof undiciFetch>[0], {...init, body} as Parameters<typeof undiciFetch>[1]) as unknown as Response;
}, {Response: globalThis.Response});

export function createGenerationOpenAI(baseURL?: string) {
  if (!process.env.OPENAI_API_KEY) throw new Error("Story generation is not configured.");
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    ...(baseURL ? {baseURL} : {}),
    timeout: GENERATION_REQUEST_TIMEOUT_MS,
    maxRetries: 0,
    fetch: generationFetch,
    fetchOptions: { dispatcher }
  });
}
