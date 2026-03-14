from fastapi import HTTPException
from repositories.setup_repo import SetupRepository
from repositories.habit_repo import HabitRepository
from repositories.task_repo import TaskRepository
from models.setup import HabitPreview, TimedTaskPreview, SetupStatus, SetupConfig


class SetupService:
    def __init__(self, setup_repo: SetupRepository, habit_repo: HabitRepository, task_repo: TaskRepository):
        self.setup_repo = setup_repo
        self.habit_repo = habit_repo
        self.task_repo = task_repo

    async def require_unlocked(self) -> None:
        if await self.setup_repo.is_locked():
            raise HTTPException(status_code=403, detail="Setup is locked. Cannot modify habits.")

    async def get_status(self) -> SetupStatus:
        return await self.setup_repo.get_status()

    async def get_config(self) -> SetupConfig | None:
        return await self.setup_repo.get_config()

    def preview_habits(self, markdown: str) -> list[HabitPreview]:
        """Parse markdown into habit previews (no DB write)."""
        habits: list[HabitPreview] = []
        current_category = "morning"
        for line in markdown.split("\n"):
            lower = line.lower().strip()
            # Detect heading lines (## or colon-based)
            if ("##" in line or ":" in line) and not line.strip().startswith(("-", "*")):
                if "morning" in lower:
                    current_category = "morning"
                    continue
                elif any(kw in lower for kw in ("evening", "night", "afternoon")):
                    current_category = "evening"
                    continue
                elif any(kw in lower for kw in ("life", "daily", "general", "habit")):
                    current_category = "life"
                    continue
            # Match "- habit name" or "* habit name"
            stripped = line.strip()
            if stripped.startswith(("-", "*")) and len(stripped) > 2:
                name = stripped.lstrip("-* ").strip()
                if name:
                    habits.append(HabitPreview(name=name, category=current_category, description=""))
        return habits

    def preview_timed_tasks(self, raw: str) -> list[TimedTaskPreview]:
        """Parse timed tasks text. Format: 'Task name - minutes' or just 'Task name'."""
        tasks: list[TimedTaskPreview] = []
        for line in raw.strip().split("\n"):
            line = line.strip().lstrip("-* ").strip()
            if not line:
                continue
            if " - " in line:
                parts = line.rsplit(" - ", 1)
                name = parts[0].strip()
                try:
                    minutes = max(int(parts[1].strip()), 60)
                except ValueError:
                    minutes = 60
            else:
                name = line
                minutes = 60
            if name:
                tasks.append(TimedTaskPreview(name=name, target_minutes=minutes))
        return tasks

    async def lock(
        self,
        user_name: str,
        start_date: str,
        start_weight: float,
        target_weight: float,
        target_calories: int,
        whatsapp_number: str,
        habits_md_raw: str,
        timed_tasks_raw: str = "",
    ) -> str:
        """Lock setup, seed habits + timed tasks, return config_hash."""
        if await self.setup_repo.is_locked():
            raise HTTPException(status_code=409, detail="Setup is already locked.")

        # Parse and create habits
        previews = self.preview_habits(habits_md_raw)
        for i, h in enumerate(previews):
            await self.habit_repo.create(
                name=h.name,
                category=h.category,
                description=h.description,
                sort_order=i,
            )

        # Parse and create timed tasks
        if timed_tasks_raw.strip():
            task_previews = self.preview_timed_tasks(timed_tasks_raw)
            for t in task_previews:
                await self.task_repo.create(name=t.name, target_minutes=t.target_minutes)

        # Create and lock config
        config_hash = await self.setup_repo.create_and_lock(
            user_name=user_name,
            start_date=start_date,
            start_weight=start_weight,
            target_weight=target_weight,
            target_calories=target_calories,
            whatsapp_number=whatsapp_number,
            habits_md_raw=habits_md_raw,
            timed_tasks_raw=timed_tasks_raw,
        )
        return config_hash
