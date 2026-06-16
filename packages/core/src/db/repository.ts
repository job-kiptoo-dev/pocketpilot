import type { AppData, RecurringExpense, SavingsGoal, Transaction } from "../types";

/**
 * Storage abstraction for PocketPilot.
 *
 * Phase 1 ships an in-memory implementation seeded from fixtures (see
 * `memory.ts`). A Supabase-backed implementation will satisfy the same
 * interface later (see `supabase.ts`), so the rest of the app never has to
 * change when we move from local-first to cloud persistence.
 */
export interface Repository {
  load(): Promise<AppData>;
  addTransaction(tx: Omit<Transaction, "id">): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;
  upsertRecurring(expense: RecurringExpense): Promise<void>;
  deleteRecurring(id: string): Promise<void>;
  upsertGoal(goal: SavingsGoal): Promise<void>;
  deleteGoal(id: string): Promise<void>;
}
