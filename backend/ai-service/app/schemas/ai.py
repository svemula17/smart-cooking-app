"""Pydantic request and response schemas for the AI service."""

from __future__ import annotations

from typing import Any, Generic, List, Literal, Optional, TypeVar
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# ---------- Chat ----------

class ChatContext(BaseModel):
    recipe_name: Optional[str] = None
    current_step: Optional[str] = None
    ingredients_available: Optional[List[str]] = None


class ChatRequest(BaseModel):
    user_id: UUID
    recipe_id: Optional[UUID] = None
    message: str = Field(min_length=1, max_length=2000)
    conversation_id: Optional[str] = None
    context: Optional[ChatContext] = None
    is_premium: bool = False


class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    tokens_used: int
    cached: bool = False


# ---------- Substitution ----------

class SubstituteRequest(BaseModel):
    ingredient_name: str = Field(min_length=1, max_length=100)
    recipe_context: Optional[str] = None
    dietary_restrictions: List[str] = Field(default_factory=list)


class Substitute(BaseModel):
    name: str
    ratio: str
    notes: str


class SubstituteResponse(BaseModel):
    substitutes: List[Substitute]


# ---------- Multi-dish coordinator ----------

class CoordinationStep(BaseModel):
    step_number: int
    instruction: str
    time_minutes: Optional[int] = None


class CoordinationRecipe(BaseModel):
    id: str
    name: str
    prep_time: int = Field(ge=0, le=600)
    cook_time: int = Field(ge=0, le=600)
    steps: List[CoordinationStep] = Field(default_factory=list)


class MultiDishRequest(BaseModel):
    recipes: List[CoordinationRecipe] = Field(min_length=1, max_length=10)
    serve_at: Optional[str] = Field(
        default=None, description="Optional ISO time for the meal. Defaults to start = now."
    )


class StepSchedule(BaseModel):
    time: str
    step: str


class TimelineEntry(BaseModel):
    recipe_id: str
    recipe_name: str
    start_time_minutes: int
    start_time_display: str
    finish_time_display: str
    steps_schedule: List[StepSchedule]


class MultiDishResponse(BaseModel):
    timeline: dict[str, TimelineEntry]
    total_time_minutes: int
    finish_time_display: str


# ---------- Variety ----------

class VarietyRequest(BaseModel):
    user_id: UUID
    days_back: int = Field(default=30, ge=1, le=365)
    limit: int = Field(default=10, ge=1, le=50)


class VarietySuggestion(BaseModel):
    id: UUID
    name: str
    cuisine_type: str
    reason: str


class VarietyResponse(BaseModel):
    suggestions: List[VarietySuggestion]
    variety_score: int
    underused_cuisines: List[str]
    cooked_cuisines: dict[str, int]
    reasoning: str


# ---------- Troubleshoot ----------

class TroubleshootRequest(BaseModel):
    problem: str = Field(min_length=1, max_length=500)
    recipe_context: Optional[str] = None


class TroubleshootSolution(BaseModel):
    action: str
    explanation: str


class TroubleshootResponse(BaseModel):
    solutions: List[TroubleshootSolution]
    tokens_used: int


# ---------- Tips ----------

class TipsRequest(BaseModel):
    recipe_id: UUID


class TipsResponse(BaseModel):
    tips: List[str]
    cached: bool = False


# ---------- Envelopes ----------

T = TypeVar("T")


class ApiSuccess(BaseModel, Generic[T]):
    success: Literal[True] = True
    data: T


class ApiError(BaseModel):
    success: Literal[False] = False
    error: dict[str, Any]


# ---------- Internal types ----------

class ConversationTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    timestamp: str

    model_config = ConfigDict(from_attributes=True)
