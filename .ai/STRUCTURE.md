# Project File Structure

```
habit_tracker/
├── .ai/                          # THIS FOLDER — AI context docs
├── .gitignore                    # node_modules, .next, .env, __pycache__, etc.
├── Architecture.md               # Full project specification (source of truth)
├── CLAUDE.md                     # Claude Code session log
├── docker-compose.yml            # Postgres 16 + FastAPI backend
│
├── backend/
│   ├── Dockerfile                # Python 3.12 slim
│   ├── requirements.txt          # fastapi, uvicorn, asyncpg, pydantic, etc.
│   ├── .env.example              # Template: DATABASE_URL=postgresql://...
│   ├── .env                      # Local env (GITIGNORED, not in repo)
│   ├── main.py                   # FastAPI app entry, CORS config, lifespan
│   ├── config.py                 # Settings class (pydantic-settings, reads .env)
│   ├── database.py               # DatabaseClient class (asyncpg connection pool)
│   ├── dependencies.py           # FastAPI Depends() factories for DI
│   ├── schema.sql                # Full Postgres DDL (11 tables + trigger)
│   │
│   ├── models/                   # Pydantic request/response models
│   │   ├── habit.py              # Habit, HabitCreate
│   │   ├── log.py                # HabitLog, LogCreate
│   │   ├── journal.py            # JournalEntry, JournalCreate
│   │   ├── body_stats.py         # BodyStats, BodyStatsCreate
│   │   ├── timed_task.py         # TimedTask, TaskSession
│   │   ├── setup.py              # SetupConfig, SetupPreview
│   │   ├── dashboard.py          # DashboardSummary (aggregated response)
│   │   └── goal.py               # Goal, GoalCreate, GoalLog
│   │
│   ├── repositories/             # Data access layer (raw SQL via asyncpg)
│   │   ├── habit_repo.py         # CRUD for habits table
│   │   ├── log_repo.py           # CRUD for habit_logs table
│   │   ├── streak_repo.py        # Read/write streaks table
│   │   ├── journal_repo.py       # CRUD for journals table
│   │   ├── body_stats_repo.py    # CRUD for body_stats table
│   │   ├── task_repo.py          # CRUD for timed_tasks + task_sessions
│   │   ├── setup_repo.py         # CRUD for setup_config table
│   │   └── goal_repo.py          # CRUD for goals + goal_logs tables
│   │
│   ├── services/                 # Business logic
│   │   ├── streak_service.py     # Streak calculation and updates
│   │   ├── dashboard_service.py  # Aggregates data for dashboard summary
│   │   ├── setup_service.py      # Setup wizard logic (parse markdown, lock)
│   │   └── goal_service.py       # Goal CRUD + LLM placeholder
│   │
│   ├── routers/                  # HTTP endpoint handlers
│   │   ├── dashboard.py          # GET /dashboard/summary
│   │   ├── logs.py               # POST /logs
│   │   ├── body_stats.py         # POST /body-stats
│   │   ├── timed_tasks.py        # POST /timed-tasks, POST /task-sessions
│   │   ├── journals.py           # POST /journals
│   │   ├── setup.py              # GET/POST /setup/*
│   │   └── goals.py              # Full CRUD /goals/*
│   │
│   └── seed/
│       ├── habits.md             # Default habits markdown (parsed during setup)
│       └── seed_habits.py        # Script to seed habits into DB
│
├── frontend/
│   ├── package.json              # Dependencies (next 16, react 19, recharts, swr, etc.)
│   ├── tsconfig.json             # TypeScript config
│   ├── next.config.ts            # Next.js config
│   ├── postcss.config.mjs        # PostCSS with Tailwind v4 plugin
│   │
│   ├── app/
│   │   ├── layout.tsx            # Root layout (Google Fonts, NavBar, global providers)
│   │   ├── page.tsx              # "/" → redirects to /dashboard
│   │   ├── globals.css           # Full theme: @theme inline tokens, animations, scrollbar
│   │   ├── dashboard/page.tsx    # Main dashboard (banner, quotes, stats, charts, goals)
│   │   ├── goals/page.tsx        # Goal CRUD page (create, edit, log progress, delete)
│   │   ├── journal/page.tsx      # Journal entry (mood, body stats, task sessions, notes)
│   │   └── setup/page.tsx        # 4-step setup wizard (paste markdown → preview → lock)
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── Banner.tsx             # Rotating banner collage (6 SVGs)
│   │   │   ├── QuoteCard.tsx          # Daily motivational quote
│   │   │   ├── GoalSection.tsx        # Active goals summary on dashboard
│   │   │   ├── CalorieGauge.tsx       # Circular calorie progress
│   │   │   ├── WeightChart.tsx        # Weight trend line chart
│   │   │   ├── StreakHeatmap.tsx       # GitHub-style streak heatmap
│   │   │   ├── TimedTaskList.tsx       # Timed task progress list
│   │   │   ├── CompletionTrendChart.tsx # Habit completion over time
│   │   │   ├── MoodTrendChart.tsx      # Mood trend visualization
│   │   │   └── TaskTimeChart.tsx       # Time spent on tasks chart
│   │   │
│   │   ├── journal/
│   │   │   ├── MoodPicker.tsx         # Emoji mood selector
│   │   │   ├── BodyStatsInput.tsx     # Weight + calorie inputs
│   │   │   ├── TaskSessionInput.tsx   # Log time for timed tasks
│   │   │   └── JournalSidebar.tsx     # Past entries sidebar
│   │   │
│   │   └── ui/
│   │       ├── Card.tsx               # Reusable card container
│   │       ├── Badge.tsx              # Status/category badge
│   │       ├── ProgressRing.tsx       # SVG circular progress ring
│   │       └── NavBar.tsx             # Top nav (Dashboard, Goals, Journal, Setup)
│   │
│   ├── hooks/
│   │   ├── useDashboard.ts       # SWR hook for dashboard summary
│   │   ├── useHabits.ts          # Habits data hook
│   │   ├── useGoals.ts           # Goals CRUD hook
│   │   └── useJournal.ts         # Journal submission hook
│   │
│   ├── lib/
│   │   ├── types.ts              # All TypeScript interfaces (matches backend models)
│   │   └── api.ts                # API client + mock data fallback
│   │
│   └── public/
│       └── banners/
│           ├── banner-1.svg      # Placeholder SVG banners (swap with real images)
│           ├── banner-2.svg
│           ├── banner-3.svg
│           ├── banner-4.svg
│           ├── banner-5.svg
│           └── banner-6.svg
```
