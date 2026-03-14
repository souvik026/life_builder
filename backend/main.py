from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dependencies import db
from routers import dashboard, logs, body_stats, timed_tasks, journals, setup, goals


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: connect to database
    await db.connect()
    yield
    # Shutdown: close database pool
    await db.close()


app = FastAPI(
    title="Habit Tracker API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend (Next.js on port 3000 or Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(dashboard.router)
app.include_router(logs.router)
app.include_router(body_stats.router)
app.include_router(timed_tasks.router)
app.include_router(journals.router)
app.include_router(setup.router)
app.include_router(goals.router)


@app.get("/health")
async def health():
    try:
        # Check database
        await db.execute("SELECT 1")
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": str(e)}, 500
