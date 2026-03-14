from fastapi import APIRouter, Depends
from models.goal import Goal, GoalCreate, GoalUpdate, GoalLogCreate, GoalLog, GoalSummary, GoalDetail, LLMGoalRequest
from services.goal_service import GoalService
from dependencies import get_goal_service

router = APIRouter(prefix="/goals", tags=["goals"])


@router.get("/", response_model=list[GoalSummary])
async def list_goals(
    status: str | None = None,
    service: GoalService = Depends(get_goal_service),
):
    return await service.get_all_goals(status=status)


@router.post("/", response_model=Goal)
async def create_goal(
    data: GoalCreate,
    service: GoalService = Depends(get_goal_service),
):
    return await service.create_goal(data)


@router.get("/{goal_id}", response_model=GoalDetail)
async def get_goal(
    goal_id: str,
    service: GoalService = Depends(get_goal_service),
):
    detail = await service.get_goal_detail(goal_id)
    if not detail:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Goal not found")
    return detail


@router.put("/{goal_id}", response_model=Goal)
async def update_goal(
    goal_id: str,
    data: GoalUpdate,
    service: GoalService = Depends(get_goal_service),
):
    goal = await service.update_goal(goal_id, data)
    if not goal:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@router.post("/{goal_id}/progress", response_model=GoalLog)
async def log_goal_progress(
    goal_id: str,
    data: GoalLogCreate,
    service: GoalService = Depends(get_goal_service),
):
    return await service.log_progress(goal_id, data)


@router.delete("/{goal_id}")
async def delete_goal(
    goal_id: str,
    service: GoalService = Depends(get_goal_service),
):
    await service.delete_goal(goal_id)
    return {"ok": True}


@router.post("/from-llm", response_model=list[Goal])
async def create_goals_from_llm(
    data: LLMGoalRequest,
    service: GoalService = Depends(get_goal_service),
):
    """Placeholder: will use LLMService to parse vision text into structured goals."""
    return await service.create_goals_from_llm(data.raw_text)
