"""End-to-end tests for the AI service.

Network-free: the LLM is stubbed (no OPENAI_API_KEY in test env), Redis is
the in-process FakeAsyncRedis, and Postgres is the local dev DB.
"""

from __future__ import annotations

import json

import pytest

from app.services.multi_dish_coordinator import MultiDishCoordinator
from app.services.substitution_service import get_substitutes
from app.schemas.ai import CoordinationRecipe, CoordinationStep


SEEDED_BIRYANI = "a0000001-0000-0000-0000-000000000001"
SEEDED_BUTTER_CHICKEN = "a0000001-0000-0000-0000-000000000002"


# ============================================================================
# /health
# ============================================================================

@pytest.mark.asyncio
async def test_health(app_client):
    res = await app_client.get("/health")
    assert res.status_code == 200
    assert res.json()["data"]["status"] == "ok"


# ============================================================================
# /ai/chat
# ============================================================================

@pytest.mark.asyncio
async def test_chat_returns_response_and_conversation_id(app_client, test_user):
    res = await app_client.post(
        "/ai/chat",
        headers=test_user["headers"],
        json={
            "user_id": test_user["id"],
            "message": "How long should I rest the chicken?",
            "context": {
                "recipe_name": "Tandoori Chicken",
                "current_step": "Resting the chicken",
                "ingredients_available": ["chicken legs", "yogurt"],
            },
        },
    )
    assert res.status_code == 200, res.text
    data = res.json()["data"]
    assert isinstance(data["response"], str) and data["response"]
    assert isinstance(data["conversation_id"], str)
    assert data["cached"] is False


@pytest.mark.asyncio
async def test_chat_caches_repeat_questions(app_client, test_user):
    body = {
        "user_id": test_user["id"],
        "message": "what is mise en place",
        "is_premium": True,  # avoid hitting rate limit on the second call
    }
    first = await app_client.post("/ai/chat", headers=test_user["headers"], json=body)
    assert first.status_code == 200
    assert first.json()["data"]["cached"] is False

    second = await app_client.post("/ai/chat", headers=test_user["headers"], json=body)
    assert second.status_code == 200
    assert second.json()["data"]["cached"] is True


