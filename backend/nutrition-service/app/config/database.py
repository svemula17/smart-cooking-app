"""asyncpg connection pool wrapper.

Pool is created on FastAPI startup and closed on shutdown — see ``main.py``
for the lifespan hookup. All queries use parameterized SQL; never format or
concatenate user input into a query string.
"""

from __future__ import annotations

import ssl
from typing import Optional

import asyncpg

from app.config.settings import settings


def _ssl_for(dsn: str):
    """Return an SSL setting suitable for the target host.

    Managed Postgres providers (Supabase, Neon, RDS, etc.) require TLS but
    asyncpg won't auto-negotiate unless told. We respect an explicit
    ``sslmode=`` in the URL when present; otherwise we enable TLS for known
    managed providers and leave it disabled for local dev hosts.
    """
    if "sslmode=" in dsn:
        return None  # asyncpg parses it from the URL
    if any(h in dsn for h in ("supabase", "amazonaws", "neon.tech", "render.com", "railway")):
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        return ctx
    return None


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
        """Return the active pool. Raises if ``connect()`` hasn't run yet."""
        if cls._pool is None:
            raise RuntimeError("Database pool is not initialized. Call Database.connect() first.")
        return cls._pool


async def get_db() -> asyncpg.Pool:
    """FastAPI dependency that yields the shared pool."""
    return Database.pool()
