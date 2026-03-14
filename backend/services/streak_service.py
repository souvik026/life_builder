from datetime import date, timedelta
from repositories.habit_repo import HabitRepository
from repositories.log_repo import LogRepository
from repositories.streak_repo import StreakRepository


class StreakService:
    def __init__(
        self,
        habit_repo: HabitRepository,
        log_repo: LogRepository,
        streak_repo: StreakRepository,
    ):
        self.habit_repo = habit_repo
        self.log_repo = log_repo
        self.streak_repo = streak_repo

    async def recalculate_all(self) -> None:
        habits = await self.habit_repo.get_all()
        for habit in habits:
            current, longest, last = await self._calculate_streak(habit.id)
            await self.streak_repo.upsert(habit.id, current, longest, last)

    async def _calculate_streak(self, habit_id: str) -> tuple[int, int, date | None]:
        dates = await self.log_repo.get_completed_dates(habit_id)
        if not dates:
            return 0, 0, None

        date_set = set(dates)
        last_completed = dates[0]

        # Current streak: consecutive days ending today (or yesterday)
        current = 0
        check = date.today()
        if check not in date_set:
            check -= timedelta(days=1)  # Allow yesterday
        while check in date_set:
            current += 1
            check -= timedelta(days=1)

        # Longest streak
        longest = 0
        streak = 0
        prev = None
        for d in sorted(dates):
            if prev and (d - prev).days == 1:
                streak += 1
            else:
                streak = 1
            longest = max(longest, streak)
            prev = d

        return current, longest, last_completed
