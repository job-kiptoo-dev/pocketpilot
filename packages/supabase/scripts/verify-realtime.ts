/**
 * End-to-end realtime check: sign in as the demo user (anon key), subscribe to
 * the transactions table, insert a row, and confirm the realtime event fires.
 *
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... pnpm dlx tsx scripts/verify-realtime.ts
 */
import { createClient } from "@supabase/supabase-js";
import { computeSurvival } from "@pocketpilot/core";
import { createSupabaseRepository, type Database } from "../src/index";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = process.env.SEED_EMAIL ?? "demo@pocketpilot.app";
const password = process.env.SEED_PASSWORD ?? "pocketpilot123";

if (!url || !anonKey) throw new Error("Set SUPABASE_URL and SUPABASE_ANON_KEY");

const client = createClient<Database>(url, anonKey);

function waitFor(predicate: () => boolean, ms: number): Promise<boolean> {
  return new Promise((resolve) => {
    const start = Date.now();
    const t = setInterval(() => {
      if (predicate() || Date.now() - start > ms) {
        clearInterval(t);
        resolve(predicate());
      }
    }, 100);
  });
}

async function main() {
  const { data: auth, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const userId = auth.user!.id;

  const repo = createSupabaseRepository(client, userId);
  const before = await repo.load();
  const survBefore = computeSurvival(before);
  console.log(`Signed in as ${email}. Balance ${before.transactions[0]?.balanceAfter ?? 0}, status ${survBefore.status}`);

  let received = false;
  const channel = client
    .channel("verify")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "transactions", filter: `user_id=eq.${userId}` }, () => {
      received = true;
    });
  await new Promise<void>((resolve) => channel.subscribe((status) => status === "SUBSCRIBED" && resolve()));
  console.log("Subscribed to realtime ✓ — inserting a test transaction…");

  await repo.addTransaction({
    amount: 20000,
    direction: "out",
    category: "Entertainment",
    merchant: "Realtime Test Soda",
    date: new Date().toISOString(),
    source: "manual",
  });

  const ok = await waitFor(() => received, 8000);
  const after = await repo.load();
  const survAfter = computeSurvival(after);

  console.log(ok ? "✓ REALTIME EVENT RECEIVED" : "✗ no realtime event within 8s");
  console.log(`Status ${survBefore.status} -> ${survAfter.status}; transactions ${before.transactions.length} -> ${after.transactions.length}`);

  await client.removeChannel(channel);
  await client.auth.signOut();
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
