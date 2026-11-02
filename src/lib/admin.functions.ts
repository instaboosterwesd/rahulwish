import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { validateTemplatePhoto } from "@/lib/template-upload";
import { requireFirebaseAdmin, UID_PATTERN } from "@/lib/firebase-auth";
import { portableTemplateCover } from "@/lib/template-cover";
import { canDecideDeposit, creditWallet } from "@/lib/shop-rules";
import { normalizeRole } from "@/lib/roles";

const uid = z.string().regex(UID_PATTERN);
const db = () => import("@/lib/firebase-db.server");
const iso = (v: unknown) => (typeof v === "number" ? new Date(v).toISOString() : typeof v === "string" ? v : new Date(0).toISOString());

type RawOrder = { code?: string; recipient_name?: string; sender_name?: string; status?: string; amount_inr?: number; created_at?: number; templates?: { title?: string } };
type RawDeposit = { amount_inr?: number; status?: string; note?: string; created_at?: number };

async function allOrders() {
  const { dbGet } = await db();
  const root = (await dbGet<Record<string, Record<string, RawOrder>>>("orders")) ?? {};
  return Object.values(root).flatMap((byUser) => Object.entries(byUser ?? {}).map(([id, o]) => ({
    id, code: o.code ?? "", recipient_name: o.recipient_name ?? "", sender_name: o.sender_name ?? "",
    status: o.status ?? "pending", amount_inr: o.amount_inr ?? 0, created_at: iso(o.created_at),
    templates: { title: o.templates?.title ?? "" },
  }))).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

async function allDeposits() {
  const { dbGet } = await db();
  const root = (await dbGet<Record<string, Record<string, RawDeposit>>>("deposits")) ?? {};
  return Object.entries(root).flatMap(([user_id, byUser]) => Object.entries(byUser ?? {}).map(([id, d]) => ({
    id, user_id, amount_inr: d.amount_inr ?? 0, status: d.status ?? "pending", note: d.note ?? "", created_at: iso(d.created_at),
  }))).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

async function catalogKeyFor(id: string) {
  const { dbGet } = await db();
  const row = await dbGet<{ id?: string }>(`catalog/${id}`);
  if (!row || row.id !== id) throw new Error("Template not found.");
  return id;
}

export const adminStats = createServerFn({ method: "GET" }).middleware([requireFirebaseAdmin]).handler(async () => {
  const { dbGet, listAuthAccounts } = await db();
  const [catalog, orders, deposits, accounts] = await Promise.all([dbGet<Record<string, unknown>>("catalog"), allOrders(), allDeposits(), listAuthAccounts()]);
  return {
    templates: Object.keys(catalog ?? {}).length,
    surprises: orders.length,
    paid: orders.filter((o) => o.status === "paid").length,
    users: accounts.length,
    pendingDeposits: deposits.filter((d) => d.status === "pending").length,
  };
});

export const adminListSurprises = createServerFn({ method: "GET" }).middleware([requireFirebaseAdmin]).handler(async () => (await allOrders()).slice(0, 100));

export const adminListTemplates = createServerFn({ method: "GET" }).middleware([requireFirebaseAdmin]).handler(async () => {
  const { readCatalogRows } = await import("@/lib/shop.server");
  return (await readCatalogRows()).map((t) => ({
    id: t.id, slug: t.slug, title: t.title, category: t.category, price_inr: t.price_inr,
    original_price_inr: t.original_price_inr, active: t.active, featured: t.featured,
    cover_image: portableTemplateCover(t.cover_image, t.category),
  }));
});

export const adminUploadTemplateCover = createServerFn({ method: "POST" }).middleware([requireFirebaseAdmin])
  .inputValidator((input: FormData) => {
    if (!(input instanceof FormData)) throw new Error("Choose a photo.");
    const id = z.string().uuid().parse(input.get("id"));
    const photo = input.get("photo");
    if (!(photo instanceof File)) throw new Error("Choose a photo.");
    validateTemplatePhoto(photo.type, photo.size);
    return { id, photo };
  })
  .handler(async ({ data }) => {
    const key = await catalogKeyFor(data.id);
    const { dbUpdate } = await db();
    const bytes = new Uint8Array(await data.photo.arrayBuffer());
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    const version = Date.now();
    await dbUpdate("", {
      [`coverImages/${data.id}`]: { type: data.photo.type, data: btoa(binary), version },
      [`catalog/${key}/cover_image`]: `/media/cover/${data.id}?v=${version}`,
      [`catalog/${key}/updated_at`]: new Date(version).toISOString(),
    });
    return { ok: true };
  });

export const adminSetSurpriseStatus = createServerFn({ method: "POST" }).middleware([requireFirebaseAdmin])
  .inputValidator((d: { id: string; status: string }) => z.object({ id: z.string().uuid(), status: z.enum(["pending", "paid", "delivered"]) }).parse(d))
  .handler(async ({ data }) => {
    const { dbGet, dbUpdate } = await db();
    const owner = await dbGet<string>(`orderIndex/${data.id}`);
    if (!owner || !UID_PATTERN.test(owner)) throw new Error("Surprise not found.");
    await dbUpdate(`orders/${owner}/${data.id}`, { status: data.status });
    return { ok: true };
  });

export const adminSetTemplatePrice = createServerFn({ method: "POST" }).middleware([requireFirebaseAdmin])
  .inputValidator((d: { id: string; price_inr: number; original_price_inr: number }) =>
    z.object({ id: z.string().uuid(), price_inr: z.number().int().min(0).max(1000000), original_price_inr: z.number().int().min(0).max(1000000) }).parse(d))
  .handler(async ({ data }) => {
    const key = await catalogKeyFor(data.id);
    const { dbUpdate } = await db();
    await dbUpdate(`catalog/${key}`, { price_inr: data.price_inr, original_price_inr: data.original_price_inr, updated_at: new Date().toISOString() });
    return { ok: true };
  });

export const adminToggleTemplate = createServerFn({ method: "POST" }).middleware([requireFirebaseAdmin])
  .inputValidator((d: { id: string; field: "active" | "featured"; value: boolean }) =>
    z.object({ id: z.string().uuid(), field: z.enum(["active", "featured"]), value: z.boolean() }).parse(d))
  .handler(async ({ data }) => {
    const key = await catalogKeyFor(data.id);
    const { dbUpdate } = await db();
    await dbUpdate(`catalog/${key}`, { [data.field]: data.value, updated_at: new Date().toISOString() });
    return { ok: true };
  });

export const adminListUsers = createServerFn({ method: "GET" }).middleware([requireFirebaseAdmin]).handler(async () => {
  const { dbGet, listAuthAccounts } = await db();
  const [accounts, profiles, flags] = await Promise.all([
    listAuthAccounts(),
    dbGet<Record<string, { name?: string; role?: unknown }>>("users"),
    dbGet<Record<string, { banned?: boolean; deleted_at?: string | null }>>("accounts"),
  ]);
  return accounts
    .filter((a) => !flags?.[a.localId]?.deleted_at)
    .map((a) => ({
      id: a.localId,
      email: a.email ?? "",
      full_name: profiles?.[a.localId]?.name ?? a.displayName ?? "",
      banned: !!flags?.[a.localId]?.banned,
      role: normalizeRole(profiles?.[a.localId]?.role),
      created_at: iso(a.createdAt ? Number(a.createdAt) : 0),
    }))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 200);
});

export const adminSetUserBanned = createServerFn({ method: "POST" }).middleware([requireFirebaseAdmin])
  .inputValidator((d: { id: string; banned: boolean }) => z.object({ id: uid, banned: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    if (data.id === context.uid) throw new Error("You cannot ban your own admin account.");
    const { dbUpdate, updateAuthAccount } = await db();
    await dbUpdate(`accounts/${data.id}`, { banned: data.banned });
    await updateAuthAccount(data.id, { disableUser: data.banned });
    return { ok: true };
  });

export const adminListDeposits = createServerFn({ method: "GET" }).middleware([requireFirebaseAdmin]).handler(async () => (await allDeposits()).slice(0, 200));

// Approving a deposit credits the wallet exactly once.
export const adminSetDepositStatus = createServerFn({ method: "POST" }).middleware([requireFirebaseAdmin])
  .inputValidator((d: { id: string; status: string }) => z.object({ id: z.string().uuid(), status: z.enum(["approved", "rejected"]) }).parse(d))
  .handler(async ({ data }) => {
    const { dbGet, dbTransaction } = await db();
    const owner = await dbGet<string>(`depositIndex/${data.id}`);
    if (!owner || !UID_PATTERN.test(owner)) throw new Error("Deposit not found.");
    const decided = await dbTransaction<RawDeposit>(`deposits/${owner}/${data.id}`, (d) =>
      d && canDecideDeposit(d.status, data.status) ? { ...d, status: data.status } : undefined);
    if (!decided.committed) throw new Error("This deposit was already decided.");
    const amount = decided.value?.amount_inr ?? 0;
    if (data.status === "approved" && amount > 0) {
      await dbTransaction(`wallets/${owner}`, (wallet) => creditWallet(wallet, amount, Date.now()));
    }
    return { ok: true };
  });

const SETTING_KEY = z.string().regex(/^[a-z_]{1,40}$/);

export const adminGetSettings = createServerFn({ method: "GET" }).middleware([requireFirebaseAdmin]).handler(async () => {
  const { dbGet } = await db();
  const value = (await dbGet<Record<string, unknown>>("publicSettings")) ?? {};
  return Object.fromEntries(Object.entries(value).filter(([, v]) => typeof v === "string")) as Record<string, string>;
});

export const adminSetSetting = createServerFn({ method: "POST" }).middleware([requireFirebaseAdmin])
  .inputValidator((d: { key: string; value: string }) => z.object({ key: SETTING_KEY, value: z.string().max(2000) }).parse(d))
  .handler(async ({ data }) => {
    const { dbSet } = await db();
    await dbSet(`publicSettings/${data.key}`, data.value);
    return { ok: true };
  });

export const adminUsersQuery = () => queryOptions({ queryKey: ["admin-users"], queryFn: () => adminListUsers() });
export const adminDepositsQuery = () => queryOptions({ queryKey: ["admin-deposits"], queryFn: () => adminListDeposits() });
export const adminSettingsQuery = () => queryOptions({ queryKey: ["admin-settings"], queryFn: () => adminGetSettings() });
export const adminStatsQuery = () => queryOptions({ queryKey: ["admin-stats"], queryFn: () => adminStats() });
export const adminSurprisesQuery = () => queryOptions({ queryKey: ["admin-surprises"], queryFn: () => adminListSurprises() });
export const adminTemplatesQuery = () => queryOptions({ queryKey: ["admin-templates"], queryFn: () => adminListTemplates() });

export const adminEditUser = createServerFn({ method: "POST" }).middleware([requireFirebaseAdmin])
  .inputValidator((d: { id: string; full_name: string }) => z.object({ id: uid, full_name: z.string().trim().min(1).max(80) }).parse(d))
  .handler(async ({ data }) => {
    const { dbGet, dbUpdate, updateAuthAccount } = await db();
    if (await dbGet(`users/${data.id}`)) await dbUpdate(`users/${data.id}`, { name: data.full_name });
    await updateAuthAccount(data.id, { displayName: data.full_name });
    return { ok: true };
  });

export const adminDeleteUser = createServerFn({ method: "POST" }).middleware([requireFirebaseAdmin])
  .inputValidator((d: { id: string }) => z.object({ id: uid }).parse(d))
  .handler(async ({ data, context }) => {
    if (data.id === context.uid) throw new Error("Cannot delete your own admin account");
    const { dbUpdate, updateAuthAccount } = await db();
    await dbUpdate(`accounts/${data.id}`, { banned: true, deleted_at: new Date().toISOString() });
    await updateAuthAccount(data.id, { disableUser: true });
    return { ok: true };
  });

// Gives or removes admin access by writing users/{uid}/role ("admin" or "user").
export const adminSetUserRole = createServerFn({ method: "POST" }).middleware([requireFirebaseAdmin])
  .inputValidator((d: { id: string; role: "admin" | "user" }) => z.object({ id: uid, role: z.enum(["admin", "user"]) }).parse(d))
  .handler(async ({ data, context }) => {
    if (data.id === context.uid && data.role !== "admin") throw new Error("You cannot remove your own admin access.");
    const { dbSet } = await db();
    await dbSet(`users/${data.id}/role`, data.role);
    return { ok: true };
  });
