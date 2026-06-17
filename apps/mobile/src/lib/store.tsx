import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { AppData, SavingsGoal, Transaction } from "@pocketpilot/core";
import { currentBalance, genId, parseMpesa } from "@pocketpilot/core";
import { createSupabaseRepository, subscribeToUserData, type SupabaseRepository } from "@pocketpilot/supabase";
import { getSupabase, supabaseConfigured } from "./supabase";
import { startSmsListener } from "./sms";

const EMPTY: AppData = {
  profile: { name: "", payday: 1, monthlyIncome: 0 },
  transactions: [],
  recurring: [],
  goals: [],
  accounts: [],
};

interface StoreValue {
  configured: boolean;
  session: Session | null;
  loading: boolean;
  live: boolean;
  data: AppData;
  now: Date;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  addFromSms: (raw: string) => boolean;
  deleteTransaction: (id: string) => void;
  upsertGoal: (goal: SavingsGoal) => void;
  contributeToGoal: (id: string, amountCents: number) => void;
  deleteGoal: (id: string) => void;
  signOut: () => Promise<void>;
  reload: () => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
  return ctx;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Created lazily at render time (never during the Node route-scan).
  const supabase = useMemo(() => getSupabase(), []);
  const [now] = useState(() => new Date());
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [data, setData] = useState<AppData>(EMPTY);
  const repoRef = useRef<SupabaseRepository | null>(null);

  const reload = useCallback(async () => {
    if (!repoRef.current) return;
    try {
      setData(await repoRef.current.load());
    } catch {
      // transient; realtime will retry
    }
  }, []);

  // Track auth session.
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  // Load data + realtime + SMS listener whenever the user changes.
  useEffect(() => {
    if (!supabase || !session?.user) {
      repoRef.current = null;
      setData(EMPTY);
      setLive(false);
      return;
    }
    const userId = session.user.id;
    repoRef.current = createSupabaseRepository(supabase, userId);
    let reloadTimer: ReturnType<typeof setTimeout> | undefined;

    void reload();
    const unsubscribe = subscribeToUserData(
      supabase,
      userId,
      () => {
        clearTimeout(reloadTimer);
        reloadTimer = setTimeout(reload, 120);
      },
      session.access_token,
    );
    setLive(true);

    // Auto-ingest incoming M-Pesa SMS (Android dev build only).
    const stopSms = startSmsListener((msg) => {
      const parsed = parseMpesa(msg.body);
      if (parsed) void repoRef.current?.addTransaction(parsed);
    });

    return () => {
      clearTimeout(reloadTimer);
      unsubscribe();
      stopSms();
    };
  }, [supabase, session?.user?.id, session?.access_token, reload]);

  const addTransaction = useCallback((tx: Omit<Transaction, "id">) => {
    setData((prev) => {
      const balance = currentBalance(prev);
      const created: Transaction = {
        ...tx,
        balanceAfter: tx.balanceAfter ?? (tx.direction === "in" ? balance + tx.amount : balance - tx.amount),
        id: genId(),
      };
      return { ...prev, transactions: [created, ...prev.transactions] };
    });
    void repoRef.current?.addTransaction(tx);
  }, []);

  const addFromSms = useCallback(
    (raw: string) => {
      const parsed = parseMpesa(raw);
      if (!parsed) return false;
      addTransaction(parsed);
      return true;
    },
    [addTransaction],
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      setData((prev) => ({ ...prev, transactions: prev.transactions.filter((t) => t.id !== id) }));
      repoRef.current?.deleteTransaction(id).catch(() => void reload());
    },
    [reload],
  );

  const upsertGoal = useCallback(
    (goal: SavingsGoal) => {
      setData((prev) => {
        const i = prev.goals.findIndex((g) => g.id === goal.id);
        const goals = [...prev.goals];
        if (i >= 0) goals[i] = goal;
        else goals.push(goal);
        return { ...prev, goals };
      });
      repoRef.current?.upsertGoal(goal).catch(() => void reload());
    },
    [reload],
  );

  const contributeToGoal = useCallback(
    (id: string, amountCents: number) => {
      let updated: SavingsGoal | undefined;
      setData((prev) => {
        const goals = prev.goals.map((g) => {
          if (g.id !== id) return g;
          updated = { ...g, saved: g.saved + amountCents };
          return updated;
        });
        return { ...prev, goals };
      });
      if (updated) repoRef.current?.upsertGoal(updated).catch(() => void reload());
    },
    [reload],
  );

  const deleteGoal = useCallback(
    (id: string) => {
      setData((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== id) }));
      repoRef.current?.deleteGoal(id).catch(() => void reload());
    },
    [reload],
  );

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
    setData(EMPTY);
  }, [supabase]);

  const value = useMemo<StoreValue>(
    () => ({
      configured: supabaseConfigured,
      session,
      loading,
      live,
      data,
      now,
      addTransaction,
      addFromSms,
      deleteTransaction,
      upsertGoal,
      contributeToGoal,
      deleteGoal,
      signOut,
      reload,
    }),
    [session, loading, live, data, now, addTransaction, addFromSms, deleteTransaction, upsertGoal, contributeToGoal, deleteGoal, signOut, reload],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
