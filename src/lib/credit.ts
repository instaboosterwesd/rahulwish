export function approvedBalance(deposits: { amount_inr: number; status: string }[], orders: { amount_inr: number; status: string }[]) {
  return deposits.filter((d) => d.status === "approved").reduce((n, d) => n + d.amount_inr, 0) - orders.filter((s) => ["paid", "delivered"].includes(s.status)).reduce((n, s) => n + s.amount_inr, 0);
}