"use client";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LocalStoreProvider } from "./local-store";
import { SupabaseStoreProvider } from "./supabase-store";

export { useStore } from "./context";

/**
 * Picks the data layer at runtime:
 * - Supabase (realtime + auth) when credentials are configured.
 * - Local seeded store otherwise, so development works without a backend.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  if (isSupabaseConfigured()) {
    return <SupabaseStoreProvider>{children}</SupabaseStoreProvider>;
  }
  return <LocalStoreProvider>{children}</LocalStoreProvider>;
}
