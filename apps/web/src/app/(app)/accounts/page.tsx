"use client";

import { motion } from "framer-motion";
import { Landmark, Pencil, Trash2, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AccountDialog } from "@/components/accounts/account-dialog";
import { AnimatedKes } from "@/components/animated-number";
import { useStore } from "@/lib/store/store";
import { accountBalance, formatKes, netCash, type AccountType } from "@pocketpilot/core";

const TYPE_EMOJI: Record<AccountType, string> = {
  mpesa: "📲",
  bank: "🏦",
  savings: "🐷",
  cash: "💵",
};

export default function AccountsPage() {
  const { data, deleteAccount } = useStore();
  const total = netCash(data);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Landmark className="size-6 text-primary" /> Accounts
          </h1>
          <p className="text-sm text-muted-foreground">Keep spending money in M-Pesa, savings in the bank — see your total.</p>
        </div>
        <AccountDialog />
      </header>

      {/* Net cash */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary to-[color:var(--chart-1)] p-6 text-primary-foreground shadow-lg">
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <p className="flex items-center gap-1.5 text-sm font-medium opacity-90">
            <Wallet className="size-4" /> Total net cash
          </p>
          <AnimatedKes cents={total} className="mt-1 block text-4xl font-bold tracking-tight tabular-nums" />
          <p className="mt-1 text-sm opacity-80">across {data.accounts.length} account{data.accounts.length === 1 ? "" : "s"}</p>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {data.accounts.map((account, i) => {
          const bal = accountBalance(account, data);
          const isMpesa = account.type === "mpesa";
          return (
            <motion.div key={account.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="flex h-full items-center gap-3 p-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-xl">
                  {TYPE_EMOJI[account.type]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{account.name}</p>
                  <p className="text-lg font-bold tabular-nums">{formatKes(bal)}</p>
                  {isMpesa && <p className="text-[11px] text-muted-foreground">Live from M-Pesa transactions</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <AccountDialog
                    account={account}
                    trigger={
                      <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label="Edit account">
                        <Pencil className="size-4" />
                      </Button>
                    }
                  />
                  {!isMpesa && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete account"
                      className="size-8 text-muted-foreground hover:text-[color:var(--critical)]"
                      onClick={() => {
                        if (confirm(`Delete "${account.name}"?`)) deleteAccount(account.id);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        💡 Survival Mode &amp; forecasts use your <strong>M-Pesa</strong> balance (your spending money). Moving cash to a
        bank/savings account keeps it out of daily spending but still counts toward net cash.
      </p>
    </div>
  );
}
