from pydantic import BaseModel


class Goal(BaseModel):
    """Full goal record from database."""
    id: str
    category: str  # "health" | "career" | "personal" | "financial" | "social" | "learning" | "other"
    title: str
    description: str = ""
    target_value: float | None = None
    current_value: float = 0
    unit: str = ""
    start_date: str
    target_date: str | None = None
    status: str = "active"  # "active" | "completed" | "paused" | "abandoned"
    source: str = "manual"  # "manual" | "whatsapp_bot" | "llm"
    created_at: str | None = None
    updated_at: str | None = None


class GoalCreate(BaseModel):
    """Request payload for creating a goal."""
    category: str
    title: str
    description: str = ""
    target_value: float | None = None
    unit: str = ""
    target_date: str | None = None


class GoalUpdate(BaseModel):
    """Partial update payload."""
    status: str | None = None
    current_value: float | None = None
    description: str | None = None
    target_date: str | None = None
    target_value: float | None = None


class GoalLogCreate(BaseModel):
    """Request payload for logging progress."""
    value: float
    note: str = ""


class GoalLog(BaseModel):
    """Goal progress log entry."""
    id: str
    goal_id: str
    log_date: str
    value: float
    note: str = ""
    created_at: str | None = None


class GoalSummary(BaseModel):
    """Enriched goal with computed progress fields."""
    id: str
    category: str
    title: str
    description: str = ""
    current_value: float
    target_value: float | None = None
    unit: str = ""
    progress_pct: float = 0  # 0-100
    days_remaining: int | None = None
    status: str = "active"
    source: str = "manual"


class GoalDetail(BaseModel):
    """Goal with its progress logs."""
    goal: Goal
    logs: list[GoalLog] = []


class LLMGoalRequest(BaseModel):
    """Placeholder for LLM-generated goals."""
    raw_text: str
