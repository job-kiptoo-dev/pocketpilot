import type { AppData } from "../types";
import { computeHealth } from "./health";
import { recurringDailyCost } from "./forecast";
import { currentBalance, daysUntilPayday, isSpend, monthTransactions, sum } from "./util";
import { formatKes } from "../money";

export type SurvivalStatus = "Safe" | "Comfortable" | "Warning" | "Critical";

export interface Survival {
  status: SurvivalStatus;
  balance: number;
  daysToPayday: number;
  dailyBurn: number;
  /** Projected balance the day payday lands (cents, may be negative). */
  expectedBalanceAtPayday: number;
  /** How many days the balance lasts at current burn. */
  daysMoneyLasts: number;
  /** Max you can spend per day and still reach payday with a buffer (cents). */
  safeDailyAllowance: number;
  /** 0..100 confidence in the estimate, from data volume + spend stability. */
  confidence: number;
  recommendations: string[];
}

const STATUS_THRESHOLDS: { status: SurvivalStatus; minRatio: number }[] = [
  { status: "Safe", minRatio: 1.5 },
  { status: "Comfortable", minRatio: 1.0 },
  { status: "Warning", minRatio: 0.6 },
  { status: "Critical", minRatio: 0 },
];

function statusForRatio(ratio: number): SurvivalStatus {
  for (const t of STATUS_THRESHOLDS) if (ratio >= t.minRatio) return t.status;
  return "Critical";
}

/** Coefficient-of-variation based confidence in the daily-burn estimate. */
function computeConfidence(data: AppData, now: Date): number {
  const month = monthTransactions(data.transactions, now).filter(isSpend);
  const daysWithData = new Set(month.map((t) => new Date(t.date).getDate())).size;

  // Daily spend series for variance.
  const byDay = new Map<number, number>();
  for (const t of month) byDay.set(new Date(t.date).getDate(), (byDay.get(new Date(t.date).getDate()) ?? 0) + t.amount);
  const series = [...byDay.values()];
  const mean = series.length ? sum(series) / series.length : 0;
  const variance = series.length ? sum(series.map((v) => (v - mean) ** 2)) / series.length : 0;
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 1;

  // More days of data -> higher; more volatile spend -> lower.
  const dataScore = Math.min(1, daysWithData / 14); // ~2 weeks = full marks
  const stabilityScore = Math.max(0, 1 - cv); // cv 0 -> 1, cv >=1 -> 0
  return Math.round(Math.max(5, Math.min(100, (dataScore * 0.6 + stabilityScore * 0.4) * 100)));
}

export function computeSurvival(data: AppData, now: Date = new Date()): Survival {
  const health = computeHealth(data, now);
  const balance = currentBalance(data);
  const daysToPayday = daysUntilPayday(now, data.profile.payday);
  const dailyBurn = Math.max(1, Math.max(health.dailyAverage, recurringDailyCost(data)));

  const daysMoneyLasts = Math.floor(balance / dailyBurn);
  const expectedBalanceAtPayday = balance - dailyBurn * daysToPayday;
  const ratio = daysMoneyLasts / daysToPayday;
  const status = statusForRatio(ratio);

  // Allowance leaves a small buffer (10% of balance) for payday day itself.
  const buffer = Math.round(balance * 0.1);
  const safeDailyAllowance = Math.max(0, Math.floor((balance - buffer) / daysToPayday));

  const confidence = computeConfidence(data, now);
  const recommendations = buildRecommendations({
    status,
    balance,
    daysToPayday,
    dailyBurn,
    safeDailyAllowance,
    expectedBalanceAtPayday,
    topCategory: health.byCategory[0]?.category,
    topShare: health.byCategory[0]?.share ?? 0,
  });

  return {
    status,
    balance,
    daysToPayday,
    dailyBurn,
    expectedBalanceAtPayday,
    daysMoneyLasts,
    safeDailyAllowance,
    confidence,
    recommendations,
  };
}

function buildRecommendations(ctx: {
  status: SurvivalStatus;
  balance: number;
  daysToPayday: number;
  dailyBurn: number;
  safeDailyAllowance: number;
  expectedBalanceAtPayday: number;
  topCategory?: string;
  topShare: number;
}): string[] {
  const recs: string[] = [];
  recs.push(`Keep daily spending under ${formatKes(ctx.safeDailyAllowance, { decimals: false })} to reach payday safely.`);

  if (ctx.status === "Critical" || ctx.status === "Warning") {
    const overshoot = ctx.dailyBurn - ctx.safeDailyAllowance;
    if (overshoot > 0) {
      recs.push(`You're overspending by about ${formatKes(overshoot, { decimals: false })}/day — trim it to avoid running dry.`);
    }
    if (ctx.expectedBalanceAtPayday < 0) {
      recs.push(`At this rate you'll be short ${formatKes(-ctx.expectedBalanceAtPayday, { decimals: false })} before payday.`);
    }
  } else {
    const surplus = ctx.safeDailyAllowance - ctx.dailyBurn;
    if (surplus > 0) {
      recs.push(`You have ${formatKes(surplus, { decimals: false })}/day of headroom — consider moving some to savings.`);
    }
  }

  if (ctx.topCategory && ctx.topShare > 0.35) {
    recs.push(`${ctx.topCategory} is ${Math.round(ctx.topShare * 100)}% of your spending — your biggest lever.`);
  }
  return recs;
}
