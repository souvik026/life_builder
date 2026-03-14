from config import Settings
from database import DatabaseClient
from repositories.habit_repo import HabitRepository
from repositories.log_repo import LogRepository
from repositories.streak_repo import StreakRepository
from repositories.journal_repo import JournalRepository
from repositories.body_stats_repo import BodyStatsRepository
from repositories.task_repo import TaskRepository
from repositories.setup_repo import SetupRepository
from services.streak_service import StreakService
from services.dashboard_service import DashboardService
from services.setup_service import SetupService
from repositories.goal_repo import GoalRepository
from services.goal_service import GoalService

# Singletons (initialized in main.py lifespan)
settings = Settings()
db = DatabaseClient(settings)


# ── Repository factories ─────────────────────────────────────────────────

def get_habit_repo() -> HabitRepository:
    return HabitRepository(db)


def get_log_repo() -> LogRepository:
    return LogRepository(db)


def get_streak_repo() -> StreakRepository:
    return StreakRepository(db)


def get_journal_repo() -> JournalRepository:
    return JournalRepository(db)


def get_body_stats_repo() -> BodyStatsRepository:
    return BodyStatsRepository(db)


def get_task_repo() -> TaskRepository:
    return TaskRepository(db)


def get_setup_repo() -> SetupRepository:
    return SetupRepository(db)


def get_goal_repo() -> GoalRepository:
    return GoalRepository(db)


# ── Service factories ────────────────────────────────────────────────────

def get_streak_service() -> StreakService:
    return StreakService(
        habit_repo=get_habit_repo(),
        log_repo=get_log_repo(),
        streak_repo=get_streak_repo(),
    )


def get_dashboard_service() -> DashboardService:
    return DashboardService(
        habit_repo=get_habit_repo(),
        log_repo=get_log_repo(),
        streak_repo=get_streak_repo(),
        body_stats_repo=get_body_stats_repo(),
        task_repo=get_task_repo(),
        setup_repo=get_setup_repo(),
        journal_repo=get_journal_repo(),
    )


def get_setup_service() -> SetupService:
    return SetupService(
        setup_repo=get_setup_repo(),
        habit_repo=get_habit_repo(),
        task_repo=get_task_repo(),
    )


def get_goal_service() -> GoalService:
    return GoalService(goal_repo=get_goal_repo())
