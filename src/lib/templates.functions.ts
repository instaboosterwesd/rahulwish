import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { readProposalConfig } from "@/lib/proposal";
import { firebaseConfig } from "@/lib/firebase-config";
import { readFirebaseCatalog, type CatalogRow } from "@/lib/firebase-catalog";
import { portableTemplateCover } from "@/lib/template-cover";
import { photoUrl } from "@/lib/firebase-customer";

export type Template = CatalogRow;

const withCover = (row: CatalogRow): Template => ({ ...row, cover_image: portableTemplateCover(row.cover_image, row.category) });

// Public catalog straight from Firebase (catalog/ is publicly readable, display fields only).
export const listTemplates = createServerFn({ method: "GET" }).handler(async () => {
  const catalog = await readFirebaseCatalog(firebaseConfig.databaseURL);
  return (catalog ?? []).map(withCover);
});

export const getTemplate = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(100) }).parse(d))
  .handler(async ({ data }) => {
    const catalog = await readFirebaseCatalog(firebaseConfig.databaseURL);
    const row = (catalog ?? []).find((item) => item.slug === data.slug);
    return row ? withCover(row) : null;
  });

const codeSchema = z.object({ code: z.string().min(4).max(32).regex(/^[A-Za-z0-9_-]+$/) });

// Shared surprise page: only the display fields of a paid surprise, never the owner's account.
export const getSurprise = createServerFn({ method: "GET" })
  .inputValidator((d: { code: string }) => codeSchema.parse(d))
  .handler(async ({ data }) => {
    const { dbGet } = await import("@/lib/firebase-db.server");
    const link = await dbGet<{ uid?: string; orderId?: string }>(`surprises/${data.code}`);
    if (!link?.uid || !link.orderId) return null;
    const { ownedPaidOrder } = await import("@/lib/shop.server");
    const order = await ownedPaidOrder(link.uid, link.orderId).catch(() => null);
    if (!order) return null;
    const category = order.templates?.category ?? "";
    return {
      category,
      recipient_name: order.recipient_name ?? "",
      sender_name: order.sender_name ?? "",
      headline: order.headline ?? "",
      message: order.message ?? "",
      cover_image: portableTemplateCover(order.templates?.cover_image ?? "", category),
      photoUrls: (Array.isArray(order.photos) ? order.photos : []).map((p) => photoUrl(link.orderId!, p)),
      proposalConfig: readProposalConfig(order.proposal_config),
      audioUrl: undefined as string | undefined,
    };
  });

export const getPublicSettings = createServerFn({ method: "GET" }).handler(async () => {
  const response = await fetch(`${firebaseConfig.databaseURL}/publicSettings.json`, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) return {} as Record<string, string>;
  const value = (await response.json()) as Record<string, unknown> | null;
  return Object.fromEntries(Object.entries(value ?? {}).filter(([, v]) => typeof v === "string")) as Record<string, string>;
});

export const templatesQuery = () =>
  queryOptions({ queryKey: ["templates"], queryFn: () => listTemplates() });
export const templateQuery = (slug: string) =>
  queryOptions({ queryKey: ["template", slug], queryFn: () => getTemplate({ data: { slug } }) });
export const surpriseQuery = (code: string) =>
  queryOptions({ queryKey: ["surprise", code], queryFn: () => getSurprise({ data: { code } }) });

export const recordSurpriseView = createServerFn({ method: "POST" })
  .inputValidator((d: { code: string }) => codeSchema.parse(d))
  .handler(async ({ data }) => {
    try {
      const { dbGet, dbTransaction } = await import("@/lib/firebase-db.server");
      const link = await dbGet<{ uid?: string; orderId?: string }>(`surprises/${data.code}`);
      if (link?.uid && link.orderId) await dbTransaction<number>(`orders/${link.uid}/${link.orderId}/views`, (v) => (typeof v === "number" ? v : 0) + 1);
    } catch (error) {
      console.error("record view:", error);
    }
    return { ok: true };
  });
