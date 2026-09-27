import type { PublicStorybook } from "@/components/storybook-public";

export type HereNowFile = {
  path: string;
  contentType: string;
  bytes: ArrayBuffer;
};

export async function buildHereNowStorybookFiles(story: PublicStorybook): Promise<HereNowFile[]> {
  const files: HereNowFile[] = [];
  let illustrationPath = "";

  if (story.illustrationUrl) {
    try {
      const response = await fetch(story.illustrationUrl);
      if (response.ok) {
        const contentType = response.headers.get("content-type") || "image/webp";
        const extension = contentType.includes("png")
          ? "png"
          : contentType.includes("jpeg")
            ? "jpg"
            : "webp";
        illustrationPath = `illustration.${extension}`;
        files.push({
          path: illustrationPath,
          contentType,
          bytes: await response.arrayBuffer()
        });
      }
    } catch {
      illustrationPath = "";
    }
  }

  const html = renderStorybookHtml(story, illustrationPath);
  files.unshift({
    path: "index.html",
    contentType: "text/html; charset=utf-8",
    bytes: new TextEncoder().encode(html).buffer as ArrayBuffer
  });
  return files;
}

export function storybookLabel(title: string, storySlug: string) {
  const titleLabel = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
  const base = titleLabel.length >= 2 ? titleLabel : "family-story";
  const uniqueSuffix = storySlug.split("-").at(-1)?.slice(-8) || "storybook";
  return `${base}-${uniqueSuffix}`;
}

function renderStorybookHtml(story: PublicStorybook, illustrationPath: string) {
  const accent = safeHex(story.designSystem.accent, "#9C4A2F");
  const deep = safeHex(story.designSystem.deep, "#4F5F3C");
  const title = escapeHtml(story.title);
  const sections = story.sections
    .map(
      (section) => `
        <section class="story-section">
          <h2>${escapeHtml(section.heading)}</h2>
          <p>${escapeHtml(section.body)}</p>
        </section>`
    )
    .join("");
  const illustration = illustrationPath
    ? `<img src="./${illustrationPath}" alt="${escapeHtml(story.illustrationBrief || story.stampSubject)}">`
    : `<div class="memory-subject">${escapeHtml(story.stampSubject)}</div>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(story.subtitle || `A Charpai story: ${story.title}`)}">
  <title>${title}</title>
  <style>
    :root { --paper:#f4f0e5; --paper-deep:#ede7d8; --ink:#241f1b; --soft:#554c42; --line:#cfc6b2; --accent:${accent}; --deep:${deep}; }
    * { box-sizing:border-box; }
    html { background:#e8e1d2; -webkit-font-smoothing:antialiased; }
    body { margin:0; color:var(--ink); font-family:Georgia,"Times New Roman",serif; background:radial-gradient(circle at 25% 18%,rgba(36,31,27,.05) 0 1px,transparent 1.5px),var(--paper); background-size:34px 34px; }
    main { width:min(1180px,calc(100% - 32px)); margin:0 auto; padding:48px 0 72px; }
    header { max-width:780px; margin:0 auto 36px; text-align:center; }
    .eyebrow { margin:0 0 12px; color:var(--accent); font:700 12px/1.3 Arial,sans-serif; letter-spacing:.18em; text-transform:uppercase; }
    h1 { margin:0; font-size:clamp(42px,7vw,76px); font-weight:600; line-height:1.02; letter-spacing:-.025em; text-wrap:balance; }
    .subtitle { margin:16px 0 0; color:var(--soft); font-size:20px; line-height:1.45; }
    .book { display:grid; grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr); overflow:hidden; border:1px solid rgba(85,76,66,.2); border-radius:10px; background:rgba(244,240,229,.9); box-shadow:0 22px 60px rgba(66,48,31,.12); }
    .visual-page,.text-page { min-width:0; padding:clamp(28px,5vw,64px); }
    .visual-page { display:grid; align-content:center; min-height:720px; border-right:1px solid var(--line); background:rgba(237,231,216,.58); }
    .visual-page img { display:block; width:100%; aspect-ratio:1; object-fit:cover; }
    .memory-subject { display:grid; place-items:center; aspect-ratio:1; color:var(--deep); text-align:center; font-size:clamp(28px,5vw,54px); font-weight:600; text-wrap:balance; }
    .dedication { margin:0 0 32px; padding:0 0 28px; border-bottom:1px solid var(--line); color:var(--soft); font-size:18px; font-style:italic; line-height:1.55; }
    .story-section { padding:24px 0; }
    .story-section + .story-section { border-top:1px solid var(--line); }
    h2 { margin:0 0 10px; color:color-mix(in srgb,var(--accent) 42%,var(--ink)); font-size:30px; font-weight:600; line-height:1.15; text-wrap:balance; }
    .story-section p,.closing { margin:0; font-size:18px; line-height:1.7; white-space:pre-line; text-wrap:pretty; }
    .closing { margin-top:24px; padding-top:24px; border-top:2px solid color-mix(in srgb,var(--accent) 28%,transparent); color:var(--soft); font-style:italic; }
    footer { margin-top:22px; color:var(--soft); text-align:center; font:600 11px/1.4 Arial,sans-serif; letter-spacing:.14em; text-transform:uppercase; }
    @media (max-width:800px) { main { width:min(100% - 20px,680px); padding-top:20px; } .book { grid-template-columns:1fr; } .visual-page { min-height:0; border-right:0; border-bottom:1px solid var(--line); } }
    @media print { html,body { background:#fff; } main { width:100%; padding:0; } .book { border:0; box-shadow:none; } footer { display:none; } }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="eyebrow">Charpai story</p>
      <h1>${title}</h1>
      ${story.subtitle ? `<p class="subtitle">${escapeHtml(story.subtitle)}</p>` : ""}
    </header>
    <article class="book">
      <section class="visual-page">${illustration}</section>
      <section class="text-page">
        ${story.dedication ? `<p class="dedication">${escapeHtml(story.dedication)}</p>` : ""}
        ${sections}
        ${story.closingNote ? `<p class="closing">${escapeHtml(story.closingNote)}</p>` : ""}
      </section>
    </article>
    <footer>Preserved with Charpai</footer>
  </main>
</body>
</html>`;
}

function safeHex(value: string, fallback: string) {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    };
    return entities[character];
  });
}
