import { describe, expect, it } from "vitest";
import { buildOrder, canDecideDeposit, chargeWallet, creditWallet, newSurpriseCode, paymentCoversPrice } from "@/lib/shop-rules";

describe("wallet charges", () => {
  it("pays a ₹1 template from a ₹1 balance, leaving ₹0", () => {
    expect(chargeWallet({ balance: 1 }, 1, 10)).toEqual({ balance: 0, updated_at: 10 });
  });
  it("refuses when the balance is too low", () => {
    expect(chargeWallet({ balance: 0 }, 1, 10)).toBeUndefined();
    expect(chargeWallet(null, 1, 10)).toBeUndefined();
  });
  it("free templates cost nothing", () => {
    expect(chargeWallet(null, 0, 10)).toEqual({ balance: 0, updated_at: 10 });
  });
  it("approved deposits add to the balance", () => {
    expect(creditWallet({ balance: 5 }, 100, 1).balance).toBe(105);
    expect(() => creditWallet({ balance: 5 }, 0, 1)).toThrow();
  });
});

describe("deposit decisions", () => {
  it("only pending deposits can be approved or rejected, once", () => {
    expect(canDecideDeposit("pending", "approved")).toBe(true);
    expect(canDecideDeposit("pending", "rejected")).toBe(true);
    expect(canDecideDeposit("approved", "approved")).toBe(false);
    expect(canDecideDeposit("rejected", "approved")).toBe(false);
  });
});

describe("UPI payments", () => {
  it("must cover the price", () => {
    expect(paymentCoversPrice("1.00", 1)).toBe(true);
    expect(paymentCoversPrice(0.5, 1)).toBe(false);
    expect(paymentCoversPrice(undefined, 1)).toBe(false);
  });
});

describe("orders", () => {
  it("new orders are paid, record the amount and start empty", () => {
    const order = buildOrder({ id: "t", slug: "s", title: "T", category: "love", cover_image: "", price_inr: 1, active: true }, 1, "abc", 5, "wallet");
    expect(order).toMatchObject({ status: "paid", amount_inr: 1, code: "abc", photos: [], views: 0 });
  });
  it("share codes are 10 characters", () => {
    expect(newSurpriseCode()).toMatch(/^[a-z0-9]{10}$/);
  });
});

import { validTopUpAmount } from "@/lib/shop-rules";
describe("wallet top-up amounts", () => {
  it("accepts whole rupees from ₹1 to ₹10,000", () => {
    expect(validTopUpAmount(1)).toBe(true);
    expect(validTopUpAmount(10000)).toBe(true);
    expect(validTopUpAmount(0)).toBe(false);
    expect(validTopUpAmount(10001)).toBe(false);
    expect(validTopUpAmount(5.5)).toBe(false);
  });
});
