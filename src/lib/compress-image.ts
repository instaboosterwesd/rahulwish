// Browser-only: shrinks a photo to at most `maxSide` pixels and returns a JPEG data URL.
export async function compressImage(file: File, maxSide = 1280, quality = 0.82): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose image files");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser cannot prepare photos");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  if (dataUrl.length > 1_900_000) dataUrl = canvas.toDataURL("image/jpeg", 0.6);
  if (dataUrl.length > 1_900_000) throw new Error("This photo is too large. Please choose a smaller one.");
  return dataUrl;
}
