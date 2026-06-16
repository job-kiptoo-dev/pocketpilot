"use client";

import { motion } from "framer-motion";
import type { Survival } from "@pocketpilot/core";
import { STATUS_META } from "@pocketpilot/core";
import { cn } from "@/lib/utils";

interface Props {
  survival: Survival;
  className?: string;
  showLabel?: boolean;
}

/** Horizontal Critical→Safe gradient meter with an animated marker. */
export function SafetyMeter({ survival, className, showLabel = true }: Props) {
  const meta = STATUS_META[survival.status];
  // Fill fraction: 2x runway (lasts twice as long as needed) = full bar.
  const ratio = survival.daysMoneyLasts / survival.daysToPayday;
  const fill = Math.max(0.04, Math.min(1, ratio / 2));

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Financial Safety</span>
          <span className={cn("text-sm font-semibold", meta.text)}>
            {meta.emoji} {meta.label}
          </span>
        </div>
      )}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-gradient-to-r from-[color:var(--critical)] via-[color:var(--warning)] to-[color:var(--safe)]">
        <motion.div
          className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-background bg-foreground shadow-md"
          initial={{ left: "0%" }}
          animate={{ left: `${fill * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
      </div>
    </div>
  );
}
