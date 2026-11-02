import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { User } from "firebase/auth";

const mocks = vi.hoisted(() => ({ role: vi.fn(), watch: vi.fn() }));
vi.mock("@/lib/role.functions", () => ({ myRole: mocks.role }));
vi.mock("@/lib/firebase-browser", () => ({ watchFirebaseUser: mocks.watch }));
import { useAuth } from "@/hooks/useAuth";

afterEach(() => vi.clearAllMocks());

describe("server-verified Admin visibility", () => {
  it("refreshes a promoted user's role when returning to the app", async () => {
    mocks.role.mockResolvedValue({ role: "user" });
    mocks.watch.mockImplementation(async (cb: (user: User | null) => void) => {
      cb({ uid: "test-user" } as User);
      return () => {};
    });
    const { result, unmount } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAdmin).toBe(false);
    mocks.role.mockResolvedValue({ role: "admin" });
    act(() => window.dispatchEvent(new Event("focus")));
    await waitFor(() => expect(result.current.isAdmin).toBe(true));
    mocks.role.mockResolvedValue({ role: "user" });
    act(() => window.dispatchEvent(new Event("focus")));
    await waitFor(() => expect(result.current.isAdmin).toBe(false));
    unmount();
  });

  it("does not let an earlier Admin response restore access after sign-out", async () => {
    let notify: ((user: User | null) => void) | undefined;
    let resolveRole: ((role: { role: string }) => void) | undefined;
    mocks.role.mockImplementation(() => new Promise((resolve) => { resolveRole = resolve; }));
    mocks.watch.mockImplementation(async (cb: (user: User | null) => void) => { notify = cb; return () => {}; });
    const { result, unmount } = renderHook(() => useAuth());
    act(() => notify?.({ uid: "test-user" } as User));
    act(() => notify?.(null));
    await act(async () => resolveRole?.({ role: "admin" }));
    expect(result.current.user).toBeNull();
    expect(result.current.isAdmin).toBe(false);
    unmount();
  });
});