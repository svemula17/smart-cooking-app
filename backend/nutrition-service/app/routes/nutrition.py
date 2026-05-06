"""HTTP routes for the nutrition service.

Each handler is async and uses the shared asyncpg pool obtained via the
``get_db`` dependency. Authentication is enforced per-route via the
``CurrentUser`` dependency. Request bodies are validated by Pydantic schemas;
unknown fields are stripped.
"""

from __future__ import annotations

from datetime import date as date_type
from datetime import timedelta
from typing import Any, Dict, List, Optional
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


# ============================================================================
# 8. GET /nutrition/monthly-stats/{user_id}  — enhanced with daily data
# ============================================================================

@router.get(
    "/monthly-stats/{user_id}",
    response_model=ApiSuccess[dict],
    summary="Enhanced monthly stats with daily breakdown, adherence, and streak",
)
async def get_monthly_stats(
    user_id: UUID,
    user: AuthenticatedUser = CurrentUser,
    pool: asyncpg.Pool = Depends(get_db),
    month: Optional[str] = Query(default=None, description="YYYY-MM — defaults to current month"),
) -> ApiSuccess[dict]:
    assert_owner(user, str(user_id))

    # Determine the date range
    if month:
        year, mon = int(month[:4]), int(month[5:7])
        start_date = date_type(year, mon, 1)
        if mon == 12:
            end_date = date_type(year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = date_type(year, mon + 1, 1) - timedelta(days=1)
    else:
        today = date_type.today()
        start_date = date_type(today.year, today.month, 1)
        end_date = today

    # Fetch user goals
    goal_row = await pool.fetchrow(
        "SELECT calories_goal, protein_goal, carbs_goal, fat_goal FROM user_preferences WHERE user_id = $1",
        user_id,
    )
    goals = {
        "calories": float(goal_row["calories_goal"]) if goal_row else 2000.0,
        "protein":  float(goal_row["protein_goal"])  if goal_row else 150.0,
        "carbs":    float(goal_row["carbs_goal"])    if goal_row else 250.0,
        "fat":      float(goal_row["fat_goal"])      if goal_row else 65.0,
    }

    # Fetch raw daily aggregates
    rows = await pool.fetch(
        """
        SELECT
            log_date::text AS date,
            SUM(calories)  AS total_calories,
            SUM(protein_g) AS total_protein,
            SUM(carbs_g)   AS total_carbs,
            SUM(fat_g)     AS total_fat
        FROM nutrition_logs
        WHERE user_id = $1 AND log_date BETWEEN $2 AND $3
        GROUP BY log_date
        ORDER BY log_date
        """,
        user_id, start_date, end_date,
    )

    daily_data: List[Dict[str, Any]] = []
    for row in rows:
        cals = float(row["total_calories"] or 0)
        goal_met = goals["calories"] > 0 and (cals / goals["calories"]) >= 0.8
        daily_data.append({
            "date":           row["date"],
            "total_calories": round(cals),
            "total_protein":  round(float(row["total_protein"] or 0)),
            "total_carbs":    round(float(row["total_carbs"] or 0)),
            "total_fat":      round(float(row["total_fat"] or 0)),
            "goal_met":       goal_met,
        })

    # Averages
    n = len(daily_data) or 1
    averages = {
        "calories": round(sum(d["total_calories"] for d in daily_data) / n),
        "protein":  round(sum(d["total_protein"]  for d in daily_data) / n),
        "carbs":    round(sum(d["total_carbs"]    for d in daily_data) / n),
        "fat":      round(sum(d["total_fat"]      for d in daily_data) / n),
    }

    # Weekly comparison: this week vs last week
    today = date_type.today()
    this_week_start = today - timedelta(days=today.weekday())
    last_week_start = this_week_start - timedelta(weeks=1)
    last_week_end   = this_week_start - timedelta(days=1)

    def _week_avg(rows_subset: list) -> dict:
        if not rows_subset:
            return {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
        n2 = len(rows_subset)
        return {
            "calories": round(sum(d["total_calories"] for d in rows_subset) / n2),
            "protein":  round(sum(d["total_protein"]  for d in rows_subset) / n2),
            "carbs":    round(sum(d["total_carbs"]    for d in rows_subset) / n2),
            "fat":      round(sum(d["total_fat"]      for d in rows_subset) / n2),
        }

    this_week_data = [d for d in daily_data if d["date"] >= this_week_start.isoformat()]
    last_week_data = [d for d in daily_data if last_week_start.isoformat() <= d["date"] <= last_week_end.isoformat()]

    weekly_comparison = {
        "this_week": _week_avg(this_week_data),
        "last_week": _week_avg(last_week_data),
    }

    # Goal adherence
    days_with_data = len(daily_data)
    days_met = sum(1 for d in daily_data if d["goal_met"])
    adherence_pct = round((days_met / days_with_data * 100) if days_with_data else 0)

    # Current streak
    streak = 0
    for d in reversed(daily_data):
        if d["goal_met"]:
            streak += 1
        else:
            break

    return ApiSuccess(data={
        "month":                  start_date.strftime("%Y-%m"),
        "daily_data":             daily_data,
        "averages":               averages,
        "weekly_comparison":      weekly_comparison,
        "goal_adherence_percent": adherence_pct,
        "current_streak":         streak,
        "goals":                  goals,
    })
