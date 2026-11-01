import { describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ setupError: null as { message: string } | null }));
const rpc = vi.hoisted(() => vi.fn(async () => ({ error: state.setupError })));
const from = vi.hoisted(() => vi.fn((table: string) => {
  const result = table === "profiles"
    ? { data: { id: "owner", banned: false, deleted_at: null }, error: null }
    : { data: [], error: null };
  const chain = { select: () => chain, eq: () => chain, single: async () => result, order: async () => result };
  return chain;
}));

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    const builder = {
      middleware: () => builder,
      inputValidator: () => builder,
      handler: (handler: (input: unknown) => unknown) => () => handler({ context: { userId: "owner", supabase: { rpc, from } } }),
    };
    return builder;
  },
}));
vi.mock("@/integrations/supabase/auth-middleware", () => ({ requireSupabaseAuth: {} }));
vi.mock("@/lib/template-cover.server", () => ({ resolveTemplateCover: vi.fn() }));

import { customerDashboard } from "@/lib/customer.functions";

describe("customer profile recovery", () => {
  it("prepares the caller's missing profile before reading wallet and orders", async () => {
    state.setupError = null;
    rpc.mockClear(); from.mockClear();
    const account = await customerDashboard();
    expect(rpc).toHaveBeenCalledWith("ensure_customer_profile");
    expect(rpc.mock.invocationCallOrder[0]).toBeLessThan(from.mock.invocationCallOrder[0] ?? 0);
    expect(account.balance).toBe(0);
    expect(account.surprises).toEqual([]);
  });

  it("does not read or invent balances when profile setup fails", async () => {
    state.setupError = { message: "Unavailable" };
    from.mockClear();
    await expect(customerDashboard()).rejects.toThrow("Could not prepare your account");
    expect(from).not.toHaveBeenCalled();
    state.setupError = null;
  });
});