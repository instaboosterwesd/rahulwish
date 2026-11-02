import { describe, expect, it } from "vitest";
import { GENERIC_ACTION_ERROR, friendlyActionError } from "@/lib/friendly-error";

describe("friendlyActionError", () => {
  it("hides technical errors behind a short notice", () => {
    expect(friendlyActionError(new Error("Unauthorized: No authorization header provided"))).toBe(GENERIC_ACTION_ERROR);
    expect(friendlyActionError(new Error("Failed to fetch"))).toBe(GENERIC_ACTION_ERROR);
  });
  it("keeps real business messages", () => {
    expect(friendlyActionError(new Error("Not enough wallet balance. Please pay with UPI instead."))).toBe("Not enough wallet balance. Please pay with UPI instead.");
  });
});
