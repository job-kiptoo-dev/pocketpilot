"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@pocketpilot/supabase";
import type { TypedSupabaseClient } from "@pocketpilot/supabase";
import { requireSupabaseEnv } from "./config";

let browserClient: TypedSupabaseClient | undefined;

/** Singleton browser Supabase client (cookie-based session via @supabase/ssr). */
export function getBrowserSupabase(): TypedSupabaseClient {
  if (browserClient) return browserClient;
  const { url, anonKey } = requireSupabaseEnv();
  browserClient = createBrowserClient<Database>(url, anonKey);
  return browserClient;
}
