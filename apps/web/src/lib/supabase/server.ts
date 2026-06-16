import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@pocketpilot/supabase";
import { requireSupabaseEnv } from "./config";

/** Server-side Supabase client wired to Next's cookie store. */
export async function getServerSupabase() {
  const { url, anonKey } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — safe to ignore; middleware refreshes.
        }
      },
    },
  });
}
