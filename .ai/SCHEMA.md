# Database Schema

PostgreSQL 16. Full DDL in `backend/schema.sql`.

## Tables (11 total)

### `habits`
Core habit definitions, seeded during setup.
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK, default gen_random_uuid() |
| name | TEXT | NOT NULL |
| category | TEXT | NOT NULL |
| description | TEXT | |
| frequency | TEXT | 'daily' or 'weekly' |
| target_value | NUMERIC | Default 1 |
| unit | TEXT | Default 'times' |
| active | BOOLEAN | Default true |
| created_at | TIMESTAMPTZ | Default now() |

### `habit_logs`
Daily completion logs for each habit.
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| habit_id | UUID | FK → habits |
| date | DATE | NOT NULL |
| value | NUMERIC | Default 1 |
| created_at | TIMESTAMPTZ | |
| **UNIQUE** | | (habit_id, date) |

### `streaks`
Precomputed streak data per habit.
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| habit_id | UUID | FK → habits, UNIQUE |
| current_streak | INT | Default 0 |
| longest_streak | INT | Default 0 |
| last_logged_date | DATE | |

### `journals`
Daily journal entries with mood tracking.
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| date | DATE | UNIQUE, NOT NULL |
| mood | TEXT | |
| energy_level | INT | |
| notes | TEXT | |
| gratitude | TEXT[] | Array |
| tags | TEXT[] | Array |
| created_at | TIMESTAMPTZ | |

### `body_stats`
Daily weight and calorie tracking.
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| date | DATE | UNIQUE, NOT NULL |
| weight_kg | NUMERIC | |
| calories | INT | |
| created_at | TIMESTAMPTZ | |

### `timed_tasks`
Tasks that track time spent (e.g., meditation, reading).
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | TEXT | NOT NULL |
| category | TEXT | |
| target_minutes | INT | Daily target |
| active | BOOLEAN | Default true |
| created_at | TIMESTAMPTZ | |

### `task_sessions`
Individual time sessions logged for timed tasks.
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| task_id | UUID | FK → timed_tasks |
| date | DATE | NOT NULL |
| duration_minutes | INT | NOT NULL |
| created_at | TIMESTAMPTZ | |

### `setup_config`
Single-row table tracking setup wizard state.
| Column | Type | Notes |
|--------|------|-------|
| id | INT | PK, default 1 |
| locked | BOOLEAN | Default false |
| habits_markdown | TEXT | Raw markdown pasted by user |
| locked_at | TIMESTAMPTZ | |

### `reports`
Placeholder for future weekly/monthly reports.
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| type | TEXT | 'weekly' or 'monthly' |
| start_date | DATE | |
| end_date | DATE | |
| data | JSONB | |
| created_at | TIMESTAMPTZ | |

### `goals`
User-defined goals with progress tracking.
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| title | TEXT | NOT NULL |
| description | TEXT | |
| category | TEXT | NOT NULL |
| target_value | NUMERIC | |
| current_value | NUMERIC | Default 0 |
| unit | TEXT | |
| deadline | DATE | |
| status | TEXT | Default 'active' |
| source | TEXT | Default 'manual' (manual/whatsapp_bot/llm) |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `goal_logs`
Progress entries for each goal.
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| goal_id | UUID | FK → goals |
| value | NUMERIC | NOT NULL |
| note | TEXT | |
| created_at | TIMESTAMPTZ | |

## Trigger
- `update_goals_updated_at` — auto-updates `goals.updated_at` on row modification.

## Conventions
- All PKs are UUID with `gen_random_uuid()`
- Dates use `DATE` type, timestamps use `TIMESTAMPTZ`
- No soft deletes — rows are actually deleted
- Single-user app — no user_id columns
