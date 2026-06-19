"use client";

import { Lightbulb, TrendingDown, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOpportunities } from "@/lib/store/selectors";
import { formatKes } from "@pocketpilot/core";

export function OpportunitiesCard() {
  const { opportunities, totalPotentialMonthly } = useOpportunities();

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-2 text-sm font-medium text-muted-foreground">
          <span className="flex items-center gap-2">
            <Lightbulb className="size-4" /> Ways to Save
          </span>
          {totalPotentialMonthly > 0 && (
            <span className="text-xs font-semibold text-[color:var(--safe)] tabular-nums">
              ~{formatKes(totalPotentialMonthly, { compact: true })}/mo
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {opportunities.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nothing to flag — your spending looks lean right now. 👌
          </p>
        ) : (
          opportunities.map((o) => {
            const warn = o.severity === "warning";
            return (
              <div key={o.id} className="flex gap-3">
                <span
                  className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${
                    warn ? "bg-[color:var(--warning)]/15 text-[color:var(--warning)]" : "bg-[color:var(--safe)]/15 text-[color:var(--safe)]"
                  }`}
                >
                  {warn ? <AlertTriangle className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{o.title}</p>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
                      {formatKes(o.potentialMonthly, { compact: true })}/mo
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{o.detail}</p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
