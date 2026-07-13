/**
 * Format a number as USD currency.
 * formatCurrency(1234.56) → "$1,234.56"
 * formatCurrency(-50)     → "-$50.00"
 */
export function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  return value < 0 ? `-${formatted}` : formatted;
}

/**
 * Format an ISO datetime string as a human-readable date.
 * formatDate("2026-04-12T00:00:00.000Z") → "Apr 12, 2026"
 */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/**
 * Format an exposure value with explicit sign.
 * formatExposure(100)  → "+$100.00"
 * formatExposure(-50)  → "-$50.00"
 * formatExposure(0)    → "$0.00"
 */
export function formatExposure(value: number): string {
  if (value === 0) return "$0.00";
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  return value > 0 ? `+${formatted}` : `-${formatted}`;
}
