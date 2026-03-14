# Local Development Setup

## Prerequisites
- Node.js 20+ (for frontend)
- Python 3.12+ (for backend, or use Docker)
- Docker & Docker Compose (for database + backend)

## Option 1: Full Stack with Docker

### Start backend + database
```bash
# From project root
docker-compose up
```
This starts:
- **Postgres 16** on port 5432 (auto-runs `backend/schema.sql` on first start)
- **FastAPI backend** on port 8001 (with hot reload)

### Start frontend
```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8001 npm run dev
```
Frontend runs on http://localhost:3000

### Seed initial habits
Either use the Setup Wizard in the UI, or:
```bash
cd backend
python seed/seed_habits.py
```

## Option 2: Frontend Only (Mock Data)

```bash
cd frontend
npm install
npm run dev
```
Without `NEXT_PUBLIC_API_URL`, the API client automatically returns mock data. Good for UI development.

## Option 3: Backend Without Docker

```bash
# Start Postgres separately, then:
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Environment Variables

### Frontend
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | No | (none → mock mode) | Backend API base URL |

### Backend
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |

## Useful Commands

```bash
# Frontend
cd frontend && npm run dev      # Dev server (port 3000)
cd frontend && npm run build    # Production build
cd frontend && npm run lint     # ESLint

# Backend (with Docker)
docker-compose up               # Start all services
docker-compose up -d            # Start in background
docker-compose down             # Stop all
docker-compose logs backend     # View backend logs
docker-compose exec db psql -U habituser habitdb  # DB shell

# Backend (without Docker)
cd backend && uvicorn main:app --reload  # Dev server (port 8000)

# API testing
curl http://localhost:8001/health
curl http://localhost:8001/dashboard/summary
```

## Deployment Target
- **Frontend**: Vercel (set `NEXT_PUBLIC_API_URL` env var)
- **Backend + DB**: Railway (provision Postgres, deploy Docker image)
