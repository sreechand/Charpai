import Link from "next/link";
import { StorybookReader } from "@/components/storybook-reader";
import type { CharpaiDraftDesign, StorySection } from "@/lib/storybook";

export type PublicStorybook = {
  coverSubtitle?: string;
  slug: string; title: string; subtitle: string; dedication: string; languageNote: string;
  sections: StorySection[]; closingNote: string; illustrationBrief: string;
  stampSubject: string; stampMotifs: string[]; illustrationUrl: string | null;
  photoCaptions: string[]; designSystem: CharpaiDraftDesign; createdAt: number; updatedAt: number;
};

export function StorybookPublic({ story }: { story: PublicStorybook }) {
  return <main className="public-story-shell folio-public-shell">
    <header className="folio-public-header screen-only"><Link href="/">Charpai</Link><span>Unlisted family story</span></header>
    <StorybookReader story={story} storyUrl={`/s/${story.slug}`} />
  </main>;
}
