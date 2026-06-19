import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database, TypedSupabaseClient } from "@pocketpilot/supabase";
import { requireSupabaseEnv } from "./config";

/**
 * Service-role Supabase client — bypasses RLS, so it's **server-only** and must
 * never be imported into client code. Used by the ingest webhook to write a
 * transaction on a user's behalf (the request comes from their phone, not a
 * browser session). The service-role key is read from the server environment.
 */
export function getAdminSupabase(): TypedSupabaseClient {
  const { url } = requireSupabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
