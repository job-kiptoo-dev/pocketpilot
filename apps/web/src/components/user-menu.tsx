"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { useStore } from "@/lib/store/store";

export function UserMenu() {
  const router = useRouter();
  const { live } = useStore();

  if (!isSupabaseConfigured()) return null;

  async function signOut() {
    await getBrowserSupabase().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
        <span className={`size-2 rounded-full ${live ? "animate-pulse bg-[color:var(--safe)]" : "bg-muted-foreground"}`} />
        {live ? "Live" : "Connecting…"}
      </span>
      <Button variant="ghost" size="icon" aria-label="Sign out" onClick={signOut} className="rounded-full">
        <LogOut className="size-5" />
      </Button>
    </div>
  );
}
