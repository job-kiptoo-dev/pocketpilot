/** Insert a transaction, then reload in a FRESH client (simulating a page
 * refresh) and confirm it persisted. Uses the same repository code as the app. */
import { createClient } from "@supabase/supabase-js";
import { createSupabaseRepository, type Database } from "../src/index";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const email = process.env.SEED_EMAIL ?? "demo@pocketpilot.app";
const password = process.env.SEED_PASSWORD ?? "pocketpilot123";
const marker = "PersistTest-" + Date.now();

async function newSession() {
  const c = createClient<Database>(url, anon);
  const { data, error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { c, userId: data.user!.id };
}

async function main() {
  const a = await newSession();
  await createSupabaseRepository(a.c, a.userId).addTransaction({
    amount: 12345,
    direction: "out",
    category: "Food",
    merchant: marker,
    date: new Date().toISOString(),
    source: "sms",
    code: "TEST" + Date.now(), // exercises the previously-failing coded path
  });
  console.log("inserted:", marker);
  await a.c.auth.signOut();

  const b = await newSession(); // fresh client = simulated refresh
  const data = await createSupabaseRepository(b.c, b.userId).load();
  const found = data.transactions.some((t) => t.merchant === marker);
  console.log(found ? "✓ PERSISTED across a fresh session" : "✗ NOT persisted");
  await b.c.auth.signOut();
  process.exit(found ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
