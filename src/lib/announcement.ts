export const ANNOUNCEMENT_DAY_MS = 24 * 60 * 60 * 1000;
export function shouldShowAnnouncement(seenAt: number, now: number) {
  return !seenAt || now - seenAt >= ANNOUNCEMENT_DAY_MS;
}