"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppData, SavingsGoal, Transaction } from "@pocketpilot/core";
import { parseMpesa, type ParsedTransaction } from "@pocketpilot/core";
import {
  createSupabaseRepository,
  subscribeToUserData,
  type SupabaseRepository,
} from "@pocketpilot/supabase";
import { toast } from "sonner";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { StoreContext, withComputedBalance, type StoreValue } from "./context";

const EMPTY: AppData = {
  profile: { name: "", payday: 1, monthlyIncome: 0 },
  transactions: [],
  recurring: [],
  goals: [],
};

/**
 * Supabase-backed store with realtime sync. Mutations are applied optimistically
 * for an instant feel, then persisted; the realtime subscription reconciles with
 * the authoritative server state (and reflects writes from other devices, e.g.
 * the mobile SMS listener).
 */
export function SupabaseStoreProvider({ children }: { children: React.ReactNode }) {
  const [now] = useState(() => new Date());
  const [data, setData] = useState<AppData>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [live, setLive] = useState(false);
  const repoRef = useRef<SupabaseRepository | null>(null);

  const reload = useCallback(async () => {
    const repo = repoRef.current;
    if (!repo) return;
    try {
      setData(await repo.load());
    } catch (err) {
      toast.error("Failed to sync", { description: err instanceof Error ? err.message : undefined });
    }
  }, []);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    let unsubscribe: (() => void) | undefined;
    let reloadTimer: ReturnType<typeof setTimeout> | undefined;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        setHydrated(true);
        return;
      }
      repoRef.current = createSupabaseRepository(supabase, user.id);
      await reload();
      setHydrated(true);

      unsubscribe = subscribeToUserData(
        supabase,
        user.id,
        () => {
          // Debounce bursts of changes into a single reload.
          clearTimeout(reloadTimer);
          reloadTimer = setTimeout(reload, 120);
        },
        session.access_token,
      );
      setLive(true);
    })();

    return () => {
      clearTimeout(reloadTimer);
      unsubscribe?.();
    };
  }, [reload]);

  const addTransaction = useCallback((tx: Omit<Transaction, "id">) => {
    let created!: Transaction;
    setData((prev) => {
      created = withComputedBalance(prev, tx);
      return { ...prev, transactions: [created, ...prev.transactions] };
    });
    repoRef.current
      ?.addTransaction(tx)
      .catch((err) => toast.error("Couldn't save transaction", { description: err instanceof Error ? err.message : undefined }));
    return created;
  }, []);

  const addFromSms = useCallback(
    (raw: string) => {
      const parsed: ParsedTransaction | null = parseMpesa(raw);
      if (!parsed) return { ok: false as const, raw };
      return { ok: true as const, tx: addTransaction(parsed) };
    },
    [addTransaction],
  );

  const deleteTransaction = useCallback((id: string) => {
    setData((prev) => ({ ...prev, transactions: prev.transactions.filter((t) => t.id !== id) }));
    repoRef.current?.deleteTransaction(id).catch(() => void reload());
  }, [reload]);

  const upsertGoal = useCallback((goal: SavingsGoal) => {
    setData((prev) => {
      const i = prev.goals.findIndex((g) => g.id === goal.id);
      const goals = [...prev.goals];
      if (i >= 0) goals[i] = goal;
      else goals.push(goal);
      return { ...prev, goals };
    });
    repoRef.current?.upsertGoal(goal).catch(() => void reload());
  }, [reload]);

  const contributeToGoal = useCallback((id: string, amountCents: number) => {
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
  }, [reload]);

  const value = useMemo<StoreValue>(
    () => ({ data, now, hydrated, live, addTransaction, addFromSms, deleteTransaction, upsertGoal, contributeToGoal, reset: reload }),
    [data, now, hydrated, live, addTransaction, addFromSms, deleteTransaction, upsertGoal, contributeToGoal, reload],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
