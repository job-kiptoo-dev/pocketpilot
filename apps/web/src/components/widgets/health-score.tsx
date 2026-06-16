"use client";

import { RadialBar, RadialBarChart, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { useHealth } from "@/lib/store/selectors";

function scoreColor(score: number): string {
  if (score >= 70) return "var(--safe)";
  if (score >= 45) return "var(--comfortable)";
  if (score >= 25) return "var(--warning)";
  return "var(--critical)";
}

function scoreLabel(score: number): string {
  if (score >= 70) return "Excellent";
  if (score >= 45) return "Healthy";
  if (score >= 25) return "Fragile";
  return "At risk";
}

export function HealthScore() {
  const health = useHealth();
  const score = health.score;
  const color = scoreColor(score);

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Activity className="size-4" /> Financial Health
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="mx-auto h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="72%"
              outerRadius="100%"
              data={[{ value: score, fill: color }]}
              startAngle={220}
              endAngle={-40}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" cornerRadius={20} background={{ fill: "var(--muted)" }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-4">
          <span className="text-4xl font-bold tabular-nums" style={{ color }}>
            {score}
          </span>
          <span className="text-xs font-medium" style={{ color }}>
            {scoreLabel(score)}
          </span>
          <span className="mt-1 text-[11px] text-muted-foreground">
            {Math.round(health.savingsRate * 100)}% savings rate
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
