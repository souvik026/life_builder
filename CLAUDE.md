# CLAUDE.md — Session status

## Current phase
Phase 1 complete (backend). Phase 2 complete (frontend UI). Goals feature complete. Green UI overhaul complete.

## What exists
- Architecture.md — full reference (updated with goals section)
- frontend/ — Next.js 16 app, TypeScript, Tailwind CSS v4 (CSS-based config, no tailwind.config.js)
- backend/ — FastAPI app, asyncpg, Pydantic v2
- docker-compose.yml — Postgres 16 + backend service
- Design: Green aesthetic palette (Fraunces + Outfit fonts, forest/emerald/mint palette)

## Backend structure
```
backend/
├── main.py              — FastAPI app, CORS, lifespan (DB connect/close)
├── config.py            — Settings (pydantic-settings, reads .env)
├── database.py          — DatabaseClient (asyncpg pool)
├── dependencies.py      — Depends() factories for repos + services
├── schema.sql           — Full Postgres schema (11 tables + trigger)
├── Dockerfile           — Python 3.12 slim
├── .env / .env.example  — DATABASE_URL
├── models/              — Pydantic models matching frontend types.ts
│   ├── habit.py, log.py, journal.py, body_stats.py
│   ├── timed_task.py, setup.py, dashboard.py, goal.py
├── repositories/        — Data access layer (one class per file)
│   ├── habit_repo.py, log_repo.py, streak_repo.py
│   ├── journal_repo.py, body_stats_repo.py
│   ├── task_repo.py, setup_repo.py, goal_repo.py
├── services/            — Business logic
│   ├── streak_service.py, dashboard_service.py, setup_service.py, goal_service.py
├── routers/             — Thin API endpoints
│   ├── dashboard.py, logs.py, body_stats.py
│   ├── timed_tasks.py, journals.py, setup.py, goals.py
└── seed/                — habits.md + seed_habits.py
```

## Frontend structure
```
frontend/
├── app/
│   ├── layout.tsx          — Root layout with NavBar
│   ├── page.tsx            — Redirects to /dashboard
│   ├── globals.css         — Green aesthetic theme, animations, custom scrollbar
│   ├── dashboard/page.tsx  — Full dashboard (banner, quote, stat cards, habit grids, charts, goals)
│   ├── goals/page.tsx      — Goal setting page (CRUD, categories, progress logging)
│   ├── journal/page.tsx    — Journal entry form
│   └── setup/page.tsx      — 4-step setup wizard
├── components/
│   ├── dashboard/ — StatCard, WeightChart, CalorieGauge, HabitGrid, TimedTaskList, StreakHeatmap, Banner, QuoteCard, GoalSection
│   └── ui/ — Card, Badge, ProgressRing, NavBar
├── lib/
│   ├── types.ts — TypeScript interfaces matching Pydantic models (incl. GoalSummary)
│   └── api.ts   — API client, auto-fallback to mock when no NEXT_PUBLIC_API_URL
├── hooks/ — useDashboard (SWR), useHabits, useGoals
└── public/banners/ — 6 placeholder SVGs (swap by replacing files)
```

## API Endpoints (implemented)
| Method | Path | Description |
|--------|------|-------------|
| GET | /dashboard/summary | Aggregated dashboard data |
| POST | /logs | Log habit completion |
| POST | /body-stats | Log weight/calories |
| POST | /timed-tasks | Create new timed task |
| POST | /task-sessions | Log task session time |
| POST | /journals | Save journal entry |
| GET | /setup/status | Check if setup is locked |
| POST | /setup/preview | Parse habits markdown |
| POST | /setup/lock | Lock setup + seed habits |
| GET | /setup/config | Read setup config |
| GET | /goals | List goals (optional ?status= filter) |
| POST | /goals | Create a goal |
| GET | /goals/{id} | Goal detail with logs |
| PUT | /goals/{id} | Update a goal |
| POST | /goals/{id}/progress | Log progress entry |
| DELETE | /goals/{id} | Delete a goal |
| POST | /goals/from-llm | Placeholder: LLM-generated goals |
| GET | /health | Health check |

## What's NOT built yet
- LLM/OpenAI (LLMService) — SKIP for now (placeholder in GoalService.create_goals_from_llm)
- WhatsApp bot (Twilio) — SKIP for now
- MCP server — SKIP for now
- Reminder service — SKIP for now
- Report page + ReportService — SKIP for now

## Next steps
1. Test with Docker: `docker-compose up`, seed habits, verify endpoints
2. Deploy: Vercel (frontend) + Railway (backend + Postgres)

## Decisions made
- asyncpg for direct Postgres access (not Supabase client) — simpler for Railway deployment
- Tailwind CSS v4 with CSS-based config (@theme inline in globals.css)
- Fonts: Fraunces (display/serif) + Outfit (body/sans) via Google Fonts @import
- Mock data fallback in api.ts — activates when NEXT_PUBLIC_API_URL is not set
- No shadcn/ui — custom Card/Badge/ProgressRing components
- Green aesthetic palette (replaced earth tones): mint cream bg, forest/emerald accents, pine text
- Banner images in public/banners/ — easy to swap by replacing files with same names
- Goals use source field (manual/whatsapp_bot/llm) to track origin for future LLM integration
- clsx, tailwind-merge, motion packages installed but not actively used yet
