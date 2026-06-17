"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Account, AppData, SavingsGoal, Transaction } from "@pocketpilot/core";
import { parseMpesa, seedData, type ParsedTransaction } from "@pocketpilot/core";
import { StoreContext, withComputedBalance, type StoreValue } from "./context";

const STORAGE_KEY = "pocketpilot:data:v1";

/** Local-first store: seeded fixtures persisted to localStorage. No backend. */
export function LocalStoreProvider({ children }: { children: React.ReactNode }) {
  const [now] = useState(() => new Date());
  const [data, setData] = useState<AppData>(() => seedData(now));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setData(JSON.parse(raw) as AppData);
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore quota errors
    }
  }, [data, hydrated]);

  const addTransaction = useCallback((tx: Omit<Transaction, "id">) => {
    let created!: Transaction;
    setData((prev) => {
      created = withComputedBalance(prev, tx);
      return { ...prev, transactions: [created, ...prev.transactions] };
    });
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
  }, []);

  const upsertGoal = useCallback((goal: SavingsGoal) => {
    setData((prev) => {
      const i = prev.goals.findIndex((g) => g.id === goal.id);
      const goals = [...prev.goals];
      if (i >= 0) goals[i] = goal;
      else goals.push(goal);
      return { ...prev, goals };
    });
  }, []);

  const contributeToGoal = useCallback((id: string, amountCents: number) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, saved: g.saved + amountCents } : g)),
    }));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setData((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== id) }));
  }, []);

  const upsertAccount = useCallback((account: Account) => {
    setData((prev) => {
      const i = prev.accounts.findIndex((a) => a.id === account.id);
      const accounts = [...prev.accounts];
      if (i >= 0) accounts[i] = account;
      else accounts.push(account);
      return { ...prev, accounts };
    });
  }, []);

  const deleteAccount = useCallback((id: string) => {
    setData((prev) => ({ ...prev, accounts: prev.accounts.filter((a) => a.id !== id) }));
  }, []);

  const reset = useCallback(() => setData(seedData(new Date())), []);

  const value = useMemo<StoreValue>(
    () => ({ data, now, hydrated, live: true, addTransaction, addFromSms, deleteTransaction, upsertGoal, contributeToGoal, deleteGoal, upsertAccount, deleteAccount, reset }),
    [data, now, hydrated, addTransaction, addFromSms, deleteTransaction, upsertGoal, contributeToGoal, deleteGoal, upsertAccount, deleteAccount, reset],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
