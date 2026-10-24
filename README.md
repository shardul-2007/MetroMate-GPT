# MetroMate GPT

Urban mobility hackathon MVP: journey comparison, Lost Passenger Rescue, browser-local expense tracking, analytics, and optional server-side OpenAI assistant.

## Run locally
1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and optionally set `OPENAI_API_KEY`.
4. Run `npm run dev` and open http://localhost:3000.

No API key? The assistant uses a labelled deterministic demo response. Never commit `.env.local`.

## Data safety
- Example journeys and prices are illustrative, not live Pune Metro data.
- Station platforms, exits, accessibility paths, fares, and service status are not verified. Confirm with official sources or station staff.
- Expenses and preferences remain in browser localStorage and are not synced.
- OpenAI credentials stay server-side; never use a `NEXT_PUBLIC_` prefix.
- No user login is implemented or required.

## Routes
`/`, `/planner`, `/journey/demo-metro`, `/lost`, `/expenses`, `/analytics`, `/assistant`, `/settings`.

## Environment
`OPENAI_API_KEY` is server-side only. Optional `OPENAI_MODEL` configures the server-selected model. Live routing, station data, fares, and real-time transit are not configured.
