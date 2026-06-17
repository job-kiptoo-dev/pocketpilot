"use client";

import { useState, type ReactElement } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store/store";
import type { SavingsGoal } from "@pocketpilot/core";
import { toCents, toKes } from "@pocketpilot/core";

const EMOJI_PRESETS = ["🎯", "🛟", "💻", "📱", "🚗", "✈️", "🏠", "🎓", "💍", "🐷"];

/** Create or edit a savings goal. Pass `goal` to edit; omit to create. */
export function GoalDialog({ goal, trigger }: { goal?: SavingsGoal; trigger?: ReactElement }) {
  const { upsertGoal } = useStore();
  const [open, setOpen] = useState(false);
  const [emoji, setEmoji] = useState(goal?.emoji ?? "🎯");
  const [name, setName] = useState(goal?.name ?? "");
  const [target, setTarget] = useState(goal ? String(toKes(goal.target)) : "");
  const [deadline, setDeadline] = useState(goal?.deadline ? goal.deadline.slice(0, 10) : "");

  function submit() {
    const targetValue = Number(target);
    if (!name.trim()) return toast.error("Give your goal a name");
    if (!targetValue || targetValue <= 0) return toast.error("Enter a target amount");

    upsertGoal({
      id: goal?.id ?? crypto.randomUUID(),
      name: name.trim(),
      target: toCents(targetValue),
      saved: goal?.saved ?? 0,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      emoji: emoji || "🎯",
    });
    toast.success(goal ? "Goal updated" : "Goal created");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button>
              <Plus className="size-4" /> New goal
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{goal ? "Edit goal" : "New savings goal"}</DialogTitle>
          <DialogDescription>Set a target and a deadline — we&apos;ll suggest a monthly amount.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_PRESETS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`grid size-9 place-items-center rounded-lg border text-lg transition-colors ${
                    emoji === e ? "border-primary bg-primary/10" : "hover:bg-accent"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="goal-name">Name</Label>
            <Input id="goal-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Emergency Fund" autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="goal-target">Target (KSh)</Label>
              <Input id="goal-target" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="50000" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-deadline">Deadline</Label>
              <Input id="goal-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={submit}>{goal ? "Save changes" : "Create goal"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
