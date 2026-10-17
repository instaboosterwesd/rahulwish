import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

// NOTE: Admin access is intentionally open (no login) per site owner's request.
async function adminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const adminStats = createServerFn({ method: "GET" }).handler(async () => {
  const db = await adminClient();
  const [{ count: templates }, { count: surprises }, { count: paid }] = await Promise.all([
    db.from("templates").select("*", { count: "exact", head: true }),
    db.from("surprises").select("*", { count: "exact", head: true }),
    db.from("surprises").select("*", { count: "exact", head: true }).eq("status", "paid"),
  ]);
  return { templates: templates ?? 0, surprises: surprises ?? 0, paid: paid ?? 0 };
});

export const adminListSurprises = createServerFn({ method: "GET" }).handler(async () => {
  const db = await adminClient();
  const { data, error } = await db
    .from("surprises")
    .select("id, code, recipient_name, sender_name, status, amount_inr, created_at, templates(title)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const adminListTemplates = createServerFn({ method: "GET" }).handler(async () => {
  const db = await adminClient();
  const { data, error } = await db
    .from("templates")
    .select("id, slug, title, category, price_inr, original_price_inr, active, featured, cover_image")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const adminSetSurpriseStatus = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; status: string }) =>
    z.object({ id: z.string().uuid(), status: z.enum(["pending", "paid", "delivered"]) }).parse(d),
  )
  .handler(async ({ data }) => {
    const db = await adminClient();
    const { error } = await db.from("surprises").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminToggleTemplate = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; field: "active" | "featured"; value: boolean }) =>
    z
      .object({ id: z.string().uuid(), field: z.enum(["active", "featured"]), value: z.boolean() })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const db = await adminClient();
    const { error } = await db
      .from("templates")
      .update({ [data.field]: data.value })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminStatsQuery = () =>
  queryOptions({ queryKey: ["admin-stats"], queryFn: () => adminStats() });
export const adminSurprisesQuery = () =>
  queryOptions({ queryKey: ["admin-surprises"], queryFn: () => adminListSurprises() });
export const adminTemplatesQuery = () =>
  queryOptions({ queryKey: ["admin-templates"], queryFn: () => adminListTemplates() });
