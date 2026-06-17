"use client";

import { motion } from "framer-motion";
import { Pencil, PiggyBank, Plus, Target, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GoalDialog } from "@/components/goals/goal-dialog";
import { ContributeDialog } from "@/components/goals/contribute-dialog";
import { useGoals } from "@/lib/store/selectors";
import { useStore } from "@/lib/store/store";
import { formatKes } from "@pocketpilot/core";

export default function GoalsPage() {
  const goals = useGoals();
  const { deleteGoal } = useStore();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Target className="size-6 text-primary" /> Savings Goals
          </h1>
          <p className="text-sm text-muted-foreground">Set targets, track progress, and stash money toward them.</p>
        </div>
        <GoalDialog />
      </header>

      {goals.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-16 text-center">
          <PiggyBank className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No goals yet. Create your first savings goal.</p>
          <GoalDialog
            trigger={
              <Button>
                <Plus className="size-4" /> New goal
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map(({ goal, progress, remaining, monthsRemaining, suggestedMonthly }, i) => (
            <motion.div key={goal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="flex h-full flex-col gap-3 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid size-10 place-items-center rounded-xl bg-muted text-xl">{goal.emoji ?? "🎯"}</span>
                    <div>
                      <p className="font-semibold leading-tight">{goal.name}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {formatKes(goal.saved, { compact: true })} / {formatKes(goal.target, { compact: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <GoalDialog
                      goal={goal}
                      trigger={
                        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label="Edit goal">
                          <Pencil className="size-4" />
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete goal"
                      className="size-8 text-muted-foreground hover:text-[color:var(--critical)]"
                      onClick={() => {
                        if (confirm(`Delete "${goal.name}"?`)) deleteGoal(goal.id);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                <Progress value={progress * 100} className="h-2.5" />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{Math.round(progress * 100)}% funded</span>
                  {progress >= 1 ? (
                    <span className="font-medium text-[color:var(--safe)]">🎉 Reached!</span>
                  ) : (
                    <span>{formatKes(remaining, { compact: true })} to go</span>
                  )}
                </div>

                {suggestedMonthly != null && monthsRemaining != null && progress < 1 && (
                  <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                    Save <strong className="text-foreground">{formatKes(suggestedMonthly, { compact: true })}/mo</strong> to hit
                    this in <strong className="text-foreground">{monthsRemaining}</strong> month{monthsRemaining === 1 ? "" : "s"}.
                  </p>
                )}

                <div className="mt-auto pt-1">
                  <ContributeDialog
                    goal={goal}
                    trigger={
                      <Button variant="outline" className="w-full">
                        <Plus className="size-4" /> Add money
                      </Button>
                    }
                  />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
