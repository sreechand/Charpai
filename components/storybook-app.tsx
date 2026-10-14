"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
  ImagePlus,
  LockKeyhole,
  LogOut,
  Mail,
  Loader2,
  Sparkles,
  Trash2
} from "lucide-react";
import Image from "next/image";
import { StorybookReader } from "@/components/storybook-reader";
import { AudioIntake } from "@/components/audio-intake";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent
} from "react";

import { useAuthSession, useEvidence, type StorybookPageSummary, type SavedGeneration } from "@/app/providers";
import { RazorpayCheckout } from "@/components/razorpay-checkout";
import type { Id } from "@/convex/_generated/dataModel";
import { readPhotoPreviews, validateAudioFile, type PhotoPreview } from "@/lib/files";
import charpaiLogo from "@/charpaiv8.png";
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
  transcript?: string;
  error?: string;
  warning?: string;
  model?: string;
  elapsedMs?: number;
};

type PendingRecommendation = {
  intake: IntakePayload;
  draft: StorybookDraft;
  audioStorageId: Id<"_storage"> | null;
  model: string;
  elapsedMs: number;
  warning: string;
};

const generationStages = [
  {
    id: "uploading",
    label: "Uploading recording",
    buttonLabel: "Uploading",
    detail: "Securely saving the interview audio.",
    progress: 12
  },
  {
    id: "preparing",
    label: "Preparing the audio",
    buttonLabel: "Preparing audio",
    detail: "Optimizing the recording while preserving voice detail.",
    progress: 28
  },
  {
    id: "transcribing",
    label: "Listening to the interview",
    buttonLabel: "Transcribing",
    detail: "Transcribing the conversation and separating voices where possible.",
    progress: 52
  },
  {
    id: "understanding",
    label: "Reading the memories",
    buttonLabel: "Reading memories",
    detail: "Finding the names, places, relationships, and moments that matter.",
    progress: 74
  },
  {
    id: "writing",
    label: "Shaping the storybook",
    buttonLabel: "Writing story",
    detail: "Turning the interview into an editable family keepsake.",
    progress: 82
  },
  {
    id: "illustrating",
    label: "Creating the memory image",
    buttonLabel: "Creating image",
    detail: "Making a story-specific rubber-stamp impression for the finished page.",
    progress: 94
  }
] as const;

type GenerationStageId = (typeof generationStages)[number]["id"];

