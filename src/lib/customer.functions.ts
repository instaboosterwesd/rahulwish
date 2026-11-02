import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { requireFirebaseAuth } from "@/lib/firebase-auth";
import { proposalConfigSchema } from "@/lib/proposal";
import { buildCustomerDashboard } from "@/lib/firebase-customer";
import { portableTemplateCover } from "@/lib/template-cover";
import { chargeWallet } from "@/lib/shop-rules";

const orderId = z.string().uuid();
export const MAX_SURPRISE_PHOTOS = 10;
const PHOTO_DATA_URL = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/;

export const customerDashboard = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(async ({ context }) => {
  const { dbGet } = await import("@/lib/firebase-db.server");
  const [profile, deposits, orders, wallet] = await Promise.all([
    dbGet(`users/${context.uid}`), dbGet(`deposits/${context.uid}`), dbGet(`orders/${context.uid}`), dbGet(`wallets/${context.uid}`),
  ]);
  const dashboard = buildCustomerDashboard(profile, deposits, orders, wallet);
  return {
    ...dashboard,
    surprises: dashboard.surprises.map((o) => ({ ...o, templates: o.templates ? { ...o.templates, cover_image: portableTemplateCover(o.templates.cover_image, o.templates.category) } : null })),
  };
});
export const customerQuery = () => queryOptions({ queryKey: ["customer-dashboard"], queryFn: () => customerDashboard(), refetchInterval: 15000 });

export const requestDeposit = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth])
  .inputValidator((d: { amount: number; note: string }) => z.object({ amount: z.number().int().positive().max(100000), note: z.string().max(500) }).parse(d))
  .handler(async ({ data, context }) => {
    const { dbUpdate } = await import("@/lib/firebase-db.server");
    const id = crypto.randomUUID();
    await dbUpdate("", {
      [`deposits/${context.uid}/${id}`]: { amount_inr: data.amount, status: "pending", note: data.note, created_at: Date.now() },
      [`depositIndex/${id}`]: context.uid,
    });
    return id;
  });

// Buys a template: free ones directly, paid ones from the wallet balance (checked and charged atomically).
export const purchaseTemplate = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth])
  .inputValidator((d: { template: string }) => z.object({ template: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { findActiveTemplate, createOrder, refundWallet } = await import("@/lib/shop.server");
    const { dbTransaction } = await import("@/lib/firebase-db.server");
    const template = await findActiveTemplate(data.template);
    const price = template.price_inr;
    if (price > 0) {
      const charged = await dbTransaction(`wallets/${context.uid}`, (wallet) => chargeWallet(wallet, price, Date.now()));
      if (!charged.committed) throw new Error("Not enough wallet balance. Please pay with UPI instead.");
    }
    try {
      return await createOrder(context.uid, template, price, price > 0 ? "wallet" : "free");
    } catch (error) {
      await refundWallet(context.uid, price);
      throw error;
    }
  });

export const saveSurprise = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth])
  .inputValidator((d: { id: string; recipient: string; sender: string; headline: string; message: string }) => z.object({ id: orderId, recipient: z.string().trim().min(1).max(100), sender: z.string().trim().min(1).max(100), headline: z.string().max(200), message: z.string().max(5000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { ownedPaidOrder } = await import("@/lib/shop.server");
    const { dbUpdate } = await import("@/lib/firebase-db.server");
    await ownedPaidOrder(context.uid, data.id);
    await dbUpdate(`orders/${context.uid}/${data.id}`, { recipient_name: data.recipient, sender_name: data.sender, headline: data.headline, message: data.message, updated_at: Date.now() });
    return { ok: true };
  });

export const saveProposalConfig = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) => z.object({ id: orderId, config: proposalConfigSchema }).parse(d))
  .handler(async ({ data, context }) => {
    const { ownedPaidOrder } = await import("@/lib/shop.server");
    const { dbSet } = await import("@/lib/firebase-db.server");
    await ownedPaidOrder(context.uid, data.id);
    await dbSet(`orders/${context.uid}/${data.id}/proposal_config`, data.config);
    return { ok: true };
  });

// Photos are stored as compressed images in the database (photos/{orderId}/{photoId}).
export const addSurprisePhoto = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) => z.object({ id: orderId, image: z.string().max(2_000_000).regex(PHOTO_DATA_URL, "Please choose a JPG, PNG or WebP photo") }).parse(d))
  .handler(async ({ data, context }) => {
    const { ownedPaidOrder } = await import("@/lib/shop.server");
    const { dbUpdate } = await import("@/lib/firebase-db.server");
    const order = await ownedPaidOrder(context.uid, data.id);
    const photos = Array.isArray(order.photos) ? order.photos : [];
    if (photos.length >= MAX_SURPRISE_PHOTOS) throw new Error(`You can add up to ${MAX_SURPRISE_PHOTOS} photos.`);
    const photoId = crypto.randomUUID();
    const next = [...photos, photoId];
    await dbUpdate("", { [`photos/${data.id}/${photoId}`]: data.image, [`orders/${context.uid}/${data.id}/photos`]: next });
    return { photos: next };
  });

export const removeSurprisePhoto = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) => z.object({ id: orderId, photo: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { ownedPaidOrder } = await import("@/lib/shop.server");
    const { dbUpdate } = await import("@/lib/firebase-db.server");
    const order = await ownedPaidOrder(context.uid, data.id);
    const next = (Array.isArray(order.photos) ? order.photos : []).filter((p) => p !== data.photo);
    await dbUpdate("", { [`photos/${data.id}/${data.photo}`]: null, [`orders/${context.uid}/${data.id}/photos`]: next });
    return { photos: next };
  });
