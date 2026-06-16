-- PocketPilot — Supabase schema, RLS, realtime and auth trigger.
-- Apply via the Supabase SQL editor or `supabase db push`.
-- Money is stored as integer cents (KES) in bigint columns.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default 'there',
  payday int not null default 1 check (payday between 1 and 31),
  monthly_income bigint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount bigint not null check (amount >= 0),
  direction text not null check (direction in ('in', 'out')),
  category text not null,
  merchant text not null default 'Unknown',
  balance_after bigint,
  occurred_at timestamptz not null default now(),
  raw text,
  code text,
  source text not null default 'manual' check (source in ('manual', 'sms')),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_occurred_idx
  on public.transactions (user_id, occurred_at desc);

-- Idempotent SMS ingestion: the same M-Pesa code can't be inserted twice.
create unique index if not exists transactions_user_code_uidx
  on public.transactions (user_id, code) where code is not null;

create table if not exists public.recurring_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  category text not null,
  amount_per_cycle bigint not null check (amount_per_cycle >= 0),
  cycle_days int not null default 1 check (cycle_days >= 1),
  created_at timestamptz not null default now()
);

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target bigint not null check (target >= 0),
  saved bigint not null default 0 check (saved >= 0),
  deadline timestamptz,
  emoji text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security — every row is private to its owner
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.recurring_expenses enable row level security;
alter table public.savings_goals enable row level security;

-- profiles (keyed on id = auth.uid())
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles_modify_own" on public.profiles;
create policy "profiles_modify_own" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Helper to declare owner policies on user_id tables.
do $$
declare t text;
begin
  foreach t in array array['transactions', 'recurring_expenses', 'savings_goals']
  loop
    execute format('drop policy if exists "%1$s_owner" on public.%1$s;', t);
    execute format(
      'create policy "%1$s_owner" on public.%1$s for all
         using (auth.uid() = user_id) with check (auth.uid() = user_id);', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Realtime — broadcast row changes to subscribed clients
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.recurring_expenses;
alter publication supabase_realtime add table public.savings_goals;
alter publication supabase_realtime add table public.profiles;

-- ---------------------------------------------------------------------------
-- Auto-create a profile when a new auth user signs up
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1), 'there'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
