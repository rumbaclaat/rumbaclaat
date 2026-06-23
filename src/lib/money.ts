/** Format a money amount (number or Decimal-as-string) in the given currency. */
export function formatMoney(amount: number | string | null | undefined, currency = "GBP"): string {
  if (amount == null || amount === "") return "—";
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(n)) return "—";
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(n);
  } catch {
    return `£${n.toFixed(2)}`;
  }
}
