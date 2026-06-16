import type { AppData } from "@/lib/types";
import { computeHealth } from "./health";
import { currentBalance, daysRemainingInMonth } from "./util";

export interface Forecast {
  /** Estimated daily burn used for projection (cents). */
  dailyBurn: number;
  /** Sum of user-defined recurring expenses expressed per day (cents). */
  recurringDailyCost: number;
  daysRemaining: number;
  /** Projected balance on the last day of the month (cents). */
  projectedEndBalance: number;
  /** Projected additional spend between now and month end (cents). */
  projectedSpend: number;
  /** Whole days the current balance can sustain at `dailyBurn`. */
  daysMoneyLasts: number;
}

/** Per-day cost of all recurring expenses (cents). */
export function recurringDailyCost(data: AppData): number {
  return Math.round(data.recurring.reduce((acc, r) => acc + r.amountPerCycle / r.cycleDays, 0));
}

export function computeForecast(data: AppData, now: Date = new Date()): Forecast {
  const health = computeHealth(data, now);
  const recurring = recurringDailyCost(data);
  // Use observed spend, but never below the user's own recurring commitments.
  const dailyBurn = Math.max(health.dailyAverage, recurring);
  const daysRemaining = daysRemainingInMonth(now);
  const balance = currentBalance(data);

  const projectedSpend = dailyBurn * daysRemaining;
  const projectedEndBalance = balance - projectedSpend;
  const daysMoneyLasts = dailyBurn > 0 ? Math.floor(balance / dailyBurn) : Infinity;

  return {
    dailyBurn,
    recurringDailyCost: recurring,
    daysRemaining,
    projectedEndBalance,
    projectedSpend,
    daysMoneyLasts,
  };
}
