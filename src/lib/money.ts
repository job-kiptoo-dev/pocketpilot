// Integer-cents money helpers. 1 KES = 100 cents.

/** Convert a KES decimal (e.g. 135.00) to integer cents. */
export function toCents(kes: number): number {
  return Math.round(kes * 100);
}

/** Convert integer cents to KES as a number. */
export function toKes(cents: number): number {
  return cents / 100;
}

/**
 * Format integer cents as a KES currency string.
 * @example formatKes(751239) // "KSh 7,512.39"
 */
export function formatKes(cents: number, opts: { compact?: boolean; decimals?: boolean } = {}): string {
  const kes = cents / 100;
  if (opts.compact && Math.abs(kes) >= 1000) {
    return "KSh " + formatCompact(kes);
  }
  const decimals = opts.decimals ?? true;
  return (
    "KSh " +
    kes.toLocaleString("en-KE", {
      minimumFractionDigits: decimals ? 2 : 0,
      maximumFractionDigits: decimals ? 2 : 0,
    })
  );
}

function formatCompact(kes: number): string {
  const abs = Math.abs(kes);
  const sign = kes < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}K`;
  return `${sign}${abs.toFixed(0)}`;
}

/** Parse a KES amount from a raw string like "7,512.39" or "Ksh135.00". */
export function parseKesAmount(raw: string): number | null {
  const match = raw.replace(/ksh/gi, "").match(/[\d,]+(?:\.\d{1,2})?/);
  if (!match) return null;
  const value = Number(match[0].replace(/,/g, ""));
  if (Number.isNaN(value)) return null;
  return toCents(value);
}
