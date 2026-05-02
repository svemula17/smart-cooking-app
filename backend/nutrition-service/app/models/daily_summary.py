"""Data access for ``daily_nutrition`` and related read paths.

The daily_nutrition table is a denormalized cache of the day's totals,
upserted whenever a log is inserted or deleted. Daily/weekly/monthly
endpoints aggregate from ``nutrition_logs`` directly so reads stay correct
even if the cache is stale (e.g. after a rare partial write).
"""

from __future__ import annotations

from datetime import date as date_type
from datetime import timedelta
from typing import Optional
from uuid import UUID

import asyncpg


async def upsert_daily_summary(
    pool: asyncpg.Pool,
    *,
    user_id: UUID,
    log_date: date_type,
    goal_calories: int = 2000,
    goal_protein: float = 100,
) -> None:
    """Recompute and persist the day's totals from ``nutrition_logs``."""
    async with pool.acquire() as conn:
        async with conn.transaction():
            totals = await conn.fetchrow(
                """
                SELECT COALESCE(SUM(calories),  0)::int    AS total_calories,
                       COALESCE(SUM(protein_g), 0)::float8 AS total_protein,
                       COALESCE(SUM(carbs_g),   0)::float8 AS total_carbs,
                       COALESCE(SUM(fat_g),     0)::float8 AS total_fat
                  FROM nutrition_logs
                 WHERE user_id = $1 AND date = $2
                """,
                user_id,
                log_date,
            )
            await conn.execute(
                """
                INSERT INTO daily_nutrition
                  (user_id, date, total_calories, total_protein_g,
                   total_carbs_g, total_fat_g, goal_calories, goal_protein_g)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (user_id, date) DO UPDATE SET
                    total_calories  = EXCLUDED.total_calories,
                    total_protein_g = EXCLUDED.total_protein_g,
                    total_carbs_g   = EXCLUDED.total_carbs_g,
                    total_fat_g     = EXCLUDED.total_fat_g,
                    updated_at      = NOW()
                """,
                user_id,
                log_date,
                totals["total_calories"] if totals else 0,
                totals["total_protein"] if totals else 0,
                totals["total_carbs"] if totals else 0,
                totals["total_fat"] if totals else 0,
                goal_calories,
                goal_protein,
            )


async def aggregate_day(
    pool: asyncpg.Pool, *, user_id: UUID, log_date: date_type
) -> dict[str, float]:
    """Aggregate from ``nutrition_logs`` directly. Authoritative — reads always
    reflect the current row set even if the cache hasn't been refreshed yet."""
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT COALESCE(SUM(calories),  0)::float8 AS total_calories,
                   COALESCE(SUM(protein_g), 0)::float8 AS total_protein,
                   COALESCE(SUM(carbs_g),   0)::float8 AS total_carbs,
                   COALESCE(SUM(fat_g),     0)::float8 AS total_fat
              FROM nutrition_logs
             WHERE user_id = $1 AND date = $2
            """,
            user_id,
            log_date,
        )
        return {
            "total_calories": float(row["total_calories"]) if row else 0.0,
            "total_protein": float(row["total_protein"]) if row else 0.0,
            "total_carbs": float(row["total_carbs"]) if row else 0.0,
            "total_fat": float(row["total_fat"]) if row else 0.0,
        }


async def aggregate_range(
    pool: asyncpg.Pool,
    *,
    user_id: UUID,
    start_date: date_type,
    end_date: date_type,
) -> list[asyncpg.Record]:
    """Return one row per logged day in [start_date, end_date], inclusive."""
    async with pool.acquire() as conn:
        return list(
            await conn.fetch(
                """
                SELECT date,
                       SUM(calories)::float8  AS total_calories,
                       SUM(protein_g)::float8 AS total_protein,
                       SUM(carbs_g)::float8   AS total_carbs,
                       SUM(fat_g)::float8     AS total_fat
                  FROM nutrition_logs
                 WHERE user_id = $1
                   AND date BETWEEN $2 AND $3
                 GROUP BY date
                 ORDER BY date ASC
                """,
                user_id,
                start_date,
                end_date,
            )
        )


async def fetch_user_goals(pool: asyncpg.Pool, *, user_id: UUID) -> dict[str, float]:
    """Fetch macro goals from ``user_preferences``. Falls back to defaults
    when no preferences row exists yet."""
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT daily_calories, daily_protein, daily_carbs, daily_fat
              FROM user_preferences WHERE user_id = $1
            """,
            user_id,
        )
        if row is None:
            return {"calories": 2000, "protein": 100.0, "carbs": 250.0, "fat": 65.0}
        return {
            "calories": int(row["daily_calories"]),
            "protein": float(row["daily_protein"]),
            "carbs": float(row["daily_carbs"]),
            "fat": float(row["daily_fat"]),
        }


async def fetch_recipe_nutrition(
    pool: asyncpg.Pool, recipe_id: UUID
) -> Optional[dict[str, float]]:
    """Fetch per-serving nutrition from ``recipe_nutrition``, or None if the
    recipe is unknown / missing nutrition."""
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT n.calories,
                   n.protein_g::float8 AS protein_g,
                   n.carbs_g::float8   AS carbs_g,
                   n.fat_g::float8     AS fat_g,
                   n.fiber_g::float8   AS fiber_g,
                   n.sodium_mg::float8 AS sodium_mg
              FROM recipe_nutrition n
              JOIN recipes r ON r.id = n.recipe_id
             WHERE n.recipe_id = $1 AND r.deleted_at IS NULL
            """,
            recipe_id,
        )
        if row is None:
            return None
        return dict(row)


def week_start_for(d: date_type) -> date_type:
    """Return the Monday of the ISO week containing ``d``."""
    return d - timedelta(days=d.weekday())
