"use client";

import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Download,
  ImagePlus,
  LockKeyhole,
  LogOut,
  Mail,
  Loader2,
  Mic,
  Printer,
  Sparkles,
  Upload,
  UserCircle
} from "lucide-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent
} from "react";

import { useAuthSession, useEvidence } from "@/app/providers";
import { readPhotoPreviews, validateAudioFile, type PhotoPreview } from "@/lib/files";
import {
  blankIntake,
  demoDraft,
  demoIntake,
  emptyDraft,
  type IntakePayload,
  type StorybookDraft,
  type StorySection
} from "@/lib/storybook";

const initialIntake: IntakePayload = {
  ...blankIntake
};

type GenerateResponse = {
  draft?: StorybookDraft;
  intake?: IntakePayload;
  error?: string;
  warning?: string;
  model?: string;
  elapsedMs?: number;
};

export function StorybookApp() {
  const evidence = useEvidence();
  const auth = useAuthSession();
  const runIdRef = useRef<string | null>(null);
  const [intake, setIntake] = useState(initialIntake);
  const [audio, setAudio] = useState<File | null>(null);
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [draft, setDraft] = useState<StorybookDraft>(emptyDraft());
  const [status, setStatus] = useState<"idle" | "generating" | "ready" | "failed">("idle");
  const [message, setMessage] = useState("");
  const [warning, setWarning] = useState("");

  const fieldsNeedReview = useMemo(
    () => [intake.elderName, intake.relationship, intake.originPlace].some((value) => !value.trim()),
    [intake.elderName, intake.originPlace, intake.relationship]
  );

  const canGenerate =
    Boolean(audio) &&
    status !== "generating" &&
    auth.status === "authenticated" &&
    Boolean(auth.authToken);

  async function handleGenerate() {
    setMessage("");
    setWarning("");
    runIdRef.current = null;

    const audioError = validateAudioFile(audio);
    if (audioError) {
      setStatus("failed");
      setMessage(audioError);
      return;
    }

    if (auth.status !== "authenticated" || !auth.authToken) {
      setStatus("failed");
      setMessage("Sign in before generating a Charpai preview.");
      return;
    }

    setStatus("generating");

    let audioStorageId: Awaited<ReturnType<typeof evidence.uploadAudio>> = null;
    try {
      audioStorageId = await evidence.uploadAudio(audio as File);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Audio upload failed.";
      setStatus("failed");
      setMessage(text);
      return;
    }

    try {
      const requestPayload = { input: intake, audioStorageId };
      const fallbackBody = new FormData();
      Object.entries(requestPayload.input).forEach(([key, value]) => fallbackBody.append(key, value));
      fallbackBody.append("audio", audio as File);

      const response = await fetch("/api/generate-storybook", audioStorageId
        ? {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.authToken}`
            },
            body: JSON.stringify(requestPayload)
          }
        : {
            method: "POST",
            body: fallbackBody
          });
      const result = (await readGenerateResponse(response)) as GenerateResponse;

      if (!response.ok || !result.draft) {
        throw new Error(result.error || "The storybook could not be generated.");
      }

      const generatedIntake = result.intake || requestPayload.input;
      setDraft(result.draft);
      setIntake(generatedIntake);
      setWarning(result.warning || "");
      setStatus("ready");
      setMessage(
        `${result.model || "model"} created the draft in ${Math.max(
          1,
          Math.round((result.elapsedMs || 1000) / 1000)
        )}s. Review the extracted fields and storybook before export.`
      );

      try {
        const runId = await evidence.createRun({
          buyerName: generatedIntake.buyerName,
          email: generatedIntake.email,
          elderName: generatedIntake.elderName,
          relationship: generatedIntake.relationship,
          originPlace: generatedIntake.originPlace,
          languageMix: generatedIntake.languageMix,
          audioStorageId: audioStorageId || undefined,
          hasAudio: Boolean(audio),
          photoCount: photos.length
        });
        runIdRef.current = runId;
        await evidence.markDraftReady(runId, result.draft.title);
      } catch (error) {
        const text = error instanceof Error ? error.message : "The run could not be saved.";
        setWarning((current) => [current, text].filter(Boolean).join(" "));
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : "The storybook could not be generated.";
      setStatus("failed");
      setMessage(text);
      if (runIdRef.current) {
        await evidence.markFailed(runIdRef.current, text);
      }
    }
  }

  async function handlePhotoFiles(files: FileList | null) {
    try {
      setPhotos(await readPhotoPreviews(files));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not preview the photos.");
    }
  }

  async function handleExport() {
    if (runIdRef.current) {
      await evidence.markExported(runIdRef.current, draft.title || `${intake.elderName}'s Story`);
    }
    window.print();
  }

  function updateIntake(key: keyof IntakePayload, value: string) {
    setIntake((current) => ({ ...current, [key]: value }));
  }

  function updateDraft(key: keyof StorybookDraft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateSection(id: string, patch: Partial<StorySection>) {
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === id ? { ...section, ...patch } : section
      )
    }));
  }

  function loadDemo() {
    const seeded = demoIntake(intake);
    setIntake(seeded);
    setDraft(demoDraft(seeded));
    setStatus("ready");
    setMessage("Demo preview loaded. Review the extracted fields and storybook before export.");
  }

  return (
    <main className="app-shell">
      <section className="masthead screen-only">
        <div>
          <p className="eyebrow">Charpai</p>
          <h1>Charpai</h1>
          <p className="masthead-copy">
            Upload an interview recording. Charpai extracts the family details, drafts the first
            storybook spread, and keeps every line editable before export.
          </p>
        </div>
        <div className="proof-strip" aria-label="Storybook constraints">
          <span>
            <UserCircle size={16} aria-hidden /> {auth.status === "authenticated" ? "Signed in" : "Login required"}
          </span>
          <span>
            <Mic size={16} aria-hidden /> Audio first
          </span>
          <span>
            <BookOpen size={16} aria-hidden /> Editable spread
          </span>
          {auth.status === "authenticated" ? (
            <button className="session-button" type="button" onClick={() => void auth.signOut()}>
              <LogOut size={16} aria-hidden />
              Sign out
            </button>
          ) : null}
        </div>
      </section>

      {auth.status !== "authenticated" ? (
        <AuthGate auth={auth} />
      ) : (
      <section className="workspace">
        <aside className="intake-panel screen-only" aria-label="Storybook intake">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{draft.sections.length ? "Review" : "Audio intake"}</p>
              <h2>{draft.sections.length ? "Extracted story details" : "Upload audio for preview"}</h2>
            </div>
          </div>

          <div className="upload-zone">
            <label className="upload-card">
              <Upload size={22} aria-hidden />
              <span>{audio ? audio.name : "Upload interview audio"}</span>
              <small>mp3, m4a, wav, mp4 or webm. Keep it under 100 MB.</small>
              <input
                type="file"
                accept="audio/*,video/mp4,.m4a,.mp3,.wav,.webm"
                onChange={(event) => setAudio(event.target.files?.[0] || null)}
              />
            </label>
            <label className="upload-card">
              <ImagePlus size={22} aria-hidden />
              <span>{photos.length ? `${photos.length} photo previewed` : "Optional photos"}</span>
              <small>Up to 3 family photos for the storybook pages.</small>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => handlePhotoFiles(event.target.files)}
              />
            </label>
          </div>

          <div className="field-section-heading">
            <p className="eyebrow">{draft.sections.length ? "Extracted fields" : "Details"}</p>
            <span>
              {draft.sections.length
                ? "Correct anything the transcript missed."
                : "Charpai fills these after the recording is processed."}
            </span>
          </div>

          {draft.sections.length && fieldsNeedReview ? (
            <div className="notice warning">
              <AlertTriangle size={18} aria-hidden />
              <span>Some core fields are still blank. Review the transcript and fill them before export.</span>
            </div>
          ) : null}

          <div className="field-grid">
            <TextField
              label="Elder name"
              value={intake.elderName}
              onChange={(value) => updateIntake("elderName", value)}
            />
            <TextField
              label="Relationship"
              value={intake.relationship}
              onChange={(value) => updateIntake("relationship", value)}
            />
            <TextField
              label="Origin place"
              value={intake.originPlace}
              onChange={(value) => updateIntake("originPlace", value)}
            />
            <TextField
              label="Languages in the recording"
              value={intake.languageMix}
              onChange={(value) => updateIntake("languageMix", value)}
            />
          </div>

          <div className="action-row">
            <button className="secondary-button" type="button" onClick={loadDemo}>
              Load demo
            </button>
            <button
              className="primary-button"
              type="button"
              disabled={!canGenerate}
              onClick={handleGenerate}
            >
              {status === "generating" ? (
                <>
                  <Loader2 className="spin" size={18} aria-hidden /> Generating
                </>
              ) : (
                <>
                  <Sparkles size={18} aria-hidden /> Generate preview
                </>
              )}
            </button>
          </div>

          {message ? (
            <div className={`notice ${status === "failed" ? "error" : "success"}`}>
              {status === "failed" ? (
                <AlertTriangle size={18} aria-hidden />
              ) : (
                <CheckCircle2 size={18} aria-hidden />
              )}
              <span>{message}</span>
            </div>
          ) : null}
          {warning ? (
            <div className="notice warning">
              <AlertTriangle size={18} aria-hidden />
              <span>{warning}</span>
            </div>
          ) : null}
        </aside>

        <section className="book-workbench" aria-label="Editable storybook">
          <div className="editor-toolbar screen-only">
            <div>
              <p className="eyebrow">Storybook</p>
              <h2>{draft.title || "Waiting for a recording"}</h2>
            </div>
            <button
              className="export-button"
              type="button"
              disabled={!draft.sections.length}
              onClick={handleExport}
            >
              <Printer size={18} aria-hidden />
              Export PDF
            </button>
          </div>

          <div id="storybook-print-area" className="storybook-page">
            {draft.sections.length ? (
              <StorybookEditor
                draft={draft}
                photos={photos}
                onDraftChange={updateDraft}
                onSectionChange={updateSection}
              />
            ) : (
              <EmptyBook />
            )}
          </div>

          {draft.sections.length ? (
            <div className="transcript-panel screen-only">
              <div>
                <p className="eyebrow">Transcript review</p>
                <h3>Correct names and mixed-language phrases</h3>
              </div>
              <textarea
                value={draft.transcript}
                onChange={(event) => updateDraft("transcript", event.target.value)}
                rows={8}
              />
            </div>
          ) : null}
        </section>
      </section>
      )}
    </main>
  );
}

