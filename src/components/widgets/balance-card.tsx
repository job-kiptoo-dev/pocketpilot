"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AnimatedKes } from "@/components/animated-number";
import { formatKes } from "@/lib/money";
import { useHealth, useSurvival } from "@/lib/store/selectors";
import { STATUS_META } from "@/lib/status";

export function BalanceCard() {
  const health = useHealth();
  const survival = useSurvival();
  const meta = STATUS_META[survival.status];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary to-[color:var(--chart-1)] p-6 text-primary-foreground shadow-lg">
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <p className="text-sm font-medium opacity-90">Current M-Pesa Balance</p>
          <AnimatedKes cents={health.balance} className="mt-1 block text-4xl font-bold tracking-tight tabular-nums" />

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-medium">
              {meta.emoji} {meta.label} until payday
            </span>
            <span className="inline-flex items-center gap-1 opacity-90">
              <TrendingDown className="size-4" />
              {formatKes(health.burnRate, { decimals: false })}/day burn
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Mini label="Income (mo)" value={formatKes(health.monthlyIncome, { compact: true })} up />
            <Mini label="Spent (mo)" value={formatKes(health.monthlySpend, { compact: true })} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function Mini({ label, value, up }: { label: string; value: string; up?: boolean }) {
  return (
    <div className="rounded-xl bg-white/10 px-3 py-2">
      <p className="flex items-center gap-1 text-xs opacity-80">
        {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
        {label}
      </p>
      <p className="mt-0.5 text-base font-semibold tabular-nums">{value}</p>
    </div>
  );
}
