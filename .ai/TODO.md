# Project Status & Next Steps

## What's DONE

### Backend (Complete)
- [x] FastAPI app with CORS, lifespan, health check
- [x] asyncpg database client with connection pooling
- [x] Pydantic v2 models for all entities
- [x] Repository layer (8 repos, raw SQL)
- [x] Service layer (streak, dashboard, setup, goal)
- [x] Router layer (7 routers, all CRUD endpoints)
- [x] Docker Compose (Postgres 16 + backend with hot reload)
- [x] Database schema (11 tables + trigger)
- [x] Seed script for default habits
- [x] Dependency injection via FastAPI Depends()

### Frontend (Complete)
- [x] Next.js 16 app with App Router
- [x] Green aesthetic UI (Fraunces + Outfit fonts, forest/emerald/mint palette)
- [x] Dashboard page (banner, quotes, stat cards, habit grids, charts, goals section)
- [x] Goals page (full CRUD: create, edit, log progress, delete)
- [x] Journal page (mood picker, body stats, task sessions, notes, sidebar)
- [x] Setup wizard (4-step: paste markdown → preview → confirm → lock)
- [x] NavBar with 4 links
- [x] Custom components (Card, Badge, ProgressRing)
- [x] SWR hooks for data fetching
- [x] API client with mock data fallback
- [x] Banner collage (6 SVG placeholders)
- [x] Charts (weight, calories, completion trends, mood, task time)

## What's NEXT (Priority Order)

### 1. Test with Docker
- Run `docker-compose up` and verify all backend endpoints work
- Seed habits via setup wizard or seed script
- Test full frontend → backend flow with `NEXT_PUBLIC_API_URL=http://localhost:8001`

### 2. Deploy
- **Frontend**: Deploy to Vercel
  - Set `NEXT_PUBLIC_API_URL` env var pointing to backend
- **Backend + DB**: Deploy to Railway
  - Provision Postgres, set `DATABASE_URL`
  - Deploy backend Docker image

### 3. Polish & Bugs (if any found during testing)
- Fix any API integration issues
- Handle edge cases (empty states, error states)
- Add loading skeletons where needed

## What's DELIBERATELY SKIPPED (Placeholders Exist)

These features have placeholder code but are not implemented:

| Feature | Placeholder Location | Notes |
|---------|---------------------|-------|
| LLM goal generation | `backend/services/goal_service.py` → `create_goals_from_llm()` | Returns 501 Not Implemented |
| WhatsApp bot | Not started | Architecture.md has spec |
| MCP server | Not started | Architecture.md has spec |
| Reminder service | Not started | Architecture.md has spec |
| Report page | `frontend/app/report/` (empty) | Backend ReportService not built |
| Auth/login | Not needed | Single-user app |

## Conventions to Follow

1. **Backend**: One class per file. Repos for SQL, services for logic, thin routers.
2. **Frontend**: Custom UI components only (no shadcn). Tailwind v4 CSS config.
3. **Types**: Keep `frontend/lib/types.ts` in sync with `backend/models/*.py`.
4. **Architecture.md**: Update when adding features. It's the source of truth.
5. **Mock data**: If adding new API calls, add mock fallback in `lib/api.ts`.
