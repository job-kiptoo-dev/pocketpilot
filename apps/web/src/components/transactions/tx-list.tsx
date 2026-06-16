"use client";

import { useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store/store";
import { CATEGORY_META } from "@pocketpilot/core";
import { formatKes } from "@pocketpilot/core";
import type { Transaction } from "@pocketpilot/core";

function dayKey(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", { weekday: "short", month: "short", day: "numeric" });
}

export function TxList() {
  const { data, deleteTransaction } = useStore();
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = data.transactions.filter(
      (t) => !q || t.merchant.toLowerCase().includes(q) || t.category.toLowerCase().includes(q),
    );
    const map = new Map<string, Transaction[]>();
    for (const t of filtered) {
      const key = dayKey(t.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return [...map.entries()];
  }, [data.transactions, query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search merchant or category"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {groups.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">No transactions found.</p>
      )}

      <div className="space-y-6">
        {groups.map(([day, txs]) => (
          <div key={day}>
            <h3 className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{day}</h3>
            <div className="overflow-hidden rounded-2xl border bg-card">
              <AnimatePresence initial={false}>
                {txs.map((t) => (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="group flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-lg">
                      {CATEGORY_META[t.category].emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.merchant}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal">
                          {t.category}
                        </Badge>
                        {t.source === "sms" && (
                          <span className="text-[10px] text-muted-foreground">via SMS</span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className={`text-sm font-semibold tabular-nums ${
                          t.direction === "in" ? "text-[color:var(--safe)]" : "text-foreground"
                        }`}
                      >
                        {t.direction === "in" ? "+" : "−"}
                        {formatKes(t.amount)}
                      </p>
                      {t.balanceAfter != null && (
                        <p className="text-[11px] text-muted-foreground tabular-nums">
                          bal {formatKes(t.balanceAfter, { compact: true })}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete transaction"
                      onClick={() => deleteTransaction(t.id)}
                      className="size-8 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-[color:var(--critical)] group-hover:opacity-100"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
