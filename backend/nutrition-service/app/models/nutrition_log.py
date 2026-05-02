"""Data access for ``nutrition_logs``.

Each row is a single eaten-meal record. Nutrition columns are denormalized
copies of recipe_nutrition × servings_consumed at log time, so historical
totals stay correct even if recipes are edited later.
"""

from __future__ import annotations

from datetime import date as date_type
from typing import Optional
from uuid import UUID

import asyncpg


_LOG_COLUMNS = """
  id, user_id, recipe_id,
  date AS log_date,
  meal_type, servings_consumed,
  calories, protein_g, carbs_g, fat_g,
  logged_at, auto_logged
"""


async def insert_log(
    pool: asyncpg.Pool,
    *,
    user_id: UUID,
    recipe_id: UUID,
    log_date: date_type,
    meal_type: str,
    servings_consumed: float,
    calories: float,
    protein_g: float,
    carbs_g: float,
    fat_g: float,
    auto_logged: bool,
) -> asyncpg.Record:
    async with pool.acquire() as conn:
        return await conn.fetchrow(
            f"""
            INSERT INTO nutrition_logs
              (user_id, recipe_id, date, meal_type, servings_consumed,
               calories, protein_g, carbs_g, fat_g, auto_logged)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING {_LOG_COLUMNS}
            """,
            user_id,
            recipe_id,
            log_date,
            meal_type,
            servings_consumed,
            calories,
            protein_g,
            carbs_g,
            fat_g,
            auto_logged,
        )


async def find_log_by_id(pool: asyncpg.Pool, log_id: UUID) -> Optional[asyncpg.Record]:
    async with pool.acquire() as conn:
        return await conn.fetchrow(
            f"SELECT {_LOG_COLUMNS} FROM nutrition_logs WHERE id = $1",
            log_id,
        )


async def delete_log(pool: asyncpg.Pool, log_id: UUID) -> bool:
    async with pool.acquire() as conn:
        result = await conn.execute(
            "DELETE FROM nutrition_logs WHERE id = $1",
            log_id,
        )
        return result.endswith(" 1")


async def list_logs(
    pool: asyncpg.Pool,
    *,
    user_id: UUID,
    start_date: Optional[date_type] = None,
    end_date: Optional[date_type] = None,
    limit: int,
    offset: int,
) -> tuple[list[asyncpg.Record], int]:
    """List logs for a user within an optional date window. Returns rows + total count."""
    conditions: list[str] = ["user_id = $1"]
    params: list[object] = [user_id]
    if start_date is not None:
        params.append(start_date)
        conditions.append(f"date >= ${len(params)}")
    if end_date is not None:
        params.append(end_date)
        conditions.append(f"date <= ${len(params)}")

    where = " AND ".join(conditions)

    async with pool.acquire() as conn:
        total_record = await conn.fetchrow(
            f"SELECT COUNT(*) AS count FROM nutrition_logs WHERE {where}",
            *params,
        )
        total = int(total_record["count"]) if total_record else 0

        params_with_paging = [*params, limit, offset]
        rows = await conn.fetch(
            f"""
            SELECT {_LOG_COLUMNS}
              FROM nutrition_logs
             WHERE {where}
             ORDER BY date DESC, logged_at DESC
             LIMIT ${len(params) + 1} OFFSET ${len(params) + 2}
            """,
            *params_with_paging,
        )
        return list(rows), total


async def list_logs_with_recipe_names(
    pool: asyncpg.Pool, *, user_id: UUID, log_date: date_type
) -> list[asyncpg.Record]:
    """Logs for a single day joined with recipe names — feeds the daily summary
    response."""
    async with pool.acquire() as conn:
        return list(
            await conn.fetch(
                """
                SELECT nl.id, nl.user_id, nl.recipe_id,
                       nl.date AS log_date,
                       nl.meal_type, nl.servings_consumed,
                       nl.calories, nl.protein_g, nl.carbs_g, nl.fat_g,
                       nl.logged_at, nl.auto_logged,
                       r.name AS recipe_name
                  FROM nutrition_logs nl
                  LEFT JOIN recipes r ON r.id = nl.recipe_id
                 WHERE nl.user_id = $1 AND nl.date = $2
                 ORDER BY nl.logged_at ASC
                """,
                user_id,
                log_date,
            )
        )
