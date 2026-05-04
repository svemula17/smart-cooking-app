"""Daily variety algorithm.

Pulls cooking history from ``cooking_sessions`` (completed sessions only),
counts cuisines, and recommends recipes from underrepresented cuisines.

Variety score is computed as ``unique_cuisines / total_supported_cuisines * 100``,
so a user who has cooked 7 of the 10 supported cuisines gets a score of 70.
"""

from __future__ import annotations

from typing import Iterable
from uuid import UUID

import asyncpg

# Keep this list in sync with backend/recipe-service/src/types/index.ts.
SUPPORTED_CUISINES: tuple[str, ...] = (
    "Indian",
    "Chinese",
    "Indo-Chinese",
    "Italian",
    "Mexican",
    "Thai",
    "French",
    "Japanese",
    "Korean",
    "American",
    "Mediterranean",
)


class VarietyAlgorithm:
    def __init__(self, pool: asyncpg.Pool) -> None:
        self._pool = pool

    async def suggest(
        self,
        *,
        user_id: UUID,
        days_back: int = 30,
        limit: int = 10,
    ) -> dict:
        history = await self._fetch_history(user_id=user_id, days_back=days_back)
        counts = self._count_cuisines(history)

        unique_count = sum(1 for c in counts.values() if c > 0)
        variety_score = round((unique_count / len(SUPPORTED_CUISINES)) * 100)

        underused = self._underused_cuisines(counts)
        suggestions = await self._recipes_from_cuisines(underused, limit=limit)

        if not unique_count:
            reasoning = (
                "No cooking activity in the last "
                f"{days_back} days. Start with a few quick recipes to find what you like!"
            )
        else:
            reasoning = (
                f"You've cooked {unique_count} different cuisine(s) in the last {days_back} days. "
                f"Try {', '.join(underused[:3]) or 'new cuisines'} for more variety!"
            )

        return {
            "suggestions": suggestions,
            "variety_score": variety_score,
            "underused_cuisines": underused,
            "cooked_cuisines": counts,
            "reasoning": reasoning,
        }

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    async def _fetch_history(self, *, user_id: UUID, days_back: int) -> list[asyncpg.Record]:
        """Fetch the user's recent completed cooking sessions joined with
        recipe cuisine. We filter on ``status = 'completed'`` so abandoned
        attempts don't bias the recommendations."""
        async with self._pool.acquire() as conn:
            return list(
                await conn.fetch(
                    """
                    SELECT cs.recipe_id, cs.completed_at, r.cuisine_type, r.name
                      FROM cooking_sessions cs
                      JOIN recipes r ON r.id = cs.recipe_id
                     WHERE cs.user_id = $1
                       AND cs.status = 'completed'
                       AND cs.completed_at >= NOW() - ($2 || ' days')::interval
                       AND r.deleted_at IS NULL
                     ORDER BY cs.completed_at DESC
                    """,
                    user_id,
                    str(days_back),
                )
            )

    @staticmethod
    def _count_cuisines(history: Iterable[asyncpg.Record]) -> dict[str, int]:
        counts: dict[str, int] = {c: 0 for c in SUPPORTED_CUISINES}
        for row in history:
            cuisine = row["cuisine_type"]
            counts[cuisine] = counts.get(cuisine, 0) + 1
        # Drop cuisines never seen in either history or supported list to
        # keep the response clean.
        return {k: v for k, v in counts.items() if v > 0 or k in SUPPORTED_CUISINES}

    @staticmethod
    def _underused_cuisines(counts: dict[str, int]) -> list[str]:
        """A cuisine is "underused" if it has fewer than 10% of total cooks.
        Cuisines never cooked (count=0) always qualify; that's the desired
        recommendation surface for new users."""
        total = sum(counts.values())
        threshold = max(1, total // 10)  # ~10% representation
        return [
            cuisine
            for cuisine in SUPPORTED_CUISINES
            if counts.get(cuisine, 0) < threshold
        ]

    async def _recipes_from_cuisines(
        self, cuisines: list[str], *, limit: int
    ) -> list[dict]:
        if not cuisines:
            return []
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT r.id, r.name, r.cuisine_type
                  FROM recipes r
                 WHERE r.cuisine_type = ANY($1::text[])
                   AND r.deleted_at IS NULL
                 ORDER BY r.created_at DESC, r.id ASC
                 LIMIT $2
                """,
                cuisines,
                limit,
            )
        return [
            {
                "id": str(row["id"]),
                "name": row["name"],
                "cuisine_type": row["cuisine_type"],
                "reason": f"You haven't cooked {row['cuisine_type']} much recently — try this one.",
            }
            for row in rows
        ]
