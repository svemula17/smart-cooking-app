"""asyncpg connection pool wrapper.

Pool is created on FastAPI startup and closed on shutdown — see ``main.py``
for the lifespan hookup. All queries use parameterized SQL; never format or
concatenate user input into a query string.
"""

from __future__ import annotations

from typing import Optional

import asyncpg

from app.config.settings import settings


class Database:
    """Thin singleton-style wrapper around an asyncpg pool."""

    _pool: Optional[asyncpg.Pool] = None

    @classmethod
    async def connect(cls) -> asyncpg.Pool:
        if cls._pool is None:
            cls._pool = await asyncpg.create_pool(
                dsn=settings.database_url,
                min_size=1,
                max_size=10,
                command_timeout=15,
            )
        return cls._pool

    @classmethod
    async def disconnect(cls) -> None:
        if cls._pool is not None:
            await cls._pool.close()
            cls._pool = None

    @classmethod
    def pool(cls) -> asyncpg.Pool:
        """Return the active pool. Raises if ``connect()`` hasn't run yet."""
        if cls._pool is None:
            raise RuntimeError("Database pool is not initialized. Call Database.connect() first.")
        return cls._pool


async def get_db() -> asyncpg.Pool:
    """FastAPI dependency that yields the shared pool."""
    return Database.pool()
