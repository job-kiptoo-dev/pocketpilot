// @pocketpilot/supabase — typed Supabase data layer shared by web + mobile.
// Platform-specific client creation (Next.js SSR cookies, Expo AsyncStorage)
// lives in each app; this package is framework-agnostic.

export * from "./database.types";
export * from "./mappers";
export * from "./repository";
export * from "./realtime";

import type { SupabaseClientOptions } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import type { TypedSupabaseClient } from "./repository";

/** Framework-agnostic typed client factory (used by mobile / scripts). */
export function createSupabaseClient(
  url: string,
  anonKey: string,
  options?: SupabaseClientOptions<"public">,
): TypedSupabaseClient {
  return createClient<Database>(url, anonKey, options);
}
