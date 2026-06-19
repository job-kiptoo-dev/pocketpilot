"use client";

import { ShieldCheck, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBuffer } from "@/lib/store/selectors";
import { formatKes, type BufferLevel } from "@pocketpilot/core";
import { cn } from "@/lib/utils";

const LEVEL: Record<BufferLevel, { token: string; label: string }> = {
  healthy: { token: "var(--safe)", label: "Comfortable buffer" },
  tight: { token: "var(--comfortable)", label: "Covered, but tight" },
  "below-minimum": { token: "var(--warning)", label: "Below safety floor" },
  negative: { token: "var(--critical)", label: "Heading into the red" },
};

export function BufferCard() {
  const b = useBuffer();
  const meta = LEVEL[b.level];
  const ok = b.level === "healthy" || b.level === "tight";

  // Fill the bar against the preferred target so "full" means fully cushioned.
  const fill = Math.max(0, Math.min(1, b.projectedEndBalance / b.preferred)) * 100;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {ok ? <ShieldCheck className="size-4" /> : <ShieldAlert className="size-4" />}
          Month-End Buffer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums" style={{ color: meta.token }}>
            {formatKes(b.projectedEndBalance, { compact: true })}
          </span>
          <span className="text-xs font-medium" style={{ color: meta.token }}>
            {meta.label}
          </span>
        </div>

        {/* Target bar with min/preferred ticks. */}
        <div className="relative mt-4 h-2 rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${fill}%`, backgroundColor: meta.token }}
          />
          <Tick fraction={b.min / b.preferred} title={`Floor ${formatKes(b.min, { decimals: false })}`} />
          <Tick fraction={1} title={`Comfort ${formatKes(b.preferred, { decimals: false })}`} />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground tabular-nums">
          <span>{formatKes(b.min, { decimals: false })} floor</span>
          <span>{formatKes(b.preferred, { decimals: false })} comfort</span>
        </div>

        <p className={cn("mt-3 text-xs leading-relaxed", ok ? "text-muted-foreground" : "text-foreground")}>
          {b.message}
        </p>
      </CardContent>
    </Card>
  );
}

function Tick({ fraction, title }: { fraction: number; title: string }) {
  return (
    <span
      title={title}
      className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-foreground/40"
      style={{ left: `${Math.min(100, fraction * 100)}%` }}
    />
  );
}
