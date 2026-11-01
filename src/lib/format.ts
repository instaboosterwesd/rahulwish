export function formatINR(amount: number): string {
  if (amount <= 0) return "Free";
  return formatMoneyINR(amount);
}

export function formatMoneyINR(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

export function discountPercent(price: number, original: number): number {
  if (original <= 0 || price >= original) return 0;
  return Math.round(((original - price) / original) * 100);
}
