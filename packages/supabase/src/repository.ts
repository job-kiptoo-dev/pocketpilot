import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Account,
  AppData,
  RecurringExpense,
  Repository,
  SavingsGoal,
  Transaction,
  UserProfile,
} from "@pocketpilot/core";
import type { Database } from "./database.types";
import {
  accountToRow,
  goalToRow,
  recurringToRow,
  rowToAccount,
  rowToGoal,
  rowToProfile,
  rowToRecurring,
  rowToTransaction,
  transactionToInsert,
} from "./mappers";

export type TypedSupabaseClient = SupabaseClient<Database>;

const DEFAULT_PROFILE: UserProfile = { name: "there", payday: 1, monthlyIncome: 0 };

/**
 * Supabase-backed implementation of the core {@link Repository}.
 * Relies on RLS to scope reads; writes set `user_id` explicitly.
 */
export class SupabaseRepository implements Repository {
  constructor(
    private readonly client: TypedSupabaseClient,
    private readonly userId: string,
  ) {}

  async load(): Promise<AppData> {
    const [profileRes, txRes, recRes, goalRes, acctRes] = await Promise.all([
      this.client.from("profiles").select("*").eq("id", this.userId).maybeSingle(),
      this.client.from("transactions").select("*").order("occurred_at", { ascending: false }),
      this.client.from("recurring_expenses").select("*").order("created_at", { ascending: true }),
      this.client.from("savings_goals").select("*").order("created_at", { ascending: true }),
      this.client.from("accounts").select("*").order("created_at", { ascending: true }),
    ]);

    return {
      profile: profileRes.data ? rowToProfile(profileRes.data) : DEFAULT_PROFILE,
      transactions: (txRes.data ?? []).map(rowToTransaction),
      recurring: (recRes.data ?? []).map(rowToRecurring),
      goals: (goalRes.data ?? []).map(rowToGoal),
      accounts: (acctRes.data ?? []).map(rowToAccount),
    };
  }

  async upsertAccount(account: Account): Promise<void> {
    const { error } = await this.client.from("accounts").upsert(accountToRow(account, this.userId));
    if (error) throw error;
  }

  async deleteAccount(id: string): Promise<void> {
    const { error } = await this.client.from("accounts").delete().eq("id", id);
    if (error) throw error;
  }

  async addTransaction(tx: Omit<Transaction, "id">): Promise<Transaction> {
    const insert = transactionToInsert(tx, this.userId);

    const { data, error } = await this.client.from("transactions").insert(insert).select().single();
    if (error) {
      // 23505 = duplicate SMS (same user_id + M-Pesa code). Treat as success and
      // return the existing row. (Manual rows have no code, so never collide.)
      if (error.code === "23505" && insert.code) {
        const existing = await this.client
          .from("transactions")
          .select("*")
          .eq("code", insert.code)
          .maybeSingle();
        if (existing.data) return rowToTransaction(existing.data);
      }
      throw error;
    }
    return rowToTransaction(data);
  }

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await this.client.from("transactions").delete().eq("id", id);
    if (error) throw error;
  }

  async upsertRecurring(expense: RecurringExpense): Promise<void> {
    const { error } = await this.client.from("recurring_expenses").upsert(recurringToRow(expense, this.userId));
    if (error) throw error;
  }

  async deleteRecurring(id: string): Promise<void> {
    const { error } = await this.client.from("recurring_expenses").delete().eq("id", id);
    if (error) throw error;
  }

  async upsertGoal(goal: SavingsGoal): Promise<void> {
    const { error } = await this.client.from("savings_goals").upsert(goalToRow(goal, this.userId));
    if (error) throw error;
  }

  async deleteGoal(id: string): Promise<void> {
    const { error } = await this.client.from("savings_goals").delete().eq("id", id);
    if (error) throw error;
  }

  async updateProfile(profile: UserProfile): Promise<void> {
    const { error } = await this.client.from("profiles").upsert({
      id: this.userId,
      name: profile.name,
      payday: profile.payday,
      monthly_income: profile.monthlyIncome,
    });
    if (error) throw error;
  }
}

export function createSupabaseRepository(client: TypedSupabaseClient, userId: string): SupabaseRepository {
  return new SupabaseRepository(client, userId);
}
