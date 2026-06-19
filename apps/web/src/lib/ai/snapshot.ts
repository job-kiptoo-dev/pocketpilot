import type { AppData } from "@pocketpilot/core";
import {
  computeAllGoals,
  computeForecast,
  computeHealth,
  computeSurvival,
  formatKes,
  netCash,
} from "@pocketpilot/core";

/** Compact, human-readable financial snapshot for the LLM system prompt. */
export function financialSnapshot(data: AppData, now: Date = new Date()): string {
  const health = computeHealth(data, now);
  const survival = computeSurvival(data, now);
  const forecast = computeForecast(data, now);
  const goals = computeAllGoals(data.goals, now);

  const topCats = health.byCategory
    .slice(0, 5)
    .map((c) => `${c.category} ${formatKes(c.amount)} (${Math.round(c.share * 100)}%)`)
    .join(", ");

  const goalLines = goals
    .map((g) => `${g.goal.name} ${Math.round(g.progress * 100)}% (${formatKes(g.goal.saved)}/${formatKes(g.goal.target)})`)
    .join("; ");

  const accountLines = data.accounts
    .map((a) => `${a.name} ${formatKes(a.type === "mpesa" ? health.balance : a.balance)}`)
    .join(", ");

  return [
    `Name: ${data.profile.name || "the user"}`,
    `M-Pesa balance: ${formatKes(health.balance)}`,
    `Net cash (all accounts): ${formatKes(netCash(data))}${accountLines ? ` — ${accountLines}` : ""}`,
    `Monthly income: ${formatKes(health.monthlyIncome)}; spent this month: ${formatKes(health.monthlySpend)}; savings rate: ${Math.round(health.savingsRate * 100)}%`,
    `Daily burn: ${formatKes(health.dailyAverage)}/day; safe daily allowance: ${formatKes(survival.safeDailyAllowance)}/day`,
    `Survival status: ${survival.status}; ${survival.daysToPayday} days to payday; balance lasts ~${survival.daysMoneyLasts} days; expected at payday: ${formatKes(survival.expectedBalanceAtPayday)}`,
    `Projected month-end balance: ${formatKes(forecast.projectedEndBalance)}`,
    `Top spending: ${topCats || "none yet"}`,
    `Goals: ${goalLines || "none"}`,
  ].join("\n");
}
