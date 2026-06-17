"use client";

import { useState, type ReactElement } from "react";
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
import { formatKes, toCents } from "@pocketpilot/core";

/** Add a contribution to a goal's saved amount. */
export function ContributeDialog({ goal, trigger }: { goal: SavingsGoal; trigger: ReactElement }) {
  const { contributeToGoal } = useStore();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");

  const remaining = Math.max(0, goal.target - goal.saved);

  function submit() {
    const value = Number(amount);
    if (!value || value <= 0) return toast.error("Enter an amount");
    contributeToGoal(goal.id, toCents(value));
    toast.success(`Added ${formatKes(toCents(value))} to ${goal.name}`);
    setOpen(false);
    setAmount("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {goal.emoji} Add to {goal.name}
          </DialogTitle>
          <DialogDescription>
            {formatKes(goal.saved)} saved · {formatKes(remaining)} to go
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="contribute-amount">Amount (KSh)</Label>
          <Input
            id="contribute-amount"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="2000"
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button onClick={submit}>Add contribution</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
