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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store/store";
import { SPEND_CATEGORIES } from "@/lib/categories";
import type { Category, Direction } from "@/lib/types";
import { toCents } from "@/lib/money";

export function AddTxDialog({ trigger }: { trigger?: ReactElement }) {
  const { addTransaction } = useStore();
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<Direction>("out");
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState<Category>("Food");

  function submit() {
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    addTransaction({
      amount: toCents(value),
      direction,
      category: direction === "in" ? "Income" : category,
      merchant: merchant.trim() || (direction === "in" ? "Income" : "Unknown"),
      date: new Date().toISOString(),
      source: "manual",
    });
    toast.success("Transaction added");
    setOpen(false);
    setAmount("");
    setMerchant("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button>
              <Plus className="size-4" /> Add
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add transaction</DialogTitle>
          <DialogDescription>Record money in or out manually.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Tabs value={direction} onValueChange={(v) => setDirection(v as Direction)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="out">Money out</TabsTrigger>
              <TabsTrigger value="in">Money in</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount (KSh)</Label>
            <Input
              id="amount"
              inputMode="decimal"
              placeholder="160"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="merchant">{direction === "in" ? "Source" : "Merchant"}</Label>
            <Input
              id="merchant"
              placeholder={direction === "in" ? "Salary, M-Pesa from..." : "Mama Oliech, Sacco..."}
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
            />
          </div>

          {direction === "out" && (
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPEND_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={submit}>Save transaction</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
