# PocketPilot — Realtime setup

PocketPilot runs in two modes:

- **Local-seed mode** (default, zero config): seeded data in `localStorage`, no auth.
- **Realtime mode**: Supabase Postgres + Auth + Realtime. The dashboard updates
  live the instant a transaction is written from anywhere (web or the mobile app).

## 1. Create the Supabase project

1. Create a project at [supabase.com](https://supabase.com) (region near Kenya, e.g. `eu-central-1`).
2. Open **SQL Editor** and run the contents of [`packages/supabase/schema.sql`](packages/supabase/schema.sql).
   This creates the tables, Row-Level Security, realtime publication and the
   auto-profile trigger.
3. (Dev convenience) **Authentication → Providers → Email**: turn **off**
   "Confirm email" so sign-up logs you in immediately. Leave it on for production.

## 2. Configure environment

```bash
cp apps/web/.env.example apps/web/.env.local
```

Fill in from **Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>   # server-only
```

## 3. Run

```bash
pnpm install
pnpm --filter @pocketpilot/web dev      # http://localhost:3000
```

With keys present, the app requires sign-in and runs in realtime mode. Create an
account on `/login`, add a transaction, and the dashboard recalculates instantly.

## Verifying realtime

Open the dashboard, then in another tab/window insert a row for your user (via the
Supabase Table editor, the mobile app, or a second browser). The balance, forecast
and **SAFE/WARNING/CRITICAL** status update with no refresh.

## Mobile app (Expo)

```bash
cp apps/mobile/.env.example apps/mobile/.env   # already created locally
# EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY

pnpm --filter @pocketpilot/mobile start        # scan the QR with Expo Go
```

The mobile app signs in against the same Supabase project, so a transaction added
on the phone appears on the web dashboard **instantly** (and vice-versa).

### Android SMS auto-detection (optional, later)

Reading incoming SMS is Android-only and needs a custom dev build:

```bash
pnpm --filter @pocketpilot/mobile add react-native-android-sms-listener
# add RECEIVE_SMS / READ_SMS permissions, then:
pnpm --filter @pocketpilot/mobile exec expo run:android
```

Until then, use the **Add → Paste M-Pesa SMS** flow (works on Expo Go and iOS).
`src/lib/sms.ts` already wires the listener when the native module is present.

## Monorepo layout

```
apps/web              Next.js dashboard (realtime + auth)
apps/mobile           Expo app — live dashboard + SMS ingestion
packages/core         finance engine, types, M-Pesa parser (shared)
packages/supabase     schema.sql, typed client, repository, realtime helper
```
