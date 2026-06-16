import type { AppData } from "../types";
import { computeSurvival, type SurvivalStatus } from "./survival";

export interface SimulationResult {
  amount: number; // cents
  label?: string;
  balanceBefore: number;
  balanceAfter: number;
  statusBefore: SurvivalStatus;
  statusAfter: SurvivalStatus;
  expectedAtPaydayBefore: number;
  expectedAtPaydayAfter: number;
  /** True if the purchase keeps you in Safe/Comfortable territory. */
  stillSafe: boolean;
  /** Human-readable risk verdict. */
  verdict: string;
}

const SAFE_STATUSES: SurvivalStatus[] = ["Safe", "Comfortable"];

/**
 * Simulate a one-off purchase by reducing the current balance and re-running
 * the survival model. Pure: it clones the latest balance instead of mutating.
 */
export function simulatePurchase(data: AppData, amountCents: number, now: Date = new Date(), label?: string): SimulationResult {
  const before = computeSurvival(data, now);

  // Clone with an adjusted latest balance by injecting a synthetic spend.
  const adjusted: AppData = {
    ...data,
    transactions: [
      {
        id: "sim",
        amount: amountCents,
        direction: "out",
        category: "Miscellaneous",
        merchant: label ?? "Simulated purchase",
        balanceAfter: Math.max(0, before.balance - amountCents),
        date: now.toISOString(),
        source: "manual",
      },
      ...data.transactions,
    ],
  };
  const after = computeSurvival(adjusted, now);

  const stillSafe = SAFE_STATUSES.includes(after.status);
  const verdict = buildVerdict(before.status, after.status, stillSafe);

  return {
    amount: amountCents,
    label,
    balanceBefore: before.balance,
    balanceAfter: after.balance,
    statusBefore: before.status,
    statusAfter: after.status,
    expectedAtPaydayBefore: before.expectedBalanceAtPayday,
    expectedAtPaydayAfter: after.expectedBalanceAtPayday,
    stillSafe,
    verdict,
  };
}

function buildVerdict(before: SurvivalStatus, after: SurvivalStatus, stillSafe: boolean): string {
  if (stillSafe) return "Go for it — you'll still be safe until payday.";
  if (before === after) return "Doable, but it keeps you on the edge until payday.";
  return "Risky — this pushes you toward running out before payday.";
}
