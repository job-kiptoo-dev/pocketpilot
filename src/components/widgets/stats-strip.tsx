"use client";

import { CalendarDays, CalendarRange, Flame, PiggyBank } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useHealth } from "@/lib/store/selectors";
import { formatKes } from "@/lib/money";

export function StatsStrip() {
  const health = useHealth();

  const stats = [
    { label: "Daily avg", value: formatKes(health.dailyAverage, { decimals: false }), icon: CalendarDays },
    { label: "Last 7 days", value: formatKes(health.weeklyAverage, { compact: true }), icon: CalendarRange },
    { label: "Burn rate", value: `${formatKes(health.burnRate, { decimals: false })}/d`, icon: Flame },
    { label: "Savings rate", value: `${Math.round(health.savingsRate * 100)}%`, icon: PiggyBank },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Icon className="size-4" /> {label}
          </div>
          <p className="mt-1.5 text-xl font-bold tabular-nums">{value}</p>
        </Card>
      ))}
    </div>
  );
}
