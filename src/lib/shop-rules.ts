// Pure money and order rules shared by the server functions (and covered by tests).

// Wallet top-up with UPI: whole rupees between these limits.
export const TOP_UP_MIN = 1;
export const TOP_UP_MAX = 10000;
export function validTopUpAmount(amount: number) {
  return Number.isInteger(amount) && amount >= TOP_UP_MIN && amount <= TOP_UP_MAX;
}

export type Wallet = { balance: number; updated_at?: number };

const money = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.floor(v)) : 0);

export function walletBalance(wallet: unknown) {
  return money((wallet as Wallet | null)?.balance);
}

// Returns the wallet after paying `price`, or undefined when the balance is too low.
export function chargeWallet(wallet: unknown, price: number, now: number): Wallet | undefined {
  if (!Number.isInteger(price) || price < 0) throw new Error("Invalid price");
  const balance = walletBalance(wallet);
  if (balance < price) return undefined;
  return { balance: balance - price, updated_at: now };
}

export function creditWallet(wallet: unknown, amount: number, now: number): Wallet {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error("Invalid amount");
  return { balance: walletBalance(wallet) + amount, updated_at: now };
}

// A deposit can be decided only once: pending → approved or rejected.
export function canDecideDeposit(current: string | undefined, next: string) {
  return current === "pending" && (next === "approved" || next === "rejected");
}

// Paid amount must cover the template price; the gateway reports it as a string or number.
export function paymentCoversPrice(paid: unknown, price: number) {
  const value = typeof paid === "string" ? Number(paid) : typeof paid === "number" ? paid : NaN;
  return Number.isFinite(value) && value >= price;
}

const CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
export function newSurpriseCode(random: (n: number) => Uint8Array = (n) => crypto.getRandomValues(new Uint8Array(n))) {
  return Array.from(random(10), (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

export type CatalogTemplate = { id: string; slug: string; title: string; category: string; cover_image: string; price_inr: number; active: boolean };

export function buildOrder(template: CatalogTemplate, amountPaid: number, code: string, now: number, payment: "wallet" | "upi" | "free") {
  return {
    code,
    status: "paid",
    payment,
    amount_inr: amountPaid,
    template_id: template.id,
    recipient_name: "",
    sender_name: "",
    headline: "",
    message: "",
    photos: [] as string[],
    proposal_config: {},
    views: 0,
    created_at: now,
    templates: { title: template.title, slug: template.slug, cover_image: template.cover_image, category: template.category },
  };
}
