Habit Tracker — Architecture & Implementation Plan
Claude Code: Read this entire file before writing any code. It is the single source of truth.

How to use this file across Claude Code sessions
Claude Code has no memory between sessions. This file is how context is preserved.
At the start of every session, run this prompt:
"Read ARCHITECTURE.md fully, then read CLAUDE.md. Do not write any code yet — confirm you understand the current phase and what was completed last session."
CLAUDE.md (project root) is a short file you update at the end of every session. It tells Claude what phase you are on, what was completed, and what to do next. Keep it under 30 lines. ARCHITECTURE.md is the full reference — never modify it mid-session. CLAUDE.md is the living status log — update it every time.

Coding rules — enforced in every file
Use classes everywhere. Every service, every repository, every helper must be a class with methods — not a collection of loose functions. This makes the codebase navigable across sessions.
One class per file. Name the file after the class in snake_case.
No business logic in routers. Routers call service classes. Service classes call repository classes. Repositories call the database. Never skip a layer.
Type everything. All function arguments and return types must be annotated. Use Pydantic models for all request/response shapes.
No local LLMs. LLM provider is OpenAI GPT-4o mini only. The LLMService class wraps all calls.
Docker for local development. Never install Postgres directly. Use docker-compose up to start the full local stack.
New features follow the same class pattern. Add a service class, a repository class if needed, wire through a thin router. No standalone functions.

Project overview
A personal 90-day habit tracking system:
Web dashboard — Next.js frontend for visual tracking
FastAPI backend — REST API with a strict service/repository class architecture
PostgreSQL — hosted on Supabase in production, Docker locally
WhatsApp bot — Twilio for daily logging and reminders
MCP server — exposes tools to Claude.ai
LLM — GPT-4o mini for NLU, journal insights, weekly coaching, 90-day report
Immutable rules baked into the system:
Habits (morning + life) are locked after the one-time setup. Cannot be changed via API, UI, or direct DB call — Postgres trigger enforces this at the database level.
90-day tasks can only be added, never deleted.
After 30 consecutive days on any timed task, prompt the user to add a new task.
All LLM calls go through LLMService — never call OpenAI directly from a router or other service.

Repository structure
habit-tracker/
├── ARCHITECTURE.md          ← full reference (this file)
├── CLAUDE.md                ← session status log (update every session)
├── docker-compose.yml       ← local dev stack
├── .env.example
│
├── backend/
│   ├── main.py              ← FastAPI app, mounts all routers, starts scheduler
│   ├── config.py            ← Settings class (pydantic-settings)
│   ├── database.py          ← DatabaseClient class (Supabase singleton)
│   │
│   ├── models/              ← Pydantic request/response models only
│   │   ├── habit.py
│   │   ├── log.py
│   │   ├── journal.py
│   │   ├── body_stats.py
│   │   ├── timed_task.py
│   │   ├── setup.py
│   │   └── report.py
│   │
│   ├── repositories/        ← DB access classes — one per table group
│   │   ├── habit_repository.py      ← HabitRepository
│   │   ├── log_repository.py        ← LogRepository
│   │   ├── streak_repository.py     ← StreakRepository
│   │   ├── journal_repository.py    ← JournalRepository
│   │   ├── body_stats_repository.py ← BodyStatsRepository
│   │   ├── task_repository.py       ← TaskRepository
│   │   ├── setup_repository.py      ← SetupRepository
│   │   └── report_repository.py     ← ReportRepository
│   │
│   ├── services/            ← Business logic classes
│   │   ├── llm_service.py           ← LLMService (OpenAI only)
│   │   ├── streak_service.py        ← StreakService
│   │   ├── dashboard_service.py     ← DashboardService
│   │   ├── whatsapp_service.py      ← WhatsAppService (Twilio)
│   │   ├── reminder_service.py      ← ReminderService (APScheduler jobs)
│   │   ├── setup_service.py         ← SetupService (lock logic, sha256 hash)
│   │   ├── report_service.py        ← ReportService (stats + GPT narrative)
│   │   └── webhook_service.py       ← WebhookService (parse WA message → action)
│   │
│   ├── routers/             ← Thin routers, call services only
│   │   ├── habits.py
│   │   ├── logs.py
│   │   ├── streaks.py
│   │   ├── journals.py
│   │   ├── body_stats.py
│   │   ├── timed_tasks.py
│   │   ├── dashboard.py
│   │   ├── setup.py
│   │   ├── report.py
│   │   └── webhook.py
│   │
│   ├── mcp/
│   │   └── server.py        ← MCPServer class using FastMCP
│   │
│   ├── seed/
│   │   ├── habits.md        ← source of truth for all fixed habits
│   │   └── seed_habits.py   ← HabitSeeder class, run once
│   │
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx
    │   │   ├── middleware.ts         ← setup lock gate
    │   │   ├── dashboard/page.tsx
    │   │   ├── journal/page.tsx
    │   │   ├── setup/page.tsx        ← one-time setup wizard
    │   │   └── report/page.tsx       ← 90-day completion report
    │   │
    │   ├── components/
    │   │   ├── dashboard/
    │   │   │   ├── StatCard.tsx
    │   │   │   ├── WeightChart.tsx
    │   │   │   ├── CalorieGauge.tsx
    │   │   │   ├── HabitGrid.tsx
    │   │   │   ├── TimedTaskList.tsx
    │   │   │   └── StreakHeatmap.tsx
    │   │   └── ui/
    │   │       ├── Card.tsx
    │   │       ├── Badge.tsx
    │   │       └── ProgressRing.tsx
    │   │
    │   ├── lib/
    │   │   ├── api.ts               ← all fetch calls, typed
    │   │   └── types.ts             ← TypeScript interfaces matching Pydantic models
    │   │
    │   └── hooks/
    │       ├── useDashboard.ts
    │       └── useHabits.ts
    │
    └── package.json


