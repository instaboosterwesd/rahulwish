import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { approvedBalance } from "@/lib/credit";

export const customerDashboard = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const [profile, deposits, surprises] = await Promise.all([
    context.supabase.from("profiles").select("*").eq("id", context.userId).single(),
    context.supabase.from("deposits").select("*").eq("user_id", context.userId).order("created_at", { ascending: false }),
    context.supabase.from("surprises").select("*, templates(title,slug,cover_image,category)").eq("user_id", context.userId).order("created_at", { ascending: false }),
  ]);
  if (profile.error || deposits.error || surprises.error) throw new Error("Could not load your account");
  if (profile.data.banned || profile.data.deleted_at) throw new Error("Your account is unavailable. Contact the site owner.");
  const requests = deposits.data ?? [];
  const orders = surprises.data ?? [];
  const balance = approvedBalance(requests, orders);
  return { profile: profile.data, deposits: requests, surprises: orders, balance };
});
export const requestDeposit = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: { amount: number; note: string }) => z.object({ amount: z.number().int().positive(), note: z.string().max(500) }).parse(d))
  .handler(async ({ data, context }) => { const { data: id, error } = await context.supabase.rpc("request_deposit", { _amount: data.amount, _note: data.note }); if (error) throw new Error(error.message); return id; });
export const purchaseTemplate = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: { template: string }) => z.object({ template: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => { const { data: id, error } = await context.supabase.rpc("purchase_template", { _template: data.template }); if (error) throw new Error(error.message); return id; });
export const saveSurprise = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; recipient: string; sender: string; headline: string; message: string }) => z.object({ id: z.string().uuid(), recipient: z.string().min(1).max(100), sender: z.string().min(1).max(100), headline: z.string().max(200), message: z.string().max(5000) }).parse(d))
  .handler(async ({ data, context }) => { const { error } = await context.supabase.rpc("save_surprise", { _id: data.id, _recipient: data.recipient, _sender: data.sender, _headline: data.headline, _message: data.message }); if (error) throw new Error(error.message); return { ok: true }; });
export const customerQuery = () => queryOptions({ queryKey: ["customer-dashboard"], queryFn: () => customerDashboard(), refetchInterval: 15000 });
export const savePhotos = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; photos: string[] }) => z.object({ id: z.string().uuid(), photos: z.array(z.string()) }).parse(d))
  .handler(async ({ data, context }) => { const { error } = await context.supabase.rpc("save_surprise_photos", { _id: data.id, _photos: data.photos }); if (error) throw new Error(error.message); return { ok: true }; });