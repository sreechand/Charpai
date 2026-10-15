import type {PDFDocument} from "pdf-lib";

export const STORYBOOK_WEBSITE = "charpai.stories.here.now";

export function storybookPdfFilename(title: string) {
  const name = title.normalize("NFC").replace(/[^\p{L}\p{M}\p{N}\u200c\u200d]+/gu, "_").replace(/^_+|_+$/g, "") || "Storybook";
  return `Charpai_${name}.pdf`;
}

export function setStorybookPdfMetadata(pdf: PDFDocument, title: string) {
  pdf.setTitle(title);
  pdf.setCreator(`Charpai (${STORYBOOK_WEBSITE})`);
  pdf.setSubject(STORYBOOK_WEBSITE);
  pdf.setKeywords(["Charpai", STORYBOOK_WEBSITE]);
}

/** Export the same fixed page DOM used by the reader; load heavy tools on demand. */
export async function createStorybookPdf(container: HTMLElement, title: string) {
  await document.fonts.ready;
  if (container.dataset.paginationReady !== "true") throw new Error("The storybook is still arranging its pages. Try again in a moment.");
  const pages = Array.from(container.querySelectorAll<HTMLElement>("[data-export-page]"));
  if (pages.length < 2) throw new Error("Add a story before exporting.");
  await Promise.all(Array.from(container.querySelectorAll("img")).map(async image => {
    try { await image.decode(); }
    catch { throw new Error("A story image could not be loaded. Reload the story and try exporting again."); }
  }));
  const [{ toPng, getFontEmbedCSS }, { PDFDocument, PDFName, PDFString }] = await Promise.all([
    import("html-to-image"), import("pdf-lib")
  ]);
  const pdf = await PDFDocument.create();
  setStorybookPdfMetadata(pdf, title);
  // The front cover is a single right-hand page; even pages face left afterwards.
  pdf.catalog.set(PDFName.of("PageLayout"), PDFName.of("TwoPageRight"));
  // Embedded font rules are shared by every page, rather than fetched per page.
  const fontEmbedCSS = await getFontEmbedCSS(pages[0]);
  const width = 148 * 72 / 25.4;
  const height = 210 * 72 / 25.4;
  // Allocate every leaf first so contents can link to chapters not yet drawn.
  const pdfPages = pages.map(() => pdf.addPage([width, height]));
  for (const [index, node] of pages.entries()) {
    if (node.scrollHeight > node.clientHeight + 2) throw new Error("One book page needs more room. Wait for pagination and try again.");
    const prose = node.querySelector<HTMLElement>(".folio-prose");
    const artwork = node.querySelector<HTMLElement>(".folio-artifact");
    const footer = node.querySelector<HTMLElement>("footer");
    if (prose && prose.offsetTop + prose.scrollHeight > (artwork ? artwork.offsetTop - 16 : footer ? footer.offsetTop - 16 : node.clientHeight - 60)) {
      throw new Error("One page needs more room. Wait for the layout to finish and try again.");
    }
    const png = await toPng(node, { pixelRatio: 2.5, width: 640, height: 908, fontEmbedCSS,
      backgroundColor: getComputedStyle(node).backgroundColor,
      style: { margin: "0", boxShadow: "none", transform: "none" } });
    const image = await pdf.embedPng(png);
    const page = pdfPages[index];
    page.drawImage(image, { x: 0, y: 0, width, height });
    const annotations = [];
    for (const link of node.querySelectorAll<HTMLAnchorElement>(".folio-qr, [data-source-link][href], [data-book-page]")) {
      const rect = link.getBoundingClientRect();
      const bounds = node.getBoundingClientRect();
      const destination = link.dataset.bookPage === undefined ? null : Number(link.dataset.bookPage);
      if (destination !== null && (!Number.isInteger(destination) || destination < 1 || destination > pdfPages.length)) throw new Error("A contents entry points outside this book. Try exporting after pagination finishes.");
      const annotation = pdf.context.register(pdf.context.obj({
        Type: "Annot", Subtype: "Link", Border: [0, 0, 0],
        Rect: [(rect.left - bounds.left) / 640 * width, height - (rect.bottom - bounds.top) / 908 * height,
          (rect.right - bounds.left) / 640 * width, height - (rect.top - bounds.top) / 908 * height],
        ...(destination === null ? {A: {Type:"Action",S:PDFName.of("URI"),URI:PDFString.of(link.href)}} : {Dest:[pdfPages[destination-1].ref,PDFName.of("Fit")]})
      }));
      annotations.push(annotation);
    }
    if (annotations.length) page.node.set(PDFName.of("Annots"), pdf.context.obj(annotations));
  }
  return await pdf.save();
}

export async function downloadStorybookPdf(container: HTMLElement, title: string) {
  const bytes = await createStorybookPdf(container, title);
  const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = storybookPdfFilename(title);
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
