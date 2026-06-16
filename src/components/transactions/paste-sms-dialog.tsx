"use client";

import { useState, type ReactElement } from "react";
import { MessageSquarePlus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store/store";
import { parseMpesaBatch } from "@/lib/mpesa/parse";
import { formatKes } from "@/lib/money";

const EXAMPLE =
  "Confirmed. Ksh135.00 paid to KIPCHIMCHIM ENTERPRISES. on 5/6/26 at 1:30 PM. New M-PESA balance is Ksh7,512.39.";

export function PasteSmsDialog({ trigger }: { trigger?: ReactElement }) {
  const { addTransaction } = useStore();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  function submit() {
    const parsed = parseMpesaBatch(text);
    if (parsed.length === 0) {
      toast.error("Couldn't read that message", {
        description: "Paste a full M-Pesa confirmation SMS (with the amount and balance).",
      });
      return;
    }
    let total = 0;
    for (const tx of parsed) {
      addTransaction(tx);
      total += tx.amount;
    }
    toast.success(`Imported ${parsed.length} transaction${parsed.length > 1 ? "s" : ""}`, {
      description: `${formatKes(total)} processed`,
    });
    setOpen(false);
    setText("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button variant="outline">
              <MessageSquarePlus className="size-4" /> Paste SMS
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Paste M-Pesa message</DialogTitle>
          <DialogDescription>
            Paste one or more M-Pesa confirmation messages. We&apos;ll extract the amount, merchant, date and balance.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          rows={6}
          placeholder={EXAMPLE}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="font-mono text-xs"
          autoFocus
        />
        <button
          type="button"
          onClick={() => setText(EXAMPLE)}
          className="self-start text-xs text-primary hover:underline"
        >
          Use example message
        </button>

        <DialogFooter>
          <Button onClick={submit}>Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
