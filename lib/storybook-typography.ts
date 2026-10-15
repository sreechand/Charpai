/** Keep Telugu books on the same serif face used by the reviewed local edition. */
export function storybookScript(story: {title: string; sections: {heading: string; body: string}[]}) {
  const telugu = /[\u0c00-\u0c7f]/;
  return telugu.test(story.title) || story.sections.some(section => telugu.test(section.heading) || telugu.test(section.body))
    ? "telugu" : "default";
}
