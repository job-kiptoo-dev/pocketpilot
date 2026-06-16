import type { AppData, Category } from "@/lib/types";
import {
  currentBalance,
  dayOfMonth,
  isSameMonth,
  isSpend,
  MS_PER_DAY,
  monthTransactions,
  sum,
} from "./util";

export interface CategorySpend {
  category: Category;
  amount: number; // cents
  share: number; // 0..1 of total spend
}

export interface DailyPoint {
  date: string; // ISO day
  label: string; // e.g. "Jun 5"
  spend: number; // cents
}

export interface HealthSummary {
  balance: number;
  /** Mean spend per elapsed day this month (cents). */
  dailyAverage: number;
  /** Actual spend over the trailing 7 days (cents). */
  weeklyAverage: number;
  /** Total spend so far this calendar month (cents). */
  monthlySpend: number;
  /** Income recognised this month (cents); falls back to profile income. */
  monthlyIncome: number;
  /** 0..1 — share of income not spent. */
  savingsRate: number;
  /** Explicit transfers to Savings this month (cents). */
  explicitSavings: number;
  /** Money burned per day (cents) — same basis as dailyAverage. */
  burnRate: number;
  /** 0..100 composite wellbeing score. */
  score: number;
  byCategory: CategorySpend[];
  dailyTrend: DailyPoint[];
}

export function computeHealth(data: AppData, now: Date = new Date()): HealthSummary {
  const monthTx = monthTransactions(data.transactions, now);
  const elapsed = Math.max(1, dayOfMonth(now));

  const spendTx = monthTx.filter(isSpend);
  const monthlySpend = sum(spendTx.map((t) => t.amount));

  const incomeTx = monthTx.filter((t) => t.direction === "in");
  const monthlyIncome = incomeTx.length ? sum(incomeTx.map((t) => t.amount)) : data.profile.monthlyIncome;

  const explicitSavings = sum(monthTx.filter((t) => t.category === "Savings").map((t) => t.amount));

  const dailyAverage = Math.round(monthlySpend / elapsed);

  const sevenDaysAgo = now.getTime() - 7 * MS_PER_DAY;
  const weeklyAverage = sum(
    data.transactions.filter((t) => isSpend(t) && new Date(t.date).getTime() >= sevenDaysAgo).map((t) => t.amount),
  );

  const savingsRate = monthlyIncome > 0 ? Math.max(0, Math.min(1, (monthlyIncome - monthlySpend) / monthlyIncome)) : 0;

  // Composite score: half from savings rate, half from leftover runway.
  const leftoverRatio = monthlyIncome > 0 ? Math.max(0, (monthlyIncome - monthlySpend) / monthlyIncome) : 0;
  const score = Math.round(Math.max(0, Math.min(100, savingsRate * 60 + leftoverRatio * 40)));

  // Category breakdown.
  const byCatMap = new Map<Category, number>();
  for (const t of spendTx) byCatMap.set(t.category, (byCatMap.get(t.category) ?? 0) + t.amount);
  const byCategory: CategorySpend[] = [...byCatMap.entries()]
    .map(([category, amount]) => ({ category, amount, share: monthlySpend ? amount / monthlySpend : 0 }))
    .sort((a, b) => b.amount - a.amount);

  // Daily trend across the month so far.
  const dailyTrend: DailyPoint[] = [];
  for (let day = 1; day <= elapsed; day++) {
    const d = new Date(now.getFullYear(), now.getMonth(), day);
    const spend = sum(
      data.transactions
        .filter((t) => isSpend(t) && isSameMonth(t.date, now) && new Date(t.date).getDate() === day)
        .map((t) => t.amount),
    );
    dailyTrend.push({
      date: d.toISOString(),
      label: d.toLocaleDateString("en-KE", { month: "short", day: "numeric" }),
      spend,
    });
  }

  return {
    balance: currentBalance(data),
    dailyAverage,
    weeklyAverage,
    monthlySpend,
    monthlyIncome,
    savingsRate,
    explicitSavings,
    burnRate: dailyAverage,
    score,
    byCategory,
    dailyTrend,
  };
}
