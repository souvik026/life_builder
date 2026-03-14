from pydantic import BaseModel
from datetime import datetime


class TimedTask(BaseModel):
    id: str
    name: str
    target_days: int = 90
    target_minutes: int = 60
    start_date: str | None = None
    is_active: bool = True
    added_at: datetime | None = None


class TimedTaskCreate(BaseModel):
    name: str
    target_minutes: int = 60


class TaskSessionCreate(BaseModel):
    task_id: str
    minutes_done: int
    note: str = ""
