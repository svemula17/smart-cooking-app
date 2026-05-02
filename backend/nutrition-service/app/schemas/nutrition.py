"""Pydantic schemas — request bodies, response envelopes, and shared types.

All response handlers wrap successful payloads in ``ApiSuccess`` and errors
are surfaced via FastAPI's ``HTTPException`` mapped through a global handler
into ``ApiError`` shape. Keeps the public contract consistent with the other
microservices in this monorepo.
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Any, Generic, List, Literal, Optional, TypeVar
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

MealType = Literal["Breakfast", "Lunch", "Dinner", "Snack"]


class IngredientInput(BaseModel):
    """One line in a recipe's ingredient list."""

    name: str = Field(min_length=1, max_length=255)
    quantity: float = Field(gt=0, le=10_000)
    unit: str = Field(min_length=1, max_length=50)


class NutritionTotals(BaseModel):
    """Per-call or per-serving macro totals returned by the calculator."""

    calories: float = 0.0
    protein_g: float = 0.0
    carbs_g: float = 0.0
    fat_g: float = 0.0
    fiber_g: float = 0.0
    sodium_mg: float = 0.0


class NutritionCalculateRequest(BaseModel):
    recipe_id: UUID
    servings: int = Field(default=1, ge=1, le=20)
    ingredients: List[IngredientInput]

    @field_validator("ingredients")
    @classmethod
    def _at_least_one(cls, v: List[IngredientInput]) -> List[IngredientInput]:
        if len(v) == 0:
            raise ValueError("ingredients must not be empty")
        return v


class NutritionCalculateResponse(BaseModel):
    total_nutrition: NutritionTotals
    per_serving: NutritionTotals
    servings: int


class NutritionLogRequest(BaseModel):
    user_id: UUID
    recipe_id: UUID
    servings_consumed: float = Field(gt=0, le=20)
    meal_type: MealType
    log_date: date = Field(alias="date")
    auto_logged: bool = False

    model_config = ConfigDict(populate_by_name=True)


class NutritionLogEntry(BaseModel):
    id: UUID
    user_id: UUID
    recipe_id: Optional[UUID]
    log_date: date = Field(serialization_alias="date")
    meal_type: str
    servings_consumed: float
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    logged_at: datetime
    auto_logged: bool

    model_config = ConfigDict(populate_by_name=True)


class MealSummary(BaseModel):
    """Compact meal entry inside the daily summary response."""

    log_id: UUID
    meal_type: str
    recipe_id: Optional[UUID]
    recipe_name: Optional[str]
    servings_consumed: float
    calories: float
    protein: float
    carbs: float
    fat: float
    auto_logged: bool
    logged_at: datetime


class MacroGoals(BaseModel):
    calories: int = 2000
    protein: float = 100
    carbs: float = 250
    fat: float = 65


class MacroProgress(BaseModel):
    """Percentage of the day's goal achieved per macro. Capped at 999 to keep
    the response size predictable when users vastly exceed their goals."""

    calories_percent: int
    protein_percent: int
    carbs_percent: int
    fat_percent: int


class DailySummary(BaseModel):
    date: date
    user_id: UUID
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float
    goals: MacroGoals
    progress: MacroProgress
    meals: List[MealSummary]


class WeeklySummary(BaseModel):
    start_date: date
    end_date: date
    days: List[DailySummary]


class MonthlyWeekBucket(BaseModel):
    """One week's rollup inside a monthly summary."""

    week_start: date
    week_end: date
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float
    days_logged: int


class MonthlySummary(BaseModel):
    start_date: date
    end_date: date
    weeks: List[MonthlyWeekBucket]
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float


T = TypeVar("T")


class ApiSuccess(BaseModel, Generic[T]):
    success: Literal[True] = True
    data: T


class ApiError(BaseModel):
    success: Literal[False] = False
    error: dict[str, Any]
