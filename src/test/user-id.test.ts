import { describe, expect, it } from "vitest";
import { cleanUserId, suggestUserId, USER_ID_RE } from "@/lib/user-id";

describe("user id", () => {
  it("suggests an ID from the name", () => {
    expect(suggestUserId("Rahul Kumar")).toMatch(/^rahul_\d{4}$/);
  });
  it("cleans spaces and symbols", () => {
    expect(cleanUserId("Ra hul@#1")).toBe("rahul1");
  });
  it("rejects IDs shorter than 4", () => {
    expect(USER_ID_RE.test("abc")).toBe(false);
  });
});