@pytest.mark.asyncio
async def test_chat_requires_auth(app_client, test_user):
    res = await app_client.post(
        "/ai/chat",
        json={"user_id": test_user["id"], "message": "Hi"},
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_chat_rejects_cross_user(app_client, test_user):
    res = await app_client.post(
        "/ai/chat",
        headers=test_user["headers"],
        json={"user_id": "00000000-0000-0000-0000-000000000099", "message": "Hi"},
    )
    assert res.status_code == 403


# ============================================================================
# Rate limiting
# ============================================================================

@pytest.mark.asyncio
async def test_rate_limiting_blocks_after_quota(app_client, test_user):
    # FREE_TIER_DAILY_LIMIT=3 in test env. Distinct messages so caching
    # doesn't bypass the counter.
    for i in range(3):
        res = await app_client.post(
            "/ai/chat",
            headers=test_user["headers"],
            json={"user_id": test_user["id"], "message": f"Question {i}"},
        )
        assert res.status_code == 200, f"call {i} failed: {res.text}"

    res = await app_client.post(
        "/ai/chat",
        headers=test_user["headers"],
        json={"user_id": test_user["id"], "message": "One too many"},
    )
    assert res.status_code == 429
    assert res.json()["error"]["code"] == "RATE_LIMITED"


@pytest.mark.asyncio
async def test_premium_users_bypass_rate_limit(app_client, test_user):
    for i in range(5):
        res = await app_client.post(
            "/ai/chat",
            headers=test_user["headers"],
            json={"user_id": test_user["id"], "message": f"Premium question {i}", "is_premium": True},
        )
        assert res.status_code == 200, f"call {i} failed: {res.text}"


# ============================================================================
# /ai/substitute
# ============================================================================

@pytest.mark.asyncio
async def test_substitute_returns_curated_subs(app_client, test_user):
    res = await app_client.post(
        "/ai/substitute",
        headers=test_user["headers"],
        json={"ingredient_name": "yogurt", "dietary_restrictions": []},
    )
    assert res.status_code == 200
    subs = res.json()["data"]["substitutes"]
    names = [s["name"] for s in subs]
    assert "sour cream" in names


@pytest.mark.asyncio
async def test_substitute_respects_vegan_restriction(app_client, test_user):
    res = await app_client.post(
        "/ai/substitute",
        headers=test_user["headers"],
        json={"ingredient_name": "butter", "dietary_restrictions": ["vegan"]},
    )
    assert res.status_code == 200
    subs = res.json()["data"]["substitutes"]
    names = [s["name"] for s in subs]
    # Ghee is dairy — must be filtered out.
    assert "ghee" not in names
    # Olive oil and vegan butter should remain.
    assert any(n in names for n in ["olive oil", "vegan butter", "coconut oil"])


def test_substitute_unit_unknown_ingredient_returns_fallback():
    subs = get_substitutes(ingredient="dragon fruit", dietary_restrictions=[])
    assert len(subs) == 1
    assert "No curated substitution" in subs[0]["notes"]


# ============================================================================
# /ai/multi-dish/coordinate
# ============================================================================

@pytest.mark.asyncio
async def test_multi_dish_two_recipes_finish_together(app_client, test_user):
    res = await app_client.post(
        "/ai/multi-dish/coordinate",
        headers=test_user["headers"],
        json={
            "recipes": [
                {"id": "r1", "name": "Chicken Biryani", "prep_time": 30, "cook_time": 45,
                 "steps": [{"step_number": 1, "instruction": "Marinate"}, {"step_number": 2, "instruction": "Cook rice"}]},
                {"id": "r2", "name": "Raita", "prep_time": 10, "cook_time": 0,
                 "steps": [{"step_number": 1, "instruction": "Mix yogurt and spices"}]},
            ]
        },
    )
    assert res.status_code == 200, res.text
    data = res.json()["data"]
    assert data["total_time_minutes"] == 75  # max(75, 10)
    # Raita has duration 10 and must start at 75 - 10 = 65.
    assert data["timeline"]["r1"]["start_time_minutes"] == 0
    assert data["timeline"]["r2"]["start_time_minutes"] == 65


def test_multi_dish_unit_three_recipes():
    coord = MultiDishCoordinator()
    recipes = [
        CoordinationRecipe(id="a", name="A", prep_time=20, cook_time=30, steps=[]),
        CoordinationRecipe(id="b", name="B", prep_time=5,  cook_time=10, steps=[]),
        CoordinationRecipe(id="c", name="C", prep_time=15, cook_time=20, steps=[]),
    ]
    result = coord.coordinate(recipes)
    assert result.total_time_minutes == 50
    assert result.timeline["a"].start_time_minutes == 0
    assert result.timeline["b"].start_time_minutes == 35
    assert result.timeline["c"].start_time_minutes == 15


def test_multi_dish_unit_uses_explicit_step_times():
    coord = MultiDishCoordinator()
    recipes = [
        CoordinationRecipe(
            id="x", name="X", prep_time=10, cook_time=20,
            steps=[
                CoordinationStep(step_number=1, instruction="Step 1", time_minutes=5),
                CoordinationStep(step_number=2, instruction="Step 2", time_minutes=15),
                CoordinationStep(step_number=3, instruction="Step 3", time_minutes=10),
            ],
        ),
    ]
    result = coord.coordinate(recipes)
    schedule = result.timeline["x"].steps_schedule
    assert len(schedule) == 3


# ============================================================================
# /ai/variety/suggest
# ============================================================================

@pytest.mark.asyncio
async def test_variety_with_no_history_recommends_underused(app_client, test_user):
    res = await app_client.post(
        "/ai/variety/suggest",
        headers=test_user["headers"],
        json={"user_id": test_user["id"], "days_back": 30},
    )
    assert res.status_code == 200
    data = res.json()["data"]
    # No cooking sessions yet → all cuisines underused, score is 0.
    assert data["variety_score"] == 0
    assert "Indian" in data["underused_cuisines"]
    assert len(data["suggestions"]) > 0


@pytest.mark.asyncio
async def test_variety_with_history_lowers_underused_set(app_client, test_user, db_pool):
    # Seed completed cooking sessions so the user has cooked Indian + Italian.
    async with db_pool.acquire() as conn:
        for recipe_id in (SEEDED_BIRYANI, SEEDED_BUTTER_CHICKEN):
            await conn.execute(
                """
                INSERT INTO cooking_sessions (user_id, recipe_id, started_at, completed_at, status)
                VALUES ($1, $2, NOW() - interval '1 day', NOW() - interval '1 day' + interval '1 hour', 'completed')
                """,
                test_user["id"], recipe_id,
            )

    res = await app_client.post(
        "/ai/variety/suggest",
        headers=test_user["headers"],
        json={"user_id": test_user["id"], "days_back": 30},
    )
    assert res.status_code == 200
    data = res.json()["data"]
    # Score increases by ~9 each cuisine cooked (1/11 ≈ 9%) — exact value
    # depends on supported cuisine count, but it should be > 0.
    assert data["variety_score"] > 0
    assert data["cooked_cuisines"]["Indian"] == 2


# ============================================================================
# /ai/troubleshoot
# ============================================================================

@pytest.mark.asyncio
async def test_troubleshoot_returns_solutions(app_client, test_user):
    res = await app_client.post(
        "/ai/troubleshoot",
        headers=test_user["headers"],
        json={"problem": "my sauce is too thick", "recipe_context": "Tomato sauce"},
    )
    assert res.status_code == 200, res.text
    data = res.json()["data"]
    assert len(data["solutions"]) >= 1
    assert all("action" in s and "explanation" in s for s in data["solutions"])


# ============================================================================
# /ai/tips
# ============================================================================

@pytest.mark.asyncio
async def test_tips_for_known_recipe(app_client, test_user):
    res = await app_client.post(
        "/ai/tips",
        headers=test_user["headers"],
        json={"recipe_id": SEEDED_BIRYANI},
    )
    assert res.status_code == 200, res.text
    data = res.json()["data"]
    assert isinstance(data["tips"], list)
    assert len(data["tips"]) >= 3
    assert data["cached"] is False

    # Second call should be cached.
    res2 = await app_client.post(
        "/ai/tips",
        headers=test_user["headers"],
        json={"recipe_id": SEEDED_BIRYANI},
    )
    assert res2.status_code == 200
    assert res2.json()["data"]["cached"] is True


@pytest.mark.asyncio
async def test_tips_unknown_recipe_returns_404(app_client, test_user):
    res = await app_client.post(
        "/ai/tips",
        headers=test_user["headers"],
        json={"recipe_id": "00000000-0000-0000-0000-000000000000"},
    )
    assert res.status_code == 404
