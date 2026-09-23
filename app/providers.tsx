"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode
} from "react";
import {
  ConvexAuthProvider,
  useAuthActions,
  useAuthToken,
  useConvexAuth
} from "@convex-dev/auth/react";
import { ConvexReactClient, useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { StorybookDraft } from "@/lib/storybook";

type CreateRunInput = {
  buyerName?: string;
  email?: string;
  elderName: string;
  relationship: string;
  originPlace: string;
  languageMix: string;
  audioStorageId?: Id<"_storage">;
  hasAudio: boolean;
  photoCount: number;
};

export type StorybookPageSummary = {
  _id: Id<"storybookPages"> | string;
  slug: string;
  title: string;
  subtitle: string;
  createdAt: number;
  updatedAt: number;
};

type EvidenceContextValue = {
  backend: "convex" | "local";
  storyPages: StorybookPageSummary[] | undefined;
  uploadAudio: (file: File) => Promise<Id<"_storage"> | null>;
  createRun: (input: CreateRunInput) => Promise<string>;
  markGenerating: (id: string) => Promise<void>;
  markDraftReady: (id: string, title: string) => Promise<void>;
  markExported: (id: string, title: string) => Promise<void>;
  markFailed: (id: string, error: string) => Promise<void>;
  publishStoryPage: (draft: StorybookDraft, runId?: string) => Promise<StorybookPageSummary | null>;
  deleteStoryPage: (pageId: string) => Promise<void>;
};

type AuthContextValue = {
  status: "loading" | "authenticated" | "unauthenticated" | "unavailable";
  authToken: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const EvidenceContext = createContext<EvidenceContextValue | null>(null);
const AuthContext = createContext<AuthContextValue | null>(null);

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function Providers({ children }: { children: ReactNode }) {
  if (!convexClient) {
    return (
      <UnavailableAuthProvider>
        <LocalEvidenceProvider>{children}</LocalEvidenceProvider>
      </UnavailableAuthProvider>
    );
  }

  return (
    <ConvexAuthProvider client={convexClient}>
      <ConvexAuthBridge>
        <ConvexEvidenceProvider>{children}</ConvexEvidenceProvider>
      </ConvexAuthBridge>
    </ConvexAuthProvider>
  );
}

export function useEvidence() {
  const value = useContext(EvidenceContext);
  if (!value) {
    throw new Error("useEvidence must be used inside Providers.");
  }
  return value;
}

export function useAuthSession() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuthSession must be used inside Providers.");
  }
  return value;
}

function ConvexAuthBridge({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const authToken = useAuthToken();
  const { signIn, signOut } = useAuthActions();

  const value = useMemo<AuthContextValue>(
    () => ({
      status: isLoading ? "loading" : isAuthenticated ? "authenticated" : "unauthenticated",
      authToken,
      signInWithGoogle: async () => {
        const result = await signIn("google", { redirectTo: "/" });
        if (result.redirect) {
          window.location.href = result.redirect.toString();
        }
      },
      signInWithEmail: async (email, password) => {
        await signIn("password", {
          flow: "signIn",
          email: email.trim().toLowerCase(),
          password
        });
      },
      signUpWithEmail: async (email, password) => {
        await signIn("password", {
          flow: "signUp",
          email: email.trim().toLowerCase(),
          password
        });
      },
      signOut
    }),
    [authToken, isAuthenticated, isLoading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function ConvexEvidenceProvider({ children }: { children: ReactNode }) {
  const storyPages = useQuery(api.storybookPages.listMine);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const recordAudioUpload = useMutation(api.files.recordAudioUpload);
  const create = useMutation(api.runs.createRun);
  const generating = useMutation(api.runs.markGenerating);
  const ready = useMutation(api.runs.markDraftReady);
  const exported = useMutation(api.runs.markExported);
  const failed = useMutation(api.runs.markFailed);
  const publish = useMutation(api.storybookPages.publish);
  const deletePublishedPage = useMutation(api.storybookPages.deletePage);

  const value = useMemo<EvidenceContextValue>(
    () => ({
      backend: "convex",
      storyPages,
      uploadAudio: async (file) => {
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file
        });

        if (!response.ok) {
          throw new Error("Audio upload failed. Try a smaller compressed mp3 or m4a file.");
        }

        const result = (await response.json()) as { storageId?: Id<"_storage"> };
        if (!result.storageId) {
          throw new Error("Audio upload did not return a storage id.");
        }

        await recordAudioUpload({
          storageId: result.storageId,
          fileName: file.name || "interview-audio",
          contentType: file.type || undefined,
          size: file.size
        });

        return result.storageId;
      },
      createRun: async (input) => String(await create(input)),
      markGenerating: async (id) => {
        await generating({ id: id as never });
      },
      markDraftReady: async (id, title) => {
        await ready({ id: id as never, title });
      },
      markExported: async (id, title) => {
        await exported({ id: id as never, title });
      },
      markFailed: async (id, error) => {
        await failed({ id: id as never, error });
      },
      publishStoryPage: async (draft, runId) => {
        return await publish({
          draft,
          runId: runId ? (runId as Id<"runs">) : undefined
        });
      },
      deleteStoryPage: async (pageId) => {
        await deletePublishedPage({ pageId: pageId as Id<"storybookPages"> });
      }
    }),
    [
      create,
      deletePublishedPage,
      exported,
      failed,
      generateUploadUrl,
      generating,
      publish,
      ready,
      recordAudioUpload,
      storyPages
    ]
  );

  return <EvidenceContext.Provider value={value}>{children}</EvidenceContext.Provider>;
}

function UnavailableAuthProvider({ children }: { children: ReactNode }) {
  const value = useMemo<AuthContextValue>(
    () => ({
      status: "unavailable",
      authToken: null,
      signInWithGoogle: async () => {
        throw new Error("Convex auth is not configured.");
      },
      signInWithEmail: async () => {
        throw new Error("Convex auth is not configured.");
      },
      signUpWithEmail: async () => {
        throw new Error("Convex auth is not configured.");
      },
      signOut: async () => undefined
    }),
    []
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function LocalEvidenceProvider({ children }: { children: ReactNode }) {
  const save = useCallback((id: string, patch: Record<string, unknown>) => {
    if (typeof window === "undefined") {
      return;
    }

    const key = "storybook-runs";
    const existing = JSON.parse(window.localStorage.getItem(key) || "{}") as Record<
      string,
      Record<string, unknown>
    >;
    existing[id] = {
      ...(existing[id] || {}),
      ...patch,
      updatedAt: Date.now()
    };
    window.localStorage.setItem(key, JSON.stringify(existing));
  }, []);

  const value = useMemo<EvidenceContextValue>(
    () => ({
      backend: "local",
      storyPages: [],
      uploadAudio: async () => null,
      createRun: async (input) => {
        const id = `local-${Date.now()}`;
        save(id, {
          ...input,
          status: "created",
          createdAt: Date.now()
        });
        return id;
      },
      markGenerating: async (id) => save(id, { status: "generating" }),
      markDraftReady: async (id, title) => save(id, { status: "draft_ready", title }),
      markExported: async (id, title) => save(id, { status: "exported", title }),
      markFailed: async (id, error) => save(id, { status: "failed", error }),
      publishStoryPage: async () => null,
      deleteStoryPage: async () => undefined
    }),
    [save]
  );

  return <EvidenceContext.Provider value={value}>{children}</EvidenceContext.Provider>;
}
