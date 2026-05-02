"""HTTP routes for the nutrition service.

Each handler is async and uses the shared asyncpg pool obtained via the
``get_db`` dependency. Authentication is enforced per-route via the
``CurrentUser`` dependency. Request bodies are validated by Pydantic schemas;
unknown fields are stripped.
"""

from __future__ import annotations

from datetime import date as date_type
from typing import Optional
from uuid import UUID

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.config.database import get_db
from app.middleware.auth import AuthenticatedUser, CurrentUser, assert_owner
from app.models import nutrition_log as nl
from app.schemas.nutrition import (
    ApiSuccess,
    DailySummary,
    MonthlySummary,
    NutritionCalculateRequest,
    NutritionCalculateResponse,
    NutritionLogEntry,
    NutritionLogRequest,
    NutritionTotals,
    WeeklySummary,
)
from app.services import calculation_service as calc
from app.services.nutritionix_service import (
    NutritionixUnavailableError,
    nutritionix_service,
)

router = APIRouter()


# ============================================================================
# 1. POST /nutrition/calculate
# ============================================================================

@router.post(
    "/calculate",
    response_model=ApiSuccess[NutritionCalculateResponse],
    summary="Calculate nutrition for a list of ingredients",
)
async def calculate_nutrition(
    body: NutritionCalculateRequest,
    user: AuthenticatedUser = CurrentUser,
) -> ApiSuccess[NutritionCalculateResponse]:
    """Hits the Nutritionix natural-language endpoint (or the dev fallback) and
    returns total + per-serving macros."""
    try:
        totals = await nutritionix_service.lookup(body.ingredients)
    except NutritionixUnavailableError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"message": "Nutritionix API unavailable", "code": "UPSTREAM_UNAVAILABLE", "details": str(exc)},
        ) from exc

    response = NutritionCalculateResponse(
        total_nutrition=calc.round_totals(totals),
        per_serving=calc.round_totals(calc.per_serving(totals, body.servings)),
        servings=body.servings,
    )
    return ApiSuccess(data=response)


# ============================================================================
# 2. POST /nutrition/log
# ============================================================================

@router.post(
    "/log",
    response_model=ApiSuccess[NutritionLogEntry],
    status_code=status.HTTP_201_CREATED,
    summary="Log a meal (auto or manual)",
)
async def log_meal(
    body: NutritionLogRequest,
    user: AuthenticatedUser = CurrentUser,
    pool: asyncpg.Pool = Depends(get_db),
) -> ApiSuccess[NutritionLogEntry]:
    assert_owner(user, str(body.user_id))

    record = await calc.log_meal(
        pool,
        user_id=body.user_id,
        recipe_id=body.recipe_id,
        log_date=body.log_date,
        meal_type=body.meal_type,
        servings_consumed=body.servings_consumed,
        auto_logged=body.auto_logged,
    )
    return ApiSuccess(data=NutritionLogEntry(**dict(record)))


# ============================================================================
# 3. GET /nutrition/daily/{user_id}/{date}
# ============================================================================

@router.get(
    "/daily/{user_id}/{day}",
    response_model=ApiSuccess[DailySummary],
    summary="Daily nutrition summary",
)
async def get_daily_summary(
    user_id: UUID,
    day: date_type,
    user: AuthenticatedUser = CurrentUser,
    pool: asyncpg.Pool = Depends(get_db),
) -> ApiSuccess[DailySummary]:
    assert_owner(user, str(user_id))
    summary = await calc.build_daily_summary(pool, user_id=user_id, log_date=day)
    return ApiSuccess(data=summary)


# ============================================================================
# 4. GET /nutrition/logs/{user_id}
# ============================================================================

@router.get(
    "/logs/{user_id}",
    response_model=ApiSuccess[dict],
    summary="List logs for a user",
)
async def list_logs(
    user_id: UUID,
    user: AuthenticatedUser = CurrentUser,
    pool: asyncpg.Pool = Depends(get_db),
    start_date: Optional[date_type] = Query(default=None),
    end_date: Optional[date_type] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
) -> ApiSuccess[dict]:
    assert_owner(user, str(user_id))
    offset = (page - 1) * limit

    rows, total = await nl.list_logs(
        pool,
        user_id=user_id,
        start_date=start_date,
        end_date=end_date,
        limit=limit,
        offset=offset,
    )
    return ApiSuccess(
        data={
            "logs": [NutritionLogEntry(**dict(r)).model_dump(by_alias=True) for r in rows],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "totalPages": max(1, (total + limit - 1) // limit),
            },
        }
    )


# ============================================================================
# 5. GET /nutrition/weekly/{user_id}
# ============================================================================

@router.get(
    "/weekly/{user_id}",
    response_model=ApiSuccess[WeeklySummary],
    summary="Last-7-days nutrition summary",
)
async def get_weekly_summary(
    user_id: UUID,
    user: AuthenticatedUser = CurrentUser,
    pool: asyncpg.Pool = Depends(get_db),
    end: Optional[date_type] = Query(default=None, description="End date (inclusive); defaults to today"),
) -> ApiSuccess[WeeklySummary]:
    assert_owner(user, str(user_id))
    end_date = end or date_type.today()
    summary = await calc.build_weekly_summary(pool, user_id=user_id, end_date=end_date)
    return ApiSuccess(data=summary)


# ============================================================================
# 6. GET /nutrition/monthly/{user_id}
# ============================================================================

@router.get(
    "/monthly/{user_id}",
    response_model=ApiSuccess[MonthlySummary],
    summary="Last-30-days monthly summary aggregated by week",
)
async def get_monthly_summary(
    user_id: UUID,
    user: AuthenticatedUser = CurrentUser,
    pool: asyncpg.Pool = Depends(get_db),
    end: Optional[date_type] = Query(default=None, description="End date (inclusive); defaults to today"),
) -> ApiSuccess[MonthlySummary]:
    assert_owner(user, str(user_id))
    end_date = end or date_type.today()
    summary = await calc.build_monthly_summary(pool, user_id=user_id, end_date=end_date)
    return ApiSuccess(data=summary)


# ============================================================================
# 7. DELETE /nutrition/log/{log_id}
# ============================================================================

@router.delete(
    "/log/{log_id}",
    response_model=ApiSuccess[dict],
    summary="Delete a nutrition log",
)
async def delete_log(
    log_id: UUID,
    user: AuthenticatedUser = CurrentUser,
    pool: asyncpg.Pool = Depends(get_db),
) -> ApiSuccess[dict]:
    existing = await nl.find_log_by_id(pool, log_id)
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": "Log not found", "code": "NOT_FOUND"},
        )
    assert_owner(user, str(existing["user_id"]))

    deleted = await calc.remove_log_and_refresh(pool, log_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": "Log not found", "code": "NOT_FOUND"},
        )
    return ApiSuccess(data={"message": "Log deleted"})
