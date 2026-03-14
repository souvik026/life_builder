from fastapi import APIRouter, Depends
from models.timed_task import TimedTask, TimedTaskCreate, TaskSessionCreate
from dependencies import get_task_repo
from repositories.task_repo import TaskRepository

router = APIRouter(tags=["timed-tasks"])


@router.get("/timed-tasks", response_model=list[TimedTask])
async def list_timed_tasks(
    repo: TaskRepository = Depends(get_task_repo),
):
    return await repo.get_all_active()


@router.post("/timed-tasks")
async def create_timed_task(
    data: TimedTaskCreate,
    repo: TaskRepository = Depends(get_task_repo),
):
    task = await repo.create(data.name, data.target_minutes)
    return task


@router.post("/task-sessions")
async def log_task_session(
    data: TaskSessionCreate,
    repo: TaskRepository = Depends(get_task_repo),
):
    await repo.log_session(data.task_id, data.minutes_done, data.note)
    return {"status": "ok"}
