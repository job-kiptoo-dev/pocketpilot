# PocketPilot 🛫

**Your M-Pesa money, finally making sense.** PocketPilot is a mobile-first personal finance assistant built for Kenyan M-Pesa users. Paste your M-Pesa SMS messages and instantly see how much you have left, whether you're safe until payday, and how much you can spend without running out.

> Built with Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui, Recharts and Framer Motion.

## ✨ Features

- **📥 Transaction tracking** — add transactions manually or paste raw M-Pesa SMS. A regex parser extracts the amount, merchant, date and remaining balance, then auto-categorizes the spend.
- **📊 Financial health dashboard** — current balance, daily/weekly/monthly spend averages, savings rate, burn rate and a composite health score, with beautiful charts.
- **🛡️ Survival Mode** _(signature feature)_ — answers *"am I safe until payday?"* with a status (Safe / Comfortable / Warning / Critical), days remaining, expected balance at payday, a safe daily allowance, recommendations and a confidence score.
- **🔮 Month-end forecast** — projects your end-of-month balance, total projected spend and how many days your money will last, factoring in recurring expenses.
- **🧪 Budget simulator** — *"If I buy a soda for KSh 200, will I still be safe?"* Re-runs the survival model on the spot.
- **🐷 Savings goals** — track progress, months remaining and suggested monthly contributions.
- **🤖 AI assistant** — chat that answers questions ("What's my biggest expense?", "How much will I have by month end?") from your real financial data.
- **🌗 Dark & light mode**, mobile-first, smooth animations.

## 🧱 Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui (Base UI) |
| Charts | Recharts |
| Animation | Framer Motion |
| AI | Vercel AI Gateway + AI SDK (Claude) — _Phase 2_ |
| Data | Local-first repository abstraction (Supabase-ready) — _Phase 4_ |

## 🚀 Getting started

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

The app ships seeded with a realistic month of Nairobi M-Pesa activity, so every screen is populated out of the box. Data persists to `localStorage`.

```bash
pnpm build        # production build (typecheck + lint)
pnpm test         # unit tests (parser + finance engine)
pnpm lint
```

## 🏗️ Architecture

```
src/
  app/                      # routes: dashboard, transactions, survival, assistant
  components/
    widgets/                # balance, forecast, savings, charts, health score, safety meter, simulator
    transactions/           # tx list, add dialog, paste-SMS dialog
    ui/                     # shadcn/ui primitives
  lib/
    types.ts                # domain model (money stored as integer cents)
    money.ts                # KES formatting + cents helpers
    mpesa/parse.ts          # M-Pesa SMS parser (regex rules)
    finance/                # pure, unit-tested engine
      health.ts forecast.ts survival.ts savings.ts simulator.ts
    db/                     # repository abstraction (memory now, Supabase later)
    store/                  # client store (React context + localStorage) + selectors
    assistant/local.ts      # rule-based assistant over real data
```

The **finance engine** (`lib/finance/*`) is made of pure functions over the app data and a `now` date, so it's fully unit-tested and reused by both the UI and the assistant.

## 🗺️ Roadmap

- **Phase 1 ✅** — dashboard, transactions + M-Pesa parser, Survival Mode, forecast, simulator, savings, local assistant.
- **Phase 2** — LLM-backed assistant + AI insight cards via Vercel AI Gateway.
- **Phase 3** — recurring-expense and simulator editors.
- **Phase 4** — Supabase persistence + auth behind a single env switch.

## 📨 Supported M-Pesa formats

Buy goods / pay bill (`paid to`), send money (`sent to`), received money, withdrawals, airtime and data bundles. Example:

```
Confirmed. Ksh135.00 paid to KIPCHIMCHIM ENTERPRISES. New M-PESA balance is Ksh7,512.39.
```

→ amount `135.00`, merchant `KIPCHIMCHIM ENTERPRISES`, balance `7,512.39`.

---

_Built for ordinary people who just want to know: do I have enough?_
