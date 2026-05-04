"""Redis client wrapper.

The async client is created on FastAPI startup and closed on shutdown.
A lightweight ``RedisProtocol`` is exposed so tests can swap in an in-memory
fake without needing a running Redis.
"""

from __future__ import annotations

from typing import Optional, Protocol

import redis.asyncio as aioredis

from app.config.settings import settings


class RedisProtocol(Protocol):
    """Subset of the redis.asyncio API the service actually uses."""

    async def get(self, key: str) -> Optional[str]: ...
    async def set(self, key: str, value: str, ex: Optional[int] = None) -> bool: ...
    async def incr(self, key: str) -> int: ...
    async def expire(self, key: str, seconds: int) -> bool: ...
    async def delete(self, *keys: str) -> int: ...


class RedisClient:
    """Module-level singleton holder. The actual client is set via
    ``connect()`` (production) or ``set_client()`` (tests)."""

    _client: Optional[RedisProtocol] = None

    @classmethod
    async def connect(cls) -> RedisProtocol:
        if cls._client is None:
            cls._client = aioredis.from_url(settings.redis_url, decode_responses=True)
        return cls._client

    @classmethod
    async def disconnect(cls) -> None:
        if cls._client is None:
            return
        # Real redis clients expose aclose()/close(); fake clients may not.
        close = getattr(cls._client, "aclose", None) or getattr(cls._client, "close", None)
        if close is not None:
            try:
                result = close()
                if hasattr(result, "__await__"):
                    await result
            except Exception:  # pragma: no cover — never fail shutdown
                pass
        cls._client = None

    @classmethod
    def client(cls) -> RedisProtocol:
        if cls._client is None:
            raise RuntimeError("Redis client is not initialized.")
        return cls._client

    @classmethod
    def set_client(cls, client: RedisProtocol) -> None:
        """Test hook — inject a fake client without touching the network."""
        cls._client = client


async def get_redis() -> RedisProtocol:
    return RedisClient.client()
