import { describe, expect, it } from "vitest";
import { parseMpesa, parseMpesaBatch } from "./parse";
import { toCents } from "../money";

describe("parseMpesa", () => {
  it("parses a buy-goods 'paid to' message", () => {
    const tx = parseMpesa(
      "TEF1A2B3C4 Confirmed. Ksh135.00 paid to KIPCHIMCHIM ENTERPRISES. on 5/6/26 at 1:30 PM. New M-PESA balance is Ksh7,512.39. Transaction cost, Ksh0.00.",
    );
    expect(tx).not.toBeNull();
    expect(tx!.amount).toBe(toCents(135));
    expect(tx!.merchant).toBe("KIPCHIMCHIM ENTERPRISES");
    expect(tx!.balanceAfter).toBe(toCents(7512.39));
    expect(tx!.direction).toBe("out");
    expect(tx!.code).toBe("TEF1A2B3C4");
    expect(tx!.source).toBe("sms");
  });

  it("parses a 'sent to' send-money message", () => {
    const tx = parseMpesa(
      "ABC1234567 Confirmed. Ksh500.00 sent to JOHN DOE 0712345678 on 5/6/26 at 2:00 PM. New M-PESA balance is Ksh3,000.00. Transaction cost, Ksh13.00.",
    );
    expect(tx!.amount).toBe(toCents(500));
    expect(tx!.merchant).toBe("JOHN DOE");
    expect(tx!.direction).toBe("out");
    expect(tx!.balanceAfter).toBe(toCents(3000));
  });

  it("parses a received-money message as income", () => {
    const tx = parseMpesa(
      "DEF7654321 Confirmed. You have received Ksh1,000.00 from JANE WANJIKU 0711111111 on 5/6/26 at 9:00 AM. New M-PESA balance is Ksh4,000.00.",
    );
    expect(tx!.direction).toBe("in");
    expect(tx!.category).toBe("Income");
    expect(tx!.amount).toBe(toCents(1000));
    expect(tx!.merchant).toBe("JANE WANJIKU");
  });

  it("parses an airtime purchase", () => {
    const tx = parseMpesa(
      "GHI1112223 Confirmed. You bought Ksh50.00 of airtime on 5/6/26 at 8:00 AM. New M-PESA balance is Ksh1,200.00.",
    );
    expect(tx!.category).toBe("Airtime");
    expect(tx!.amount).toBe(toCents(50));
    expect(tx!.direction).toBe("out");
  });

  it("infers Transport category from a sacco merchant", () => {
    const tx = parseMpesa("XYZ9998887 Confirmed. Ksh100.00 paid to EMBASSAVA SACCO. on 5/6/26 at 7:00 AM. New M-PESA balance is Ksh900.00.");
    expect(tx!.category).toBe("Transport");
  });

  it("returns null for unrecognized text", () => {
    expect(parseMpesa("Hey, are we still meeting at 5?")).toBeNull();
    expect(parseMpesa("")).toBeNull();
  });

  it("parses a batch of newline-separated messages", () => {
    const input = [
      "AAA1112223 Confirmed. Ksh135.00 paid to DUKA. on 5/6/26 at 1:00 PM. New M-PESA balance is Ksh7,000.00.",
      "BBB1112224 Confirmed. You bought Ksh50.00 of airtime on 5/6/26 at 2:00 PM. New M-PESA balance is Ksh6,950.00.",
    ].join("\n\n");
    const txs = parseMpesaBatch(input);
    expect(txs).toHaveLength(2);
  });
});
