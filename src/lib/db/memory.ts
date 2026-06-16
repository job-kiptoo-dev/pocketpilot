import type { AppData, RecurringExpense, SavingsGoal, Transaction } from "@/lib/types";
import type { Repository } from "./repository";
import { seedData } from "./fixtures";

/** Generate a reasonably unique id without extra deps. */
export function genId(prefix = "tx"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * In-memory repository seeded from fixtures. Used on the server for the MVP
 * and as the reference implementation of {@link Repository}.
 */
export class MemoryRepository implements Repository {
  private data: AppData;

  constructor(initial?: AppData) {
    this.data = initial ?? seedData();
  }

  async load(): Promise<AppData> {
    return this.data;
  }

  async addTransaction(tx: Omit<Transaction, "id">): Promise<Transaction> {
    const created: Transaction = { ...tx, id: genId() };
    this.data.transactions = [created, ...this.data.transactions];
    return created;
  }

  async deleteTransaction(id: string): Promise<void> {
    this.data.transactions = this.data.transactions.filter((t) => t.id !== id);
  }

  async upsertRecurring(expense: RecurringExpense): Promise<void> {
    const i = this.data.recurring.findIndex((r) => r.id === expense.id);
    if (i >= 0) this.data.recurring[i] = expense;
    else this.data.recurring.push(expense);
  }

  async deleteRecurring(id: string): Promise<void> {
    this.data.recurring = this.data.recurring.filter((r) => r.id !== id);
  }

  async upsertGoal(goal: SavingsGoal): Promise<void> {
    const i = this.data.goals.findIndex((g) => g.id === goal.id);
    if (i >= 0) this.data.goals[i] = goal;
    else this.data.goals.push(goal);
  }

  async deleteGoal(id: string): Promise<void> {
    this.data.goals = this.data.goals.filter((g) => g.id !== id);
  }
}
