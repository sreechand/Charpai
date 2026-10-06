import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";
import "./landing.css";

export const metadata: Metadata = {
  title: "Charpai — nostalgia trips into storybooks",
  description: "Record a conversation with someone in your family and turn their memories into an editable, illustrated digital storybook."
};

export default function Home() {
  return <LandingPage />;
}
