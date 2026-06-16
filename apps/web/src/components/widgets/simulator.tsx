"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSimulation } from "@/lib/store/selectors";
import { STATUS_META } from "@pocketpilot/core";
import { formatKes, toCents } from "@pocketpilot/core";

export function Simulator() {
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const cents = Number(amount) > 0 ? toCents(Number(amount)) : 0;
  const result = useSimulation(cents, label || undefined);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4 text-primary" /> Budget Simulator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          &ldquo;If I buy this, will I still be safe?&rdquo;
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
          <div className="space-y-1.5">
            <Label htmlFor="sim-item">What are you buying?</Label>
            <Input id="sim-item" placeholder="Soda, Jacket, Night out..." value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sim-amount">Amount (KSh)</Label>
            <Input id="sim-amount" inputMode="decimal" placeholder="200" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={cents}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`rounded-2xl p-4 ${STATUS_META[result.statusAfter].tint}`}
            >
              <p className={`text-sm font-semibold ${STATUS_META[result.statusAfter].text}`}>
                {STATUS_META[result.statusAfter].emoji} {result.verdict}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <Stat label="New balance" value={formatKes(result.balanceAfter, { compact: true })} />
                <Stat
                  label="Status"
                  value={`${result.statusBefore} → ${result.statusAfter}`}
                />
                <Stat
                  label="At payday"
                  value={formatKes(result.expectedAtPaydayAfter, { compact: true })}
                  negative={result.expectedAtPaydayAfter < 0}
                />
                <Stat label="Spent now" value={formatKes(result.amount, { compact: true })} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, negative }: { label: string; value: string; negative?: boolean }) {
  return (
    <div className="rounded-xl bg-background/60 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-0.5 font-semibold tabular-nums ${negative ? "text-[color:var(--critical)]" : ""}`}>{value}</p>
    </div>
  );
}
