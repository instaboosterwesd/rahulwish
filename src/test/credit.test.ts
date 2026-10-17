import { expect, it } from "vitest";
import { approvedBalance } from "@/lib/credit";
it("manual approval grants credit even without payment", () => {
  expect(approvedBalance([{ amount_inr: 199, status: "approved" }], [])).toBe(199);
});
it("pending and rejected requests do not grant credit", () => {
  expect(approvedBalance([{ amount_inr: 199, status: "pending" }, { amount_inr: 199, status: "rejected" }], [])).toBe(0);
});
it("purchasing deducts credit once from approved funds", () => {
  expect(approvedBalance([{ amount_inr: 399, status: "approved" }], [{ amount_inr: 199, status: "paid" }])).toBe(200);
});