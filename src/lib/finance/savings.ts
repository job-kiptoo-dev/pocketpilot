import type { SavingsGoal } from "@/lib/types";
import { MS_PER_DAY } from "./util";

export interface GoalProgress {
  goal: SavingsGoal;
  /** 0..1 */
  progress: number;
  remaining: number; // cents
  monthsRemaining: number | null;
  /** Suggested monthly contribution to hit the deadline (cents). */
  suggestedMonthly: number | null;
  onTrack: boolean;
}

export function computeGoalProgress(goal: SavingsGoal, now: Date = new Date()): GoalProgress {
  const progress = goal.target > 0 ? Math.min(1, goal.saved / goal.target) : 0;
  const remaining = Math.max(0, goal.target - goal.saved);

  let monthsRemaining: number | null = null;
  let suggestedMonthly: number | null = null;
  if (goal.deadline) {
    const days = (new Date(goal.deadline).getTime() - now.getTime()) / MS_PER_DAY;
    monthsRemaining = Math.max(0, Math.round((days / 30) * 10) / 10);
    const months = Math.max(1, Math.ceil(days / 30));
    suggestedMonthly = Math.ceil(remaining / months);
  }

  // On track if at least proportionally funded for time elapsed (simple heuristic).
  const onTrack = progress >= 0.5 || (monthsRemaining != null && monthsRemaining > 3);

  return { goal, progress, remaining, monthsRemaining, suggestedMonthly, onTrack };
}

export function computeAllGoals(goals: SavingsGoal[], now: Date = new Date()): GoalProgress[] {
  return goals.map((g) => computeGoalProgress(g, now));
}
