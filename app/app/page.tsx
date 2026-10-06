import { Suspense } from "react";
import { StorybookApp } from "@/components/storybook-app";

export default function StorybookWorkspace() {
  return <Suspense fallback={null}><StorybookApp /></Suspense>;
}
