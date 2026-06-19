"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/** Catches render errors in any app route so a single bad screen never white-screens the app. */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("App route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="flex max-w-md flex-col items-center gap-4 px-6 py-10 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-[color:var(--critical)]/10 text-[color:var(--critical)]">
          <AlertTriangle className="size-6" />
        </span>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Something went sideways</h2>
          <p className="text-sm text-muted-foreground">
            This screen hit an error, but your data is safe. Try again — if it keeps happening, reload the page.
          </p>
        </div>
        <Button onClick={reset}>
          <RotateCw className="size-4" /> Try again
        </Button>
      </Card>
    </div>
  );
}
