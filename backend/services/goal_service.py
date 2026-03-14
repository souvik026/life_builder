from datetime import date
from repositories.goal_repo import GoalRepository
from services.llm_service import LLMService
from models.goal import Goal, GoalCreate, GoalUpdate, GoalLogCreate, GoalLog, GoalSummary, GoalDetail


class GoalService:
    def __init__(self, goal_repo: GoalRepository, llm_service: LLMService | None = None):
        self.goal_repo = goal_repo
        self.llm_service = llm_service

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
        """Parse a user's vision description into structured goals using LLM."""
        if not self.llm_service:
            return []

        system_prompt = (
            "You are a personal goal-setting coach. The user will describe their vision, "
            "aspirations, or what they want to achieve. Extract structured, measurable goals from their description.\n\n"
            "Return a JSON array of goal objects. Each object must have:\n"
            '- "category": one of "health", "career", "personal", "financial", "social", "learning", "other"\n'
            '- "title": a short, clear goal title (max 60 chars)\n'
            '- "description": 1-2 sentence description of what success looks like\n'
            '- "target_value": a numeric target if measurable, or null\n'
            '- "unit": the unit of measurement (e.g. "kg", "books", "$", "hours"), or "" if no numeric target\n'
            '- "target_date": ISO date string (YYYY-MM-DD) for a reasonable deadline, or null\n\n'
            "Extract 3-7 goals. Be specific and actionable. Make targets realistic."
        )

        try:
            result = await self.llm_service.call_json(raw_text, system=system_prompt)
            goals_data = result if isinstance(result, list) else result.get("goals", [])
        except Exception:
            return []

        created: list[Goal] = []
        for g in goals_data:
            try:
                goal = await self.goal_repo.create(
                    category=g.get("category", "other"),
                    title=g.get("title", "Untitled Goal"),
                    description=g.get("description", ""),
                    target_value=g.get("target_value"),
                    unit=g.get("unit", ""),
                    target_date=g.get("target_date"),
                    source="llm",
                )
                created.append(goal)
            except Exception:
                continue
        return created

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
