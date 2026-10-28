import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const OTP_API = "https://api-iota-umber-91.vercel.app/api/login";
const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, "Sahi 10-digit mobile number daalo");

type ApiResult = { success: boolean; data?: Record<string, string | null>; error?: { code: string; message: string } };

async function callOtpApi(params: Record<string, string>): Promise<ApiResult> {
  const res = await fetch(`${OTP_API}?${new URLSearchParams(params)}`);
  const body = (await res.json().catch(() => null)) as ApiResult | null;
  if (!body) throw new Error("Login service ne jawaab nahi diya, dobara try karo");
  return body;
}

export const sendPhoneOtp = createServerFn({ method: "POST" })
  .inputValidator((d: { phone: string }) => z.object({ phone: phoneSchema }).parse(d))
  .handler(async ({ data }) => {
    const r = await callOtpApi({ action: "send-otp", phone: data.phone });
    if (!r.success || !r.data?.['device_id']) throw new Error(r.error?.message || "Code nahi bhej paaye");
    return { deviceId: r.data['device_id'] };
  });

export const verifyPhoneOtp = createServerFn({ method: "POST" })
  .inputValidator((d: { phone: string; otp: string; deviceId: string }) =>
    z.object({ phone: phoneSchema, otp: z.string().regex(/^\d{4}$/), deviceId: z.string().min(4).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const r = await callOtpApi({ action: "verify-otp", phone: data.phone, otp: data.otp, device_id: data.deviceId });
    if (!r.success) throw new Error(r.error?.message || "Code galat hai");
    // The phone is verified by the OTP service; now issue a session for this phone's account.
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
    const key = process.env["SUPABASE_SERVICE_ROLE_KEY"] || process.env["DB_SERVICE_ROLE_KEY"];
    if (!url || !key) throw new Error("Phone login abhi setup nahi hua (database key missing)");
    const supabaseAdmin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => { const h = new Headers(init?.headers); if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(input, { ...init, headers: h }); } },
    });
    const email = `${data.phone}@phone.rjx4you.app`;
    const created = await supabaseAdmin.auth.admin.createUser({
      email, email_confirm: true,
      user_metadata: { phone: data.phone, full_name: r.data?.['name'] ?? null },
    });
    if (created.error && !/already|registered|exists/i.test(created.error.message)) throw new Error(created.error.message);
    const link = await supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email });
    if (link.error || !link.data.properties?.hashed_token) throw new Error(link.error?.message || "Login nahi ho paaya");
    return { tokenHash: link.data.properties.hashed_token };
  });