Class architecture — canonical patterns
Every service and repository must follow these patterns exactly. Claude Code must replicate this structure for any new feature.
Repository class
# backend/repositories/habit_repository.py
from database import DatabaseClient
from models.habit import Habit

class HabitRepository:
    def __init__(self, db: DatabaseClient):
        self.db = db

    async def get_all(self, category: str | None = None) -> list[Habit]:
        query = self.db.client.table("habits").select("*").eq("is_active", True)
        if category:
            query = query.eq("category", category)
        result = query.execute()
        return [Habit(**row) for row in result.data]

    async def get_by_id(self, habit_id: str) -> Habit | None:
        result = self.db.client.table("habits").select("*").eq("id", habit_id).single().execute()
        return Habit(**result.data) if result.data else None

Service class
# backend/services/streak_service.py
from repositories.habit_repository import HabitRepository
from repositories.streak_repository import StreakRepository
from repositories.log_repository import LogRepository

class StreakService:
    def __init__(
        self,
        habit_repo: HabitRepository,
        streak_repo: StreakRepository,
        log_repo: LogRepository
    ):
        self.habit_repo = habit_repo
        self.streak_repo = streak_repo
        self.log_repo = log_repo

    async def recalculate_all(self) -> None:
        habits = await self.habit_repo.get_all()
        for habit in habits:
            streak = await self._calculate_streak(habit.id)
            await self.streak_repo.upsert(habit.id, streak)

    async def _calculate_streak(self, habit_id: str) -> int:
        logs = await self.log_repo.get_completed_dates(habit_id)
        # streak logic here
        ...

Router (thin — calls service only)
# backend/routers/habits.py
from fastapi import APIRouter, Depends
from repositories.habit_repository import HabitRepository

router = APIRouter(prefix="/habits", tags=["habits"])

@router.get("/")
async def get_habits(
    category: str | None = None,
    habit_repo: HabitRepository = Depends()
):
    return await habit_repo.get_all(category=category)

LLMService — the only place OpenAI is called
# backend/services/llm_service.py
from openai import AsyncOpenAI
from config import Settings
import json

class LLMService:
    def __init__(self, settings: Settings):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model

    async def call(self, prompt: str, system: str = "", max_tokens: int = 500) -> str:
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt}
            ],
            max_tokens=max_tokens
        )
        return response.choices[0].message.content

    async def call_json(self, prompt: str, system: str = "") -> dict:
        """Use when you need a structured JSON response."""
        json_system = system + "\n\nReturn ONLY valid JSON. No preamble, no markdown fences."
        raw = await self.call(prompt, json_system, max_tokens=1000)
        return json.loads(raw)


Docker setup
docker-compose.yml
version: "3.9"
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: habituser
      POSTGRES_PASSWORD: habitpass
      POSTGRES_DB: habitdb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    depends_on:
      - db
    volumes:
      - ./backend:/app
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

volumes:
  pgdata:

Commands
# Start full local stack
docker-compose up

