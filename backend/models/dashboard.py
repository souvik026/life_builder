from pydantic import BaseModel


class BodySummary(BaseModel):
    current_weight_kg: float
    target_weight_kg: float
    calories_burnt_today: int
    target_calories: int
    weight_history: list[dict]  # [{"date": "YYYY-MM-DD", "weight_kg": float}]


class HabitSummary(BaseModel):
    """Matches frontend HabitStatus interface."""
    id: str
    name: str
    completed: bool
    streak: int


class TimedTaskSummary(BaseModel):
    """Matches frontend TimedTask interface."""
    id: str
    name: str
    minutes_today: int
    target_minutes: int
    streak_days: int
    prompt_add_task: bool


class CompletionTrendPoint(BaseModel):
    date: str
    pct: int


class MoodTrendPoint(BaseModel):
    date: str
    mood: str


class TaskTimeBar(BaseModel):
    name: str
    total_minutes: int


class DashboardSummary(BaseModel):
    """Matches frontend DashboardSummary interface."""
    today: str
    day_number: int
    body: BodySummary
    morning_habits: list[HabitSummary]
    evening_habits: list[HabitSummary]
    life_habits: list[HabitSummary]
    timed_tasks: list[TimedTaskSummary]
    overall_completion_pct: int
    completion_trend: list[CompletionTrendPoint] = []
    mood_trend: list[MoodTrendPoint] = []
    task_time_distribution: list[TaskTimeBar] = []
