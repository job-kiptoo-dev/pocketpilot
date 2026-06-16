"use client";

import { CalendarClock, Hourglass } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedKes } from "@/components/animated-number";
import { formatKes } from "@pocketpilot/core";
import { useForecast } from "@/lib/store/selectors";

export function ForecastCard() {
  const f = useForecast();
  const negative = f.projectedEndBalance < 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <CalendarClock className="size-4" /> Month-End Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatedKes
          cents={f.projectedEndBalance}
          className={`block text-3xl font-bold tabular-nums ${negative ? "text-[color:var(--critical)]" : "text-foreground"}`}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          projected balance on the last day of the month
        </p>

        <div className="mt-4 space-y-2 text-sm">
          <Row label="Projected spend left" value={formatKes(f.projectedSpend, { compact: true })} />
          <Row label="Daily burn estimate" value={`${formatKes(f.dailyBurn, { decimals: false })}/day`} />
          <Row
            label="Money lasts"
            value={
              Number.isFinite(f.daysMoneyLasts) ? `${f.daysMoneyLasts} days` : "—"
            }
            icon={<Hourglass className="size-3.5" />}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}
