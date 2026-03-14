# API Reference

Base URL: `http://localhost:8001` (Docker) or `http://localhost:8000` (direct uvicorn)

## Endpoints

### Dashboard
| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard/summary` | Returns aggregated dashboard data |

**Response** (`DashboardSummary`):
```json
{
  "date": "2026-03-14",
  "day_number": 42,
  "habits": [...],
  "habit_logs_today": [...],
  "streaks": [...],
  "timed_tasks": [...],
  "task_sessions_today": [...],
  "body_stats_today": { "weight_kg": 75.5, "calories": 2100 },
  "journal_today": { ... },
  "weight_history": [...],
  "calorie_history": [...],
  "completion_rate_7d": 0.85,
  "mood_history": [...],
  "goal_summary": { "active": 3, "completed": 1, "goals": [...] }
}
```

### Habit Logs
| Method | Path | Description |
|--------|------|-------------|
| POST | `/logs` | Log a habit completion |

**Request** (`LogCreate`):
```json
{ "habit_id": "uuid", "date": "2026-03-14", "value": 1 }
```

### Body Stats
| Method | Path | Description |
|--------|------|-------------|
| POST | `/body-stats` | Log weight and/or calories |

**Request** (`BodyStatsCreate`):
```json
{ "date": "2026-03-14", "weight_kg": 75.5, "calories": 2100 }
```

### Timed Tasks
| Method | Path | Description |
|--------|------|-------------|
| POST | `/timed-tasks` | Create a new timed task |
| POST | `/task-sessions` | Log a task session |

**Task Session Request**:
```json
{ "task_id": "uuid", "date": "2026-03-14", "duration_minutes": 30 }
```

### Journals
| Method | Path | Description |
|--------|------|-------------|
| POST | `/journals` | Save a journal entry |

**Request** (`JournalCreate`):
```json
{
  "date": "2026-03-14",
  "mood": "happy",
  "energy_level": 4,
  "notes": "Great day!",
  "gratitude": ["family", "sunshine"],
  "tags": ["productive"]
}
```

### Setup
| Method | Path | Description |
|--------|------|-------------|
| GET | `/setup/status` | Check if setup is already locked |
| POST | `/setup/preview` | Parse habits markdown, return preview |
| POST | `/setup/lock` | Lock setup + seed habits into DB |
| GET | `/setup/config` | Read current setup config |

### Goals
| Method | Path | Description |
|--------|------|-------------|
| GET | `/goals` | List goals (optional `?status=active\|completed\|abandoned`) |
| POST | `/goals` | Create a new goal |
| GET | `/goals/{id}` | Goal detail with progress logs |
| PUT | `/goals/{id}` | Update a goal |
| POST | `/goals/{id}/progress` | Log a progress entry |
| DELETE | `/goals/{id}` | Delete a goal |
| POST | `/goals/from-llm` | Placeholder: LLM-generated goals (not implemented) |

**Goal Create Request**:
```json
{
  "title": "Run a 5K",
  "description": "Train to run 5km without stopping",
  "category": "fitness",
  "target_value": 5.0,
  "unit": "km",
  "deadline": "2026-06-01",
  "source": "manual"
}
```

**Goal categories**: `fitness`, `health`, `learning`, `productivity`, `mindfulness`, `custom`
**Goal sources**: `manual`, `whatsapp_bot`, `llm`
**Goal statuses**: `active`, `completed`, `abandoned`

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check (returns `{"status": "ok"}`) |