export function StorybookApp() {
  const evidence = useEvidence();
  const auth = useAuthSession();
  const runIdRef = useRef<string | null>(null);
  const loadedDraftRef = useRef("");
  const [openDraftVersion, setOpenDraftVersion] = useState(0);
  const [savedAudioUrl, setSavedAudioUrl] = useState<string | null>(null);
  const [intake, setIntake] = useState(initialIntake);
  const [audio, setAudio] = useState<File | null>(null);
  const [isRecordingBusy, setIsRecordingBusy] = useState(false);
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [draft, setDraft] = useState<StorybookDraft>(emptyDraft());
  const [pendingRecommendation, setPendingRecommendation] = useState<PendingRecommendation | null>(null);
  const [status, setStatus] = useState<"idle" | "generating" | "reviewing" | "ready" | "failed">("idle");
  const generationIdRef = useRef<string | undefined>(undefined);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [warning, setWarning] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedStoryPath, setPublishedStoryPath] = useState("");
  const [isBrandCompact, setIsBrandCompact] = useState(false);
  const [deletingPageId, setDeletingPageId] = useState<string | null>(null);
  const [generationStageId, setGenerationStageId] =
    useState<GenerationStageId>("uploading");

  const activeIntake = pendingRecommendation?.intake || intake;
  const activeDraft = pendingRecommendation?.draft || draft;
  const hasPendingRecommendation = Boolean(pendingRecommendation);
  const generationStage =
    generationStages.find((stage) => stage.id === generationStageId) || generationStages[0];

  const selectedGeneration = evidence.selectedGeneration;
  useEffect(() => {
    if (!selectedGeneration) return;
    let cancelled = false;
    const restore = async () => {
      generationIdRef.current = selectedGeneration.generationId;
      setActiveBookId(selectedGeneration.generationId);
      setSavedAudioUrl(selectedGeneration.audioUrl);
      setPhotos(selectedGeneration.photos.map(photo => ({id: photo.storageId, name: photo.fileName, url: photo.url || ""})));
      if (selectedGeneration.stage !== "ready") setGenerationStageId(selectedGeneration.stage);
      if (selectedGeneration.status === "queued" || selectedGeneration.status === "running") {
        setStatus("generating"); setMessage("Your draft is saved. You can close this page and come back.");
      } else if (selectedGeneration.status === "failed") {
        setStatus("failed"); setMessage(selectedGeneration.error || "Your completed work is saved. Resume this draft to continue.");
      }
      const url = selectedGeneration.draftUrl || selectedGeneration.textDraftUrl;
      const loadKey = `${selectedGeneration._id}:${url || "intake"}`;
      if (loadedDraftRef.current === loadKey) return;
      if (selectedGeneration.intakeUrl) {
        const response = await fetch(selectedGeneration.intakeUrl); if (!response.ok) throw new Error("Your saved details could not be loaded.");
        const restored = await response.json() as IntakePayload;
        if (!cancelled) setIntake(restored);
      } else if (!cancelled) setIntake(JSON.parse(selectedGeneration.inputJson) as IntakePayload);
      if (!url) { loadedDraftRef.current = loadKey; return; }
      const response = await fetch(url); if (!response.ok) throw new Error("Your saved draft could not be loaded. Open it again to retry.");
      const data = await response.json() as GenerateResponse | StorybookDraft;
      if (cancelled) return;
      loadedDraftRef.current = loadKey;
      if (selectedGeneration.draftUrl && "draft" in data && data.draft) {
        setPendingRecommendation({intake: data.intake || JSON.parse(selectedGeneration.inputJson), draft: data.draft,
          audioStorageId: selectedGeneration.audioStorageId, model: data.model || "model", elapsedMs: data.elapsedMs || 0, warning: data.warning || ""});
        setStatus("reviewing"); setMessage("Your saved draft is ready to review.");
      } else if ("sections" in data) { setDraft(data); }
    };
    void restore().catch(error => { if (!cancelled) setMessage(error instanceof Error ? error.message : "Your saved draft could not be loaded."); });
    return () => { cancelled = true; };
  }, [selectedGeneration, openDraftVersion]);

  function startNewDraft() {
    evidence.openGeneration(null); loadedDraftRef.current = ""; generationIdRef.current = undefined;
    setAudio(null); setSavedAudioUrl(null); setPhotos([]); setIntake(initialIntake); setDraft(emptyDraft()); setPendingRecommendation(null); setStatus("idle"); setMessage(""); setWarning(""); setActiveBookId(crypto.randomUUID());
  }

  function openSavedDraft(id: string) {
    setOpenDraftVersion(version => version + 1);
    loadedDraftRef.current = "";
    setDraft(emptyDraft()); setAudio(null); setPendingRecommendation(null); setMessage(""); setWarning("");
    evidence.openGeneration(id);
    const saved = evidence.draftStories?.find(d => d._id === id);
    if (saved) { setActiveBookId(saved.generationId); generationIdRef.current = saved.generationId; }
  }

  async function resumeSavedDraft(id: string) {
    openSavedDraft(id);
    try { await evidence.resumeGeneration(id); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Your draft could not resume."); }
  }

  useEffect(() => {
    const updateBrand = () => setIsBrandCompact(window.scrollY > 56);
    updateBrand();
    window.addEventListener("scroll", updateBrand, { passive: true });
    return () => window.removeEventListener("scroll", updateBrand);
  }, []);

  const fieldsNeedReview = useMemo(
    () =>
      [activeIntake.elderName, activeIntake.relationship, activeIntake.originPlace].some((value) =>
        !value.trim()
      ),
    [activeIntake.elderName, activeIntake.originPlace, activeIntake.relationship]
  );

  // This only separates local recovery copies; authentication is still checked by the backend.
  const recordingRecoveryKey = useMemo(() => {
    try {
      const payload = auth.authToken?.split(".")[1];
      if (!payload) return "signed-out";
      const subject = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))).sub;
      return typeof subject === "string" ? subject.split("|")[0] : "signed-out";
    } catch { return "signed-out"; }
  }, [auth.authToken]);

  function resumeStorybook() {
    if (!evidence.paymentResumeId) return;
    const saved = evidence.draftStories?.find(d => d.generationId === evidence.paymentResumeId);
    if (saved) { openSavedDraft(saved._id); return; }
    generationIdRef.current = evidence.paymentResumeId;
    setActiveBookId(evidence.paymentResumeId);
    if (evidence.paymentResponse) {
      try {
        const saved = JSON.parse(evidence.paymentResponse) as GenerateResponse & { audioStorageId?: Id<"_storage"> };
        if (saved.intake) setIntake(saved.intake);
        if (saved.draft) {
          setPendingRecommendation({ intake: saved.intake || initialIntake, draft: saved.draft,
            audioStorageId: saved.audioStorageId || null, model: saved.model || "model", elapsedMs: saved.elapsedMs || 0, warning: saved.warning || "" });
          setStatus("reviewing");
        }
      } catch { setMessage("Your draft could not be loaded. Please refresh."); }
    }
  }

  const canGenerate =
    (Boolean(audio) || selectedGeneration?.status === "failed") &&
    !isRecordingBusy && status !== "generating" && !hasPendingRecommendation &&
    auth.status === "authenticated" && Boolean(auth.authToken);

  async function handleGenerate() {
    if (selectedGeneration?.status === "failed") { await resumeSavedDraft(selectedGeneration._id); return; }
    if (isRecordingBusy) return;
    setMessage(""); setWarning(""); setPendingRecommendation(null);
    const audioError = validateAudioFile(audio);
    if (audioError) { setStatus("failed"); setMessage(audioError); return; }
    if (auth.status !== "authenticated") { setMessage("Sign in before creating your story."); return; }
    setStatus("generating"); setGenerationStageId("uploading");
    const generationId = crypto.randomUUID(); generationIdRef.current = generationId; setActiveBookId(generationId);
    try {
      const audioStorageId = await evidence.uploadAudio(audio as File);
      if (!audioStorageId) throw new Error("Your recording could not be saved.");
      const photoStorageIds = [];
      for (const photo of photos) if (photo.file) photoStorageIds.push(await evidence.uploadPhoto(photo.file));
      await evidence.submitGeneration({generationId, inputJson: JSON.stringify(intake), audioStorageId, fileName: audio!.name, photoStorageIds});
      setMessage("Your draft is saved. You can close this page and come back.");
    } catch (error) {
      setStatus("failed"); setMessage(error instanceof Error ? error.message : "Your story could not be submitted.");
    }
  }

  async function handleConfirmRecommendation() {
    if (!pendingRecommendation || isPublishing) {
      return;
    }

    const accepted = pendingRecommendation;
    evidence.recordEvent("preview_accepted", { generationId: generationIdRef.current });
    const warnings = accepted.warning ? [accepted.warning] : [];
    let runId: string | null = null;
    let publishedPath = "";

    setIsPublishing(true);
    setMessage("");
    setWarning("");
    setIntake(accepted.intake);
    setDraft(accepted.draft);
    setStatus("reviewing");

    try {
      runId = await evidence.createRun({
        generationId: generationIdRef.current,
        buyerName: accepted.intake.buyerName,
        email: accepted.intake.email,
        elderName: accepted.intake.elderName,
        relationship: accepted.intake.relationship,
        originPlace: accepted.intake.originPlace,
        languageMix: accepted.intake.languageMix,
        audioStorageId: accepted.audioStorageId || undefined,
        hasAudio: Boolean(accepted.audioStorageId),
        photoCount: photos.length
      });
      runIdRef.current = runId;
      await evidence.markDraftReady(runId, accepted.draft.title);
    } catch (error) {
      warnings.push(error instanceof Error ? error.message : "The storybook run could not be saved.");
    }

    try {
      const page = await evidence.publishStoryPage(accepted.draft, runId || undefined);
      if (page) {
        evidence.recordEvent("publish_succeeded", { generationId: generationIdRef.current });
        publishedPath = `/s/${page.slug}`;
        setPublishedStoryPath(publishedPath);
        if (selectedGeneration && runId) await evidence.markGenerationPublished(selectedGeneration._id, runId);
      }
    } catch (error) {
      evidence.recordEvent("publish_failed", { generationId: generationIdRef.current, error: error instanceof Error ? error.message : "Publishing failed" });
      warnings.push(error instanceof Error ? error.message : "The storybook page could not be published.");
    }

    setIsPublishing(false);
    setPendingRecommendation(null);
    setStatus("ready");
    setWarning(warnings.join(" "));
    setMessage(
      publishedPath
        ? `Recommendations applied. Unlisted page published at ${publishedPath}.`
        : "Recommendations applied."
    );
  }

  function handleCancelRecommendation() {
    evidence.recordEvent("preview_rejected", { generationId: generationIdRef.current });
    setPendingRecommendation(null);
    setWarning("");
    setStatus(draft.sections.length ? "ready" : "idle");
    setMessage("Recommended changes cancelled. The current storybook was not changed.");
  }

  async function handleDeleteStoryPage(pageId: string) {
    if (!window.confirm("Delete this storybook page? The public link will stop working.")) {
      return;
    }

    setDeletingPageId(pageId);
    setMessage("");
    setWarning("");

    try {
      await evidence.deleteStoryPage(pageId);
      setMessage("Storybook page deleted. The public link now returns 404.");
    } catch (error) {
      setWarning(error instanceof Error ? error.message : "The storybook page could not be deleted.");
    } finally {
      setDeletingPageId(null);
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
    evidence.recordEvent("export_requested", { generationId: generationIdRef.current });
    if (runIdRef.current) {
      const saved = await evidence.publishStoryPage(draft, runIdRef.current);
      if (!saved) throw new Error("Save the story before exporting its QR code.");
      setPublishedStoryPath(`/s/${saved.slug}`);
    }
  }

  async function handleExportComplete() {
    if (runIdRef.current) {
      await evidence.markExported(runIdRef.current, draft.title || `${intake.elderName}'s Story`);
    }
  }

  function updateIntake(key: keyof IntakePayload, value: string) {
    if (pendingRecommendation) {
      setPendingRecommendation((current) =>
        current ? { ...current, intake: { ...current.intake, [key]: value } } : current
      );
      return;
    }

    setIntake((current) => ({ ...current, [key]: value }));
  }

  function updateDraft(key: keyof StorybookDraft, value: string) {
    if (pendingRecommendation) {
      setPendingRecommendation((current) =>
        current ? { ...current, draft: { ...current.draft, [key]: value } } : current
      );
      return;
    }

    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateSection(id: string, patch: Partial<StorySection>) {
    if (pendingRecommendation) {
      setPendingRecommendation((current) =>
        current
          ? {
              ...current,
              draft: {
                ...current.draft,
                sections: current.draft.sections.map((section) =>
                  section.id === id ? { ...section, ...patch } : section
                )
              }
            }
          : current
      );
      return;
    }

    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === id ? { ...section, ...patch } : section
      )
    }));
  }

  function loadDemo() {
    const seeded = demoIntake(intake);
    setPendingRecommendation(null);
    setIntake(seeded);
    setDraft(demoDraft(seeded));
    setStatus("ready");
    setMessage("Demo preview loaded. Review the extracted fields and storybook before export.");
  }

  return (
    <main className="app-shell">
      <section className="masthead screen-only">
        <div>
          <h1 className="visually-hidden">Charpai</h1>
          <div
            className={`brand-logo-lockup${isBrandCompact ? " is-compact" : ""}`}
            aria-hidden="true"
          >
            <Image
              className="brand-logo"
              src={charpaiLogo}
              alt=""
              priority
            />
          </div>
          <p className="masthead-copy">
            Record an interview here or upload a recording. Charpai extracts the family details, drafts the first
            storybook spread, and keeps every line editable before export.
          </p>
        </div>
        <div className="proof-strip" aria-label="Account actions">
          {auth.status === "authenticated" ? (
            <button className="session-button" type="button" disabled={isRecordingBusy} onClick={() => { setAudio(null); setDraft(emptyDraft()); setPhotos([]); setPendingRecommendation(null); setSavedAudioUrl(null); setActiveBookId(null); setStatus("idle"); evidence.openGeneration(null); void auth.signOut(); }}>
              <LogOut size={16} aria-hidden />
              Sign out
            </button>
          ) : null}
        </div>
      </section>

      {auth.status === "authenticated" ? <SavedDraftsPanel drafts={evidence.draftStories} onOpen={openSavedDraft} /> : null}
      {auth.status !== "authenticated" ? (
        <AuthGate auth={auth} />
      ) : evidence.paymentAvailable === undefined ? (
        <p role="status">Checking your storybook access…</p>
      ) : !activeBookId && (!evidence.paymentAvailable || Boolean(evidence.paymentResumeId)) ? (
        <section className="purchase-onboarding" aria-label="Unlock your first storybook">
          <p className="eyebrow">Your family story starts here</p>
          <h2>{evidence.paymentResumeId ? "Your storybook is waiting for you." : "One storybook. Four chances to get it right."}</h2>
          <p>{evidence.paymentResumeId ? "You’ve already paid for this storybook. Pick up where you left off." : "Pay ₹200 for 4 generation credits. Each new storybook draft uses 1 credit, so you can try again until your story feels right. Reading, editing and exporting your saved books do not use credits."}</p>
          {evidence.paymentResumeId ? <>
            <button className="primary-button" type="button" onClick={resumeStorybook}>Continue your storybook</button>
            {evidence.paymentAvailable ? <button className="session-button" type="button" onClick={startNewDraft}>Start a new draft · 1 credit</button> : null}
          </> : <RazorpayCheckout key={recordingRecoveryKey} />}
          <ProfileStoriesPanel deletingPageId={deletingPageId} onDelete={(pageId) => void handleDeleteStoryPage(pageId)} pages={evidence.storyPages} />
        </section>
      ) : (
      <section className={`workspace${activeDraft.sections.length ? "" : " workspace-empty"}`}>
        <aside className="intake-panel screen-only" aria-label="Storybook intake">
          {draft.sections.length && !hasPendingRecommendation ? <button className="session-button" type="button" onClick={startNewDraft}>Start another storybook</button> : null}
          <p role="status">{evidence.paymentCredits ?? 0} generation credits remaining. Retrying this draft uses no extra credit.</p>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{activeDraft.sections.length ? "Review" : "Audio intake"}</p>
              <h2>
                {activeDraft.sections.length ? "Extracted story details" : "Record an interview"}
              </h2>
            </div>
          </div>

          {savedAudioUrl ? <div className="recording-preview"><span>{selectedGeneration?.fileName || "Saved recording"}</span><audio controls src={savedAudioUrl} /><a className="session-button" href={savedAudioUrl} target="_blank" rel="noreferrer"><Download size={16} aria-hidden /> Download saved recording</a></div> : null}
          <div className="upload-zone">
            {!savedAudioUrl ? <AudioIntake
              onEvent={evidence.recordEvent}
              key={recordingRecoveryKey}
              recoveryKey={recordingRecoveryKey}
              audio={audio}
              onChange={setAudio}
              onBusyChange={setIsRecordingBusy}
              disabled={status === "generating" || hasPendingRecommendation || isPublishing}
            /> : null}
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

          {activeDraft.sections.length ? (
          <>
          <div className="field-section-heading">
            <p className="eyebrow">
              {hasPendingRecommendation
                ? "Recommended fields"
                : activeDraft.sections.length
                  ? "Extracted fields"
                  : "Details"}
            </p>
            <span>
              {activeDraft.sections.length
                ? "Correct anything the transcript missed."
                : "Charpai fills these after the recording is processed."}
            </span>
          </div>

          {activeDraft.sections.length && fieldsNeedReview ? (
            <div className="notice warning">
              <AlertTriangle size={18} aria-hidden />
              <span>Some core fields are still blank. Review the transcript and fill them before export.</span>
            </div>
          ) : null}

          <div className="field-grid">
            <TextField
              label="Elder name"
              value={activeIntake.elderName}
              onChange={(value) => updateIntake("elderName", value)}
            />
            <TextField
              label="Relationship"
              value={activeIntake.relationship}
              onChange={(value) => updateIntake("relationship", value)}
            />
            <TextField
              label="Origin place"
              value={activeIntake.originPlace}
              onChange={(value) => updateIntake("originPlace", value)}
            />
            <TextField
              label="Languages in the recording"
              value={activeIntake.languageMix}
              onChange={(value) => updateIntake("languageMix", value)}
            />
          </div>

          </>
          ) : null}

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
                  <Loader2 className="spin" size={18} aria-hidden />
                  {generationStage.buttonLabel}
                </>
              ) : (
                <>
                  <Sparkles size={18} aria-hidden /> {selectedGeneration?.status === "failed" ? "Resume saved draft" : "Generate preview"}
                </>
              )}
            </button>
          </div>

          {!pendingRecommendation && status === "ready" && draft.languageNote ? (
            <LanguageReviewAlert note={draft.languageNote} />
          ) : null}

          {status === "generating" ? (
            <GenerationProgress stage={generationStage} completedParts={selectedGeneration?.completedParts} totalParts={selectedGeneration?.totalParts} />
          ) : null}

          {selectedGeneration ? <details className="profile-story-panel saved-work"><summary>Saved work for this draft</summary>
            <ul><li>Original recording and entered details</li>
              {selectedGeneration.photos.length ? <li>{selectedGeneration.photos.length} family photos</li> : null}
              {selectedGeneration.completedSteps.includes("audio.parts") ? <li>Prepared recording parts</li> : null}
              {selectedGeneration.completedParts ? <li>{selectedGeneration.completedParts} completed transcript parts</li> : null}
              {selectedGeneration.completedSteps.includes("transcript") ? <li>Complete transcript</li> : null}
              {selectedGeneration.completedSteps.includes("intake") ? <li>Extracted family details</li> : null}
              {selectedGeneration.completedSteps.includes("draft.text") ? <li>Storybook text</li> : null}
              {selectedGeneration.completedSteps.filter(key => key.startsWith("illustration.")).length ? <li>{selectedGeneration.completedSteps.filter(key => key.startsWith("illustration.")).length} completed illustrations</li> : null}
            </ul>
          </details> : null}
          {pendingRecommendation ? (
            <RecommendationReview
              recommendation={pendingRecommendation}
              isPublishing={isPublishing}
              onCancel={handleCancelRecommendation}
              onConfirm={handleConfirmRecommendation}
            />
          ) : null}

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

          <ProfileStoriesPanel
            deletingPageId={deletingPageId}
            onDelete={(pageId) => void handleDeleteStoryPage(pageId)}
            pages={evidence.storyPages}
          />
        </aside>

        <section className="book-workbench" aria-label="Editable storybook">
          <div className="editor-toolbar screen-only">
            <div>
              <p className="eyebrow">{hasPendingRecommendation ? "Pending preview" : "Storybook"}</p>
              <h2>{activeDraft.title || "Waiting for a recording"}</h2>
            </div>

          </div>

          <div id="storybook-print-area" className="storybook-page">
            {activeDraft.sections.length ? (
              <StorybookEditor
                draft={activeDraft}
                photos={photos}
                onDraftChange={updateDraft}
                onSectionChange={updateSection}
                storyUrl={hasPendingRecommendation ? undefined : publishedStoryPath}
                allowExport={!hasPendingRecommendation}
                onBeforeExport={handleExport}
                onAfterExport={handleExportComplete}
              />
            ) : (
              <EmptyBook />
            )}
          </div>

          {activeDraft.sections.length ? (
            <div className="transcript-panel screen-only">
              <div>
                <p className="eyebrow">Transcript review</p>
                <h3>Correct names and mixed-language phrases</h3>
              </div>
              <textarea
                value={activeDraft.transcript}
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

function GenerationProgress({
  stage, completedParts, totalParts
}: {
  completedParts?: number; totalParts?: number;
  stage: (typeof generationStages)[number];
}) {
  const stageIndex = generationStages.findIndex((candidate) => candidate.id === stage.id);

  return (
    <section className="generation-progress">
      <div
        className="generation-progress-heading"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div>
          <p className="eyebrow">Working on your story</p>
          <h3>{stage.label}</h3>
        </div>
        <span>{stageIndex + 1} / {generationStages.length}</span>
      </div>
      <p>{stage.detail}{stage.id === "transcribing" && totalParts ? ` ${completedParts || 0} of ${totalParts} recording parts saved.` : ""}</p>
      <p>Your completed steps are saved. You can leave this page and return later.</p>
      <div
        className="generation-progress-track"
        role="progressbar"
        aria-label="Story generation progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={stage.progress}
      >
        <span style={{ width: `${stage.progress}%` }} />
      </div>
      <ol aria-label="Generation steps">
        {generationStages.map((candidate, index) => (
          <li
            className={
              index < stageIndex ? "complete" : index === stageIndex ? "active" : undefined
            }
            key={candidate.id}
          >
            <span aria-hidden>{index < stageIndex ? "✓" : index + 1}</span>
            {candidate.label}
          </li>
        ))}
      </ol>
    </section>
  );
}

function SavedDraftsPanel({drafts, onOpen}: {drafts: SavedGeneration[] | undefined; onOpen: (id: string) => void}) {
  const saved = drafts?.filter(d => d.status !== "published");
  if (!saved?.length) return null;
  return <section className="profile-story-panel saved-drafts-panel screen-only" aria-label="Saved drafts">
    <div className="profile-story-heading"><div><p className="eyebrow">Saved drafts</p><h3>Pick up where you left off</h3></div><span>{saved.length}</span></div>
    <p className="profile-story-empty">Recordings and finished steps are kept here. Resuming uses no extra credit.</p>
    <ul className="profile-story-list">{saved.map(d => <li key={d._id}>
      <div><strong>{d.title}</strong><span>{d.fileName}</span>
        <span>{d.status === "ready" ? "Ready to review" : d.status === "failed" ? "Paused · completed work saved" : generationStages.find(s => s.id === d.stage)?.label || "Saved draft"}
          {d.totalParts && d.stage === "transcribing" ? ` · ${d.completedParts}/${d.totalParts} recording parts saved` : ""}</span>
      </div><button className="secondary-button" type="button" onClick={() => onOpen(d._id)}>Open draft</button>
    </li>)}</ul>
  </section>;
}

function RecommendationReview({
  recommendation,
  isPublishing,
  onCancel,
  onConfirm
}: {
  recommendation: PendingRecommendation;
  isPublishing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {

  return (
    <section className="recommendation-review">
      <div className="recommendation-heading">
        <div>
          <p className="eyebrow">Recommended changes</p>
          <h3>{recommendation.draft.title || "Generated storybook preview"}</h3>
        </div>
        <span>Saved draft</span>
      </div>

      <dl className="recommendation-fields">
        <div>
          <dt>Elder</dt>
          <dd>{recommendation.intake.elderName || "Needs review"}</dd>
        </div>
        <div>
          <dt>Relationship</dt>
          <dd>{recommendation.intake.relationship || "Needs review"}</dd>
        </div>
        <div>
          <dt>Place</dt>
          <dd>{recommendation.intake.originPlace || "Needs review"}</dd>
        </div>
        <div>
          <dt>Language</dt>
          <dd>{recommendation.intake.languageMix || "Needs review"}</dd>
        </div>
      </dl>

      <div className="recommendation-actions">
        <button className="secondary-button" type="button" disabled={isPublishing} onClick={onCancel}>
          Cancel
        </button>
        <button className="primary-button" type="button" disabled={isPublishing} onClick={onConfirm}>
          {isPublishing ? (
            <>
              <Loader2 className="spin" size={18} aria-hidden /> Publishing
            </>
          ) : (
            <>
              <CheckCircle2 size={18} aria-hidden /> Confirm changes
            </>
          )}
        </button>
      </div>

      {recommendation.draft.languageNote ? (
        <LanguageReviewAlert note={recommendation.draft.languageNote} />
      ) : null}
    </section>
  );
}

function LanguageReviewAlert({ note }: { note: string }) {
  return (
    <div className="notice warning" role="alert">
      <AlertTriangle size={18} aria-hidden />
      <span>{note}</span>
    </div>
  );
}

function ProfileStoriesPanel({
  deletingPageId,
  onDelete,
  pages
}: {
  deletingPageId: string | null;
  onDelete: (pageId: string) => void;
  pages: StorybookPageSummary[] | undefined;
}) {
  return (
    <section className="profile-story-panel">
      <div className="profile-story-heading">
        <div>
          <p className="eyebrow">Profile</p>
          <h3>Your stories</h3>
        </div>
        <span>{pages ? pages.length : "..."}</span>
      </div>

      {pages === undefined ? (
        <p className="profile-story-empty">Loading stories.</p>
      ) : pages.length ? (
        <ul className="profile-story-list">
          {pages.map((page) => (
            <li key={page._id}>
              <div>
                <strong>{page.title || "Untitled Charpai story"}</strong>
                <span>{page.subtitle || formatStoryDate(page.createdAt)}</span>
              </div>
              <div className="profile-story-actions">
                <a
                  className="icon-link"
                  href={`/s/${page.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${page.title || "storybook page"}`}
                >
                  <ExternalLink size={17} aria-hidden />
                </a>
                <button
                  className="icon-button"
                  type="button"
                  disabled={deletingPageId === String(page._id)}
                  onClick={() => onDelete(String(page._id))}
                  aria-label={`Delete ${page.title || "storybook page"}`}
                >
                  {deletingPageId === String(page._id) ? (
                    <Loader2 className="spin" size={17} aria-hidden />
                  ) : (
                    <Trash2 size={17} aria-hidden />
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="profile-story-empty">Published story pages appear here.</p>
      )}
    </section>
  );
}

function formatStoryDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(timestamp));
}

function AuthGate({ auth }: { auth: ReturnType<typeof useAuthSession> }) {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [needsAccount, setNeedsAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const unavailable = auth.status === "unavailable";

  async function handleGoogleSignIn() {
    setAuthMessage("");
    setNeedsAccount(false);
    setIsSubmitting(true);
    try {
      await auth.signInWithGoogle();
    } catch {
      setAuthMessage("Google sign-in could not start. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthMessage("");
    setNeedsAccount(false);
    setIsSubmitting(true);

    try {
      if (mode === "signUp") {
        await auth.signUpWithEmail(email, password);
      } else {
        await auth.signInWithEmail(email, password);
      }
    } catch (error) {
      const data = error && typeof error === "object" && "data" in error ? error.data : null;
      const code = data && typeof data === "object" && "code" in data ? data.code : null;
      const missingAccount = mode === "signIn" && code === "ACCOUNT_NOT_FOUND";
      setNeedsAccount(missingAccount);
      setAuthMessage(missingAccount
        ? "No email account found. Create an account to get started, or continue with Google if you signed up that way."
        : code === "INCORRECT_PASSWORD"
          ? "Incorrect password. Try again, or continue with Google if you signed up that way."
          : mode === "signUp"
            ? "We could not create this account. If you already registered, choose Sign in or Continue with Google."
            : "Sign-in was unsuccessful. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-gate screen-only" aria-label="Charpai login">
      <div className="auth-card">
        <div className="auth-card-heading">
          <p className="eyebrow">Login</p>
          <h2>{mode === "signUp" ? "Sign up on Charpai" : "Sign in to Charpai"}</h2>
        </div>

        <button
          className="google-button"
          type="button"
          disabled={isSubmitting || auth.status === "loading" || unavailable}
          onClick={handleGoogleSignIn}
        >
          <Image src="/google-g.png" alt="" width={20} height={20} aria-hidden />
          <span>Continue with Google</span>
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

          <div className="auth-actions">
            <button
              className="form-switch"
              type="button"
              disabled={isSubmitting || unavailable}
              onClick={() => { setAuthMessage(""); setNeedsAccount(false); setMode((current) => (current === "signIn" ? "signUp" : "signIn")); }}
            >
              {mode === "signIn" ? "Sign up" : "Sign in"}
            </button>
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
          </div>
        </form>

        {unavailable ? (
          <div className="notice warning">
            <AlertTriangle size={18} aria-hidden />
            <span>Set Convex and Auth environment variables to enable login.</span>
          </div>
        ) : null}
        {authMessage ? (
          <div className="notice error" role="alert">
            <AlertTriangle size={18} aria-hidden />
            <div>
              <p style={{ margin: 0 }}>{authMessage}</p>
              {needsAccount ? <button className="form-switch" style={{ marginTop: 10 }} type="button"
                onClick={() => { setMode("signUp"); setAuthMessage(""); setNeedsAccount(false); }}>
                Create an account
              </button> : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function StorybookEditor({ draft, photos, onDraftChange, onSectionChange, storyUrl, allowExport, onBeforeExport, onAfterExport }: {
  draft: StorybookDraft; photos: PhotoPreview[];
  onDraftChange: (key: keyof StorybookDraft, value: string) => void;
  onSectionChange: (id: string, patch: Partial<StorySection>) => void;
  storyUrl?: string; allowExport: boolean; onBeforeExport: () => Promise<void>; onAfterExport: () => Promise<void>;
}) {
  return <>
    <StorybookReader story={draft} storyUrl={storyUrl} showExport={allowExport} onBeforeExport={onBeforeExport} onAfterExport={onAfterExport} />
    <details className="folio-edit-fields screen-only">
      <summary>Edit story text</summary>
      <label>Book title<input value={draft.title} onChange={event => onDraftChange("title", event.target.value)} /></label>
      <label>Subtitle<input value={draft.subtitle} onChange={event => onDraftChange("subtitle", event.target.value)} /></label>
      <label>Dedication<AutoSizeTextArea value={draft.dedication} onChange={value => onDraftChange("dedication", value)} rows={3} ariaLabel="Dedication" /></label>
      {draft.sections.map(section => <div key={section.id}>
        <label>Page heading<input value={section.heading} onChange={event => onSectionChange(section.id, { heading: event.target.value })} aria-label={`Heading for ${section.id}`} /></label>
        <label>Story text<AutoSizeTextArea value={section.body} onChange={value => onSectionChange(section.id, { body: value })} rows={7} ariaLabel={`Body for ${section.id}`} /></label>
      </div>)}
      <label>Closing note<AutoSizeTextArea value={draft.closingNote} onChange={value => onDraftChange("closingNote", value)} rows={4} ariaLabel="Closing note" /></label>
      {photos.length ? <section className="scrapbook-photos" aria-label="Uploaded family photos">{photos.map(photo => <figure key={photo.id}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.url} alt={photo.name} />
      </figure>)}</section> : null}
    </details>
  </>;
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
    <>
    <div className={`print-text ${className || ""}`} aria-hidden="true">{value}</div>
    <textarea
      aria-label={ariaLabel}
      className={className}
      onChange={(event) => onChange(event.target.value)}
      ref={ref}
      rows={rows}
      value={value}
    />
    </>
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
