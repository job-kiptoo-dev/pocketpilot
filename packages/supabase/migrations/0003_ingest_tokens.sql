-- Per-user ingest token for the M-Pesa SMS webhook (/api/ingest/sms).
-- A forwarder app on the user's phone POSTs M-Pesa SMS here using this token.
-- We store only a SHA-256 hash; the raw token is shown once in the UI.

create table if not exists public.ingest_tokens (
  user_id uuid primary key references auth.users (id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

alter table public.ingest_tokens enable row level security;

-- Owner-only: the settings UI reads created_at/last_used_at and rotates the
-- token. The hash is never sensitive on its own, and the raw token is never
-- stored, so it can't be re-read — rotating issues a fresh one.
drop policy if exists "ingest_tokens_owner" on public.ingest_tokens;
create policy "ingest_tokens_owner" on public.ingest_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
