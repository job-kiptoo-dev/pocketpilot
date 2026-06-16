import { describe, expect, it } from "vitest";
import type { AppData } from "../types";
import { toCents } from "../money";
import { computeHealth } from "./health";
import { computeForecast } from "./forecast";
import { computeSurvival } from "./survival";
import { simulatePurchase } from "./simulator";

// Fixed "now": 16 June 2026. Payday on the 1st -> next payday in 15 days.
const NOW = new Date(2026, 5, 16, 12, 0, 0);

function makeData(): AppData {
  return {
    profile: { name: "Test", payday: 1, monthlyIncome: toCents(60000) },
    transactions: [
      // newest first
      { id: "t3", amount: toCents(200), direction: "out", category: "Food", merchant: "Lunch", balanceAfter: toCents(9000), date: new Date(2026, 5, 15, 13).toISOString(), source: "manual" },
      { id: "t2", amount: toCents(800), direction: "out", category: "Transport", merchant: "Bolt", balanceAfter: toCents(9200), date: new Date(2026, 5, 10, 8).toISOString(), source: "manual" },
      { id: "t1", amount: toCents(60000), direction: "in", category: "Income", merchant: "Salary", balanceAfter: toCents(10000), date: new Date(2026, 5, 1, 9).toISOString(), source: "manual" },
    ],
    recurring: [
      { id: "r1", label: "Lunch", category: "Food", amountPerCycle: toCents(160), cycleDays: 1 },
    ],
    goals: [
      { id: "g1", name: "Phone", target: toCents(40000), saved: toCents(10000), deadline: new Date(2026, 9, 16).toISOString() },
    ],
  };
}

describe("computeHealth", () => {
  it("uses the latest balance and totals spend", () => {
    const h = computeHealth(makeData(), NOW);
    expect(h.balance).toBe(toCents(9000)); // latest by date
    expect(h.monthlySpend).toBe(toCents(1000)); // 200 + 800
    expect(h.monthlyIncome).toBe(toCents(60000));
  });

  it("ranks categories by spend", () => {
    const h = computeHealth(makeData(), NOW);
    expect(h.byCategory[0].category).toBe("Transport"); // 800 > 200
  });

  it("computes a positive savings rate when income exceeds spend", () => {
    const h = computeHealth(makeData(), NOW);
    expect(h.savingsRate).toBeGreaterThan(0.9);
  });
});

describe("computeForecast", () => {
  it("never projects burn below the recurring daily commitment", () => {
    const f = computeForecast(makeData(), NOW);
    expect(f.dailyBurn).toBeGreaterThanOrEqual(toCents(160));
    expect(f.daysRemaining).toBe(14); // 30 - 16
  });
});

describe("computeSurvival", () => {
  it("counts days to the next payday", () => {
    const s = computeSurvival(makeData(), NOW);
    expect(s.daysToPayday).toBe(15); // 16 Jun -> 1 Jul
  });

  it("returns a valid status and bounded confidence", () => {
    const s = computeSurvival(makeData(), NOW);
    expect(["Safe", "Comfortable", "Warning", "Critical"]).toContain(s.status);
    expect(s.confidence).toBeGreaterThanOrEqual(5);
    expect(s.confidence).toBeLessThanOrEqual(100);
  });

  it("produces at least one recommendation", () => {
    const s = computeSurvival(makeData(), NOW);
    expect(s.recommendations.length).toBeGreaterThan(0);
  });
});

describe("simulatePurchase", () => {
  it("reduces the balance and re-evaluates status", () => {
    const sim = simulatePurchase(makeData(), toCents(5000), NOW);
    expect(sim.balanceAfter).toBe(toCents(4000));
    expect(sim.balanceBefore).toBe(toCents(9000));
    expect(typeof sim.verdict).toBe("string");
  });
});
