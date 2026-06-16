/**
 * Seed a Supabase project with realistic PocketPilot data for a demo user.
 * Uses the service-role key (bypasses RLS). Idempotent-ish: it replaces the
 * demo user's transactions each run.
 *
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... pnpm dlx tsx scripts/seed.ts
 */
import { createClient } from "@supabase/supabase-js";
import { seedData } from "@pocketpilot/core";
import { goalToRow, recurringToRow, transactionToInsert, type Database } from "../src/index";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.SEED_EMAIL ?? "demo@pocketpilot.app";
const password = process.env.SEED_PASSWORD ?? "pocketpilot123";

if (!url || !serviceKey) throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");

const admin = createClient<Database>(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findOrCreateUser(): Promise<string> {
  const { data: list, error } = await admin.auth.admin.listUsers();
  if (error) throw error;
  const existing = list.users.find((u) => u.email === email);
  if (existing) return existing.id;
  const { data, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: "Brian" },
  });
  if (createErr) throw createErr;
  return data.user.id;
}

async function main() {
  const userId = await findOrCreateUser();
  const data = seedData(new Date());

  await admin.from("profiles").upsert({
    id: userId,
    name: data.profile.name,
    payday: data.profile.payday,
    monthly_income: data.profile.monthlyIncome,
  });

  // Replace the demo user's data for a clean, deterministic seed.
  await admin.from("transactions").delete().eq("user_id", userId);
  await admin.from("recurring_expenses").delete().eq("user_id", userId);
  await admin.from("savings_goals").delete().eq("user_id", userId);

  // Drop the fixtures' string ids so Postgres assigns real UUIDs.
  const tx = await admin.from("transactions").insert(data.transactions.map((t) => transactionToInsert(t, userId)));
  if (tx.error) throw tx.error;
  const rec = await admin.from("recurring_expenses").insert(
    data.recurring.map((r) => {
      const { id: _id, ...row } = recurringToRow(r, userId);
      return row;
    }),
  );
  if (rec.error) throw rec.error;
  const goals = await admin.from("savings_goals").insert(
    data.goals.map((g) => {
      const { id: _id, ...row } = goalToRow(g, userId);
      return row;
    }),
  );
  if (goals.error) throw goals.error;

  console.log(`✓ Seeded ${email} (${userId})`);
  console.log(`  ${data.transactions.length} transactions, ${data.recurring.length} recurring, ${data.goals.length} goals`);
  console.log(`  Sign in on the web/mobile app with: ${email} / ${password}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
