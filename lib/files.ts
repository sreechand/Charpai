export type PhotoPreview = {
  id: string;
  name: string;
  url: string;
};

export const acceptedAudioTypes = [
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/x-m4a",
  "audio/wav",
  "audio/webm",
  "audio/ogg",
  "video/mp4"
];

export const maxAudioBytes = 100 * 1024 * 1024;

export function validateAudioFile(file: File | null) {
  if (!file) {
    return "Record or upload one interview before generating the storybook.";
  }

  if (file.size === 0) {
    return "The recording is empty. Record again or choose another file.";
  }

  if (file.size > maxAudioBytes) {
    return "The recording is too large. Keep v1 recordings under 100 MB and about 10 minutes.";
  }

  const lowerName = file.name.toLowerCase();
  const extensionAllowed = /\.(mp3|m4a|mp4|wav|webm|ogg)$/.test(lowerName);
  if (!acceptedAudioTypes.includes(file.type.split(";")[0]) && !extensionAllowed) {
    return "Use an mp3, m4a, mp4, wav, webm, or ogg recording.";
  }

  return "";
}

export function readPhotoPreviews(files: FileList | null): Promise<PhotoPreview[]> {
  const selected = Array.from(files || []).slice(0, 3);

  return Promise.all(
    selected.map(
      (file, index) =>
        new Promise<PhotoPreview>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
          reader.onload = () =>
            resolve({
              id: `${file.name}-${file.size}-${index}`,
              name: file.name,
              url: String(reader.result)
            });
          reader.readAsDataURL(file);
        })
    )
  );
}