# Seed habits (first time only)
docker-compose exec backend python seed/seed_habits.py

# Frontend runs outside Docker
cd frontend && npm install && npm run dev


Environment variables
# backend/.env
DATABASE_URL=postgresql://habituser:habitpass@localhost:5432/habitdb
# Production: DATABASE_URL=postgresql://postgres:[pass]@db.[ref].supabase.co:5432/postgres

SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-anon-key

OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000


Database schema
CREATE TABLE habits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('morning', 'life')),
  description TEXT,
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE habit_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id   UUID REFERENCES habits(id),
  log_date   DATE NOT NULL,
  completed  BOOLEAN DEFAULT false,
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(habit_id, log_date)
);

CREATE TABLE streaks (
  habit_id        UUID PRIMARY KEY REFERENCES habits(id),
  current_streak  INT DEFAULT 0,
  longest_streak  INT DEFAULT 0,
  last_completed  DATE,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE journals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date  DATE UNIQUE NOT NULL,
  went_well   TEXT,
  went_bad    TEXT,
  reflection  TEXT,
  ai_insight  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE timed_tasks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  target_days    INT DEFAULT 90,
  target_minutes INT DEFAULT 60,
  start_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active      BOOLEAN DEFAULT true,
  added_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE task_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id      UUID REFERENCES timed_tasks(id),
  session_date DATE NOT NULL,
  minutes_done INT NOT NULL,
  note         TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE body_stats (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date       DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg       NUMERIC(5,2),
  calories_burnt  INT,
  target_calories INT DEFAULT 500,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE setup_config (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name       TEXT NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE GENERATED ALWAYS AS (start_date + INTERVAL '89 days') STORED,
  start_weight    NUMERIC(5,2),
  target_weight   NUMERIC(5,2),
  target_calories INT DEFAULT 500,
  whatsapp_number TEXT,
  habits_md_raw   TEXT NOT NULL,
  config_hash     TEXT NOT NULL,
  is_locked       BOOLEAN DEFAULT false,
  locked_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX only_one_config ON setup_config ((true));

CREATE TABLE reports (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_at      TIMESTAMPTZ DEFAULT now(),
  overall_pct       NUMERIC(5,2),
  weight_start      NUMERIC(5,2),
  weight_end        NUMERIC(5,2),
  best_streak_habit TEXT,
  best_streak_days  INT,
  habit_stats       JSONB,
  task_stats        JSONB,
  dow_stats         JSONB,
  ai_strengths      TEXT,
  ai_improvements   TEXT,
  ai_next_session   TEXT
);

-- Blocks any habit mutation after setup is locked
CREATE OR REPLACE FUNCTION prevent_habit_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF (SELECT is_locked FROM setup_config LIMIT 1) THEN
    RAISE EXCEPTION 'Habits are locked. Setup config is immutable after Day 1.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER lock_habits
  BEFORE INSERT OR UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION prevent_habit_mutation();


API contracts
GET /dashboard/summary
Single aggregated call — frontend never stitches multiple endpoints.
{
  "today": "2025-03-13",
  "day_number": 42,
  "body": {
    "current_weight_kg": 78.5,
    "target_weight_kg": 72.0,
    "calories_burnt_today": 320,
    "target_calories": 500,
    "weight_history": [{ "date": "2025-02-01", "weight_kg": 81.0 }]
  },
  "morning_habits": [{ "id": "uuid", "name": "Meditation", "completed": true, "streak": 14 }],
  "life_habits": [{ "id": "uuid", "name": "No sugar", "completed": false, "streak": 7 }],
  "timed_tasks": [{
    "id": "uuid", "name": "Deep work",
    "minutes_today": 45, "target_minutes": 60,
    "streak_days": 31, "prompt_add_task": true
  }],
  "overall_completion_pct": 73
}

All endpoints
Method
Path
Notes
GET
/dashboard/summary
Aggregated dashboard payload
POST
/logs
{ habit_id, completed, note? }
POST
/body-stats
{ weight_kg, calories_burnt, target_calories }
POST
/timed-tasks
{ name, target_minutes? } — append only
POST
/task-sessions
{ task_id, minutes_done, note? }
POST
/journals
{ went_well, went_bad, reflection? }
GET
/setup/status
{ is_locked, start_date, day_number, end_date }
POST
/setup/preview
Parses habits MD, returns list. No DB write.
POST
/setup/lock
Commits setup. sha256 hash stored. 409 if already locked.
GET
/setup/config
Read-only config + config_hash
POST
/setup/new-session
Archives config, clears lock, triggers redirect to /setup
GET
/report/summary
Full 90-day report. 404 if day < 90.
POST
/webhook/whatsapp
Twilio webhook receiver


MCP server (MCPServer class)
7 tools exposed to Claude.ai. Each calls existing service classes — no direct DB access.
Tool
Parameters
What it does
log_habit
habit_name, note?
Fuzzy match + log today
get_streak
habit_name
Current streak
list_habits
category?
All habits
write_journal
went_well, went_bad, reflection?
Save today's entry
get_summary
—
Today's dashboard summary
add_timed_task
name, target_minutes?
Add new 90-day task
log_task_session
task_name, minutes
Log time for a task

Register in Claude.ai: Settings → Integrations → Add MCP server → http://localhost:8000/mcp

ReminderService jobs
Job method
Schedule
Action
morning_nudge
7:00am daily
WhatsApp: habits ready
evening_check
9:00pm daily
Check incomplete habits, send nudges
streak_milestone
8:00pm daily
Check 30-day timed task streaks, prompt new task
weekly_summary
Sunday 8pm
GPT weekly review via WhatsApp
streak_recalc
Midnight
Recompute all streaks from habit_logs
report_trigger
Midnight
If today = end_date → call ReportService.generate()


One-time setup flow
Immutability is enforced at three levels — all three must be implemented:
Frontend — middleware.ts redirects away from /setup permanently once locked. No edit controls ever render.
API — SetupService.require_unlocked() is called at the top of every write endpoint. Returns HTTP 403 if locked.
Database — Postgres trigger on habits blocks any INSERT or UPDATE if is_locked = true.
Setup wizard steps (setup/page.tsx):
Profile — name, start date
Habits — paste markdown, live preview via POST /setup/preview
Goals — start weight, target weight, calorie target, WhatsApp number
Lock — read-only review, checkbox confirmation, red "Lock & Begin 90 Days" button. On success: show config_hash, redirect to /dashboard after 3 seconds.
Middleware routing (middleware.ts):
Not locked → always redirect to /setup
Locked → /setup redirects to /dashboard

90-day completion report
Trigger: report_trigger job in ReminderService fires at midnight on end_date. Calls ReportService.generate().
ReportService.generate() steps:
Aggregate stats (per-habit %, streaks, weight history, task stats, day-of-week patterns)
Call LLMService.call_json() with the coaching prompt
Write result to reports table
Call WhatsAppService.send() with a completion message
Dashboard shows a report-ready banner
Coaching prompt (inside ReportService):
You are a personal habit coach analysing a completed 90-day program.
Given the statistics below, return JSON with three keys:
- "strengths": 3-4 sentences. What the person excelled at. Cite specific numbers.
- "improvements": 3-4 sentences. Where they struggled. Identify patterns, not just low scores.
- "next_session": 2-3 sentences. Concrete recommendations for the next 90 days.

Return ONLY valid JSON. No preamble, no fences.
Statistics: {stats_json}

Report page sections (report/page.tsx):
Hero — overall %, weight change, date range
Four stat cards — overall %, weight lost, best streak, journaling days
Habit completion bar chart (morning + life) + weight line chart + timed task summary
GPT strengths — green cards
GPT improvements — amber cards
Day-of-week bar chart (Mon–Sun average completion %)
CTA buttons — "Start new 90 days" | "Export PDF"

Phased implementation plan
Phase 1 — Foundation (days 1–3)
Goal: Database live, backend running, every endpoint testable in Postman.
Run full SQL schema in Supabase (and local Docker Postgres)
docker-compose.yml
config.py — Settings class (pydantic-settings)
database.py — DatabaseClient class (singleton)
All repositories: HabitRepository, LogRepository, StreakRepository, BodyStatsRepository, TaskRepository, JournalRepository
Services: StreakService, DashboardService
All routers: habits, logs, streaks, body_stats, timed_tasks, journals, dashboard
seed/seed_habits.py — HabitSeeder class, run once
Test every endpoint with Postman
Claude Code session prompt:
"Read ARCHITECTURE.md and CLAUDE.md. Implement Phase 1. Use the class architecture exactly — repositories for DB access, services for business logic, thin routers. Start with config.py (Settings), then database.py (DatabaseClient), then repositories in order, then services, then routers. Use the exact API response shapes from the contracts section."

Phase 1b — Setup flow (immediately after Phase 1)
Goal: One-time setup wizard works end-to-end. Habits lock permanently after submit.
SetupRepository, SetupService (sha256 hash, lock logic, require_unlocked())
routers/setup.py — all 4 endpoints
frontend/src/app/setup/page.tsx — 4-step wizard
middleware.ts — routing gate
Postgres trigger in DB (if not already run with schema)
Test: full wizard → lock → verify 403 on any habit write
Claude Code session prompt:
"Read ARCHITECTURE.md and CLAUDE.md. Implement Phase 1b — the one-time setup flow. Build SetupRepository and SetupService with sha256 hash generation and require_unlocked() guard. Build routers/setup.py. Build the 4-step setup wizard in Next.js. Build middleware.ts routing gate. Verify the Postgres trigger is in place."

Phase 2 — Dashboard frontend (days 4–8)
Goal: Web dashboard is live and reads from the API.
npx create-next-app@latest frontend --typescript --tailwind --app
npm install recharts @radix-ui/react-progress lucide-react swr
lib/types.ts — mirror all Pydantic models
lib/api.ts — typed fetch wrappers
hooks/useDashboard.ts — SWR hook for /dashboard/summary
Components in order: StatCard → WeightChart → CalorieGauge → HabitGrid → TimedTaskList → StreakHeatmap
dashboard/page.tsx — assemble all components
Claude Code session prompt:
"Read ARCHITECTURE.md and CLAUDE.md. Implement Phase 2 — the dashboard frontend. Follow the component structure exactly. API base URL from NEXT_PUBLIC_API_URL. Recharts for all charts. Design: clean, minimal, no gradients, generous whitespace."

Phase 3 — MCP server (days 9–10)
Goal: You can log habits and journals by talking to Claude.ai.
pip install fastmcp
mcp/server.py — MCPServer class with all 7 tools
Each tool calls existing service classes — no direct DB access in MCP layer
Mount at /mcp in main.py
Register in Claude.ai settings
Test: "Log meditation for today" → row appears in habit_logs
Claude Code session prompt:
"Read ARCHITECTURE.md and CLAUDE.md. Implement Phase 3 — the MCP server. Build MCPServer class in mcp/server.py using FastMCP. Each tool must delegate to existing service and repository classes. No direct database calls from MCPServer. Mount at /mcp in main.py."

Phase 4 — WhatsApp bot (days 11–14)
Goal: You can text your habits and get reminders.
Twilio WhatsApp sandbox setup, configure webhook URL
WhatsAppService class — Twilio send/receive
WebhookService class — parses incoming message via LLMService, returns structured action, executes via service classes
routers/webhook.py
Test end-to-end with real WhatsApp messages
Claude Code session prompt:
"Read ARCHITECTURE.md and CLAUDE.md. Implement Phase 4 — the WhatsApp bot. Build WhatsAppService and WebhookService classes. WebhookService calls LLMService.call_json() to parse the incoming text into a structured action object, then executes it using the appropriate service class. The system prompt must list all habit names."

Phase 5 — Reminders + polish (days 15–18)
Goal: Reminders work, journal page exists, app feels complete.
pip install apscheduler
ReminderService class — all 6 jobs as class methods, started in main.py lifespan
journal/page.tsx — frontend journal entry page
Streak milestone badge on dashboard (shows "30 days!" when triggered)
Deploy: Vercel (frontend) + Railway (backend)
Claude Code session prompt:
"Read ARCHITECTURE.md and CLAUDE.md. Implement Phase 5 — reminders and polish. Build ReminderService with all 6 jobs as methods. Start in main.py lifespan event. Add the journal page. Add the streak milestone badge to the dashboard."

Phase 5b — 90-day report (after Phase 5)
Goal: Completion report auto-generates on Day 90 and is viewable.
ReportRepository, ReportService — stats computation + LLMService.call_json()
routers/report.py
report_trigger job in ReminderService calls ReportService.generate()
frontend/src/app/report/page.tsx — all sections as described above
Test: manually trigger report, verify WhatsApp message, verify page renders correctly
Claude Code session prompt:
"Read ARCHITECTURE.md and CLAUDE.md. Implement Phase 5b — the 90-day completion report. Build ReportRepository and ReportService. ReportService.generate() aggregates all stats, calls LLMService.call_json() with the coaching prompt, writes to the reports table, and calls WhatsAppService.send(). Build the full report page."

CLAUDE.md template — create this file, update it at the end of every session
# CLAUDE.md — Session status

## Current phase
Phase 1 — Foundation

## Completed last session
- SQL schema run in Supabase and Docker
- docker-compose.yml
- config.py (Settings class)
- database.py (DatabaseClient)
- HabitRepository, LogRepository

## In progress
- StreakRepository, BodyStatsRepository, TaskRepository, JournalRepository

## Start here next session
Finish remaining repositories, then implement StreakService and DashboardService,
then implement all routers in order.

## Decisions made
- Using pydantic-settings v2 for config
- Supabase client uses service_role key for server-side repo calls
- Docker DB URL: postgresql://habituser:habitpass@db:5432/habitdb


Goal Setting Feature
A goal-planning system for tracking progress across various life aspects. Goals can be created manually or (in the future) generated by AI from a user's vision description sent via WhatsApp.

Objective
Allow users to define goals across categories (health, career, personal, financial, social, learning, other), set measurable targets, and track progress over time. This is the foundation for future LLM-powered goal generation where the WhatsApp bot captures a user's vision and creates structured goals automatically.

Database tables
- goals — id, category, title, description, target_value, current_value, unit, start_date, target_date, status (active/completed/paused/abandoned), source (manual/whatsapp_bot/llm), timestamps
- goal_logs — id, goal_id, log_date, value, note, created_at

Backend classes
- GoalRepository (repositories/goal_repo.py) — CRUD + progress logging
- GoalService (services/goal_service.py) — business logic, progress computation, LLM placeholder
- Router (routers/goals.py) — thin endpoints

API endpoints
| Method | Path | Notes |
|--------|------|-------|
| GET | /goals | List all goals (optional ?status= filter) |
| POST | /goals | Create a new goal |
| GET | /goals/{id} | Goal detail with progress logs |
| PUT | /goals/{id} | Update goal (status, value, etc.) |
| POST | /goals/{id}/progress | Log progress entry, updates current_value |
| DELETE | /goals/{id} | Delete a goal |
| POST | /goals/from-llm | Placeholder: LLM parses vision text into goals |

Frontend
- Goals page (app/goals/page.tsx) — full CRUD, category filters, progress logging
- GoalSection (components/dashboard/GoalSection.tsx) — compact dashboard widget showing top active goals
- useGoals hook (hooks/useGoals.ts) — SWR data fetching

Future LLM integration (not yet implemented)
1. User sends a vision description to the WhatsApp bot (e.g., "I want to lose weight, read more, and save money")
2. WebhookService routes the message to GoalService.create_goals_from_llm()
3. GoalService calls LLMService.call_json() with a prompt that extracts structured goals (category, title, target, timeline)
4. Parsed goals are created via GoalRepository.create(source="llm")
5. User sees the goals appear on their Goals page and dashboard

The /goals/from-llm endpoint and GoalService.create_goals_from_llm() are placeholder stubs ready for this integration.


Scalability — how to extend correctly
Every extension follows the same class pattern. No exceptions.
New feature → new service class + repository class if DB needed + thin router
New habit category → add CHECK constraint + habits.md section + dashboard card in DashboardService
New MCP tool → add method to MCPServer class
New reminder → add method to ReminderService class
New dashboard widget → new component + add data to DashboardService.get_summary()
Multi-user → add user_id UUID to every table + Supabase Auth injected into DatabaseClient

Required services
Service
Purpose
Cost
Supabase
Production database
Free (500MB)
Docker Desktop
Local database
Free
Twilio
WhatsApp
Free sandbox
OpenAI
GPT-4o mini
~$0.001/1K tokens
Vercel
Frontend
Free tier
Railway
Backend
$5/month

Python requirements (backend/requirements.txt)
fastapi==0.115.0
uvicorn==0.30.0
supabase==2.7.0
pydantic==2.7.0
pydantic-settings==2.4.0
python-dotenv==1.0.0
openai==1.50.0
httpx==0.27.0
fastmcp==0.1.0
twilio==9.3.0
apscheduler==3.10.4

Node requirements (frontend/package.json)
{
  "next": "14.2.0",
  "react": "18.3.0",
  "typescript": "5.4.0",
  "tailwindcss": "3.4.0",
  "recharts": "2.12.0",
  "lucide-react": "0.383.0",
  "@radix-ui/react-progress": "1.1.0",
  "swr": "2.2.5"
}


