from fastapi import APIRouter, Depends
from models.log import LogCreate
from dependencies import get_log_repo, get_streak_service
from repositories.log_repo import LogRepository
from services.streak_service import StreakService

router = APIRouter(tags=["logs"])


@router.post("/logs")
async def create_log(
    data: LogCreate,
    log_repo: LogRepository = Depends(get_log_repo),
    streak_service: StreakService = Depends(get_streak_service),
):
    await log_repo.upsert(data.habit_id, data.completed, data.note)
    # Recalculate streaks after logging
    await streak_service.recalculate_all()
    return {"status": "ok"}
