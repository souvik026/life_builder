from datetime import date
from repositories.goal_repo import GoalRepository
from models.goal import Goal, GoalCreate, GoalUpdate, GoalLogCreate, GoalLog, GoalSummary, GoalDetail


class GoalService:
    def __init__(self, goal_repo: GoalRepository):
        self.goal_repo = goal_repo

    async def get_all_goals(self, status: str | None = None) -> list[GoalSummary]:
        goals = await self.goal_repo.get_all(status=status)
        return [self._to_summary(g) for g in goals]

    async def create_goal(self, data: GoalCreate) -> Goal:
        return await self.goal_repo.create(
            category=data.category,
            title=data.title,
            description=data.description,
            target_value=data.target_value,
            unit=data.unit,
            target_date=data.target_date,
        )

    async def update_goal(self, goal_id: str, data: GoalUpdate) -> Goal | None:
        fields = data.model_dump(exclude_none=True)
        return await self.goal_repo.update(goal_id, **fields)

    async def log_progress(self, goal_id: str, data: GoalLogCreate) -> GoalLog:
        log = await self.goal_repo.log_progress(goal_id, data.value, data.note)
        # Update the goal's current_value to the latest logged value
        await self.goal_repo.update(goal_id, current_value=data.value)
        return log

    async def get_goal_detail(self, goal_id: str) -> GoalDetail | None:
        goal = await self.goal_repo.get_by_id(goal_id)
        if not goal:
            return None
        logs = await self.goal_repo.get_logs(goal_id)
        return GoalDetail(goal=goal, logs=logs)

    async def delete_goal(self, goal_id: str) -> None:
        await self.goal_repo.delete(goal_id)

    async def create_goals_from_llm(self, raw_text: str) -> list[Goal]:
        """Placeholder for LLM-generated goals.

        TODO: When LLMService is available, this will:
        1. Send raw_text to LLMService.call_json() with a prompt that asks
           the LLM to extract structured goals from the user's vision description
        2. Parse the response into GoalCreate objects
        3. Create each goal via self.goal_repo.create(source="llm")

        Future integration: WhatsApp bot sends user's vision text here,
        LLM parses it into actionable goals with categories, targets, and timelines.
        """
        return []

    def _to_summary(self, goal: Goal) -> GoalSummary:
        progress_pct = 0.0
        if goal.target_value and goal.target_value > 0:
            progress_pct = min((goal.current_value / goal.target_value) * 100, 100)

        days_remaining = None
        if goal.target_date:
            try:
                target = date.fromisoformat(goal.target_date)
                delta = (target - date.today()).days
                days_remaining = max(delta, 0)
            except ValueError:
                pass

        return GoalSummary(
            id=goal.id,
            category=goal.category,
            title=goal.title,
            description=goal.description,
            current_value=goal.current_value,
            target_value=goal.target_value,
            unit=goal.unit,
            progress_pct=round(progress_pct, 1),
            days_remaining=days_remaining,
            status=goal.status,
            source=goal.source,
        )
