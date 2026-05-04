"""HTTP routes for the AI service.

All endpoints (except /health, exposed at the app level) require a bearer
JWT. Quota is consumed per request to the LLM-backed endpoints (chat,
troubleshoot, tips). Substitution and variety endpoints don't hit the LLM
and don't consume quota.
"""

from __future__ import annotations

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID

from app.config.database import get_db
from app.config.redis import RedisProtocol, get_redis
from app.middleware.auth import AuthenticatedUser, CurrentUser, assert_owner
from app.middleware.rate_limiter import consume_quota
from app.schemas.ai import (
    ApiSuccess,
    ChatRequest,
    ChatResponse,
    MultiDishRequest,
    MultiDishResponse,
    SubstituteRequest,
    SubstituteResponse,
    TipsRequest,
    TipsResponse,
    TroubleshootRequest,
    TroubleshootResponse,
    VarietyRequest,
    VarietyResponse,
)
from app.services.ai_assistant import CookingAssistant
from app.services.multi_dish_coordinator import MultiDishCoordinator
from app.services.substitution_service import get_substitutes
from app.services.variety_algorithm import VarietyAlgorithm

router = APIRouter()


# ============================================================================
# 1. POST /ai/chat
# ============================================================================

@router.post(
    "/chat",
    response_model=ApiSuccess[ChatResponse],
    summary="AI cooking assistant chat",
)
async def chat(
    body: ChatRequest,
    user: AuthenticatedUser = CurrentUser,
    redis: RedisProtocol = Depends(get_redis),
) -> ApiSuccess[ChatResponse]:
    assert_owner(user, str(body.user_id))
    await consume_quota(redis, user_id=str(body.user_id), is_premium=body.is_premium)

    assistant = CookingAssistant(redis=redis)
    response, conversation_id, tokens, cached = await assistant.ask(
        message=body.message,
        context=body.context,
        conversation_id=body.conversation_id,
    )
    return ApiSuccess(
        data=ChatResponse(
            response=response,
            conversation_id=conversation_id,
            tokens_used=tokens,
            cached=cached,
        )
    )


# ============================================================================
# 2. POST /ai/substitute
# ============================================================================

@router.post(
    "/substitute",
    response_model=ApiSuccess[SubstituteResponse],
    summary="Suggest ingredient substitutes",
)
async def substitute(
    body: SubstituteRequest,
    user: AuthenticatedUser = CurrentUser,
) -> ApiSuccess[SubstituteResponse]:
    subs = get_substitutes(
        ingredient=body.ingredient_name,
        dietary_restrictions=body.dietary_restrictions,
    )
    return ApiSuccess(data=SubstituteResponse(substitutes=subs))


# ============================================================================
# 3. POST /ai/multi-dish/coordinate
# ============================================================================

@router.post(
    "/multi-dish/coordinate",
    response_model=ApiSuccess[MultiDishResponse],
    summary="Coordinate cooking timeline for multiple dishes",
)
async def coordinate_multi_dish(
    body: MultiDishRequest,
    user: AuthenticatedUser = CurrentUser,
) -> ApiSuccess[MultiDishResponse]:
    from datetime import datetime

    serve_at = None
    if body.serve_at:
        try:
            serve_at = datetime.fromisoformat(body.serve_at.replace("Z", "+00:00"))
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": f"Invalid serve_at: {exc}", "code": "VALIDATION_ERROR"},
            ) from exc

    coordinator = MultiDishCoordinator()
    response = coordinator.coordinate(body.recipes, serve_at=serve_at)
    return ApiSuccess(data=response)


# ============================================================================
# 4. POST /ai/variety/suggest
# ============================================================================

@router.post(
    "/variety/suggest",
    response_model=ApiSuccess[VarietyResponse],
    summary="Suggest cuisines/recipes for daily variety",
)
async def variety_suggest(
    body: VarietyRequest,
    user: AuthenticatedUser = CurrentUser,
    pool: asyncpg.Pool = Depends(get_db),
) -> ApiSuccess[VarietyResponse]:
    assert_owner(user, str(body.user_id))
    algorithm = VarietyAlgorithm(pool)
    result = await algorithm.suggest(
        user_id=body.user_id,
        days_back=body.days_back,
        limit=body.limit,
    )
    return ApiSuccess(data=VarietyResponse(**result))


# ============================================================================
# 5. POST /ai/troubleshoot
# ============================================================================

@router.post(
    "/troubleshoot",
    response_model=ApiSuccess[TroubleshootResponse],
    summary="Cooking troubleshooting suggestions",
)
async def troubleshoot(
    body: TroubleshootRequest,
    user: AuthenticatedUser = CurrentUser,
    redis: RedisProtocol = Depends(get_redis),
) -> ApiSuccess[TroubleshootResponse]:
    await consume_quota(redis, user_id=user.user_id, is_premium=False)
    assistant = CookingAssistant(redis=redis)
    solutions, tokens = await assistant.troubleshoot(
        problem=body.problem,
        recipe_context=body.recipe_context,
    )
    return ApiSuccess(
        data=TroubleshootResponse(solutions=solutions, tokens_used=tokens)
    )


# ============================================================================
# 6. POST /ai/tips
# ============================================================================

@router.post(
    "/tips",
    response_model=ApiSuccess[TipsResponse],
    summary="Cooking tips for a recipe",
)
async def tips(
    body: TipsRequest,
    user: AuthenticatedUser = CurrentUser,
    pool: asyncpg.Pool = Depends(get_db),
    redis: RedisProtocol = Depends(get_redis),
) -> ApiSuccess[TipsResponse]:
    async with pool.acquire() as conn:
        recipe = await conn.fetchrow(
            """
            SELECT name, cuisine_type, difficulty,
                   (prep_time_minutes + cook_time_minutes) AS total_minutes
              FROM recipes
             WHERE id = $1 AND deleted_at IS NULL
            """,
            body.recipe_id,
        )
    if recipe is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": "Recipe not found", "code": "NOT_FOUND"},
        )

    assistant = CookingAssistant(redis=redis)
    tips_list, cached = await assistant.tips(
        recipe_name=recipe["name"],
        cuisine_type=recipe["cuisine_type"] or "Unknown",
        difficulty=recipe["difficulty"] or "Medium",
        total_minutes=int(recipe["total_minutes"] or 0),
    )
    return ApiSuccess(data=TipsResponse(tips=tips_list, cached=cached))
