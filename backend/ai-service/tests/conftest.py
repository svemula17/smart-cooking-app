"""Test fixtures.

Tests run against:
- A local Postgres (same DB the dev server uses).
- An in-process fake Redis (no real server needed).
- A stub LLM client (no OpenAI calls).
"""

from __future__ import annotations

import os
import sys
import uuid
from pathlib import Path
from typing import Optional

# Test-mode env must be set before app modules import.
os.environ.setdefault("NODE_ENV", "test")
os.environ.setdefault("JWT_SECRET", "test-jwt-secret-for-pytest-runs-only")
os.environ.setdefault(
    "DATABASE_URL", "postgresql://saikumarvemula@localhost:5432/smart_cooking_app"
)
# Lower the daily quota so rate-limit tests don't need many requests.
os.environ.setdefault("FREE_TIER_DAILY_LIMIT", "3")
# Make `app` importable when tests run from the service root.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import asyncpg
import httpx
import pytest
import pytest_asyncio
from httpx import ASGITransport
from jose import jwt

from app.config.database import Database
from app.config.redis import RedisClient
from app.config.settings import settings


# ============================================================================
# Fake async Redis — covers the small subset of commands the service uses.
# ============================================================================


class FakeAsyncRedis:
    """In-process stand-in for ``redis.asyncio.Redis``.

    Implements only the operations the service actually needs (get, set, incr,
    expire, delete) and is keyed off a plain dict. TTLs are stored but not
    enforced — adequate for tests that don't manipulate the clock.
    """

    def __init__(self) -> None:
        self.store: dict[str, str] = {}
        self.ttls: dict[str, int] = {}

    async def get(self, key: str) -> Optional[str]:
        return self.store.get(key)

    async def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        self.store[key] = value
        if ex is not None:
            self.ttls[key] = ex
        return True

    async def incr(self, key: str) -> int:
        cur = int(self.store.get(key, "0"))
        cur += 1
        self.store[key] = str(cur)
        return cur

    async def expire(self, key: str, seconds: int) -> bool:
        if key not in self.store:
            return False
        self.ttls[key] = seconds
        return True

    async def delete(self, *keys: str) -> int:
        n = 0
        for k in keys:
            if k in self.store:
                del self.store[k]
                self.ttls.pop(k, None)
                n += 1
        return n

    async def aclose(self) -> None:  # parity with real client
        return None


# ============================================================================
# Fixtures
# ============================================================================


@pytest_asyncio.fixture
async def fake_redis() -> FakeAsyncRedis:
    fake = FakeAsyncRedis()
    RedisClient.set_client(fake)
    try:
        yield fake
    finally:
        # Reset between tests so quota counters don't bleed across cases.
        RedisClient.set_client(FakeAsyncRedis())


@pytest_asyncio.fixture
async def db_pool() -> asyncpg.Pool:
    pool = await Database.connect()
    try:
        yield pool
    finally:
        await Database.disconnect()


@pytest_asyncio.fixture
async def app_client(db_pool: asyncpg.Pool, fake_redis: FakeAsyncRedis) -> httpx.AsyncClient:
    """ASGI test client — bypasses the real network. The fake_redis fixture
    is depended-on so RedisClient is wired up before the app loads."""
    from main import app

    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


@pytest_asyncio.fixture
async def test_user(db_pool: asyncpg.Pool) -> dict:
    email = f"aisvc-{uuid.uuid4().hex[:8]}@test.dev"
    async with db_pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO users (email, password_hash, name)
            VALUES ($1, 'placeholder', 'Test User')
            RETURNING id
            """,
            email,
        )
    user_id = str(row["id"])
    token = jwt.encode(
        {"userId": user_id, "email": email, "type": "access"},
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )

    yield {
        "id": user_id,
        "email": email,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }

    async with db_pool.acquire() as conn:
        await conn.execute(
            "DELETE FROM cooking_sessions WHERE user_id = $1", row["id"]
        )
        await conn.execute("DELETE FROM users WHERE id = $1", row["id"])
