// Map between database rows and the @pocketpilot/core domain model.
import type {
  Account,
  AccountType,
  Category,
  Direction,
  RecurringExpense,
  SavingsGoal,
  Transaction,
  TransactionSource,
  UserProfile,
} from "@pocketpilot/core";
import type { AccountRow, GoalRow, ProfileRow, RecurringRow, TransactionRow } from "./database.types";

export function rowToTransaction(r: TransactionRow): Transaction {
  return {
    id: r.id,
    amount: r.amount,
    direction: r.direction as Direction,
    category: r.category as Category,
    merchant: r.merchant,
    balanceAfter: r.balance_after ?? undefined,
    date: r.occurred_at,
    raw: r.raw ?? undefined,
    code: r.code ?? undefined,
    source: r.source as TransactionSource,
    note: r.note ?? undefined,
  };
}

export function transactionToInsert(
  t: Omit<Transaction, "id">,
  userId: string,
): Omit<TransactionRow, "id" | "created_at"> {
  return {
    user_id: userId,
    amount: t.amount,
    direction: t.direction,
    category: t.category,
    merchant: t.merchant,
    balance_after: t.balanceAfter ?? null,
    occurred_at: t.date,
    raw: t.raw ?? null,
    code: t.code ?? null,
    source: t.source,
    note: t.note ?? null,
  };
}

export function rowToRecurring(r: RecurringRow): RecurringExpense {
  return {
    id: r.id,
    label: r.label,
    category: r.category as Category,
    amountPerCycle: r.amount_per_cycle,
    cycleDays: r.cycle_days,
  };
}

export function recurringToRow(e: RecurringExpense, userId: string): Omit<RecurringRow, "created_at"> {
  return {
    id: e.id,
    user_id: userId,
    label: e.label,
    category: e.category,
    amount_per_cycle: e.amountPerCycle,
    cycle_days: e.cycleDays,
  };
}

export function rowToGoal(r: GoalRow): SavingsGoal {
  return {
    id: r.id,
    name: r.name,
    target: r.target,
    saved: r.saved,
    deadline: r.deadline ?? undefined,
    emoji: r.emoji ?? undefined,
  };
}

export function goalToRow(g: SavingsGoal, userId: string): Omit<GoalRow, "created_at"> {
  return {
    id: g.id,
    user_id: userId,
    name: g.name,
    target: g.target,
    saved: g.saved,
    deadline: g.deadline ?? null,
    emoji: g.emoji ?? null,
  };
}

export function rowToAccount(r: AccountRow): Account {
  return { id: r.id, name: r.name, type: r.type as AccountType, balance: r.balance };
}

export function accountToRow(a: Account, userId: string): Omit<AccountRow, "created_at"> {
  return { id: a.id, user_id: userId, name: a.name, type: a.type, balance: a.balance };
}

export function rowToProfile(r: ProfileRow): UserProfile {
  return {
    name: r.name,
    payday: r.payday,
    monthlyIncome: r.monthly_income,
  };
}
