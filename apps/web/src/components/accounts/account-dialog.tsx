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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store/store";
import type { Account, AccountType } from "@pocketpilot/core";
import { toCents, toKes } from "@pocketpilot/core";

const TYPES: { value: AccountType; label: string }[] = [
  { value: "bank", label: "🏦 Bank" },
  { value: "savings", label: "🐷 Savings" },
  { value: "cash", label: "💵 Cash" },
];

/** Create or edit a non-M-Pesa account (M-Pesa balance is derived, not edited here). */
export function AccountDialog({ account, trigger }: { account?: Account; trigger?: ReactElement }) {
  const { upsertAccount } = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(account?.name ?? "");
  const [type, setType] = useState<AccountType>(account?.type === "mpesa" ? "bank" : account?.type ?? "bank");
  const [balance, setBalance] = useState(account ? String(toKes(account.balance)) : "");

  const isMpesa = account?.type === "mpesa";

  function submit() {
    if (!name.trim()) return toast.error("Name your account");
    upsertAccount({
      id: account?.id ?? crypto.randomUUID(),
      name: name.trim(),
      type: isMpesa ? "mpesa" : type,
      balance: isMpesa ? account!.balance : toCents(Number(balance) || 0),
    });
    toast.success(account ? "Account updated" : "Account added");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button>
              <Plus className="size-4" /> Add account
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{account ? "Edit account" : "Add account"}</DialogTitle>
          <DialogDescription>Track a bank or savings balance alongside M-Pesa for your net cash.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="acct-name">Name</Label>
            <Input id="acct-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Equity Savings" autoFocus />
          </div>

          {!isMpesa && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as AccountType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="acct-balance">Balance (KSh)</Label>
                <Input id="acct-balance" inputMode="decimal" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="15000" />
              </div>
            </div>
          )}

          {isMpesa && (
            <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
              Your M-Pesa balance updates automatically from transactions — only the name is editable.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button onClick={submit}>{account ? "Save" : "Add account"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
