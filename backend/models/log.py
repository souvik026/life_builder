from pydantic import BaseModel


class LogCreate(BaseModel):
    habit_id: str
    completed: bool
    note: str = ""
