import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireFirebaseAdmin, requireFirebaseAuth } from "@/lib/firebase-auth";
import { creditWallet, paymentCoversPrice, TOP_UP_MAX, TOP_UP_MIN } from "@/lib/shop-rules";

const BASE = "https://famgateway.in";

// The admin panel can save a gateway key (private/famKey, server-only); otherwise the
// FAMGATEWAY_API_KEY secret is used.
async function gatewayKey() {
  const { dbGet } = await import("@/lib/firebase-db.server");
  const saved = await dbGet<string>("private/famKey");
  const key = (typeof saved === "string" && saved) || process.env["FAMGATEWAY_API_KEY"];
  if (!key) throw new Error("UPI payments are not set up yet. Please use wallet credit or try later.");
  return key;
}

export const adminFamKeyHint = createServerFn({ method: "GET" }).middleware([requireFirebaseAdmin]).handler(async () => {
  const { dbGet } = await import("@/lib/firebase-db.server");
  const saved = await dbGet<string>("private/famKey");
  const key = (typeof saved === "string" && saved) || process.env["FAMGATEWAY_API_KEY"] || "";
  return { hint: key ? `••••${key.slice(-4)}` : "not set" };
});

export const adminSetFamKey = createServerFn({ method: "POST" }).middleware([requireFirebaseAdmin])
  .inputValidator((d: unknown) => z.object({ key: z.string().trim().min(10).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { dbSet } = await import("@/lib/firebase-db.server");
    await dbSet("private/famKey", data.key);
    return { ok: true };
  });

export type FamCheckout = { orderId: string; qrUrl: string; checkoutUrl: string; upiIntent: string; upiId: string; amount: number; expiresAt: string };
// kind "template" buys one template; kind "wallet" adds money to the wallet balance.
type PendingPayment = {
  uid: string; kind?: "template" | "wallet"; template_id?: string; amount: number;
  status: "pending" | "completing" | "completed"; surpriseId?: string; depositId?: string; created_at: number;
};
export type FamCheckResult = { status: "pending" | "success" | "expired"; surpriseId?: string; walletCredited?: number };

// Creates the FamGateway order for an amount the server decided, and remembers who it is for.
async function createGatewayOrder(email: string | null, pending: PendingPayment): Promise<FamCheckout> {
  const { dbSet } = await import("@/lib/firebase-db.server");
  const key = await gatewayKey();
  const res = await fetch(`${BASE}/api/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": key },
    body: JSON.stringify({ api_key: key, amount: pending.amount, ...(email ? { customer_email: email } : {}) }),
  });
  const body = await res.text();
  if (!res.ok) { console.error(`FamGateway create-order [${res.status}]: ${body}`); throw new Error("Could not start payment. Please try again."); }
  const json = JSON.parse(body) as { status: string; message?: string; data?: { order_id: string; qr_url: string; checkout_url: string; upi_intent: string; upi_id: string; amount: string; payable_amount?: string; expires_at_ist?: string } };
  if (json.status !== "success" || !json.data || !/^[A-Za-z0-9_-]{4,64}$/.test(json.data.order_id)) { console.error("FamGateway create-order:", body); throw new Error("Could not start payment. Please try again."); }
  const d = json.data;
  await dbSet(`payments/${d.order_id}`, pending);
  return { orderId: d.order_id, qrUrl: d.qr_url, checkoutUrl: d.checkout_url, upiIntent: d.upi_intent, upiId: d.upi_id, amount: Number(d.payable_amount ?? d.amount), expiresAt: d.expires_at_ist ?? "" };
}

export const startFamPayment = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) => z.object({ template: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<FamCheckout> => {
    const { findActiveTemplate } = await import("@/lib/shop.server");
    const t = await findActiveTemplate(data.template);
    if (t.price_inr <= 0) throw new Error("This template is free");
    return createGatewayOrder(context.email, { uid: context.uid, kind: "template", template_id: t.id, amount: t.price_inr, status: "pending", created_at: Date.now() });
  });

// Wallet top-up with UPI: the balance is credited only after FamGateway confirms the payment.
export const startWalletTopUp = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) => z.object({ amount: z.number().int().min(TOP_UP_MIN).max(TOP_UP_MAX) }).parse(d))
  .handler(async ({ data, context }): Promise<FamCheckout> =>
    createGatewayOrder(context.email, { uid: context.uid, kind: "wallet", amount: data.amount, status: "pending", created_at: Date.now() }));

export const checkFamPayment = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) => z.object({ orderId: z.string().min(4).max(64).regex(/^[A-Za-z0-9_-]+$/) }).parse(d))
  .handler(async ({ data, context }): Promise<FamCheckResult> => {
    const { dbGet, dbTransaction, dbUpdate } = await import("@/lib/firebase-db.server");
    const done = (p: PendingPayment): FamCheckResult =>
      p.kind === "wallet" ? { status: "success", walletCredited: p.amount } : { status: "success", ...(p.surpriseId ? { surpriseId: p.surpriseId } : {}) };
    const payment = await dbGet<PendingPayment>(`payments/${data.orderId}`);
    if (!payment || payment.uid !== context.uid) throw new Error("Payment not found.");
    if (payment.status === "completed") return done(payment);
    if (payment.status === "completing") return { status: "pending" };

    const key = await gatewayKey();
    const res = await fetch(`${BASE}/api/verify-order.php?api_key=${encodeURIComponent(key)}&order_id=${encodeURIComponent(data.orderId)}`, { headers: { "X-Api-Key": key } });
    const body = await res.text();
    if (!res.ok) { console.error(`FamGateway verify [${res.status}]: ${body}`); return { status: "pending" }; }
    let json: { status?: string; amount?: string | number; payable_amount?: string | number; utr?: string };
    try { json = JSON.parse(body); } catch { console.error("FamGateway verify: not JSON", body.slice(0, 200)); return { status: "pending" }; }
    if (json.status === "expired") return { status: "expired" };
    if (json.status !== "success") return { status: "pending" };
    // The gateway order was created by this server for the exact amount; when the
    // verify reply includes an amount it must still cover it.
    const reported = json.amount ?? json.payable_amount;
    if (reported !== undefined && !paymentCoversPrice(reported, payment.amount)) { console.error("FamGateway verify: amount too low", body.slice(0, 200)); return { status: "pending" }; }

    // Claim the payment once, so two checks can never credit twice or create two surprises.
    const claimed = await dbTransaction<PendingPayment>(`payments/${data.orderId}`, (p) => (p && p.status === "pending" ? { ...p, status: "completing" } : undefined));
    if (!claimed.committed) {
      const latest = await dbGet<PendingPayment>(`payments/${data.orderId}`);
      return latest?.status === "completed" ? done(latest) : { status: "pending" };
    }
    const receipt = { utr: json.utr ?? "", paid_amount: Number(reported ?? payment.amount) };

    if (payment.kind === "wallet") {
      const depositId = crypto.randomUUID();
      await dbTransaction(`wallets/${context.uid}`, (wallet) => creditWallet(wallet, payment.amount, Date.now()));
      await dbUpdate("", {
        [`deposits/${context.uid}/${depositId}`]: { amount_inr: payment.amount, status: "approved", note: "UPI top-up", created_at: Date.now(), order_id: data.orderId },
        [`depositIndex/${depositId}`]: context.uid,
        [`payments/${data.orderId}/status`]: "completed",
        [`payments/${data.orderId}/depositId`]: depositId,
        [`payments/${data.orderId}/utr`]: receipt.utr,
        [`payments/${data.orderId}/paid_amount`]: receipt.paid_amount,
      });
      return { status: "success", walletCredited: payment.amount };
    }

    const { findActiveTemplate, createOrder, readCatalogRows } = await import("@/lib/shop.server");
    const template = await findActiveTemplate(payment.template_id ?? "").catch(async () => {
      const row = (await readCatalogRows()).find((t) => t.id === payment.template_id);
      if (!row) throw new Error("Template not found.");
      return row;
    });
    const surpriseId = await createOrder(context.uid, template, payment.amount, "upi");
    await dbUpdate(`payments/${data.orderId}`, { status: "completed", surpriseId, ...receipt });
    return { status: "success", surpriseId };
  });
