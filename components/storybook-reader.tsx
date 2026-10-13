"use client";

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import QRCode from "qrcode";
import type { StorySection } from "@/lib/storybook";
import { paginateStoryText } from "@/lib/storybook-pagination";

export type ReaderStory = {
  title: string; subtitle: string; dedication: string; closingNote: string;
  sections: StorySection[]; stampSubject?: string; illustrationUrl?: string | null;
};
type ReadingPage = { key: string; section: StorySection; body: string; continued: boolean };

export function StoryQrCode({ url }: { url: string }) {
  const qr = useMemo(() => QRCode.create(url, { errorCorrectionLevel: "M" }), [url]);
  const size = qr.modules.size;
  const cells: string[] = [];
  for (let row = 0; row < size; row++) for (let col = 0; col < size; col++) {
    if (qr.modules.get(row, col)) cells.push(`M${col + 4},${row + 4}h1v1h-1z`);
  }
  return <a href={url} className="folio-qr" aria-label="Open this story online">
    <svg viewBox={`0 0 ${size + 8} ${size + 8}`} role="img" aria-label="QR code for this story" shapeRendering="crispEdges">
      <rect width={size + 8} height={size + 8} fill="#f2eee3" />
      <path d={cells.join("")} fill="#264c3e" />
    </svg>
  </a>;
}

