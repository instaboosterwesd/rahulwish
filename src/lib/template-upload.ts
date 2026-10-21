export const templatePhotoTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export function validateTemplatePhoto(type: string, size: number) {
  if (!templatePhotoTypes.includes(type)) throw new Error('Choose a JPG, PNG, WebP or GIF photo.');
  if (size <= 0 || size > 10 * 1024 * 1024) throw new Error('Choose a photo smaller than 10 MB.');
}