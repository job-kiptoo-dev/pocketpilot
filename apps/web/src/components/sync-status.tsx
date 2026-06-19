"use client";

import { Cloud, CloudOff, HardDrive, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store/store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { cn } from "@/lib/utils";

/**
 * Small header pill that makes the data layer's state legible:
 * local-only, syncing, live, or reconnecting. Mirrors the store's
 * `hydrated`/`live` flags so the user always knows where their data lives.
 */
export function SyncStatus() {
  const { hydrated, live } = useStore();
  const cloud = isSupabaseConfigured();

  let icon: React.ReactNode;
  let label: string;
  let tone: string;
  let title: string;

  if (!cloud) {
    icon = <HardDrive className="size-3.5" />;
    label = "Local";
    tone = "text-muted-foreground";
    title = "Saved on this device only — not synced to the cloud.";
  } else if (!hydrated) {
    icon = <Loader2 className="size-3.5 animate-spin" />;
    label = "Syncing";
    tone = "text-muted-foreground";
    title = "Loading your data…";
  } else if (live) {
    icon = <Cloud className="size-3.5" />;
    label = "Synced";
    tone = "text-[color:var(--safe)]";
    title = "Live — changes sync across your devices in real time.";
  } else {
    icon = <CloudOff className="size-3.5" />;
    label = "Reconnecting";
    tone = "text-[color:var(--warning)]";
    title = "Saved, but the live connection dropped. Reconnecting…";
  }

  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        tone,
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}
