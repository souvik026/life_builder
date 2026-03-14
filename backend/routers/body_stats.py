from fastapi import APIRouter, Depends
from models.body_stats import BodyStatsCreate
from dependencies import get_body_stats_repo
from repositories.body_stats_repo import BodyStatsRepository

router = APIRouter(tags=["body-stats"])


@router.post("/body-stats")
async def log_body_stats(
    data: BodyStatsCreate,
    repo: BodyStatsRepository = Depends(get_body_stats_repo),
):
    await repo.upsert_today(data.weight_kg, data.calories_burnt, data.target_calories)
    return {"status": "ok"}
