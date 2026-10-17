import { describe, expect, it } from "vitest";
import { discountPercent, formatINR } from "@/lib/format";

describe("pricing", () => {
  it("shows Free for zero-price templates", () => {
    expect(formatINR(0)).toBe("Free");
  });
  it("formats rupees in Indian style", () => {
    expect(formatINR(1499)).toBe("₹1,499");
  });
  it("computes discount from original price", () => {
    expect(discountPercent(299, 799)).toBe(63);
    expect(discountPercent(0, 399)).toBe(100);
  });
});
