"use client";

import { createContext, useContext } from "react";
import type { AppData, SavingsGoal, Transaction } from "@pocketpilot/core";
import { currentBalance, genId } from "@pocketpilot/core";

export interface StoreValue {
  data: AppData;
  now: Date;
  hydrated: boolean;
  /** Online status for the realtime connection (always true in local mode). */
  live: boolean;
  addTransaction: (tx: Omit<Transaction, "id">) => Transaction;
  addFromSms: (raw: string) => { ok: true; tx: Transaction } | { ok: false; raw: string };
  deleteTransaction: (id: string) => void;
  upsertGoal: (goal: SavingsGoal) => void;
  contributeToGoal: (id: string, amountCents: number) => void;
  deleteGoal: (id: string) => void;
  reset: () => void;
}

export const StoreContext = createContext<StoreValue | null>(null);

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
  return ctx;
}

/** Attach a computed balance + id to a new transaction given current data. */
export function withComputedBalance(data: AppData, tx: Omit<Transaction, "id">): Transaction {
  const balance = currentBalance(data);
  const balanceAfter = tx.balanceAfter ?? (tx.direction === "in" ? balance + tx.amount : balance - tx.amount);
  return { ...tx, balanceAfter, id: genId() };
}
