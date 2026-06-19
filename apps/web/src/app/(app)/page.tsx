"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store/store";
import { AddTxDialog } from "@/components/transactions/add-tx-dialog";
import { PasteSmsDialog } from "@/components/transactions/paste-sms-dialog";
import { BalanceCard } from "@/components/widgets/balance-card";
import { ForecastCard } from "@/components/widgets/forecast-card";
import { HealthScore } from "@/components/widgets/health-score";
import { CategoriesPie } from "@/components/widgets/categories-pie";
import { SpendingTrend } from "@/components/widgets/spending-trend";
import { SavingsCard } from "@/components/widgets/savings-card";
import { BufferCard } from "@/components/widgets/buffer-card";
import { OpportunitiesCard } from "@/components/widgets/opportunities-card";
import { StatsStrip } from "@/components/widgets/stats-strip";
import { SafetyMeter } from "@/components/widgets/safety-meter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSurvival } from "@/lib/store/selectors";
import { STATUS_META } from "@pocketpilot/core";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { data } = useStore();
  const survival = useSurvival();
  const meta = STATUS_META[survival.status];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{greeting()},</p>
          <h1 className="text-2xl font-bold tracking-tight">{data.profile.name} 👋</h1>
        </div>
        <div className="flex gap-2">
          <PasteSmsDialog />
          <AddTxDialog />
        </div>
      </header>

      {data.transactions.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 px-6 py-14 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-2xl">📲</span>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Let&apos;s see your money clearly</h2>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              Paste an M-Pesa SMS or add a transaction, and PocketPilot starts tracking your
              balance, forecasting payday, and spotting ways to save.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <PasteSmsDialog />
            <AddTxDialog />
          </div>
        </Card>
      ) : (
      <>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BalanceCard />
        </div>
        <HealthScore />
      </div>

      <StatsStrip />

      {/* Survival highlight */}
      <Card className={`border-0 p-5 ${meta.tint}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Survival Mode</p>
            <p className="text-lg font-semibold">
              {meta.emoji} {survival.status} — {survival.daysToPayday} days to payday
            </p>
          </div>
          <Button render={<Link href="/survival" />} variant="ghost" className="text-primary">
            See full report <ArrowRight className="size-4" />
          </Button>
        </div>
        <div className="mt-4">
          <SafetyMeter survival={survival} showLabel={false} />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SpendingTrend />
        </div>
        <ForecastCard />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BufferCard />
        <OpportunitiesCard />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CategoriesPie />
        <SavingsCard />
      </div>
      </>
      )}
    </div>
  );
}
