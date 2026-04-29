from datetime import datetime
from pydantic import BaseModel, Field


class IngredientInput(BaseModel):
    name: str
    quantity_g: float = Field(gt=0)


class NutritionRequest(BaseModel):
    ingredients: list[IngredientInput]


class NutritionInfo(BaseModel):
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float = 0.0
    sugar_g: float = 0.0


class LogEntry(BaseModel):
    id: str | None = None
    user_id: str
    recipe_id: str | None = None
    meal_type: str
    nutrition: NutritionInfo
    consumed_at: datetime
