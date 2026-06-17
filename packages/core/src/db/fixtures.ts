import type { AppData, Category, Direction, Transaction } from "../types";
import { toCents } from "../money";

interface SpendDef {
  merchant: string;
  category: Category;
  kes: number;
  /** every N days; 1 = daily */
  everyDays?: number;
  /** specific day-of-month to fire on (overrides everyDays) */
  onDay?: number;
  direction?: Direction;
}

// Realistic Nairobi spending pattern for a young salaried earner.
const DAILY: SpendDef[] = [
  { merchant: "Mama Oliech Lunch", category: "Food", kes: 160 },
  { merchant: "Embassava Sacco", category: "Transport", kes: 100 },
  { merchant: "Soko Eggs Vendor", category: "Food", kes: 30 },
  { merchant: "Indomie Duka", category: "Food", kes: 135, everyDays: 2 },
];

const WEEKLY: SpendDef[] = [
  { merchant: "Safaricom Airtime", category: "Airtime", kes: 50, everyDays: 7 },
  { merchant: "Safaricom Data Bundles", category: "Data Bundles", kes: 100, everyDays: 7 },
  { merchant: "Naivas Supermarket", category: "Food", kes: 1200, everyDays: 7 },
  { merchant: "Sportpesa", category: "Entertainment", kes: 300, everyDays: 6 },
];

const ONE_OFFS: SpendDef[] = [
  { merchant: "Salary - Acme Ltd", category: "Income", kes: 60000, onDay: 1, direction: "in" },
  { merchant: "Monthly Rent", category: "Rent", kes: 15000, onDay: 3 },
  { merchant: "M-Shwari Lock Savings", category: "Savings", kes: 5000, onDay: 2 },
  { merchant: "KPLC Tokens", category: "Miscellaneous", kes: 1000, onDay: 4 },
  { merchant: "Java House", category: "Food", kes: 850, onDay: 8 },
  { merchant: "Bolt Ride", category: "Transport", kes: 420, onDay: 11 },
];

const OPENING_BALANCE_KES = 3200;

function makeId(seed: number): string {
  return "seed-" + seed.toString(36).padStart(5, "0");
}

/**
 * Build seed data for the current month, up to `now`.
 * Transactions are returned newest-first with a running M-PESA balance.
 */
export function seedData(now: Date = new Date()): AppData {
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  type Pending = { day: number; def: SpendDef };
  const pending: Pending[] = [];

  for (let day = 1; day <= today; day++) {
    for (const def of [...DAILY, ...WEEKLY]) {
      const every = def.everyDays ?? 1;
      if ((day - 1) % every === 0) pending.push({ day, def });
    }
    for (const def of ONE_OFFS) {
      if (def.onDay === day) pending.push({ day, def });
    }
  }

  // Chronological order so the running balance is correct.
  pending.sort((a, b) => a.day - b.day);

  let balance = toCents(OPENING_BALANCE_KES);
  let seed = 1;
  const transactions: Transaction[] = pending.map(({ day, def }) => {
    const amount = toCents(def.kes);
    const direction = def.direction ?? "out";
    balance += direction === "in" ? amount : -amount;
    // Spread transactions across the day for a believable timeline.
    const hour = 7 + ((seed * 3) % 12);
    const date = new Date(year, month, day, hour, (seed * 7) % 60).toISOString();
    return {
      id: makeId(seed++),
      amount,
      direction,
      category: def.category,
      merchant: def.merchant,
      balanceAfter: balance,
      date,
      source: "manual",
    } satisfies Transaction;
  });

  transactions.reverse(); // newest first

  return {
    profile: {
      name: "Brian",
      payday: 1,
      monthlyIncome: toCents(60000),
    },
    transactions,
    recurring: [
      { id: "rec-lunch", label: "Lunch", category: "Food", amountPerCycle: toCents(160), cycleDays: 1 },
      { id: "rec-transport", label: "Transport", category: "Transport", amountPerCycle: toCents(100), cycleDays: 1 },
      { id: "rec-eggs", label: "Eggs", category: "Food", amountPerCycle: toCents(30), cycleDays: 1 },
      { id: "rec-indomie", label: "Indomie", category: "Food", amountPerCycle: toCents(135), cycleDays: 2 },
      { id: "rec-airtime", label: "Airtime", category: "Airtime", amountPerCycle: toCents(50), cycleDays: 7 },
      { id: "rec-bundles", label: "Data Bundles", category: "Data Bundles", amountPerCycle: toCents(100), cycleDays: 7 },
    ],
    goals: [
      { id: "goal-emergency", name: "Emergency Fund", emoji: "🛟", target: toCents(50000), saved: toCents(18500), deadline: isoMonthsAhead(now, 6) },
      { id: "goal-laptop", name: "Laptop Upgrade", emoji: "💻", target: toCents(85000), saved: toCents(22000), deadline: isoMonthsAhead(now, 8) },
      { id: "goal-phone", name: "New Phone", emoji: "📱", target: toCents(35000), saved: toCents(9000), deadline: isoMonthsAhead(now, 4) },
    ],
    accounts: [
      { id: "acct-mpesa", name: "M-Pesa", type: "mpesa", balance: 0 },
      { id: "acct-savings", name: "Bank Savings", type: "bank", balance: toCents(15000) },
    ],
  };
}

function isoMonthsAhead(now: Date, months: number): string {
  const d = new Date(now.getFullYear(), now.getMonth() + months, now.getDate());
  return d.toISOString();
}
