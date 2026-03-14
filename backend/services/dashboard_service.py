from datetime import date
from repositories.habit_repo import HabitRepository
from repositories.log_repo import LogRepository
from repositories.streak_repo import StreakRepository
from repositories.body_stats_repo import BodyStatsRepository
from repositories.task_repo import TaskRepository
from repositories.setup_repo import SetupRepository
from repositories.journal_repo import JournalRepository
from models.dashboard import (
    DashboardSummary, BodySummary, HabitSummary, TimedTaskSummary,
    CompletionTrendPoint, MoodTrendPoint, TaskTimeBar,
)


class DashboardService:
    def __init__(
        self,
        habit_repo: HabitRepository,
        log_repo: LogRepository,
        streak_repo: StreakRepository,
        body_stats_repo: BodyStatsRepository,
        task_repo: TaskRepository,
        setup_repo: SetupRepository,
        journal_repo: JournalRepository,
    ):
        self.habit_repo = habit_repo
        self.log_repo = log_repo
        self.streak_repo = streak_repo
        self.body_stats_repo = body_stats_repo
        self.task_repo = task_repo
        self.setup_repo = setup_repo
        self.journal_repo = journal_repo

    async def get_summary(self) -> DashboardSummary:
        # Setup info
        status = await self.setup_repo.get_status()
        config = await self.setup_repo.get_config()

        # Body stats
        today_stats = await self.body_stats_repo.get_today()
        weight_history = await self.body_stats_repo.get_weight_history()
        current_weight = await self.body_stats_repo.get_latest_weight()

        target_weight = float(config.target_weight) if config else 72.0
        target_calories = config.target_calories if config else 500

        body = BodySummary(
            current_weight_kg=current_weight or (float(config.start_weight) if config else 0),
            target_weight_kg=target_weight,
            calories_burnt_today=today_stats["calories_burnt"] if today_stats else 0,
            target_calories=target_calories,
            weight_history=weight_history,
        )

        # Habits
        morning_habits = await self._get_habits_with_status("morning")
        evening_habits = await self._get_habits_with_status("evening")
        life_habits = await self._get_habits_with_status("life")

        # Timed tasks
        timed_tasks = await self._get_timed_tasks()

        # Overall cumulative completion (across all days, not just today)
        all_habits = morning_habits + evening_habits + life_habits
        total_habits = len(all_habits)
        days_elapsed = max(status.day_number, 1)
        total_completed_ever = await self.log_repo.get_total_completed_count()
        total_possible = total_habits * days_elapsed
        pct = round(total_completed_ever / total_possible * 100) if total_possible > 0 else 0

        # Trend data
        completion_trend = await self._get_completion_trend()
        mood_trend = await self._get_mood_trend()
        task_time_distribution = await self._get_task_time_distribution()

        return DashboardSummary(
            today=str(date.today()),
            day_number=status.day_number,
            body=body,
            morning_habits=morning_habits,
            evening_habits=evening_habits,
            life_habits=life_habits,
            timed_tasks=timed_tasks,
            overall_completion_pct=pct,
            completion_trend=completion_trend,
            mood_trend=mood_trend,
            task_time_distribution=task_time_distribution,
        )

    async def _get_habits_with_status(self, category: str) -> list[HabitSummary]:
        habits = await self.habit_repo.get_all(category=category)
        result = []
        for h in habits:
            completed = await self.log_repo.get_completed_today(h.id)
            streak = await self.streak_repo.get_by_habit(h.id)
            result.append(HabitSummary(
                id=h.id,
                name=h.name,
                completed=completed,
                streak=streak,
            ))
        return result

    async def _get_timed_tasks(self) -> list[TimedTaskSummary]:
        tasks = await self.task_repo.get_all_active()
        result = []
        for t in tasks:
            minutes = await self.task_repo.get_minutes_today(t.id)
            streak = await self.task_repo.get_streak_days(t.id)
            result.append(TimedTaskSummary(
                id=t.id,
                name=t.name,
                minutes_today=minutes,
                target_minutes=t.target_minutes,
                streak_days=streak,
                prompt_add_task=streak >= 30,
            ))
        return result

    async def _get_completion_trend(self) -> list[CompletionTrendPoint]:
        rates = await self.log_repo.get_daily_completion_rates()
        return [CompletionTrendPoint(date=r["date"], pct=r["pct"]) for r in rates]

    async def _get_mood_trend(self) -> list[MoodTrendPoint]:
        history = await self.journal_repo.get_mood_history()
        return [MoodTrendPoint(date=r["date"], mood=r["mood"]) for r in history]

    async def _get_task_time_distribution(self) -> list[TaskTimeBar]:
        data = await self.task_repo.get_total_minutes_by_task()
        return [TaskTimeBar(name=r["name"], total_minutes=r["total_minutes"]) for r in data]
