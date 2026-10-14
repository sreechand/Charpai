import { Suspense } from "react";
import { StorybookApp } from "@/components/storybook-app";

export default function StorybookWorkspace() {
  // Homepage launch visibility is separate from authenticated app access.
  return <Suspense fallback={null}><StorybookApp /></Suspense>;
}
