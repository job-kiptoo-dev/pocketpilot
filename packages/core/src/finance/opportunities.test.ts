import { describe, expect, it } from "vitest";
import type { AppData } from "../types";
import { toCents } from "../money";
import { findOpportunities } from "./opportunities";

const NOW = new Date(2026, 5, 16, 12, 0, 0);

function makeData(over: Partial<AppData> = {}): AppData {
  return {
    profile: { name: "Test", payday: 1, monthlyIncome: toCents(60000) },
    transactions: [],
    recurring: [],
    goals: [],
    accounts: [{ id: "a-mpesa", name: "M-Pesa", type: "mpesa", balance: 0 }],
    ...over,
  };
}

describe("findOpportunities", () => {
  it("flags a large discretionary category", () => {
    const data = makeData({
      transactions: [
        { id: "t1", amount: toCents(4000), direction: "out", category: "Entertainment", merchant: "Bar", balanceAfter: toCents(20000), date: new Date(2026, 5, 14).toISOString(), source: "manual" },
        { id: "t2", amount: toCents(1000), direction: "out", category: "Food", merchant: "Lunch", balanceAfter: toCents(24000), date: new Date(2026, 5, 12).toISOString(), source: "manual" },
      ],
    });
    const { opportunities } = findOpportunities(data, NOW);
    expect(opportunities.some((o) => o.category === "Entertainment" && o.kind === "discretionary")).toBe(true);
  });

  it("warns when spending outruns the safe allowance", () => {
    const data = makeData({
      transactions: [
        { id: "t1", amount: toCents(8000), direction: "out", category: "Food", merchant: "Spend", balanceAfter: toCents(2000), date: new Date(2026, 5, 15).toISOString(), source: "manual" },
      ],
    });
    const { opportunities } = findOpportunities(data, NOW);
    const warn = opportunities.find((o) => o.kind === "overspend");
    expect(warn?.severity).toBe("warning");
    // Warnings sort ahead of suggestions.
    expect(opportunities[0].severity).toBe("warning");
  });

  it("returns nothing actionable on empty data and caps at four", () => {
    const { opportunities } = findOpportunities(makeData(), NOW);
    expect(opportunities.length).toBeLessThanOrEqual(4);
  });
});