export function StorybookReader({ story, storyUrl, showExport = true, onBeforeExport, onAfterExport }: {
  story: ReaderStory; storyUrl?: string; showExport?: boolean; onBeforeExport?: () => Promise<void>; onAfterExport?: () => Promise<void>;
}) {
  const [pages, setPages] = useState<ReadingPage[]>([]);
  const [position, setPosition] = useState(0);
  const origin = useSyncExternalStore(subscribeOrigin, () => window.location.origin, () => "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const exportRef = useRef<HTMLDivElement>(null);
  const absoluteUrl = storyUrl ? (/^https?:\/\//.test(storyUrl) ? storyUrl : origin ? new URL(storyUrl, origin).href : "") : "";

  useEffect(() => {
    let cancelled = false;
    async function paginate() {
      await document.fonts.ready;
      if (cancelled) return;
      const probe = document.createElement("div");
      probe.className = "folio-measure";
      document.body.appendChild(probe);
      const measure = (text: string) => {
        if (probe.classList.contains("folio-measure-heading")) probe.textContent = text;
        else probe.replaceChildren(...text.split(/\n\s*\n/).map(paragraph => {
          const node = document.createElement("p"); node.textContent = paragraph; return node;
        }));
        return probe.getBoundingClientRect().height;
      };
      const output: ReadingPage[] = [];
      for (const [index, source] of story.sections.entries()) {
        const section = { ...source,
          artifactSubject: source.artifactSubject || (index === 0 ? story.stampSubject : ""),
          illustrationUrl: source.illustrationUrl || (index === 0 ? story.illustrationUrl : null) };
        probe.classList.add("folio-measure-heading");
        const headingHeight = measure(section.heading);
        probe.classList.remove("folio-measure-heading");
        const content = [index === 0 && story.dedication.length > 160 ? story.dedication : "", section.body, index === story.sections.length - 1 ? story.closingNote : ""].filter(Boolean).join("\n\n");
        const chunks = paginateStoryText(content, Math.max(130, 370 - headingHeight), measure);
        for (const [part, body] of chunks.entries()) output.push({ key: `${index}-${part}`, section, body, continued: part > 0 });
      }
      probe.remove();
      if (!cancelled) setPages(output);
    }
    void paginate();
    return () => { cancelled = true; };
  }, [story]);

  const spreads = Math.ceil(pages.length / 2);
  const current = Math.min(position, spreads);
  const visiblePages = current > 0 ? pages.slice((current - 1) * 2, current * 2) : [];
  const move = (direction: number) => setPosition(Math.max(0, Math.min(spreads, current + direction)));

  async function exportBook() {
    setBusy(true); setError("");
    try {
      await onBeforeExport?.();
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      if (!exportRef.current) throw new Error("The storybook is still loading.");
      const { downloadStorybookPdf } = await import("@/lib/storybook-pdf");
      await downloadStorybookPdf(exportRef.current, story.title);
      await onAfterExport?.();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The PDF could not be created. Try again."); }
    finally { setBusy(false); }
  }

  return <section className="folio-reader" aria-label="Storybook reader">
    <div className="folio-toolbar screen-only">
      <span>{current === 0 ? "Cover" : `Spread ${current} of ${spreads}`}</span>
      {showExport ? <button type="button" className="folio-export" disabled={busy || !pages.length} onClick={exportBook}>
        <Download size={17} aria-hidden />{busy ? "Creating PDF…" : "Export PDF"}
      </button> : null}
    </div>
    {!storyUrl ? <p className="folio-unsaved screen-only">Save the story to add its QR code and online link.</p> : null}
    {error ? <p role="alert" className="folio-export-error screen-only">{error}</p> : null}
    <div className={`folio-stage screen-only${current === 0 ? " folio-closed" : ""}`}>
      {current === 0 ? <Cover story={story} /> : visiblePages.map((page, index) => <StoryPage key={page.key} page={page} url={absoluteUrl} number={(current - 1) * 2 + index + 1} />)}
    </div>
    <nav className="folio-navigation screen-only" aria-label="Turn storybook pages">
      <button type="button" onClick={() => move(-1)} disabled={current === 0} aria-label="Previous pages"><ChevronLeft aria-hidden /></button>
      <span aria-live="polite">{current === 0 ? "Open the book" : `Spread ${current} of ${spreads}`}</span>
      <button type="button" onClick={() => move(1)} disabled={current >= spreads || !pages.length} aria-label="Next pages"><ChevronRight aria-hidden /></button>
    </nav>
    <div className="folio-export-pages" ref={exportRef} aria-hidden="true" data-pagination-ready={pages.length > 0}>
      <Cover story={story} exporting />
      {pages.map((page, index) => <StoryPage key={page.key} page={page} url={absoluteUrl} number={index + 1} exporting />)}
    </div>
  </section>;
}

function Cover({ story, exporting = false }: { story: ReaderStory; exporting?: boolean }) {
  const image = story.sections[0]?.illustrationUrl || story.illustrationUrl;
  const compact = story.title.length > 65 || story.subtitle.length > 100;
  return <article className={`folio-page folio-cover${compact ? " folio-cover-compact" : ""}`} data-export-page={exporting || undefined}>
    <div className="folio-cover-panel">
      <span className="folio-cover-series">A FAMILY STORY</span>
      <div className="folio-cover-title"><h2>{story.title}</h2>
        {story.subtitle ? <p className="folio-cover-subtitle">{story.subtitle}</p> : null}
      </div>
      <div className="folio-cover-credit">
        {story.dedication && story.dedication.length <= 160 ? <p className="folio-cover-dedication">{story.dedication}</p> : null}
        <span className="folio-cover-brand">CHARPAI</span>
      </div>
    </div>
    <div className="folio-cover-art">
      {image ? <ArtifactImage src={image} alt={story.sections[0]?.artifactSubject || story.stampSubject || "Story artifact"} className="folio-cover-image" /> : <div className="folio-cover-emblem" aria-hidden="true">C</div>}
    </div>
  </article>;
}

function ArtifactImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const id = `folio-ink-${useId().replace(/:/g, "")}`;
  return <>
    <svg width="0" height="0" className="folio-ink-defs" aria-hidden="true"><defs>
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0 0 0 0 0.149  0 0 0 0 0.298  0 0 0 0 0.243  -0.3189 -1.0728 -0.1083 0 1.25" />
        <feComposite in2="SourceGraphic" operator="in" />
      </filter>
    </defs></svg>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className={className} src={src} alt={alt} crossOrigin="anonymous" style={{ filter: `url(#${id})` }} />
  </>;
}

function StoryPage({ page, url, number, exporting = false }: { page: ReadingPage; url: string; number: number; exporting?: boolean }) {
  return <article className="folio-page folio-story-page" data-export-page={exporting || undefined}>
    <h3>{page.section.heading}</h3>
    <div className="folio-prose">{page.body.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
    <figure className="folio-artifact">
      {page.section.illustrationUrl ? <ArtifactImage src={page.section.illustrationUrl} alt={page.section.artifactSubject || "Story artifact"} /> : <div className="folio-artwork-missing">{page.section.artifactSubject || "Artwork not available"}</div>}
      {page.section.artifactSubject ? <figcaption>{page.section.artifactSubject}</figcaption> : null}
    </figure>
    <footer>{url ? <StoryQrCode url={url} /> : <span />}<span>{page.continued ? "Continued · " : ""}{number}</span></footer>
  </article>;
}

const subscribeOrigin = () => () => {};
