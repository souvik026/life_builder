from pydantic import BaseModel


class BodyStatsCreate(BaseModel):
    weight_kg: float
    calories_burnt: int
    target_calories: int = 500
