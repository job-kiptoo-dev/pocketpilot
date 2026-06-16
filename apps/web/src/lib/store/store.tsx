"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AppData, SavingsGoal, Transaction } from "@pocketpilot/core";
import { seedData } from "@pocketpilot/core";
import { genId } from "@pocketpilot/core";
import { parseMpesa, type ParsedTransaction } from "@pocketpilot/core";
import { currentBalance } from "@pocketpilot/core";

const STORAGE_KEY = "pocketpilot:data:v1";

interface StoreValue {
  data: AppData;
  now: Date;
  hydrated: boolean;
  addTransaction: (tx: Omit<Transaction, "id">) => Transaction;
  addFromSms: (raw: string) => { ok: true; tx: Transaction } | { ok: false; raw: string };
  deleteTransaction: (id: string) => void;
  upsertGoal: (goal: SavingsGoal) => void;
  contributeToGoal: (id: string, amountCents: number) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function withComputedBalance(data: AppData, tx: Omit<Transaction, "id">): Transaction {
  const balance = currentBalance(data);
  const balanceAfter = tx.balanceAfter ?? (tx.direction === "in" ? balance + tx.amount : balance - tx.amount);
  return { ...tx, balanceAfter, id: genId() };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Deterministic seed for the current day -> identical on server and client,
  // so there is no hydration mismatch before localStorage loads.
  const [now] = useState(() => new Date());
  const [data, setData] = useState<AppData>(() => seedData(now));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // One-time hydration from localStorage after mount; server and initial
      // client render both use the deterministic seed, so this is safe.
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

  const addFromSms = useCallback((raw: string) => {
    const parsed: ParsedTransaction | null = parseMpesa(raw);
    if (!parsed) return { ok: false as const, raw };
    const created = addTransaction(parsed);
    return { ok: true as const, tx: created };
  }, [addTransaction]);

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

  const reset = useCallback(() => {
    setData(seedData(new Date()));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({ data, now, hydrated, addTransaction, addFromSms, deleteTransaction, upsertGoal, contributeToGoal, reset }),
    [data, now, hydrated, addTransaction, addFromSms, deleteTransaction, upsertGoal, contributeToGoal, reset],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
  return ctx;
}
