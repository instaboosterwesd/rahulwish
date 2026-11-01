import { describe, expect, it } from "vitest";
import { parseFirebaseCatalog } from "@/lib/firebase-catalog";

const template = {
  id: "11111111-1111-4111-8111-111111111111", slug: "birthday", title: "Birthday",
  tagline: "A birthday gift", description: "Birthday", category: "sweet-birthday",
  cover_image: "", badge: "New", style: "pink", price_inr: 0, original_price_inr: 0,
  rating: 5, active: true, featured: false, created_at: "2026-11-01", updated_at: "2026-11-01",
};

describe("public Firebase catalog", () => {
  it("does not expose inactive templates", () => {
    expect(parseFirebaseCatalog({ a: template, b: { ...template, active: false } })).toHaveLength(1);
  });
  it("strips private fields from public template records", () => {
    expect(parseFirebaseCatalog({ a: { ...template, payment_secret: "not-public" } })?.[0]).not.toHaveProperty("payment_secret");
  });
  it("distinguishes an uninitialized catalog from intentionally empty catalog", () => {
    expect(parseFirebaseCatalog(null)).toBeNull();
    expect(parseFirebaseCatalog({})).toEqual([]);
  });
  it("rejects malformed records and negative prices", () => {
    expect(() => parseFirebaseCatalog({ a: { ...template, price_inr: -1 } })).toThrow();
  });
});