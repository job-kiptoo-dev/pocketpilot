import { parseMpesaBatch } from "@pocketpilot/core";
import { createSupabaseRepository } from "@pocketpilot/supabase";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { extractToken, hashToken, parseIngestBody } from "@/lib/ingest";

export const runtime = "nodejs";

const MAX_BODY = 16 * 1024; // 16 KB is ample for SMS payloads.

/**
 * Inbound M-Pesa SMS webhook. A forwarder app on the user's phone POSTs their
 * M-Pesa confirmation here; we parse it and insert a transaction, which the
 * user's live dashboard receives via Supabase realtime.
 */
export async function POST(req: Request) {
  const url = new URL(req.url);

  const raw = await req.text();
  if (raw.length > MAX_BODY) return json({ error: "Payload too large" }, 413);

  const { text, token: bodyToken } = parseIngestBody(req.headers.get("content-type") ?? "", raw);
  const token = extractToken(req, url, bodyToken);
  if (!token) return json({ error: "Missing token" }, 401);

  const admin = getAdminSupabase();

  // Resolve token -> user. Generic 401 on any miss (don't leak validity).
  const { data: tokenRow } = await admin
    .from("ingest_tokens")
    .select("user_id")
    .eq("token_hash", hashToken(token))
    .maybeSingle();
  if (!tokenRow) return json({ error: "Invalid token" }, 401);

  const transactions = parseMpesaBatch(text);
  if (transactions.length === 0) {
    // Not an M-Pesa message we understand — accept but ignore (don't retry).
    return json({ ok: true, processed: 0, note: "No M-Pesa transaction found" }, 422);
  }

  // addTransaction is idempotent on (user_id, code): a re-sent SMS resolves to
  // the existing row rather than duplicating, so `processed` counts messages
  // safely persisted, new or already-present.
  const repo = createSupabaseRepository(admin, tokenRow.user_id);
  let processed = 0;
  for (const tx of transactions) {
    try {
      await repo.addTransaction(tx);
      processed += 1;
    } catch {
      // Skip a single bad row; keep ingesting the rest.
    }
  }

  // Best-effort touch of last_used_at (don't fail the request on error).
  await admin
    .from("ingest_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("user_id", tokenRow.user_id);

  return json({ ok: true, processed }, 200);
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
