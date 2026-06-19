import type { AppData, Category } from "../types";
import { computeHealth } from "./health";
import { computeSurvival } from "./survival";
import { recurringDailyCost } from "./forecast";
import { daysUntilPayday } from "./util";
import { formatKes } from "../money";

export type OpportunityKind = "discretionary" | "overspend" | "recurring" | "headroom";

export interface SavingsOpportunity {
  id: string;
  kind: OpportunityKind;
  title: string;
  detail: string;
  /** Estimated amount this could free up per month (cents). */
  potentialMonthly: number;
  /** "warning" = fix to stay safe, "suggestion" = optional win. */
  severity: "warning" | "suggestion";
  category?: Category;
}

export interface OpportunityReport {
  opportunities: SavingsOpportunity[];
  /** Sum of monthly potential across all opportunities (cents). */
  totalPotentialMonthly: number;
}

// Categories the user has real discretion over month-to-month.
const DISCRETIONARY: Category[] = ["Entertainment", "Data Bundles", "Airtime", "Miscellaneous"];

// Only flag a discretionary category once it's a meaningful slice of spend.
const DISCRETIONARY_MIN_SHARE = 0.12;
const DISCRETIONARY_TRIM = 0.3; // assume a realistic 30% trim

/**
 * Find concrete places the user could free up cash, newest data first.
 * Pure and explainable — every number traces back to their transactions.
 */
export function findOpportunities(data: AppData, now: Date = new Date()): OpportunityReport {
  const health = computeHealth(data, now);
  const survival = computeSurvival(data, now);
  const out: SavingsOpportunity[] = [];

  // 1. Overspending vs the safe daily allowance — the most urgent lever.
  const overshoot = survival.dailyBurn - survival.safeDailyAllowance;
  if (overshoot > 0 && survival.daysToPayday > 0) {
    out.push({
      id: "overspend",
      kind: "overspend",
      title: "You're spending faster than is safe",
      detail: `At ${formatKes(survival.dailyBurn, { decimals: false })}/day you're ${formatKes(overshoot, { decimals: false })} over the ${formatKes(survival.safeDailyAllowance, { decimals: false })} that reaches payday safely.`,
      potentialMonthly: overshoot * 30,
      severity: "warning",
    });
  }

  // 2. Discretionary categories that are a big slice of spend.
  for (const cat of DISCRETIONARY) {
    const row = health.byCategory.find((c) => c.category === cat);
    if (!row || row.share < DISCRETIONARY_MIN_SHARE) continue;
    const trim = Math.round(row.amount * DISCRETIONARY_TRIM);
    if (trim <= 0) continue;
    out.push({
      id: `cut-${cat}`,
      kind: "discretionary",
      title: `Trim ${cat}`,
      detail: `${cat} is ${Math.round(row.share * 100)}% of your spend (${formatKes(row.amount, { decimals: false })}). Cutting it ~30% frees up money with little pain.`,
      potentialMonthly: trim,
      severity: "suggestion",
      category: cat,
    });
  }

  // 3. Heavy recurring commitments worth renegotiating.
  const recurringMonthly = recurringDailyCost(data) * 30;
  const biggest = [...data.recurring].sort((a, b) => b.amountPerCycle / b.cycleDays - a.amountPerCycle / a.cycleDays)[0];
  if (biggest && recurringMonthly > 0) {
    const monthly = Math.round((biggest.amountPerCycle / biggest.cycleDays) * 30);
    if (monthly >= 100_000) {
      out.push({
        id: `recurring-${biggest.id}`,
        kind: "recurring",
        title: `Review "${biggest.label}"`,
        detail: `This recurring cost runs about ${formatKes(monthly, { decimals: false })}/month. Renegotiating or downgrading it is a lasting saving.`,
        potentialMonthly: Math.round(monthly * 0.2),
        severity: "suggestion",
        category: biggest.category,
      });
    }
  }

  // 4. Genuine headroom — nudge surplus into savings.
  const surplus = survival.safeDailyAllowance - survival.dailyBurn;
  if (surplus > 0 && survival.status !== "Critical" && survival.status !== "Warning") {
    out.push({
      id: "headroom",
      kind: "headroom",
      title: "You have room to save more",
      detail: `You're spending ${formatKes(surplus, { decimals: false })}/day under your safe allowance. Sweeping that into a goal builds your buffer automatically.`,
      potentialMonthly: surplus * 30,
      severity: "suggestion",
    });
  }

  // Most impactful first, warnings always ahead of suggestions.
  out.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === "warning" ? -1 : 1;
    return b.potentialMonthly - a.potentialMonthly;
  });

  const opportunities = out.slice(0, 4);
  const totalPotentialMonthly = opportunities.reduce((acc, o) => acc + o.potentialMonthly, 0);
  return { opportunities, totalPotentialMonthly };
}
