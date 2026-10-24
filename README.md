# MetroMate GPT � Beyond the Metro Map

A privacy-conscious urban-mobility MVP for comparing illustrative trips, tracking browser-local commute expenses, and providing a grounded mobility assistant.

## Features

- Eight App Router routes: dashboard, planner, journey details, Lost Passenger Rescue, expenses, analytics, assistant, and settings.
- Deterministic routes ranked by cheapest, fastest, least walking, or a documented balanced score. Every price and duration is labelled illustrative.
- Lost Passenger Rescue gives safe general recovery steps and explicitly directs users to official signage or station staff when station facts are unavailable.
- Local expense creation, validation, deletion, totals, averages, seven-day chart, mode breakdown, and CSV export.
- Local travel-preference persistence.
- Optional Responses API integration through a server-only route, with Zod validation, a 1,200-character message limit, 12-second timeout, one SDK retry, per-instance request throttling, and a labelled deterministic fallback.

## Local setup

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Run quality checks with `npm run typecheck`, `npm run test`, `npm run lint`, and `npm run build`.

## Environment

`OPENAI_API_KEY` is read only by `src/app/api/openai/route.ts`. `OPENAI_MODEL` is optional and server-controlled; it defaults to `gpt-4.1-mini`. Do not use a `NEXT_PUBLIC_` prefix or commit `.env.local`.

## Data safety and limitations

- There is no live routing, scheduling, fare, disruption, platform, exit, or accessibility-data provider.
- Planner values are deterministic demo estimates, not Pune Metro claims.
- Lost Passenger Rescue never invents station-specific directions.
- Expenses and preferences stay in the current browser�s local storage; there are no accounts or cloud synchronization.
- The deployed in-memory throttle is a best-effort per-instance safeguard. A production multi-instance rollout should use a shared edge or database-backed rate limiter.