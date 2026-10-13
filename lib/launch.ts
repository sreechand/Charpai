/** Default to update collection; set CHARPAI_LAUNCHED=true to open the app. */
export function isCharpaiLaunched() {
  return process.env.CHARPAI_LAUNCHED === "true";
}
