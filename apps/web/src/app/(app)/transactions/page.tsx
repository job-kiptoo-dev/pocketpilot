"use client";

import { AddTxDialog } from "@/components/transactions/add-tx-dialog";
import { PasteSmsDialog } from "@/components/transactions/paste-sms-dialog";
import { TxList } from "@/components/transactions/tx-list";

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">Every shilling in and out, categorized.</p>
        </div>
        <div className="flex gap-2">
          <PasteSmsDialog />
          <AddTxDialog />
        </div>
      </header>

      <TxList />
    </div>
  );
}
