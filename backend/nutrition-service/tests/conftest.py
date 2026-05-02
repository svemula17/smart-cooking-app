"""Shared pytest fixtures.

Tests run against a live local Postgres (the same DB the dev server uses).
Each test creates its own user via ``test_user`` and cleans up via
``afterAll``-style fixture teardown so different test runs don't collide.
"""

from __future__ import annotations

import os
import sys
import uuid
from datetime import date, timedelta
from pathlib import Path

# Test-mode env must be set before importing app modules.
os.environ.setdefault("NODE_ENV", "test")
os.environ.setdefault("JWT_SECRET", "test-jwt-secret-for-pytest-runs-only")
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql://saikumarvemula@localhost:5432/smart_cooking_app",
)

# Make `app` importable when tests run from the service root.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import asyncpg
import httpx
import pytest
import pytest_asyncio
from httpx import ASGITransport
from jose import jwt

from app.config.database import Database
from app.config.settings import settings


@pytest_asyncio.fixture
async def db_pool() -> asyncpg.Pool:
    """Bring up the asyncpg pool for the duration of one test."""
    pool = await Database.connect()
    try:
        yield pool
    finally:
        await Database.disconnect()


@pytest_asyncio.fixture
async def app_client(db_pool: asyncpg.Pool) -> httpx.AsyncClient:
    """Async test client wired to the FastAPI ASGI app — bypasses the network."""
    from main import app  # local import so settings load with test env applied

    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


@pytest_asyncio.fixture
async def test_user(db_pool: asyncpg.Pool) -> dict:
    """Create a throwaway test user and yield its id, email, and a valid JWT."""
    email = f"nsvc-{uuid.uuid4().hex[:8]}@test.dev"
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
        await conn.execute("DELETE FROM users WHERE id = $1", row["id"])


@pytest.fixture
def today() -> date:
    return date.today()


@pytest.fixture
def yesterday() -> date:
    return date.today() - timedelta(days=1)
