"use client";

import { motion } from "framer-motion";
import { CalendarClock, Gauge, Lightbulb, ShieldCheck, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SafetyMeter } from "@/components/widgets/safety-meter";
import { BufferCard } from "@/components/widgets/buffer-card";
import { Simulator } from "@/components/widgets/simulator";
import { AnimatedInt, AnimatedKes } from "@/components/animated-number";
import { useSurvival } from "@/lib/store/selectors";
import { STATUS_META } from "@pocketpilot/core";
import { formatKes } from "@pocketpilot/core";

export default function SurvivalPage() {
  const s = useSurvival();
  const meta = STATUS_META[s.status];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <ShieldCheck className="size-6 text-primary" /> Survival Mode
        </h1>
        <p className="text-sm text-muted-foreground">
          Based on your spending patterns — are you safe until payday?
        </p>
      </header>

      {/* Hero verdict */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <Card className={`border-0 p-6 ${meta.tint}`}>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">Your status</span>
            <span className={`text-4xl font-bold ${meta.text}`}>
              {meta.emoji} {s.status}
            </span>
            <span className="text-sm text-muted-foreground">{meta.blurb}</span>
          </div>
          <div className="mt-6">
            <SafetyMeter survival={s} showLabel={false} />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Runs out</span>
              <span>Payday reached</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Key numbers */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric icon={<CalendarClock className="size-4" />} label="Days to payday">
          <AnimatedInt value={s.daysToPayday} suffix=" days" />
        </Metric>
        <Metric icon={<Wallet className="size-4" />} label="Balance at payday" negative={s.expectedBalanceAtPayday < 0}>
          <AnimatedKes cents={s.expectedBalanceAtPayday} compact decimals={false} />
        </Metric>
        <Metric icon={<Gauge className="size-4" />} label="Safe daily spend">
          <AnimatedKes cents={s.safeDailyAllowance} compact decimals={false} />
        </Metric>
        <Metric icon={<ShieldCheck className="size-4" />} label="Confidence">
          <AnimatedInt value={s.confidence} suffix="%" />
        </Metric>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="size-4 text-[color:var(--warning)]" /> Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {s.recommendations.map((r, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-2.5 text-sm"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{r}</span>
              </motion.li>
            ))}
          </ul>
          <p className="mt-4 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            At your current burn of {formatKes(s.dailyBurn, { decimals: false })}/day, your balance lasts{" "}
            <strong className="text-foreground">{s.daysMoneyLasts} days</strong>.
          </p>
        </CardContent>
      </Card>

      <BufferCard />

      <Simulator />
    </div>
  );
}

function Metric({
  icon,
  label,
  children,
  negative,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  negative?: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon} {label}
      </div>
      <p className={`mt-1.5 text-xl font-bold tabular-nums ${negative ? "text-[color:var(--critical)]" : ""}`}>
        {children}
      </p>
    </Card>
  );
}
