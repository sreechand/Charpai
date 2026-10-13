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
  pdf.setTitle(title); pdf.setCreator("Charpai");
  // Embedded font rules are shared by every page, rather than fetched per page.
  const fontEmbedCSS = await getFontEmbedCSS(pages[0]);
  const width = 148 * 72 / 25.4;
  const height = 210 * 72 / 25.4;
  for (const node of pages) {
    const prose = node.querySelector<HTMLElement>(".folio-prose");
    const artwork = node.querySelector<HTMLElement>(".folio-artifact");
    if (prose && prose.offsetTop + prose.scrollHeight > (artwork ? artwork.offsetTop - 16 : node.clientHeight - 60)) {
      throw new Error("One page needs more room. Wait for the layout to finish and try again.");
    }
    const png = await toPng(node, { pixelRatio: 2.5, width: 640, height: 908, fontEmbedCSS,
      backgroundColor: "#f2eee3",
      style: { margin: "0", boxShadow: "none", transform: "none" } });
    const image = await pdf.embedPng(png);
    const page = pdf.addPage([width, height]);
    page.drawImage(image, { x: 0, y: 0, width, height });
    const link = node.querySelector<HTMLAnchorElement>(".folio-qr");
    if (link) {
      const rect = link.getBoundingClientRect();
      const bounds = node.getBoundingClientRect();
      const annotation = pdf.context.register(pdf.context.obj({
        Type: "Annot", Subtype: "Link", Border: [0, 0, 0],
        Rect: [(rect.left - bounds.left) / 640 * width, height - (rect.bottom - bounds.top) / 908 * height,
          (rect.right - bounds.left) / 640 * width, height - (rect.top - bounds.top) / 908 * height],
        A: { Type: "Action", S: PDFName.of("URI"), URI: PDFString.of(link.href) }
      }));
      page.node.set(PDFName.of("Annots"), pdf.context.obj([annotation]));
    }
  }
  return await pdf.save();
}

export async function downloadStorybookPdf(container: HTMLElement, title: string) {
  const bytes = await createStorybookPdf(container, title);
  const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "charpai-story"}.pdf`;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
