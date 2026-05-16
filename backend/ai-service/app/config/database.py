"""asyncpg pool wrapper, mirroring the nutrition-service pattern."""

from __future__ import annotations

import ssl
from typing import Optional

import asyncpg

from app.config.settings import settings


def _ssl_for(dsn: str):
    """Enable TLS for managed Postgres providers (Supabase/Neon/RDS/Railway).

    asyncpg does not auto-negotiate TLS unless explicitly configured. We
    respect an explicit ``sslmode=`` in the URL when present; otherwise we
    enable TLS for known managed providers and leave it disabled for local
    dev hosts.
    """
    if "sslmode=" in dsn:
        return None
    if any(h in dsn for h in ("supabase", "amazonaws", "neon.tech", "render.com", "railway")):
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        return ctx
    return None


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
                ssl=_ssl_for(settings.database_url),
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
