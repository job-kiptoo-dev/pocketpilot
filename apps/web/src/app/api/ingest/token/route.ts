import { getServerSupabase } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { generateToken, hashToken } from "@/lib/ingest";

export const runtime = "nodejs";

/**
 * Create or rotate the signed-in user's ingest token. Returns the raw token
 * exactly once — only its hash is persisted, so it can't be retrieved later.
 */
export async function POST() {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "Not authenticated" }, 401);

  const token = generateToken();
  const admin = getAdminSupabase();
  const { error } = await admin
    .from("ingest_tokens")
    .upsert({ user_id: user.id, token_hash: hashToken(token), last_used_at: null });
  if (error) return json({ error: error.message }, 500);

  return json({ token }, 200);
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
