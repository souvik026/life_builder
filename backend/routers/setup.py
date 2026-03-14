from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from models.setup import SetupLockRequest, SetupStatus, SetupConfig, HabitPreview, TimedTaskPreview
from dependencies import get_setup_service
from services.setup_service import SetupService

router = APIRouter(prefix="/setup", tags=["setup"])


class PreviewRequest(BaseModel):
    markdown: str


@router.get("/status", response_model=SetupStatus)
async def get_setup_status(
    service: SetupService = Depends(get_setup_service),
):
    return await service.get_status()


@router.post("/preview", response_model=list[HabitPreview])
async def preview_habits(
    data: PreviewRequest,
    service: SetupService = Depends(get_setup_service),
):
    return service.preview_habits(data.markdown)


class TaskPreviewRequest(BaseModel):
    raw: str


@router.post("/preview-tasks", response_model=list[TimedTaskPreview])
async def preview_timed_tasks(
    data: TaskPreviewRequest,
    service: SetupService = Depends(get_setup_service),
):
    return service.preview_timed_tasks(data.raw)


@router.post("/lock")
async def lock_setup(
    data: SetupLockRequest,
    service: SetupService = Depends(get_setup_service),
):
    config_hash = await service.lock(
        user_name=data.user_name,
        start_date=data.start_date,
        start_weight=data.start_weight,
        target_weight=data.target_weight,
        target_calories=data.target_calories,
        whatsapp_number=data.whatsapp_number,
        habits_md_raw=data.habits_md_raw,
        timed_tasks_raw=data.timed_tasks_raw,
    )
    return {"config_hash": config_hash}


@router.get("/config", response_model=SetupConfig)
async def get_setup_config(
    service: SetupService = Depends(get_setup_service),
):
    config = await service.get_config()
    if not config:
        raise HTTPException(status_code=404, detail="No setup config found.")
    return config
