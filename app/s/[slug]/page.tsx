import { ConvexHttpClient } from "convex/browser";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { api } from "@/convex/_generated/api";
import { StorybookPublic } from "@/components/storybook-public";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default async function PublicStorybookPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    notFound();
  }

  const convex = new ConvexHttpClient(convexUrl);
  const story = await convex.query(api.storybookPages.getPublicBySlug, { slug });

  if (!story) {
    notFound();
  }

  return <StorybookPublic story={story} />;
}
