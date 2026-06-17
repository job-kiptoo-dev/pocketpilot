import type { AppData } from "@pocketpilot/core";
import type { SupabaseRepository } from "@pocketpilot/supabase";

const LOCAL_KEY = "pocketpilot:data:v1";
const MIGRATED_KEY = "pocketpilot:migrated:v1";

/**
 * One-time migration of transactions created in local-seed mode (localStorage)
 * into the signed-in user's Supabase account. Seed rows ("seed-*") are skipped;
 * only user-added transactions are pushed. Runs once per browser.
 * Returns the number of transactions migrated.
 */
export async function migrateLocalData(repo: SupabaseRepository): Promise<number> {
  if (typeof window === "undefined") return 0;
  try {
    if (localStorage.getItem(MIGRATED_KEY)) return 0;
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) {
      localStorage.setItem(MIGRATED_KEY, "1");
      return 0;
    }
    const data = JSON.parse(raw) as AppData;
    const userTxns = (data.transactions ?? []).filter((t) => !String(t.id).startsWith("seed-"));

    let migrated = 0;
    for (const t of userTxns) {
      const { id: _id, ...rest } = t;
      try {
        await repo.addTransaction(rest);
        migrated++;
      } catch {
        // skip duplicates / individual failures, keep going
      }
    }
    localStorage.setItem(MIGRATED_KEY, "1");
    return migrated;
  } catch {
    return 0;
  }
}
