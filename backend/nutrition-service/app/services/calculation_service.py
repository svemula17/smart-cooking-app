"""Higher-level operations: log a meal, build a daily summary, etc."""

from __future__ import annotations

from datetime import date as date_type
from datetime import timedelta
from typing import Optional
from uuid import UUID

import asyncpg
from fastapi import HTTPException, status

from app.models import daily_summary as ds
from app.models import nutrition_log as nl
from app.schemas.nutrition import (
    DailySummary,
    MacroGoals,
    MacroProgress,
    MealSummary,
    MonthlySummary,
    MonthlyWeekBucket,
    NutritionTotals,
    WeeklySummary,
)


def _percent(consumed: float, goal: float) -> int:
    """Goal-progress percentage, capped at 999. Returns 0 when goal is 0/None."""
    if not goal:
        return 0
    return min(999, round((consumed / goal) * 100))


def _build_progress(totals: dict[str, float], goals: dict[str, float]) -> MacroProgress:
    return MacroProgress(
        calories_percent=_percent(totals["total_calories"], goals["calories"]),
        protein_percent=_percent(totals["total_protein"], goals["protein"]),
        carbs_percent=_percent(totals["total_carbs"], goals["carbs"]),
        fat_percent=_percent(totals["total_fat"], goals["fat"]),
    )


async def log_meal(
    pool: asyncpg.Pool,
    *,
    user_id: UUID,
    recipe_id: UUID,
    log_date: date_type,
    meal_type: str,
    servings_consumed: float,
    auto_logged: bool,
) -> asyncpg.Record:
    """Insert a nutrition_logs row and refresh daily_nutrition.

    The caller must verify ownership before calling. Calories/macros are
    derived from recipe_nutrition × servings — we don't trust the client to
    supply numbers.
    """
    nutrition = await ds.fetch_recipe_nutrition(pool, recipe_id)
    if nutrition is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": "Recipe or recipe nutrition not found", "code": "NOT_FOUND"},
        )

    record = await nl.insert_log(
        pool,
        user_id=user_id,
        recipe_id=recipe_id,
        log_date=log_date,
        meal_type=meal_type,
        servings_consumed=servings_consumed,
        calories=float(nutrition["calories"]) * servings_consumed,
        protein_g=float(nutrition["protein_g"]) * servings_consumed,
        carbs_g=float(nutrition["carbs_g"]) * servings_consumed,
        fat_g=float(nutrition["fat_g"]) * servings_consumed,
        auto_logged=auto_logged,
    )

    goals = await ds.fetch_user_goals(pool, user_id=user_id)
    await ds.upsert_daily_summary(
        pool,
        user_id=user_id,
        log_date=log_date,
        goal_calories=int(goals["calories"]),
        goal_protein=float(goals["protein"]),
    )
    return record


async def remove_log_and_refresh(pool: asyncpg.Pool, log_id: UUID) -> bool:
    """Delete a log and refresh that day's daily_nutrition. Returns False if
    the log didn't exist."""
    existing = await nl.find_log_by_id(pool, log_id)
    if existing is None:
        return False
    deleted = await nl.delete_log(pool, log_id)
    if not deleted:
        return False
    goals = await ds.fetch_user_goals(pool, user_id=existing["user_id"])
    await ds.upsert_daily_summary(
        pool,
        user_id=existing["user_id"],
        log_date=existing["log_date"],
        goal_calories=int(goals["calories"]),
        goal_protein=float(goals["protein"]),
    )
    return True


async def build_daily_summary(
    pool: asyncpg.Pool, *, user_id: UUID, log_date: date_type
) -> DailySummary:
    totals = await ds.aggregate_day(pool, user_id=user_id, log_date=log_date)
    goals = await ds.fetch_user_goals(pool, user_id=user_id)
    rows = await nl.list_logs_with_recipe_names(pool, user_id=user_id, log_date=log_date)

    meals = [
        MealSummary(
            log_id=row["id"],
            meal_type=row["meal_type"],
            recipe_id=row["recipe_id"],
            recipe_name=row["recipe_name"],
            servings_consumed=float(row["servings_consumed"]),
            calories=float(row["calories"]),
            protein=float(row["protein_g"]),
            carbs=float(row["carbs_g"]),
            fat=float(row["fat_g"]),
            auto_logged=row["auto_logged"],
            logged_at=row["logged_at"],
        )
        for row in rows
    ]

    return DailySummary(
        date=log_date,
        user_id=user_id,
        total_calories=totals["total_calories"],
        total_protein=totals["total_protein"],
        total_carbs=totals["total_carbs"],
        total_fat=totals["total_fat"],
        goals=MacroGoals(
            calories=int(goals["calories"]),
            protein=float(goals["protein"]),
            carbs=float(goals["carbs"]),
            fat=float(goals["fat"]),
        ),
        progress=_build_progress(totals, goals),
        meals=meals,
    )


