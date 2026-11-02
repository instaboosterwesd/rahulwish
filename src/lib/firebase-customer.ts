import { walletBalance } from "./shop-rules";

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type CustomerDeposit = { id: string; amount_inr: number; status: string; note: string; created_at: number };
export type CustomerOrder = {
  id: string;
  code: string;
  status: string;
  amount_inr: number;
  recipient_name: string;
  sender_name: string;
  headline: string;
  message: string;
  photos: string[];
  proposal_config: JsonValue;
  views: number;
  created_at: number;
  templates: { title: string; slug: string; cover_image: string; category: string } | null;
};
export type CustomerProfile = { name?: string; email?: string };
export type CustomerDashboard = { profile: CustomerProfile; deposits: CustomerDeposit[]; surprises: CustomerOrder[]; balance: number };

const str = (v: unknown) => (typeof v === "string" ? v : "");
type RawNode = { amount_inr?: unknown; status?: unknown; note?: unknown; created_at?: unknown; code?: unknown; recipient_name?: unknown; sender_name?: unknown; headline?: unknown; message?: unknown; photos?: unknown; proposal_config?: unknown; views?: unknown; templates?: { title?: unknown; slug?: unknown; cover_image?: unknown; category?: unknown } };
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);

// Turns the Realtime Database nodes users/{uid}, deposits/{uid}, orders/{uid} and
// wallets/{uid} into the wallet/orders view. The balance is the server-kept wallet balance.
export function buildCustomerDashboard(profile: unknown, depositsNode: unknown, ordersNode: unknown, walletNode: unknown): CustomerDashboard {
  const raw = (profile && typeof profile === "object" ? profile : {}) as { name?: unknown; email?: unknown };
  const p: CustomerProfile = { ...(str(raw.name) ? { name: str(raw.name) } : {}), ...(str(raw.email) ? { email: str(raw.email) } : {}) };
  const entries = (node: unknown) => Object.entries(node && typeof node === "object" ? (node as Record<string, RawNode | undefined>) : {});
  const deposits = entries(depositsNode)
    .map(([id, d]) => ({ id, amount_inr: num(d?.amount_inr), status: str(d?.status) || "pending", note: str(d?.note), created_at: num(d?.created_at) }))
    .sort((a, b) => b.created_at - a.created_at);
  const surprises = entries(ordersNode)
    .map(([id, o]) => {
      const t = o?.templates;
      return {
        id,
        code: str(o?.code),
        status: str(o?.status) || "pending",
        amount_inr: num(o?.amount_inr),
        recipient_name: str(o?.recipient_name),
        sender_name: str(o?.sender_name),
        headline: str(o?.headline),
        message: str(o?.message),
        photos: Array.isArray(o?.photos) ? (o.photos as unknown[]).filter((x): x is string => typeof x === "string") : [],
        proposal_config: (o?.proposal_config ?? {}) as JsonValue,
        views: num(o?.views),
        created_at: num(o?.created_at),
        templates: t ? { title: str(t.title), slug: str(t.slug), cover_image: str(t.cover_image), category: str(t.category) } : null,
      };
    })
    .sort((a, b) => b.created_at - a.created_at);
  return { profile: p, deposits, surprises, balance: walletBalance(walletNode) };
}

export const photoUrl = (orderId: string, photoId: string) => `/media/photo/${orderId}/${photoId}`;
