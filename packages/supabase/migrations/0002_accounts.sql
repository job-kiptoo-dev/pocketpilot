-- Multi-account support: M-Pesa + bank/savings, with net cash across accounts.

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type text not null default 'bank' check (type in ('mpesa', 'bank', 'savings', 'cash')),
  balance bigint not null default 0,
  created_at timestamptz not null default now()
);

-- At most one M-Pesa account per user (its balance is derived from transactions).
create unique index if not exists accounts_one_mpesa_uidx
  on public.accounts (user_id) where type = 'mpesa';

alter table public.accounts enable row level security;

drop policy if exists "accounts_owner" on public.accounts;
create policy "accounts_owner" on public.accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- realtime (guard against duplicate membership)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'accounts'
  ) then
    alter publication supabase_realtime add table public.accounts;
  end if;
end $$;

-- Backfill: every existing user gets a default M-Pesa account.
insert into public.accounts (user_id, name, type)
select id, 'M-Pesa', 'mpesa' from auth.users u
where not exists (select 1 from public.accounts a where a.user_id = u.id and a.type = 'mpesa');

-- Extend the new-user trigger to also create the M-Pesa account.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1), 'there'))
  on conflict (id) do nothing;
  insert into public.accounts (user_id, name, type)
  select new.id, 'M-Pesa', 'mpesa'
  where not exists (select 1 from public.accounts a where a.user_id = new.id and a.type = 'mpesa');
  return new;
end;
$$;
