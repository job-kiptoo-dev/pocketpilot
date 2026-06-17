// Core domain model for PocketPilot.
// All money is stored as integer cents (KES) to avoid floating-point drift.

export type Direction = "in" | "out";

export type Category =
  | "Food"
  | "Transport"
  | "Rent"
  | "Entertainment"
  | "Savings"
  | "Airtime"
  | "Data Bundles"
  | "Income"
  | "Miscellaneous";

export type TransactionSource = "manual" | "sms";

export interface Transaction {
  id: string;
  /** Amount in integer cents (KES). Always positive; use `direction` for sign. */
  amount: number;
  direction: Direction;
  category: Category;
  merchant: string;
  /** M-Pesa balance after the transaction, in cents, if known. */
  balanceAfter?: number;
  /** ISO date string. */
  date: string;
  /** Original SMS text, if parsed from one. */
  raw?: string;
  /** M-Pesa transaction code, if known. */
  code?: string;
  source: TransactionSource;
  note?: string;
}

export interface RecurringExpense {
  id: string;
  label: string;
  category: Category;
  /** Amount per cycle, in cents. */
  amountPerCycle: number;
  /** Cycle length in days (e.g. 1 = daily, 2 = every 2 days). */
  cycleDays: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  /** Target amount in cents. */
  target: number;
  /** Amount already saved, in cents. */
  saved: number;
  /** ISO date string for the goal deadline, if any. */
  deadline?: string;
  emoji?: string;
}

export type AccountType = "mpesa" | "bank" | "savings" | "cash";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  /**
   * Stored balance in cents. For the M-Pesa account this is derived from
   * transactions instead (see `accountBalance`).
   */
  balance: number;
}

export interface UserProfile {
  name: string;
  /** Day of the month payday lands on (1-31). */
  payday: number;
  /** Monthly income in cents. */
  monthlyIncome: number;
}

export interface AppData {
  profile: UserProfile;
  transactions: Transaction[];
  recurring: RecurringExpense[];
  goals: SavingsGoal[];
  accounts: Account[];
}