function AuthGate({ auth }: { auth: ReturnType<typeof useAuthSession> }) {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const unavailable = auth.status === "unavailable";

  async function handleGoogleSignIn() {
    setAuthMessage("");
    setIsSubmitting(true);
    try {
      await auth.signInWithGoogle();
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Google sign-in failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthMessage("");
    setIsSubmitting(true);

    try {
      if (mode === "signUp") {
        await auth.signUpWithEmail(email, password);
      } else {
        await auth.signInWithEmail(email, password);
      }
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Email sign-in failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-gate screen-only" aria-label="Charpai login">
      <div className="auth-card">
        <div className="auth-card-heading">
          <p className="eyebrow">Login</p>
          <h2>Sign in to Charpai</h2>
        </div>

        <button
          className="google-button"
          type="button"
          disabled={isSubmitting || auth.status === "loading" || unavailable}
          onClick={handleGoogleSignIn}
        >
          <UserCircle size={18} aria-hidden />
          Continue with Google
        </button>

        <div className="auth-divider">
          <span>Email</span>
        </div>

        <form className="auth-form" onSubmit={handleEmailSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              autoComplete="email"
              disabled={isSubmitting || unavailable}
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              autoComplete={mode === "signUp" ? "new-password" : "current-password"}
              disabled={isSubmitting || unavailable}
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          <button
            className="primary-button"
            type="submit"
            disabled={isSubmitting || auth.status === "loading" || unavailable}
          >
            {isSubmitting || auth.status === "loading" ? (
              <>
                <Loader2 className="spin" size={18} aria-hidden /> Checking
              </>
            ) : mode === "signUp" ? (
              <>
                <Mail size={18} aria-hidden /> Create account
              </>
            ) : (
              <>
                <LockKeyhole size={18} aria-hidden /> Sign in
              </>
            )}
          </button>
        </form>

        <button
          className="form-switch"
          type="button"
          disabled={isSubmitting || unavailable}
          onClick={() => setMode((current) => (current === "signIn" ? "signUp" : "signIn"))}
        >
          {mode === "signIn" ? "Create an email account" : "Use an existing account"}
        </button>

        {unavailable ? (
          <div className="notice warning">
            <AlertTriangle size={18} aria-hidden />
            <span>Set Convex and Auth environment variables to enable login.</span>
          </div>
        ) : null}
        {authMessage ? (
          <div className="notice error">
            <AlertTriangle size={18} aria-hidden />
            <span>{authMessage}</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

async function readGenerateResponse(response: Response): Promise<GenerateResponse> {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return {
    error:
      response.status === 413
        ? "The recording is too large for this upload path. Try a compressed mp3 or m4a file."
        : text || "The storybook server returned an unexpected response."
  };
}

function StorybookEditor({
  draft,
  photos,
  onDraftChange,
  onSectionChange
}: {
  draft: StorybookDraft;
  photos: PhotoPreview[];
  onDraftChange: (key: keyof StorybookDraft, value: string) => void;
  onSectionChange: (id: string, patch: Partial<StorySection>) => void;
}) {
  return (
    <article className="book" style={getDraftDesignStyle(draft)}>
      <section className="visual-page" aria-label="Storybook illustration page">
        <StampPoster draft={draft} />
        {photos.length ? <PolaroidPhotos draft={draft} photos={photos} /> : null}
      </section>

      <section className="text-page" aria-label="Editable storybook text page">
        <section className="book-cover">
          <AutoSizeTextArea
            className="book-title"
            value={draft.title}
            onChange={(value) => onDraftChange("title", value)}
            ariaLabel="Storybook title"
            rows={2}
          />
          <input
            className="book-subtitle"
            value={draft.subtitle}
            onChange={(event) => onDraftChange("subtitle", event.target.value)}
            aria-label="Storybook subtitle"
          />
          <AutoSizeTextArea
            className="book-dedication"
            value={draft.dedication}
            onChange={(value) => onDraftChange("dedication", value)}
            ariaLabel="Dedication"
            rows={3}
          />
        </section>

        <section className="language-note">
          <AlertTriangle size={16} aria-hidden />
          <AutoSizeTextArea
            value={draft.languageNote}
            onChange={(value) => onDraftChange("languageNote", value)}
            rows={2}
            ariaLabel="Language review note"
          />
        </section>

        {draft.sections.map((section) => (
          <section className="story-section" key={section.id}>
            <AutoSizeTextArea
              className="story-section-heading"
              value={section.heading}
              onChange={(value) => onSectionChange(section.id, { heading: value })}
              rows={2}
              ariaLabel={`Heading for ${section.id}`}
            />
            <AutoSizeTextArea
              className="story-section-body"
              value={section.body}
              onChange={(value) => onSectionChange(section.id, { body: value })}
              rows={7}
              ariaLabel={`Body for ${section.id}`}
            />
          </section>
        ))}

        <section className="closing-note">
          <AutoSizeTextArea
            value={draft.closingNote}
            onChange={(value) => onDraftChange("closingNote", value)}
            rows={4}
            ariaLabel="Closing note"
          />
        </section>
      </section>
    </article>
  );
}

function PolaroidPhotos({ draft, photos }: { draft: StorybookDraft; photos: PhotoPreview[] }) {
  return (
    <section className="scrapbook-photos" aria-label="Uploaded family photos">
      {photos.map((photo, index) => (
        <figure className={`polaroid polaroid-${(index % 3) + 1}`} key={photo.id}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.url} alt={photo.name} />
          <figcaption>{draft.photoCaptions[index] || photo.name}</figcaption>
        </figure>
      ))}
    </section>
  );
}

function StampPoster({ draft }: { draft: StorybookDraft }) {
  const roughId = useId().replaceAll(":", "");
  const stampKinds = deriveStampKinds(draft);

  return (
    <section className="field-note-poster" aria-label={draft.illustrationBrief || draft.stampSubject}>
      <svg className="stamp-scene" viewBox="0 0 360 360" role="img" aria-hidden="true">
        <defs>
          <filter id={roughId}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              seed="8"
              result="noise"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" />
          </filter>
        </defs>
        <g className="stamp-impression" filter={`url(#${roughId})`}>
          <path
            className="stamp-ghost"
            d="M50 295c44-16 82-18 118-7 42 13 81 8 137-16"
          />
          {stampKinds.map((kind, index) => renderStampShape(kind, index))}
          <path className="stamp-dark" d="M44 292c52 10 108 7 156-4 42-10 73-9 113 3" />
        </g>
      </svg>
    </section>
  );
}

type StampKind = "landmark" | "home" | "food" | "water" | "tree" | "object";

function deriveStampKinds(draft: StorybookDraft): StampKind[] {
  const text = [
    draft.stampSubject,
    ...(draft.stampMotifs || []),
    draft.illustrationBrief,
    draft.title,
    draft.subtitle,
    draft.designSystem.memoryWorldLabel,
    draft.designSystem.constructionNotes,
    ...draft.designSystem.artifactForms
  ]
    .join(" ")
    .toLowerCase();

  const selected: StampKind[] = [];
  const add = (kind: StampKind) => {
    if (!selected.includes(kind)) {
      selected.push(kind);
    }
  };

  if (/temple|mandir|church|mosque|market|bazaar|arch|palace|fort|school|station/.test(text)) {
    add("landmark");
  }
  if (/home|house|door|courtyard|room|kitchen|street|village|lane/.test(text)) {
    add("home");
  }
  if (/coffee|tea|food|smell|rice|mango|pickle|meal|kitchen|tiffin|sweet/.test(text)) {
    add("food");
  }
  if (/river|lake|sea|rain|water|well|shore|pond|monsoon/.test(text)) {
    add("water");
  }
  if (/tree|garden|field|farm|leaf|flower|jasmine|coconut/.test(text)) {
    add("tree");
  }
  if (/photo|object|book|letter|radio|clock|sari|saree|toy|tool/.test(text)) {
    add("object");
  }

  (["landmark", "home", "food", "water"] as StampKind[]).forEach(add);
  return selected.slice(0, 5);
}

function renderStampShape(kind: StampKind, index: number) {
  const x = 54 + index * 54;

  switch (kind) {
    case "landmark":
      return (
        <g className="stamp-form" key={`${kind}-${index}`} transform={`translate(${x} 212)`}>
          <path className="stamp-ochre" d="M4 62h44v24H4z" />
          <path className="stamp-dark" d="M7 86V50c0-18 10-30 19-30s19 12 19 30v36" />
          <path className="stamp-brick" d="M16 86V61c0-9 5-15 10-15s10 6 10 15v25" />
          <path className="stamp-dark" d="M2 50h48M8 38h36M26 8v13" />
        </g>
      );
    case "home":
      return (
        <g className="stamp-form" key={`${kind}-${index}`} transform={`translate(${x} 222)`}>
          <path className="stamp-green" d="M4 40 27 18l24 22" />
          <path className="stamp-dark" d="M11 40v42h33V40" />
          <path className="stamp-ochre" d="M24 82V57h10v25" />
          <path className="stamp-dark" d="M18 51h8M37 51h7" />
        </g>
      );
    case "food":
      return (
        <g className="stamp-form" key={`${kind}-${index}`} transform={`translate(${x} 231)`}>
          <path className="stamp-brick" d="M12 24h30l-5 43H17z" />
          <path className="stamp-dark" d="M8 24h38M17 67h21M18 12c3-8 15-8 18 0" />
          <path className="stamp-ochre" d="M12 77c11 6 23 6 35 0" />
        </g>
      );
    case "water":
      return (
        <g className="stamp-form" key={`${kind}-${index}`} transform={`translate(${x} 242)`}>
          <path className="stamp-blue" d="M2 24c14-11 25 11 40 0s27 9 43-1" />
          <path className="stamp-blue" d="M8 43c12-9 23 8 37-1s23 8 37-2" />
          <path className="stamp-dark" d="M16 65c16-5 34-5 52 0" />
        </g>
      );
    case "tree":
      return (
        <g className="stamp-form" key={`${kind}-${index}`} transform={`translate(${x} 218)`}>
          <path className="stamp-green" d="M27 12c24 6 28 39 4 48-28 7-38-27-17-42 4-4 8-6 13-6z" />
          <path className="stamp-dark" d="M28 55v31M18 86h25M28 65l-12-12M29 70l15-17" />
        </g>
      );
    case "object":
      return (
        <g className="stamp-form" key={`${kind}-${index}`} transform={`translate(${x} 228)`}>
          <path className="stamp-ochre" d="M9 17h41v54H9z" />
          <path className="stamp-dark" d="M13 21h33v33H13zM13 71h33M18 61h22" />
          <path className="stamp-brick" d="M19 47 29 35l10 12" />
        </g>
      );
  }
}

function getDraftDesignStyle(draft: StorybookDraft) {
  return {
    "--memory-accent": draft.designSystem.accent,
    "--memory-deep": draft.designSystem.deep,
    "--hand-ink": draft.designSystem.handInk
  } as CSSProperties;
}

function AutoSizeTextArea({
  ariaLabel,
  className,
  onChange,
  rows,
  value
}: {
  ariaLabel: string;
  className?: string;
  onChange: (value: string) => void;
  rows: number;
  value: string;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      aria-label={ariaLabel}
      className={className}
      onChange={(event) => onChange(event.target.value)}
      ref={ref}
      rows={rows}
      value={value}
    />
  );
}

function EmptyBook() {
  return (
    <div className="empty-book">
      <div className="empty-icon">
        <Download size={34} aria-hidden />
      </div>
      <p className="eyebrow">Artifact preview</p>
      <h2>The storybook appears here</h2>
      <p>
        The live demo proof is a fresh recording becoming a structured, editable keepsake without
        manual rewriting.
      </p>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
