"""asyncpg pool wrapper, mirroring the nutrition-service pattern."""

from __future__ import annotations

from typing import Optional

import asyncpg

from app.config.settings import settings


class Database:
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
        if cls._pool is None:
            raise RuntimeError("Database pool is not initialized. Call Database.connect() first.")
        return cls._pool


async def get_db() -> asyncpg.Pool:
    return Database.pool()
