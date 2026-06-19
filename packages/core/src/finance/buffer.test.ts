import { describe, expect, it } from "vitest";
import type { AppData } from "../types";
import { toCents } from "../money";
import { BUFFER_MIN, BUFFER_PREFERRED, computeBuffer } from "./buffer";

// "now" = 16 June 2026, payday on the 1st. 14 days remain in the month.
const NOW = new Date(2026, 5, 16, 12, 0, 0);

function makeData(over: Partial<AppData> = {}): AppData {
  return {
    profile: { name: "Test", payday: 1, monthlyIncome: toCents(60000) },
    transactions: [
      { id: "t1", amount: toCents(200), direction: "out", category: "Food", merchant: "Lunch", balanceAfter: toCents(20000), date: new Date(2026, 5, 15, 13).toISOString(), source: "manual" },
    ],
    recurring: [],
    goals: [],
    accounts: [{ id: "a-mpesa", name: "M-Pesa", type: "mpesa", balance: 0 }],
    ...over,
  };
}

describe("computeBuffer", () => {
  it("reports healthy when projected end balance clears the preferred buffer", () => {
    const b = computeBuffer(makeData(), NOW);
    expect(b.projectedEndBalance).toBeGreaterThanOrEqual(BUFFER_PREFERRED);
    expect(b.level).toBe("healthy");
    expect(b.shortfallToMinimum).toBe(0);
    expect(b.shortfallToPreferred).toBe(0);
  });

  it("flags below-minimum and suggests a daily cut", () => {
    // Tiny balance, heavy recurring burn -> projection dips under the floor.
    const data = makeData({
      transactions: [
        { id: "t1", amount: toCents(200), direction: "out", category: "Food", merchant: "Lunch", balanceAfter: toCents(3000), date: new Date(2026, 5, 15, 13).toISOString(), source: "manual" },
      ],
      recurring: [{ id: "r1", label: "Daily", category: "Food", amountPerCycle: toCents(300), cycleDays: 1 }],
    });
    const b = computeBuffer(data, NOW);
    expect(b.level === "below-minimum" || b.level === "negative").toBe(true);
    expect(b.shortfallToMinimum).toBeGreaterThan(0);
    expect(b.dailyCutToMinimum).toBeGreaterThan(0);
  });

  it("respects custom targets", () => {
    const b = computeBuffer(makeData(), NOW, { min: toCents(100), preferred: toCents(200) });
    expect(b.min).toBe(toCents(100));
    expect(b.preferred).toBe(toCents(200));
  });

  it("uses the documented default targets", () => {
    expect(BUFFER_MIN).toBe(toCents(2500));
    expect(BUFFER_PREFERRED).toBe(toCents(5000));
  });
});
