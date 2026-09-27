import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";

import { api } from "@/convex/_generated/api";
import {
  buildHereNowStorybookFiles,
  storybookLabel,
  type HereNowFile
} from "@/lib/here-now-storybook";

export const runtime = "nodejs";
export const maxDuration = 120;

const hereNowBaseUrl = "https://here.now";
const hereNowWorkspace = "stories";
const hereNowClient = "codex/charpai";

type PublishCreateResponse = {
  slug: string;
  upload: {
    versionId: string;
    finalizeUrl: string;
    uploads: Array<{
      path: string;
      method: "PUT";
      url: string;
      headers: Record<string, string>;
    }>;
  };
};

type FinalizeResponse = {
  siteUrl: string;
  primaryUrl?: string;
  accountUrl?: string;
};

export async function POST(request: Request) {
  try {
    const authToken = readBearerToken(request.headers.get("authorization"));
    const apiKey = process.env.HERENOW_API_KEY;
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!authToken) {
      return NextResponse.json({ error: "Sign in before publishing a storybook." }, { status: 401 });
    }
    if (!apiKey || !convexUrl) {
      throw new Error("here.now publishing is not configured.");
    }

    const body = (await request.json()) as unknown;
    const slug = readSlug(body);
    if (!slug) {
      return NextResponse.json({ error: "A valid storybook slug is required." }, { status: 400 });
    }

    const convex = new ConvexHttpClient(convexUrl);
    convex.setAuth(authToken);
    const ownedPages = await convex.query(api.storybookPages.listMine, {});
    if (!ownedPages.some((page) => page.slug === slug)) {
      return NextResponse.json({ error: "You do not have access to this storybook." }, { status: 403 });
    }

    const story = await convex.query(api.storybookPages.getPublicBySlug, { slug });
    if (!story) {
      return NextResponse.json({ error: "Storybook not found." }, { status: 404 });
    }

    const files = await buildHereNowStorybookFiles(story);
    const headers = hereNowHeaders(apiKey);
    const createResponse = await fetch(`${hereNowBaseUrl}/api/v1/publish`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        account: hereNowWorkspace,
        displayName: story.title.slice(0, 80),
        displayDescription: (story.subtitle || "A family story preserved with Charpai").slice(0, 280),
        files: files.map((file) => ({
          path: file.path,
          size: file.bytes.byteLength,
          contentType: file.contentType
        }))
      })
    });
    const created = await readHereNowResponse<PublishCreateResponse>(createResponse);
    await uploadFiles(created, files);

    const finalizeUrl = requireHereNowUrl(created.upload.finalizeUrl);
    const finalizeResponse = await fetch(finalizeUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        versionId: created.upload.versionId,
        account: hereNowWorkspace,
        label: storybookLabel(story.title)
      })
    });
    const finalized = await readHereNowResponse<FinalizeResponse>(finalizeResponse);

    const accessResponse = await fetch(
      `${hereNowBaseUrl}/api/v1/publish/${encodeURIComponent(created.slug)}/access`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ mode: "anyone_with_link" })
      }
    );
    await readHereNowResponse(accessResponse);

    return NextResponse.json({
      url: finalized.primaryUrl || finalized.accountUrl || finalized.siteUrl,
      canonicalUrl: finalized.siteUrl
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The storybook could not be published.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function uploadFiles(created: PublishCreateResponse, files: HereNowFile[]) {
  const filesByPath = new Map(files.map((file) => [file.path, file]));
  await Promise.all(
    created.upload.uploads.map(async (upload) => {
      const file = filesByPath.get(upload.path);
      if (!file) {
        throw new Error(`here.now requested an unknown file: ${upload.path}`);
      }
      const uploadUrl = new URL(upload.url);
      if (!uploadUrl.hostname.endsWith(".r2.cloudflarestorage.com")) {
        throw new Error("here.now returned an invalid upload host.");
      }
      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: upload.headers,
        body: file.bytes
      });
      if (!response.ok) {
        throw new Error(`here.now could not upload ${file.path}.`);
      }
    })
  );
}

function hereNowHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-HereNow-Account": hereNowWorkspace,
    "X-HereNow-Client": hereNowClient
  };
}

async function readHereNowResponse<T = unknown>(response: Response): Promise<T> {
  const result = (await response.json().catch(() => null)) as
    | (T & { error?: string; message?: string })
    | null;
  if (!response.ok) {
    throw new Error(result?.error || result?.message || `here.now returned ${response.status}.`);
  }
  return result as T;
}

function readBearerToken(value: string | null) {
  return value?.startsWith("Bearer ") ? value.slice(7).trim() : "";
}

function readSlug(value: unknown) {
  if (!value || typeof value !== "object" || !("slug" in value)) {
    return "";
  }
  const slug = (value as { slug?: unknown }).slug;
  return typeof slug === "string" && /^[a-z0-9-]{1,100}$/.test(slug) ? slug : "";
}

function requireHereNowUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.hostname !== "here.now") {
    throw new Error("here.now returned an invalid finalize URL.");
  }
  return url;
}
