import { describe, expect, it } from "vitest";
import { gardenMessage, matchesSecretPasscode, newTemplateKind } from "@/lib/new-templates";

describe("uploaded template rules", () => {
  it("Secret Birthday Gift unlocks with the original 2005 code when no passcode is set", () => {
    expect(matchesSecretPasscode("2005", undefined)).toBe(true);
    expect(matchesSecretPasscode("1111", undefined)).toBe(false);
  });
  it("Secret Birthday Gift uses the buyer's own 4-digit passcode when set", () => {
    expect(matchesSecretPasscode("0512", "0512")).toBe(true);
    expect(matchesSecretPasscode("2005", "0512")).toBe(false);
  });
  it("each of the five catalog categories opens its own presentation", () => {
    expect(["sweet-birthday", "apology", "secret-birthday", "garden", "heart-universe"].map(newTemplateKind)).toEqual(["sweet", "apology", "secret", "garden", "heart"]);
  });
  it("garden message keeps at most 4 lines and drops messages over 140 characters", () => {
    expect(gardenMessage("a\nb\nc\nd\ne")).toBe("a|b|c|d");
    expect(gardenMessage("x".repeat(141))).toBeUndefined();
  });
});
