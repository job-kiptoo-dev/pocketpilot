// Hand-written Database types matching schema.sql. Regenerate with
// `supabase gen types typescript` once the project is linked, if preferred.

export type Direction = "in" | "out";
export type Source = "manual" | "sms";

export type ProfileRow = {
  id: string;
  name: string;
  payday: number;
  monthly_income: number;
  created_at: string;
}

export type TransactionRow = {
  id: string;
  user_id: string;
  amount: number;
  direction: Direction;
  category: string;
  merchant: string;
  balance_after: number | null;
  occurred_at: string;
  raw: string | null;
  code: string | null;
  source: Source;
  note: string | null;
  created_at: string;
}

export type RecurringRow = {
  id: string;
  user_id: string;
  label: string;
  category: string;
  amount_per_cycle: number;
  cycle_days: number;
  created_at: string;
}

export type AccountType = "mpesa" | "bank" | "savings" | "cash";

export type AccountRow = {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  balance: number;
  created_at: string;
};

export type GoalRow = {
  id: string;
  user_id: string;
  name: string;
  target: number;
  saved: number;
  deadline: string | null;
  emoji: string | null;
  created_at: string;
}

export type IngestTokenRow = {
  user_id: string;
  token_hash: string;
  created_at: string;
  last_used_at: string | null;
};

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow, Partial<ProfileRow> & { id: string }, Partial<ProfileRow>>;
      transactions: Table<
        TransactionRow,
        Omit<TransactionRow, "id" | "created_at"> & { id?: string },
        Partial<TransactionRow>
      >;
      recurring_expenses: Table<
        RecurringRow,
        Omit<RecurringRow, "id" | "created_at"> & { id?: string },
        Partial<RecurringRow>
      >;
      savings_goals: Table<
        GoalRow,
        Omit<GoalRow, "id" | "created_at"> & { id?: string },
        Partial<GoalRow>
      >;
      accounts: Table<
        AccountRow,
        Omit<AccountRow, "id" | "created_at"> & { id?: string },
        Partial<AccountRow>
      >;
      ingest_tokens: Table<
        IngestTokenRow,
        Omit<IngestTokenRow, "created_at" | "last_used_at"> & { last_used_at?: string | null },
        Partial<IngestTokenRow>
      >;
    };
    // Empty mapped types (no string index signature) — a `Record<string, never>`
    // here would intersect with Tables and collapse every table to `never`.
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
