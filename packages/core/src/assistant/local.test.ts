import { describe, expect, it } from "vitest";
import type { AppData } from "../types";
import { toCents } from "../money";
import { answerLocally } from "./local";

const NOW = new Date(2026, 5, 16, 12, 0, 0);

function makeData(): AppData {
  return {
    profile: { name: "Job", payday: 31, monthlyIncome: toCents(29000) },
    transactions: [
      { id: "t2", amount: toCents(500), direction: "out", category: "Food", merchant: "Lunch", balanceAfter: toCents(6782.39), date: new Date(2026, 5, 15).toISOString(), source: "manual" },
      { id: "t1", amount: toCents(29000), direction: "in", category: "Income", merchant: "Salary", balanceAfter: toCents(7282.39), date: new Date(2026, 5, 1).toISOString(), source: "manual" },
    ],
    recurring: [],
    goals: [{ id: "g1", name: "Emergency Fund", emoji: "🛟", target: toCents(50000), saved: toCents(10000), deadline: new Date(2026, 11, 16).toISOString() }],
    accounts: [
      { id: "a1", name: "M-Pesa", type: "mpesa", balance: 0 },
      { id: "a2", name: "Bank Savings", type: "bank", balance: toCents(15000) },
    ],
  };
}

describe("answerLocally", () => {
  it("simulates a purchase phrased as 'I want to buy X for 800, how much will I have?'", () => {
    const a = answerLocally(makeData(), "i want to buy some liquor and it costs around 800 how much will i have ?", NOW);
    expect(a).toMatch(/left/i);
    expect(a).toContain("5,982.39"); // 6,782.39 - 800
    expect(a).not.toMatch(/quick snapshot/i); // not the fallback
  });

  it("simulates 'can I spend 200'", () => {
    const a = answerLocally(makeData(), "if I spend 200 am I okay?", NOW);
    expect(a).toContain("6,582.39");
  });

  it("answers net cash across accounts", () => {
    const a = answerLocally(makeData(), "what's my net cash?", NOW);
    expect(a).toContain("21,782.39"); // 6,782.39 + 15,000
  });

  it("reports the biggest expense", () => {
    const a = answerLocally(makeData(), "what is my biggest expense?", NOW);
    expect(a).toContain("Food");
  });

  it("reports goal progress", () => {
    const a = answerLocally(makeData(), "how's my emergency fund doing?", NOW);
    expect(a).toContain("Emergency Fund");
  });

  it("answers month-end with no amount", () => {
    const a = answerLocally(makeData(), "how much will I have by month end?", NOW);
    expect(a).toMatch(/finish the month/i);
  });

  it("answers safety", () => {
    const a = answerLocally(makeData(), "am I safe until payday?", NOW);
    expect(a).toMatch(/payday/i);
  });
});
