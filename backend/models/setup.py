from pydantic import BaseModel


class SetupLockRequest(BaseModel):
    user_name: str
    start_date: str
    start_weight: float
    target_weight: float
    target_calories: int = 500
    whatsapp_number: str = ""
    habits_md_raw: str
    timed_tasks_raw: str = ""


class SetupStatus(BaseModel):
    """Matches frontend SetupStatus interface."""
    is_locked: bool
    start_date: str | None = None
    day_number: int = 0
    end_date: str | None = None


class SetupConfig(BaseModel):
    """Matches frontend SetupConfig interface."""
    user_name: str
    start_date: str
    end_date: str
    start_weight: float
    target_weight: float
    target_calories: int
    whatsapp_number: str
    habits_md_raw: str
    timed_tasks_raw: str
    config_hash: str
    is_locked: bool


class HabitPreview(BaseModel):
    """Matches frontend HabitPreview interface."""
    name: str
    category: str  # "morning" | "evening" | "life"
    description: str = ""


class TimedTaskPreview(BaseModel):
    """Parsed timed task from raw text."""
    name: str
    target_minutes: int = 60