async def build_weekly_summary(
    pool: asyncpg.Pool, *, user_id: UUID, end_date: date_type
) -> WeeklySummary:
    """Build a 7-day window ending at ``end_date`` (inclusive). Empty days are
    included with zero totals so the client can render a contiguous chart."""
    start_date = end_date - timedelta(days=6)
    rows = await ds.aggregate_range(
        pool, user_id=user_id, start_date=start_date, end_date=end_date
    )
    by_date = {row["date"]: row for row in rows}
    goals = await ds.fetch_user_goals(pool, user_id=user_id)

    days: list[DailySummary] = []
    for offset in range(7):
        d = start_date + timedelta(days=offset)
        row = by_date.get(d)
        totals = (
            {
                "total_calories": float(row["total_calories"]),
                "total_protein": float(row["total_protein"]),
                "total_carbs": float(row["total_carbs"]),
                "total_fat": float(row["total_fat"]),
            }
            if row
            else {
                "total_calories": 0.0,
                "total_protein": 0.0,
                "total_carbs": 0.0,
                "total_fat": 0.0,
            }
        )
        days.append(
            DailySummary(
                date=d,
                user_id=user_id,
                total_calories=totals["total_calories"],
                total_protein=totals["total_protein"],
                total_carbs=totals["total_carbs"],
                total_fat=totals["total_fat"],
                goals=MacroGoals(
                    calories=int(goals["calories"]),
                    protein=float(goals["protein"]),
                    carbs=float(goals["carbs"]),
                    fat=float(goals["fat"]),
                ),
                progress=_build_progress(totals, goals),
                meals=[],
            )
        )
    return WeeklySummary(start_date=start_date, end_date=end_date, days=days)


async def build_monthly_summary(
    pool: asyncpg.Pool, *, user_id: UUID, end_date: date_type
) -> MonthlySummary:
    """Build a ~30-day window ending at ``end_date`` (inclusive), bucketed by
    ISO week. Days without logs are simply absent from ``days_logged``."""
    start_date = end_date - timedelta(days=29)
    rows = await ds.aggregate_range(
        pool, user_id=user_id, start_date=start_date, end_date=end_date
    )

    buckets: dict[date_type, MonthlyWeekBucket] = {}
    for row in rows:
        wk_start = ds.week_start_for(row["date"])
        wk_end = wk_start + timedelta(days=6)
        bucket = buckets.get(wk_start)
        if bucket is None:
            bucket = MonthlyWeekBucket(
                week_start=wk_start,
                week_end=wk_end,
                total_calories=0.0,
                total_protein=0.0,
                total_carbs=0.0,
                total_fat=0.0,
                days_logged=0,
            )
            buckets[wk_start] = bucket
        bucket.total_calories += float(row["total_calories"])
        bucket.total_protein += float(row["total_protein"])
        bucket.total_carbs += float(row["total_carbs"])
        bucket.total_fat += float(row["total_fat"])
        bucket.days_logged += 1

    weeks = [buckets[k] for k in sorted(buckets.keys())]
    return MonthlySummary(
        start_date=start_date,
        end_date=end_date,
        weeks=weeks,
        total_calories=sum(w.total_calories for w in weeks),
        total_protein=sum(w.total_protein for w in weeks),
        total_carbs=sum(w.total_carbs for w in weeks),
        total_fat=sum(w.total_fat for w in weeks),
    )


def per_serving(totals: NutritionTotals, servings: int) -> NutritionTotals:
    """Divide totals by servings; treats 0/1 servings as no-op."""
    if servings <= 0:
        return NutritionTotals(
            calories=totals.calories,
            protein_g=totals.protein_g,
            carbs_g=totals.carbs_g,
            fat_g=totals.fat_g,
            fiber_g=totals.fiber_g,
            sodium_mg=totals.sodium_mg,
        )
    return NutritionTotals(
        calories=totals.calories / servings,
        protein_g=totals.protein_g / servings,
        carbs_g=totals.carbs_g / servings,
        fat_g=totals.fat_g / servings,
        fiber_g=totals.fiber_g / servings,
        sodium_mg=totals.sodium_mg / servings,
    )


def round_totals(totals: NutritionTotals, places: int = 2) -> NutritionTotals:
    return NutritionTotals(
        calories=round(totals.calories, places),
        protein_g=round(totals.protein_g, places),
        carbs_g=round(totals.carbs_g, places),
        fat_g=round(totals.fat_g, places),
        fiber_g=round(totals.fiber_g, places),
        sodium_mg=round(totals.sodium_mg, places),
    )
