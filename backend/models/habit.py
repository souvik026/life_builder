from pydantic import BaseModel
from datetime import datetime


class Habit(BaseModel):
    id: str
    name: str
    category: str  # "morning" | "life"
    description: str = ""
    sort_order: int = 0
    is_active: bool = True
    created_at: datetime | None = None


class HabitWithStatus(BaseModel):
    """Matches frontend HabitStatus interface."""
    id: str
    name: str
    completed: bool
    streak: int
