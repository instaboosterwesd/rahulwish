import { describe, expect, it } from "vitest";
import { normalizeRole } from "@/lib/roles";

describe("roles", () => {
  it("only the exact value admin grants admin access", () => {
    expect(normalizeRole("admin")).toBe("admin");
    expect(normalizeRole("user")).toBe("user");
    expect(normalizeRole("Admin")).toBe("user");
    expect(normalizeRole(null)).toBe("user");
    expect(normalizeRole(true)).toBe("user");
  });
});
