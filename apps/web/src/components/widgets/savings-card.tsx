"use client";

import { PiggyBank } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useGoals } from "@/lib/store/selectors";
import { formatKes } from "@pocketpilot/core";

export function SavingsCard() {
  const goals = useGoals();

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <PiggyBank className="size-4" /> Savings Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map(({ goal, progress, suggestedMonthly, monthsRemaining }) => (
          <div key={goal.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {goal.emoji} {goal.name}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {formatKes(goal.saved, { compact: true })} / {formatKes(goal.target, { compact: true })}
              </span>
            </div>
            <Progress value={progress * 100} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{Math.round(progress * 100)}% funded</span>
              {suggestedMonthly != null && monthsRemaining != null && (
                <span>
                  {formatKes(suggestedMonthly, { compact: true })}/mo · {monthsRemaining}mo left
                </span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
