import { describe, expect, it } from "vitest";
import { filterTemplates, templateSearchText } from "@/lib/template-search";

const sweet = { title: "Sweet Bday", tagline: "Candles and cake", category: "sweet-birthday", badge: "New", slug: "sweet-bday", description: null };
const heart = { title: "3D Heart", tagline: "A floating heart", category: "heart-universe", badge: null, slug: "3d-heart", description: "rotating heart" };
const apology = { title: "Apology Card", tagline: "Sorry", category: "apology", badge: "New", slug: "apology-card", description: null };
const rows = [sweet, heart, apology];

describe("template search", () => {
  it("an empty or blank query keeps every template", () => {
    expect(filterTemplates(rows, "")).toEqual(rows);
    expect(filterTemplates(rows, "   ")).toEqual(rows);
  });
  it("matches on title ignoring case", () => {
    expect(filterTemplates(rows, "HEART").map((t) => t.slug)).toEqual(["3d-heart"]);
  });
  it("matches on tagline, category and badge too", () => {
    expect(filterTemplates(rows, "sorry").map((t) => t.slug)).toEqual(["apology-card"]);
    expect(filterTemplates(rows, "sweet-birthday").map((t) => t.slug)).toEqual(["sweet-bday"]);
    expect(filterTemplates(rows, "new").map((t) => t.slug)).toEqual(["sweet-bday", "apology-card"]);
  });
  it("requires every word to match, so a wrong word returns nothing", () => {
    expect(filterTemplates(rows, "heart birthday").map((t) => t.slug)).toEqual([]);
    expect(filterTemplates(rows, "birthday cake").map((t) => t.slug)).toEqual(["sweet-bday"]);
  });
  it("keeps the original order of the results", () => {
    expect(filterTemplates(rows, "a").map((t) => t.slug)).toEqual(["sweet-bday", "3d-heart", "apology-card"]);
  });
  it("search text covers the fields a buyer would type", () => {
    expect(templateSearchText(apology)).toBe("apology card sorry apology new apology-card ");
  });
});
