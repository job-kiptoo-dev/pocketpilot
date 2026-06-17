import type { Account, AppData } from "../types";
import { currentBalance } from "./util";

/**
 * Effective balance for an account (cents). The M-Pesa account is derived from
 * the live transaction balance; other accounts use their stored balance.
 */
export function accountBalance(account: Account, data: AppData): number {
  return account.type === "mpesa" ? currentBalance(data) : account.balance;
}

/** Total cash across all accounts (cents). */
export function netCash(data: AppData): number {
  return data.accounts.reduce((sum, a) => sum + accountBalance(a, data), 0);
}

/** The primary spending account (M-Pesa), if any. */
export function spendingAccount(data: AppData): Account | undefined {
  return data.accounts.find((a) => a.type === "mpesa") ?? data.accounts[0];
}
