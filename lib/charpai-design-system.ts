export const charpaiDesignSystem = {
  source: {
    repository: "https://github.com/sreechand/Charpai-Design-System-v1.0",
    inspectedCommit: "8722c94975afe806e6d3dc8bff04d46723c8e927"
  },
  colors: {
    paper: "#F4F0E5",
    paperDeep: "#EDE7D8",
    paperEdge: "#E2DAC6",
    paperMount: "#E9E2D0",
    ink: "#241F1B",
    inkSoft: "#554C42",
    inkFaint: "#8A8074",
    inkRule: "#CFC6B2",
    oxide: "#9C4A2F",
    penBlue: "#2C3E5C",
    banyan: "#4F5F3C",
    wrapperGold: "#D7A84A",
    uniform: "#3F5147",
    teak: "#6B4A2B",
    testCard: "#2E6C79",
    carbon: "#6A4E7C",
    chrome: "#8C9196"
  },
  fonts: {
    story: "Gentium Book Plus, Georgia, serif",
    ui: "Inter, system-ui, sans-serif",
    hand: "Caveat or Kalam, cursive",
    regional: "Noto Serif Telugu / Noto Serif Devanagari where the transcript requires it"
  },
  spacing: {
    touch: "8px",
    object: "16px",
    thought: "32px",
    scene: "48-80px",
    breath: "72-128px",
    silence: "120-240px"
  },
  principles: [
    "A storybook is a memory world, not a decade theme.",
    "Colors come from evidence in the transcript: place, artifacts, narrator, material, and recollection.",
    "The base surface is high-quality uncoated book stock, not aged or stained paper.",
    "Elevation expresses physical state: printed, mounted, loose, lifted, or overlay.",
    "Artifacts should preserve their own scale and material logic; do not crop or enlarge them just to fill space.",
    "Use documentary labels quietly; prose and artifacts should carry the emotion."
  ]
} as const;

export const charpaiStorybookPrompt = `
Charpai Design System v1.0:
- Treat the storybook as a memory world: Period x Geography x Artifacts x Recollection. Do not use generic nostalgia, decade themes, scrapbook clutter, or decorative vintage styling.
- Build the visual language from evidence in the transcript: place, route, room, food, document, object, weather, handwriting, family phrase, or surviving photograph.
- Foundation palette: paper #F4F0E5, deep paper #EDE7D8, paper edge #E2DAC6, ink #241F1B, soft ink #554C42, faint ink #8A8074, rule #CFC6B2.
- Memory accents must come from the Charpai palette when possible: oxide #9C4A2F, pen blue #2C3E5C, banyan #4F5F3C, wrapper gold #D7A84A, uniform green #3F5147, teak #6B4A2B, test-card teal #2E6C79, carbon violet #6A4E7C, chrome #8C9196.
- Typography intent: story prose is serif and literary; documentary labels are small uppercase UI text; handwriting is narrator-specific and should feel like fountain pen, ballpoint, pencil, or margin note.
- Spacing is semantic: touch 8px, object 16px, thought 32px, scene 48-80px, breath 72-128px, silence 120-240px.
- Physical constructions are allowed in the concept: mounted photograph, field note, tracing overlay, gatefold, pocket, document reverse, route strip, receipt, school record, recipe card, or typed label.
`;

export function defaultCharpaiDraftDesign(originPlace = "home") {
  return {
    memoryWorldLabel: `${originPlace} family memory`,
    accent: charpaiDesignSystem.colors.oxide,
    deep: charpaiDesignSystem.colors.banyan,
    handInk: charpaiDesignSystem.colors.penBlue,
    handStyle: "fountain pen margin note",
    constructionNotes:
      "A quiet printed spread on uncoated paper, with one mounted artifact and small documentary labels.",
    artifactForms: ["mounted photograph", "field note", "route fragment"]
  };
}
