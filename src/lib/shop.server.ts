import { dbGet, dbTransaction, dbUpdate } from "./firebase-db.server";
import { parseCatalogRows, type CatalogRow } from "./firebase-catalog";
import { buildOrder, creditWallet, newSurpriseCode } from "./shop-rules";

// Prices always come from the server-side catalog, never from the browser.
export async function readCatalogRows(): Promise<CatalogRow[]> {
  return parseCatalogRows(await dbGet("catalog"));
}

export async function findActiveTemplate(id: string) {
  const row = (await readCatalogRows()).find((t) => t.id === id);
  if (!row || !row.active) throw new Error("This template is not available right now.");
  return row;
}

// Writes the order, its share-link index and its owner index in one update.
export async function createOrder(uid: string, template: CatalogRow, amountPaid: number, payment: "wallet" | "upi" | "free") {
  const orderId = crypto.randomUUID();
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = newSurpriseCode();
    if (await dbGet(`surprises/${code}`)) continue;
    await dbUpdate("", {
      [`orders/${uid}/${orderId}`]: buildOrder(template, amountPaid, code, Date.now(), payment),
      [`surprises/${code}`]: { uid, orderId },
      [`orderIndex/${orderId}`]: uid,
    });
    return orderId;
  }
  throw new Error("Could not create your surprise. Please try again.");
}

export async function refundWallet(uid: string, amount: number) {
  if (amount <= 0) return;
  await dbTransaction(`wallets/${uid}`, (wallet) => creditWallet(wallet, amount, Date.now()));
}

export type StoredOrder = {
  code?: string; status?: string; photos?: string[]; views?: number; proposal_config?: unknown;
  recipient_name?: string; sender_name?: string; headline?: string; message?: string;
  templates?: { title?: string; slug?: string; cover_image?: string; category?: string };
};

// Loads an order that belongs to `uid` and has been paid for.
export async function ownedPaidOrder(uid: string, orderId: string) {
  const order = await dbGet<StoredOrder>(`orders/${uid}/${orderId}`);
  if (!order || !["paid", "delivered"].includes(order.status ?? "")) throw new Error("Surprise not found.");
  return order;
}
