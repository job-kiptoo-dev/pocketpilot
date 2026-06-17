import type { AppData } from "../types";
import { computeHealth } from "../finance/health";
import { computeForecast } from "../finance/forecast";
import { computeSurvival } from "../finance/survival";
import { simulatePurchase } from "../finance/simulator";
import { computeAllGoals } from "../finance/savings";
import { netCash } from "../finance/accounts";
import { formatKes, toCents } from "../money";

/** Pull the first KES amount mentioned in a question. */
function extractAmount(q: string): number | null {
  const m = q.replace(/ksh|kes|shillings?|bob/gi, "").match(/(\d[\d,]*(?:\.\d+)?)/);
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
 * Works fully offline; an LLM-backed version can reuse these same finance
 * functions as tools.
 */
export function answerLocally(data: AppData, question: string, now: Date = new Date()): string {
  const q = question.toLowerCase().trim();
  const health = computeHealth(data, now);
  const forecast = computeForecast(data, now);
  const survival = computeSurvival(data, now);
  const amount = extractAmount(q);

  // Greeting / help
  if (/^(hi|hey|hello|yo|sasa|niaje|help|what can you do)\b/.test(q) || /what can you (do|help)/.test(q)) {
    return `I read your real M-Pesa data. Try: "can I afford a 800 night out?", "what's my biggest expense?", "how much will I have at month end?", "am I safe until payday?", "what's my net cash?", or "how's my emergency fund?"`;
  }

  // Purchase / affordability — "buy X for 800", "spend 200", "how much will I have?"
  const purchaseWords = /(buy|bought|buying|spend|spending|cost|costs|afford|purchase|pay for|get a|get the|grab|order|book)/.test(q);
  const remainingWords = /((how much|what).*(will i have|left|remain)|have left|left after|balance after)/.test(q);
  if (amount && (purchaseWords || remainingWords)) {
    const sim = simulatePurchase(data, amount, now);
    return `If you spend ${formatKes(amount)} on that, you'll have ${formatKes(sim.balanceAfter)} left. You'd reach payday in ${survival.daysToPayday} days with about ${formatKes(sim.expectedAtPaydayAfter)} (${sim.statusAfter}). ${sim.verdict}`;
  }
  if (/(afford|can i (buy|get)|should i (buy|get))/.test(q)) {
    return `Tell me the price (e.g. "can I afford a 1,500 jacket?") and I'll simulate it against your ${formatKes(survival.safeDailyAllowance, { decimals: false })}/day safe limit.`;
  }

  // Month-end forecast (also catches "how much will I have" with no purchase amount)
  if (/(month.?end|end of (the )?month|finish the month)/.test(q) || (!amount && remainingWords)) {
    return `You're on track to finish the month with about ${formatKes(forecast.projectedEndBalance)}, spending roughly ${formatKes(forecast.projectedSpend)} more over the next ${forecast.daysRemaining} days.`;
  }

  // Net cash / accounts
  if (/(net cash|net worth|total (cash|money|balance)|all my (money|accounts)|across)/.test(q)) {
    const parts = data.accounts.map((a) => `${a.name} ${formatKes(a.type === "mpesa" ? health.balance : a.balance, { compact: true })}`).join(", ");
    return `Your total net cash is ${formatKes(netCash(data))}${parts ? ` (${parts})` : ""}.`;
  }

  // Goals
  if (/(goal|emergency fund|saving for|target|on track)/.test(q)) {
    const goals = computeAllGoals(data.goals, now);
    if (goals.length === 0) return "You don't have any savings goals yet — create one on the Goals tab.";
    const lines = goals.map((g) => {
      const pct = Math.round(g.progress * 100);
      const sugg = g.suggestedMonthly != null ? `, save ${formatKes(g.suggestedMonthly, { compact: true })}/mo` : "";
      return `${g.goal.emoji ?? "🎯"} ${g.goal.name}: ${pct}% (${formatKes(g.goal.saved, { compact: true })}/${formatKes(g.goal.target, { compact: true })}${sugg})`;
    });
    return `Here's where your goals stand — ${lines.join("; ")}.`;
  }

  // Biggest expense
  if (/(biggest|largest|most|highest).*(expense|spend|cost|category)/.test(q) || /where.*money.*go/.test(q) || /spend most/.test(q)) {
    const top = health.byCategory[0];
    if (!top) return "You haven't recorded any spending yet this month.";
    return `Your biggest expense is ${top.category} at ${formatKes(top.amount)} — ${Math.round(top.share * 100)}% of this month's spending.`;
  }

  // How much can I save in N months
  if (/save|put aside|set aside/.test(q)) {
    const months = extractMonths(q) ?? 6;
    const monthlySurplus = Math.max(0, health.monthlyIncome - health.monthlySpend);
    return `At your current pace you keep about ${formatKes(monthlySurplus)}/month. Over ${months} months that's roughly ${formatKes(monthlySurplus * months)}.`;
  }

  // Safe / survival
  if (/(safe|survive|make it|payday|run out|broke|last)/.test(q)) {
    return `You're ${survival.status}. At ${formatKes(survival.dailyBurn, { decimals: false })}/day your balance of ${formatKes(survival.balance)} lasts ${survival.daysMoneyLasts} days, and payday is in ${survival.daysToPayday} days. Keep spending under ${formatKes(survival.safeDailyAllowance, { decimals: false })}/day to stay safe.`;
  }

  // How much can I spend (per day)
  if (/(how much).*(spend|spending)/.test(q)) {
    return `You can safely spend up to ${formatKes(survival.safeDailyAllowance, { decimals: false })} per day and still reach payday in ${survival.daysToPayday} days.`;
  }

  // Balance (present tense)
  if (/(balance|how much.*(do i have|i have now)|how much money)/.test(q)) {
    return `Your current M-Pesa balance is ${formatKes(health.balance)}. You've spent ${formatKes(health.monthlySpend)} this month.`;
  }

  // Fallback summary
  return `Quick snapshot: balance ${formatKes(health.balance)}, ${survival.status} until payday (${survival.daysToPayday} days), spending ~${formatKes(health.dailyAverage, { decimals: false })}/day. Ask me if you can afford something, your biggest expense, your month-end balance, or your net cash.`;
}
