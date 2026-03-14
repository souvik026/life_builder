from fastapi import APIRouter, Depends
from models.dashboard import DashboardSummary
from dependencies import get_dashboard_service
from services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    service: DashboardService = Depends(get_dashboard_service),
):
    return await service.get_summary()
