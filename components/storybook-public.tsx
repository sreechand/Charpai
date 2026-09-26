import type { CSSProperties } from "react";

import type { CharpaiDraftDesign, StorySection } from "@/lib/storybook";

export type PublicStorybook = {
  slug: string;
  title: string;
  subtitle: string;
  dedication: string;
  languageNote: string;
  sections: StorySection[];
  closingNote: string;
  illustrationBrief: string;
  stampSubject: string;
  stampMotifs: string[];
  illustrationUrl: string | null;
  photoCaptions: string[];
  designSystem: CharpaiDraftDesign;
  createdAt: number;
  updatedAt: number;
};

export function StorybookPublic({ story }: { story: PublicStorybook }) {
  return (
    <main className="public-story-shell" style={getStoryDesignStyle(story)}>
      <header className="public-story-header">
        <div>
          <p className="eyebrow">Charpai story</p>
          <h1>{story.title}</h1>
          {story.subtitle ? <p>{story.subtitle}</p> : null}
        </div>
        <span>Unlisted</span>
      </header>

      <article className="book public-book" aria-label={story.title}>
        <section className="visual-page public-visual-page" aria-label="Storybook memory world">
          <section
            className={`field-note-poster public-memory-poster${story.illustrationUrl ? " has-generated-image" : ""}`}
          >
            {story.illustrationUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="generated-story-image"
                src={story.illustrationUrl}
                alt={story.illustrationBrief || story.stampSubject}
              />
            ) : (
              <>
                <div className="public-memory-label">{story.designSystem.memoryWorldLabel}</div>
                <div className="public-memory-subject">{story.stampSubject}</div>
                <div className="public-motif-grid" aria-label="Visual motifs">
                  {story.stampMotifs.slice(0, 6).map((motif) => (
                    <span key={motif}>{motif}</span>
                  ))}
                </div>
              </>
            )}
          </section>

          {story.illustrationBrief ? (
            <p className="public-illustration-brief">{story.illustrationBrief}</p>
          ) : null}

        </section>

        <section className="text-page public-text-page" aria-label="Storybook text">
          <section className="book-cover public-book-cover">
            <h2>{story.title}</h2>
            {story.subtitle ? <p className="public-book-subtitle">{story.subtitle}</p> : null}
            {story.dedication ? <p className="public-book-dedication">{story.dedication}</p> : null}
          </section>

          {story.sections.map((section) => (
            <section className="story-section public-story-section" key={section.id}>
              <h3>{section.heading}</h3>
              <p>{section.body}</p>
            </section>
          ))}

          {story.closingNote ? (
            <section className="closing-note public-closing-note">
              <p>{story.closingNote}</p>
            </section>
          ) : null}
        </section>
      </article>
    </main>
  );
}

function getStoryDesignStyle(story: PublicStorybook) {
  return {
    "--memory-accent": story.designSystem.accent,
    "--memory-deep": story.designSystem.deep,
    "--hand-ink": story.designSystem.handInk
  } as CSSProperties;
}
