import { describe, expect, it } from "vitest";
import { buildCustomerDashboard } from "@/lib/firebase-customer";

describe("Firebase wallet dashboard", () => {
  it("shows the server-kept wallet balance", () => {
    const d = buildCustomerDashboard(
      { name: "A" },
      { a: { amount_inr: 500, status: "approved" }, b: { amount_inr: 900, status: "pending" } },
      { o1: { amount_inr: 1, status: "paid" } },
      { balance: 499 },
    );
    expect(d.balance).toBe(499);
    expect(d.deposits).toHaveLength(2);
  });

  it("shows zero balance for a new account with no data", () => {
    const d = buildCustomerDashboard(null, null, null, null);
    expect(d.balance).toBe(0);
    expect(d.surprises).toEqual([]);
  });

  it("lists newest orders first", () => {
    const d = buildCustomerDashboard(null, null, { a: { created_at: 1, status: "paid" }, b: { created_at: 5, status: "paid" } }, null);
    expect(d.surprises.map((s) => s.id)).toEqual(["b", "a"]);
  });
});
