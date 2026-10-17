import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
const requireAdmin = createMiddleware({ type: "function" }).middleware([requireSupabaseAuth]).server(async ({ context, next }) => {
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error || !data) throw new Error("Admin access required");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return next({ context: { db: supabaseAdmin } });
});

export const adminStats = createServerFn({ method: "GET" }).middleware([requireAdmin]).handler(async ({ context }) => {
  const db = context.db;
  const [{ count: templates }, { count: surprises }, { count: paid }, { count: users }, { count: pendingDeposits }] =
    await Promise.all([
      db.from("templates").select("*", { count: "exact", head: true }),
      db.from("surprises").select("*", { count: "exact", head: true }),
      db.from("surprises").select("*", { count: "exact", head: true }).eq("status", "paid"),
      db.from("profiles").select("*", { count: "exact", head: true }),
      db.from("deposits").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]);
  return {
    templates: templates ?? 0,
    surprises: surprises ?? 0,
    paid: paid ?? 0,
    users: users ?? 0,
    pendingDeposits: pendingDeposits ?? 0,
  };
});

export const adminListSurprises = createServerFn({ method: "GET" }).middleware([requireAdmin]).handler(async ({ context }) => {
  const db = context.db;
  const { data, error } = await db
    .from("surprises")
    .select("id, code, recipient_name, sender_name, status, amount_inr, created_at, templates(title)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const adminListTemplates = createServerFn({ method: "GET" }).middleware([requireAdmin]).handler(async ({ context }) => {
  const db = context.db;
  const { data, error } = await db
    .from("templates")
    .select("id, slug, title, category, price_inr, original_price_inr, active, featured, cover_image")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const adminSetSurpriseStatus = createServerFn({ method: "POST" }).middleware([requireAdmin])
  .inputValidator((d: { id: string; status: string }) =>
    z.object({ id: z.string().uuid(), status: z.enum(["pending", "paid", "delivered"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = context.db;
    const { error } = await db.from("surprises").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSetTemplatePrice = createServerFn({ method: "POST" }).middleware([requireAdmin])
  .inputValidator((d: { id: string; price_inr: number; original_price_inr: number }) =>
    z.object({ id: z.string().uuid(), price_inr: z.number().int().min(0).max(1000000), original_price_inr: z.number().int().min(0).max(1000000) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.db.from("templates").update({ price_inr: data.price_inr, original_price_inr: data.original_price_inr }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminToggleTemplate = createServerFn({ method: "POST" }).middleware([requireAdmin])
  .inputValidator((d: { id: string; field: "active" | "featured"; value: boolean }) =>
    z
      .object({ id: z.string().uuid(), field: z.enum(["active", "featured"]), value: z.boolean() })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = context.db;
    const { error } = await db
      .from("templates")
      .update({ [data.field]: data.value } as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListUsers = createServerFn({ method: "GET" }).middleware([requireAdmin]).handler(async ({ context }) => {
  const db = context.db;
  const { data, error } = await db
    .from("profiles")
    .select("id, email, full_name, banned, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const adminSetUserBanned = createServerFn({ method: "POST" }).middleware([requireAdmin])
  .inputValidator((d: { id: string; banned: boolean }) =>
    z.object({ id: z.string().uuid(), banned: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = context.db;
    const { error } = await db.from("profiles").update({ banned: data.banned }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListDeposits = createServerFn({ method: "GET" }).middleware([requireAdmin]).handler(async ({ context }) => {
  const db = context.db;
  const { data, error } = await db
    .from("deposits")
    .select("id, user_id, amount_inr, status, note, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const adminSetDepositStatus = createServerFn({ method: "POST" }).middleware([requireAdmin])
  .inputValidator((d: { id: string; status: string }) =>
    z.object({ id: z.string().uuid(), status: z.enum(["pending", "approved", "rejected"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = context.db;
    const { error } = await db.from("deposits").update({ status: data.status }).eq("id", data.id).eq("status", "pending");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminGetSettings = createServerFn({ method: "GET" }).middleware([requireAdmin]).handler(async ({ context }) => {
  const db = context.db;
  const { data, error } = await db.from("settings").select("key, value");
  if (error) throw new Error(error.message);
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<string, string>;
});

export const adminSetSetting = createServerFn({ method: "POST" }).middleware([requireAdmin])
  .inputValidator((d: { key: string; value: string }) =>
    z.object({ key: z.string().min(1), value: z.string() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = context.db;
    const { error } = await db
      .from("settings")
      .upsert({ key: data.key, value: data.value } as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUsersQuery = () =>
  queryOptions({ queryKey: ["admin-users"], queryFn: () => adminListUsers() });
export const adminDepositsQuery = () =>
  queryOptions({ queryKey: ["admin-deposits"], queryFn: () => adminListDeposits() });
export const adminSettingsQuery = () =>
  queryOptions({ queryKey: ["admin-settings"], queryFn: () => adminGetSettings() });

export const adminStatsQuery = () =>
  queryOptions({ queryKey: ["admin-stats"], queryFn: () => adminStats() });
export const adminSurprisesQuery = () =>
  queryOptions({ queryKey: ["admin-surprises"], queryFn: () => adminListSurprises() });
export const adminTemplatesQuery = () =>
  queryOptions({ queryKey: ["admin-templates"], queryFn: () => adminListTemplates() });

export const adminEditUser = createServerFn({ method: "POST" }).middleware([requireAdmin])
  .inputValidator((d: { id: string; full_name: string }) => z.object({ id: z.string().uuid(), full_name: z.string().max(100) }).parse(d))
  .handler(async ({ data, context }) => { const { error } = await context.db.from("profiles").update({ full_name: data.full_name }).eq("id", data.id); if (error) throw new Error(error.message); return { ok: true }; });
export const adminDeleteUser = createServerFn({ method: "POST" }).middleware([requireAdmin])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => { if (data.id === context.userId) throw new Error("Cannot delete your own admin account"); const { error } = await context.db.from("profiles").update({ deleted_at: new Date().toISOString(), banned: true }).eq("id", data.id); if (error) throw new Error(error.message); return { ok: true }; });
