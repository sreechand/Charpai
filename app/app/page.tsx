import { Suspense } from "react";
import { StorybookApp } from "@/components/storybook-app";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { isCharpaiLaunched } from "@/lib/launch";

export default async function StorybookWorkspace() {
  await connection();
  if (!isCharpaiLaunched()) redirect("/#start");
  return <Suspense fallback={null}><StorybookApp /></Suspense>;
}
