import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BASE = "https://famgateway.in";

function serverKey() {
  const key = process.env["FAMGATEWAY_API_KEY"];
  if (!key) throw new Error("Payment gateway is not configured");
  return key;
}

// The admin panel can replace the gateway key; the env key stays the server's proof for database calls.
async function gatewayKey(supabase: unknown, server: string) {
  const { data, error } = await (supabase as any).rpc("get_fam_key", { _server: server });
  if (error) console.error("get_fam_key:", error.message);
  return (typeof data === "string" && data) || server;
}

export const adminFamKeyHint = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await (context.supabase as any).rpc("admin_fam_key_hint");
    if (error) throw new Error(error.message);
    return { hint: (data as string | null) ?? null };
  });

export const adminSetFamKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ key: z.string().trim().min(10).max(200) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await (context.supabase as any).rpc("admin_set_fam_key", { _key: data.key });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type FamCheckout = { orderId: string; qrUrl: string; checkoutUrl: string; upiIntent: string; upiId: string; amount: number; expiresAt: string };

export const startFamPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ template: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<FamCheckout> => {
    const server = serverKey();
    const key = await gatewayKey(context.supabase, server);
    const { data: t, error } = await context.supabase.from("templates").select("id,price_inr,active").eq("id", data.template).single();
    if (error || !t || !t.active) throw new Error("Template unavailable");
    if (t.price_inr <= 0) throw new Error("This template is free");
    const email = (context.claims as { email?: string }).email;
    const res = await fetch(`${BASE}/api/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Api-Key": key },
      body: JSON.stringify({ api_key: key, amount: t.price_inr, customer_email: email }),
    });
    const body = await res.text();
    if (!res.ok) { console.error(`FamGateway create-order [${res.status}]: ${body}`); throw new Error("Could not start payment. Please try again."); }
    const json = JSON.parse(body) as { status: string; message?: string; data?: { order_id: string; qr_url: string; checkout_url: string; upi_intent: string; upi_id: string; amount: string; payable_amount?: string; expires_at_ist?: string } };
    if (json.status !== "success" || !json.data) { console.error("FamGateway create-order:", body); throw new Error(json.message || "Could not start payment"); }
    const d = json.data;
    const { error: e2 } = await (context.supabase as any).rpc("start_fam_payment", { _template: t.id, _order_id: d.order_id, _amount: t.price_inr, _key: server });
    if (e2) { console.error("start_fam_payment:", e2.message); throw new Error("Payment setup is not finished on the database yet."); }
    return { orderId: d.order_id, qrUrl: d.qr_url, checkoutUrl: d.checkout_url, upiIntent: d.upi_intent, upiId: d.upi_id, amount: Number(d.payable_amount ?? d.amount), expiresAt: d.expires_at_ist ?? "" };
  });

export const checkFamPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ orderId: z.string().min(4).max(64).regex(/^[A-Za-z0-9_]+$/) }).parse(d))
  .handler(async ({ data, context }): Promise<{ status: "pending" | "success" | "expired"; surpriseId?: string }> => {
    const server = serverKey();
    const key = await gatewayKey(context.supabase, server);
    const url = `${BASE}/api/verify-order.php?api_key=${encodeURIComponent(key)}&order_id=${encodeURIComponent(data.orderId)}`;
    const res = await fetch(url, { headers: { "X-Api-Key": key } });
    const body = await res.text();
    if (!res.ok) { console.error(`FamGateway verify [${res.status}]: ${body}`); return { status: "pending" }; }
    const json = JSON.parse(body) as { status: string; amount?: string | number; utr?: string; order_id?: string };
    if (json.status === "expired") return { status: "expired" };
    if (json.status !== "success") return { status: "pending" };
    const { data: sid, error } = await (context.supabase as any).rpc("complete_fam_payment", { _order_id: data.orderId, _paid_amount: Number(json.amount ?? 0), _utr: json.utr ?? "", _key: server });
    if (error) { console.error("complete_fam_payment:", error.message); throw new Error(error.message); }
    return { status: "success", surpriseId: sid as string };
  });
