import type { AppData } from "@/lib/types";
import { computeHealth } from "@/lib/finance/health";
import { computeForecast } from "@/lib/finance/forecast";
import { computeSurvival } from "@/lib/finance/survival";
import { simulatePurchase } from "@/lib/finance/simulator";
import { formatKes, toCents } from "@/lib/money";

/** Pull the first KES amount mentioned in a question. */
function extractAmount(q: string): number | null {
  const m = q.replace(/ksh|kes|sh/gi, "").match(/(\d[\d,]*(?:\.\d+)?)/);
  if (!m) return null;
  const v = Number(m[1].replace(/,/g, ""));
  return Number.isNaN(v) ? null : toCents(v);
}

function extractMonths(q: string): number | null {
  const m = q.match(/(\d+)\s*month/i);
  return m ? Number(m[1]) : null;
}

/**
 * Rule-based financial assistant that answers from the user's real data.
 * Works fully offline; the LLM-backed version (Phase 2) reuses these same
 * finance functions as tools.
 */
export function answerLocally(data: AppData, question: string, now: Date = new Date()): string {
  const q = question.toLowerCase();
  const health = computeHealth(data, now);
  const forecast = computeForecast(data, now);
  const survival = computeSurvival(data, now);

  // Can I afford X?
  if (/(afford|can i (buy|get)|should i (buy|get))/.test(q)) {
    const amount = extractAmount(q);
    if (amount) {
      const sim = simulatePurchase(data, amount, now);
      return `If you spend ${formatKes(amount)}, your balance drops to ${formatKes(
        sim.balanceAfter,
      )} and you'd reach payday with about ${formatKes(sim.expectedAtPaydayAfter)}. ${sim.verdict}`;
    }
    return `Tell me the price (e.g. "Can I afford a 1,500 jacket?") and I'll simulate it against your ${formatKes(
      survival.safeDailyAllowance,
    )}/day safe limit.`;
  }

  // Biggest expense
  if (/(biggest|largest|most).*(expense|spend|cost|category)/.test(q) || /where.*money.*go/.test(q)) {
    const top = health.byCategory[0];
    if (!top) return "You haven't recorded any spending yet this month.";
    return `Your biggest expense is ${top.category} at ${formatKes(top.amount)} — that's ${Math.round(
      top.share * 100,
    )}% of your spending this month.`;
  }

  // Month-end balance
  if (/(month.?end|end of (the )?month|finish the month)/.test(q)) {
    return `You're on track to finish the month with about ${formatKes(
      forecast.projectedEndBalance,
    )}, spending roughly ${formatKes(forecast.projectedSpend)} more over the next ${forecast.daysRemaining} days.`;
  }

  // Savings in N months
  if (/save/.test(q)) {
    const months = extractMonths(q) ?? 6;
    const monthlySurplus = Math.max(0, health.monthlyIncome - health.monthlySpend);
    return `At your current pace you keep about ${formatKes(
      monthlySurplus,
    )}/month. Over ${months} months that's roughly ${formatKes(monthlySurplus * months)} — before topping up your goals.`;
  }

  // Safe / survival
  if (/(safe|survive|make it|payday|run out|broke)/.test(q)) {
    return `You're ${survival.status}. At ${formatKes(survival.dailyBurn, {
      decimals: false,
    })}/day your balance of ${formatKes(survival.balance)} lasts ${survival.daysMoneyLasts} days, and payday is in ${
      survival.daysToPayday
    } days. Keep spending under ${formatKes(survival.safeDailyAllowance, { decimals: false })}/day to stay safe.`;
  }

  // How much can I spend
  if (/(how much).*(spend|spending)/.test(q)) {
    return `You can safely spend up to ${formatKes(survival.safeDailyAllowance, {
      decimals: false,
    })} per day and still reach payday in ${survival.daysToPayday} days.`;
  }

  // Balance
  if (/(balance|how much.*(have|left|money))/.test(q)) {
    return `Your current balance is ${formatKes(health.balance)}. You've spent ${formatKes(
      health.monthlySpend,
    )} this month.`;
  }

  // Fallback summary
  return `Here's a quick snapshot: balance ${formatKes(health.balance)}, ${survival.status} until payday (${
    survival.daysToPayday
  } days), spending ~${formatKes(health.dailyAverage, { decimals: false })}/day. Ask me about affording something, your biggest expense, or your month-end balance.`;
}
