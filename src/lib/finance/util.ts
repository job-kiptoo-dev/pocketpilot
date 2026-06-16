import type { AppData, Transaction } from "@/lib/types";

export const MS_PER_DAY = 86_400_000;

export function daysInMonth(now: Date): number {
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

/** Days elapsed in the current month, including today (1-based). */
export function dayOfMonth(now: Date): number {
  return now.getDate();
}

/** Calendar days left in the month after today. */
export function daysRemainingInMonth(now: Date): number {
  return daysInMonth(now) - dayOfMonth(now);
}

/** Whole days from `now` until the next occurrence of `payday` (day-of-month). */
export function daysUntilPayday(now: Date, payday: number): number {
  const dim = daysInMonth(now);
  const clampedPayday = Math.min(Math.max(payday, 1), dim);
  let target: Date;
  if (now.getDate() < clampedPayday) {
    target = new Date(now.getFullYear(), now.getMonth(), clampedPayday);
  } else {
    target = new Date(now.getFullYear(), now.getMonth() + 1, payday);
  }
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(1, Math.round((target.getTime() - start.getTime()) / MS_PER_DAY));
}

export function isSameMonth(iso: string, now: Date): boolean {
  const d = new Date(iso);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

/** Transactions in the current calendar month. */
export function monthTransactions(txs: Transaction[], now: Date): Transaction[] {
  return txs.filter((t) => isSameMonth(t.date, now));
}

/** Spending = money out, excluding transfers into Savings. */
export function isSpend(t: Transaction): boolean {
  return t.direction === "out" && t.category !== "Savings";
}

/**
 * Most recent known M-PESA balance (cents). Transactions are expected
 * newest-first, but we scan defensively for the latest dated balance.
 */
export function currentBalance(data: AppData): number {
  let latest: Transaction | undefined;
  for (const t of data.transactions) {
    if (t.balanceAfter == null) continue;
    if (!latest || new Date(t.date) > new Date(latest.date)) latest = t;
  }
  return latest?.balanceAfter ?? 0;
}

export function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}
