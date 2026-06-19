import "server-only";

import { createHash, randomBytes } from "node:crypto";

/** Generate a fresh, URL-safe ingest token (shown to the user exactly once). */
export function generateToken(): string {
  return randomBytes(24).toString("base64url");
}

/** SHA-256 hex of a token — only the hash is ever stored. */
export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * Pull the ingest token from a request: `Authorization: Bearer …`, `?token=`,
 * or a form/JSON `token` field. Returns null when absent.
 */
export function extractToken(req: Request, url: URL, bodyToken?: string): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim() || null;
  const q = url.searchParams.get("token");
  if (q) return q.trim();
  return bodyToken?.trim() || null;
}

/** Field names different SMS-forwarder apps use for the message text. */
const TEXT_FIELDS = ["text", "message", "body", "msg", "sms", "content"] as const;
const TOKEN_FIELDS = ["token", "secret", "key"] as const;

/**
 * Extract { text, token } from a forwarded-SMS request, tolerating JSON,
 * urlencoded form, and raw text/plain bodies. `raw` is capped by the caller.
 */
export function parseIngestBody(contentType: string, raw: string): { text: string; token?: string } {
  const ct = contentType.toLowerCase();

  if (ct.includes("application/json")) {
    try {
      const obj = JSON.parse(raw) as Record<string, unknown>;
      const text = firstString(obj, TEXT_FIELDS) ?? "";
      const token = firstString(obj, TOKEN_FIELDS);
      return { text, token };
    } catch {
      return { text: "" };
    }
  }

  if (ct.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(raw);
    const text = TEXT_FIELDS.map((f) => params.get(f)).find(Boolean) ?? "";
    const token = TOKEN_FIELDS.map((f) => params.get(f)).find(Boolean) ?? undefined;
    return { text, token };
  }

  // Fallback: treat the whole body as the SMS text.
  return { text: raw };
}

function firstString(obj: Record<string, unknown>, fields: readonly string[]): string | undefined {
  for (const f of fields) {
    const v = obj[f];
    if (typeof v === "string" && v.trim()) return v;
  }
  return undefined;
}
