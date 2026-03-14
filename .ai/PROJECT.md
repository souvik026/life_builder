# Project Overview

## What is this?

A **90-day personal habit tracker** web app. Users set up habits, log daily completions, track streaks, journal moods, monitor body stats (weight/calories), manage timed tasks, and set goals.

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 (CSS-based config in `globals.css`, NO `tailwind.config.js`)
- **Charts**: Recharts 3
- **Data fetching**: SWR 2
- **Icons**: Lucide React
- **Animations**: Motion (framer-motion successor) — installed but not actively used yet
- **Utilities**: clsx, tailwind-merge — installed but not actively used yet

### Backend
- **Framework**: FastAPI (Python 3.12)
- **Database**: PostgreSQL 16 via asyncpg (direct SQL, no ORM)
- **Validation**: Pydantic v2 + pydantic-settings
- **Infrastructure**: Docker Compose (Postgres + backend service)

### What's NOT built (deliberately skipped, placeholders exist)
- LLM/OpenAI integration (placeholder in `GoalService.create_goals_from_llm`)
- WhatsApp bot (Twilio)
- MCP server
- Reminder service
- Report page + ReportService

## Architecture Pattern

### Backend: Repository → Service → Router
```
repositories/  →  Pure data access (SQL queries via asyncpg)
services/      →  Business logic (calls repos, computes streaks, etc.)
routers/       →  Thin HTTP endpoints (validates input, calls services, returns responses)
dependencies.py → FastAPI Depends() factories wiring repos → services → routers
```

Each layer has **one class per file**. Models (Pydantic) define request/response shapes.

### Frontend: Pages + Components + Hooks
```
app/           →  Next.js pages (server components by default, "use client" where needed)
components/    →  Reusable UI components (custom, NOT shadcn/ui)
hooks/         →  SWR-based data fetching hooks
lib/api.ts     →  API client with automatic mock data fallback
lib/types.ts   →  TypeScript interfaces matching backend Pydantic models
```

### Mock Data Fallback
`lib/api.ts` checks for `NEXT_PUBLIC_API_URL` env var. If not set, all API calls return mock data. This lets the frontend run standalone without a backend.

## Key Design Decisions

1. **asyncpg over Supabase client** — simpler for Railway deployment, raw SQL control
2. **Tailwind v4 CSS config** — all theme tokens defined in `globals.css` via `@theme inline`, no JS config file
3. **Custom UI components** — no shadcn/ui dependency; Card, Badge, ProgressRing, NavBar are hand-built
4. **Green aesthetic palette** — forest/emerald/mint color scheme, Fraunces (serif) + Outfit (sans) fonts
5. **Banner images as static SVGs** — in `public/banners/`, easy to swap by replacing files with same names
6. **Goals `source` field** — tracks origin (manual/whatsapp_bot/llm) for future AI integration
7. **No auth system** — single-user app, no login/sessions needed
