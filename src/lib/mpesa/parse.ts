import type { Category, Transaction } from "@/lib/types";
import { parseKesAmount } from "@/lib/money";

export type ParsedTransaction = Omit<Transaction, "id">;

const AMOUNT = String.raw`Ksh[\s]?[\d,]+(?:\.\d{1,2})?`;

/** Pull the "New M-PESA balance is Ksh..." value, if present. */
function extractBalance(text: string): number | undefined {
  const m = text.match(new RegExp(String.raw`balance\s+is\s+(${AMOUNT})`, "i"));
  if (!m) return undefined;
  return parseKesAmount(m[1]) ?? undefined;
}

/** Pull the M-Pesa transaction code (first token, e.g. "WEF1A2B3C4"). */
function extractCode(text: string): string | undefined {
  const m = text.match(/\b([A-Z]{2,3}[A-Z0-9]{6,9})\b/);
  return m?.[1];
}

/** Parse a date like "5/6/26" or "5/6/2026" plus optional time into ISO. */
function extractDate(text: string): string {
  const m = text.match(/on\s+(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+at\s+(\d{1,2}):(\d{2})\s*(AM|PM)?)?/i);
  if (!m) return new Date().toISOString();
  const [, dd, mm, yy, hh, min, ampm] = m;
  let year = Number(yy);
  if (year < 100) year += 2000;
  let hour = hh ? Number(hh) : 12;
  if (ampm) {
    const isPm = ampm.toUpperCase() === "PM";
    if (isPm && hour < 12) hour += 12;
    if (!isPm && hour === 12) hour = 0;
  }
  const d = new Date(year, Number(mm) - 1, Number(dd), hour, min ? Number(min) : 0);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

function cleanMerchant(raw: string): string {
  return raw
    .replace(/\b\d{9,12}\b/g, "") // strip phone numbers
    .replace(/\s+/g, " ")
    .replace(/[.,]+$/, "")
    .trim();
}

const TRANSPORT_HINTS = /sacco|matatu|transport|fuel|petrol|shell|total|rubis|uber|bolt|little|fare/i;
const FOOD_HINTS = /enterprise|food|hotel|restaurant|cafe|kibanda|butchery|grocer|supermarket|mart|kitchen|eatery|bakery|naivas|carrefour|quickmart/i;
const RENT_HINTS = /rent|landlord|apartment|housing|caretaker/i;
const ENT_HINTS = /bet|sportpesa|odibet|netflix|showmax|dstv|gotv|cinema|bar|club|spotify/i;

/** Guess a category for a "paid to"/"sent to" merchant. */
function guessCategory(merchant: string, direction: "in" | "out"): Category {
  if (direction === "in") return "Income";
  if (TRANSPORT_HINTS.test(merchant)) return "Transport";
  if (RENT_HINTS.test(merchant)) return "Rent";
  if (ENT_HINTS.test(merchant)) return "Entertainment";
  if (FOOD_HINTS.test(merchant)) return "Food";
  return "Miscellaneous";
}

interface Rule {
  test: RegExp;
  build: (text: string, m: RegExpMatchArray) => Partial<ParsedTransaction> & { merchant: string; direction: "in" | "out" };
}

const RULES: Rule[] = [
  // Received money
  {
    test: new RegExp(String.raw`received\s+(${AMOUNT})\s+from\s+([A-Za-z0-9 .'&-]+?)(?:\s+on\b|\.)`, "i"),
    build: (_t, m) => ({
      amount: parseKesAmount(m[1])!,
      direction: "in",
      merchant: cleanMerchant(m[2]),
      category: "Income",
    }),
  },
  // Airtime
  {
    test: new RegExp(String.raw`bought\s+(${AMOUNT})\s+of\s+airtime`, "i"),
    build: (_t, m) => ({
      amount: parseKesAmount(m[1])!,
      direction: "out",
      merchant: "Airtime",
      category: "Airtime",
    }),
  },
  // Data bundles
  {
    test: new RegExp(String.raw`(${AMOUNT}).{0,40}?(?:data|bundle)`, "i"),
    build: (_t, m) => ({
      amount: parseKesAmount(m[1])!,
      direction: "out",
      merchant: "Data Bundles",
      category: "Data Bundles",
    }),
  },
  // Cash withdrawal
  {
    test: new RegExp(String.raw`(?:withdraw|give)\s+(${AMOUNT})\s+from\s+([A-Za-z0-9 .'&-]+?)(?:\s+New\b|\.\s+New|\.)`, "i"),
    build: (_t, m) => ({
      amount: parseKesAmount(m[1])!,
      direction: "out",
      merchant: cleanMerchant(m[2]) || "Cash Withdrawal",
      category: "Miscellaneous",
    }),
  },
  // Paid to (buy goods / pay bill)
  {
    test: new RegExp(String.raw`(${AMOUNT})\s+paid\s+to\s+([A-Za-z0-9 .'&-]+?)(?:\s+on\b|\.\s|\.$)`, "i"),
    build: (_t, m) => {
      const merchant = cleanMerchant(m[2]);
      return {
        amount: parseKesAmount(m[1])!,
        direction: "out",
        merchant,
        category: guessCategory(merchant, "out"),
      };
    },
  },
  // Sent to (send money)
  {
    test: new RegExp(String.raw`(${AMOUNT})\s+sent\s+to\s+([A-Za-z0-9 .'&-]+?)(?:\s+on\b|\s+\d{9,}|\.\s|\.$)`, "i"),
    build: (_t, m) => {
      const merchant = cleanMerchant(m[2]);
      return {
        amount: parseKesAmount(m[1])!,
        direction: "out",
        merchant,
        category: guessCategory(merchant, "out"),
      };
    },
  },
];

/**
 * Parse a single M-Pesa SMS confirmation message.
 * Returns a transaction (without id) or null if no rule matches.
 */
export function parseMpesa(raw: string): ParsedTransaction | null {
  const text = raw.trim();
  if (!text) return null;

  for (const rule of RULES) {
    const m = text.match(rule.test);
    if (!m) continue;
    const partial = rule.build(text, m);
    if (!partial.amount || Number.isNaN(partial.amount)) continue;
    return {
      amount: partial.amount,
      direction: partial.direction,
      merchant: partial.merchant || "Unknown",
      category: (partial.category as Category) ?? "Miscellaneous",
      balanceAfter: extractBalance(text),
      date: extractDate(text),
      code: extractCode(text),
      raw: text,
      source: "sms",
    };
  }
  return null;
}

/** Parse multiple messages (one per line / blank-line separated). */
export function parseMpesaBatch(input: string): ParsedTransaction[] {
  return input
    .split(/\n{2,}|\r?\n(?=[A-Z]{2,3}[A-Z0-9]{6,9}\b)/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map(parseMpesa)
    .filter((t): t is ParsedTransaction => t !== null);
}
