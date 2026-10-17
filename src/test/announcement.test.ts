import { describe, expect, it } from "vitest";
import { shouldShowAnnouncement } from "@/lib/announcement";
describe("Announcement cooldown", () => {
  it("shows no more than once in 24 hours", () => {
    const seen = 1000;
    expect(shouldShowAnnouncement(seen, seen + 24 * 60 * 60 * 1000 - 1)).toBe(false);
    expect(shouldShowAnnouncement(seen, seen + 24 * 60 * 60 * 1000)).toBe(true);
  });
});