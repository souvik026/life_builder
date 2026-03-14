-- Habit Tracker Database Schema
-- Runs automatically on first docker-compose up

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Habits ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habits (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    category    TEXT NOT NULL CHECK (category IN ('morning', 'evening', 'life')),
    description TEXT DEFAULT '',
    sort_order  INT DEFAULT 0,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Habit Logs ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id    UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    log_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    completed   BOOLEAN NOT NULL DEFAULT false,
    note        TEXT DEFAULT '',
    created_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE (habit_id, log_date)
);

-- ── Streaks ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS streaks (
    habit_id        UUID PRIMARY KEY REFERENCES habits(id) ON DELETE CASCADE,
    current_streak  INT DEFAULT 0,
    longest_streak  INT DEFAULT 0,
    last_completed  DATE,
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── Journals ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS journals (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_date  DATE NOT NULL DEFAULT CURRENT_DATE,
    entry_type  TEXT DEFAULT 'journal' CHECK (entry_type IN ('journal', 'note')),
    title       TEXT DEFAULT '',
    went_well   TEXT DEFAULT '',
    went_bad    TEXT DEFAULT '',
    reflection  TEXT DEFAULT '',
    ai_insight  TEXT DEFAULT '',
    mood        TEXT DEFAULT NULL CHECK (mood IN ('great', 'good', 'okay', 'bad', 'terrible')),
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Timed Tasks ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS timed_tasks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    target_days     INT DEFAULT 90,
    target_minutes  INT DEFAULT 60,
    start_date      DATE DEFAULT CURRENT_DATE,
    is_active       BOOLEAN DEFAULT true,
    added_at        TIMESTAMPTZ DEFAULT now()
);

-- ── Task Sessions ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS task_sessions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id       UUID NOT NULL REFERENCES timed_tasks(id) ON DELETE CASCADE,
    session_date  DATE NOT NULL DEFAULT CURRENT_DATE,
    minutes_done  INT NOT NULL DEFAULT 0,
    note          TEXT DEFAULT '',
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── Body Stats ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS body_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_date       DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
    weight_kg       NUMERIC(5,2),
    calories_burnt  INT DEFAULT 0,
    target_calories INT DEFAULT 500,
    notes           TEXT DEFAULT '',
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── Setup Config (singleton) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS setup_config (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name       TEXT NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE GENERATED ALWAYS AS (start_date + 89) STORED,
    start_weight    NUMERIC(5,2),
    target_weight   NUMERIC(5,2),
    target_calories INT DEFAULT 500,
    whatsapp_number TEXT DEFAULT '',
    habits_md_raw   TEXT DEFAULT '',
    timed_tasks_raw TEXT DEFAULT '',
    config_hash     TEXT,
    is_locked       BOOLEAN DEFAULT false,
    locked_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- Enforce singleton: only one row allowed
CREATE UNIQUE INDEX IF NOT EXISTS setup_config_singleton ON setup_config ((true));

-- ── Reports ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generated_at      TIMESTAMPTZ DEFAULT now(),
    overall_pct       NUMERIC(5,2),
    weight_start      NUMERIC(5,2),
    weight_end        NUMERIC(5,2),
    best_streak_habit TEXT,
    best_streak_days  INT,
    habit_stats       JSONB DEFAULT '{}',
    task_stats        JSONB DEFAULT '{}',
    dow_stats         JSONB DEFAULT '{}',
    ai_strengths      TEXT DEFAULT '',
    ai_improvements   TEXT DEFAULT '',
    ai_next_session   TEXT DEFAULT '',
    created_at        TIMESTAMPTZ DEFAULT now()
);

-- ── Goals ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS goals (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category      TEXT NOT NULL CHECK (category IN ('health', 'career', 'personal', 'financial', 'social', 'learning', 'other')),
    title         TEXT NOT NULL,
    description   TEXT DEFAULT '',
    target_value  NUMERIC(10,2),
    current_value NUMERIC(10,2) DEFAULT 0,
    unit          TEXT DEFAULT '',
    start_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    target_date   DATE,
    status        TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'abandoned')),
    source        TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'whatsapp_bot', 'llm')),
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ── Goal Logs ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS goal_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id     UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    log_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    value       NUMERIC(10,2) NOT NULL,
    note        TEXT DEFAULT '',
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Trigger: prevent habit mutation after lock ──────────────────────────
CREATE OR REPLACE FUNCTION prevent_habit_mutation()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM setup_config WHERE is_locked = true) THEN
        RAISE EXCEPTION 'Cannot modify habits after setup is locked';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS habits_lock_trigger ON habits;
CREATE TRIGGER habits_lock_trigger
    BEFORE INSERT OR UPDATE ON habits
    FOR EACH ROW
    EXECUTE FUNCTION prevent_habit_mutation();
