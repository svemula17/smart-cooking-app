"""End-to-end tests for the nutrition service.

Strategy:
- Fire requests via an ASGI httpx client (no real server bind).
- Use the seeded recipes (Chicken Biryani, Butter Chicken) which already have
  recipe_nutrition rows.
- For Nutritionix, monkeypatch ``nutritionix_service.lookup`` so we don't
  depend on credentials or network.
"""

from __future__ import annotations

from datetime import date, timedelta

import pytest

from app.schemas.nutrition import NutritionTotals
from app.services import nutritionix_service as nx_module


SEEDED_BIRYANI = "a0000001-0000-0000-0000-000000000001"
SEEDED_BUTTER_CHICKEN = "a0000001-0000-0000-0000-000000000002"


# ============================================================================
# /health
# ============================================================================

@pytest.mark.asyncio
async def test_health(app_client):
    res = await app_client.get("/health")
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert body["data"]["status"] == "ok"


# ============================================================================
# /nutrition/calculate
# ============================================================================

@pytest.mark.asyncio
async def test_calculate_uses_nutritionix_stub(app_client, test_user, monkeypatch):
    async def fake_lookup(self, ingredients):
        # Return a known total regardless of input so we can assert the
        # per-serving math.
        return NutritionTotals(
            calories=2000, protein_g=160, carbs_g=200, fat_g=80, fiber_g=20, sodium_mg=4000
        )

    monkeypatch.setattr(nx_module.NutritionixService, "lookup", fake_lookup)

    res = await app_client.post(
        "/nutrition/calculate",
        headers=test_user["headers"],
        json={
            "recipe_id": SEEDED_BIRYANI,
            "servings": 4,
            "ingredients": [
                {"name": "chicken breast", "quantity": 200, "unit": "g"},
                {"name": "white rice", "quantity": 150, "unit": "g"},
            ],
        },
    )
    assert res.status_code == 200, res.text
    data = res.json()["data"]
    assert data["servings"] == 4
    assert data["total_nutrition"]["calories"] == 2000
    assert data["per_serving"]["calories"] == 500
    assert data["per_serving"]["protein_g"] == 40


@pytest.mark.asyncio
async def test_calculate_requires_auth(app_client):
    res = await app_client.post(
        "/nutrition/calculate",
        json={
            "recipe_id": SEEDED_BIRYANI,
            "ingredients": [{"name": "chicken breast", "quantity": 200, "unit": "g"}],
        },
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_calculate_rejects_empty_ingredients(app_client, test_user):
    res = await app_client.post(
        "/nutrition/calculate",
        headers=test_user["headers"],
        json={"recipe_id": SEEDED_BIRYANI, "ingredients": []},
    )
    assert res.status_code == 400


# ============================================================================
# /nutrition/log + /nutrition/daily
# ============================================================================

@pytest.mark.asyncio
async def test_log_and_daily_summary(app_client, test_user, today):
    # Log breakfast
    res = await app_client.post(
        "/nutrition/log",
        headers=test_user["headers"],
        json={
            "user_id": test_user["id"],
            "recipe_id": SEEDED_BIRYANI,
            "servings_consumed": 1,
            "meal_type": "Lunch",
            "date": today.isoformat(),
            "auto_logged": True,
        },
    )
    assert res.status_code == 201, res.text
    log = res.json()["data"]
    assert log["meal_type"] == "Lunch"
    assert log["auto_logged"] is True
    assert log["calories"] > 0

    # Daily summary should reflect that one log
    res = await app_client.get(
        f"/nutrition/daily/{test_user['id']}/{today.isoformat()}",
        headers=test_user["headers"],
    )
    assert res.status_code == 200
    daily = res.json()["data"]
    assert daily["total_calories"] == log["calories"]
    assert len(daily["meals"]) == 1
    assert daily["meals"][0]["recipe_name"] == "Chicken Biryani"
    assert daily["goals"]["calories"] == 2000
    assert daily["progress"]["calories_percent"] >= 0


@pytest.mark.asyncio
async def test_log_rejects_cross_user_access(app_client, test_user, today):
    other_user_id = "00000000-0000-0000-0000-000000000099"
    res = await app_client.post(
        "/nutrition/log",
        headers=test_user["headers"],
        json={
            "user_id": other_user_id,
            "recipe_id": SEEDED_BIRYANI,
            "servings_consumed": 1,
            "meal_type": "Lunch",
            "date": today.isoformat(),
        },
    )
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_log_rejects_unknown_recipe(app_client, test_user, today):
    res = await app_client.post(
        "/nutrition/log",
        headers=test_user["headers"],
        json={
            "user_id": test_user["id"],
            "recipe_id": "00000000-0000-0000-0000-000000000000",
            "servings_consumed": 1,
            "meal_type": "Lunch",
            "date": today.isoformat(),
        },
    )
    assert res.status_code == 404


# ============================================================================
# /nutrition/logs (list with pagination + date filter)
# ============================================================================

@pytest.mark.asyncio
async def test_list_logs_with_date_filter(app_client, test_user, today, yesterday):
    # Seed 2 logs across 2 days
    for d, recipe in [(yesterday, SEEDED_BIRYANI), (today, SEEDED_BUTTER_CHICKEN)]:
        await app_client.post(
            "/nutrition/log",
            headers=test_user["headers"],
            json={
                "user_id": test_user["id"],
                "recipe_id": recipe,
                "servings_consumed": 1,
                "meal_type": "Dinner",
                "date": d.isoformat(),
            },
        )

    # Default: returns both
    res = await app_client.get(
        f"/nutrition/logs/{test_user['id']}",
        headers=test_user["headers"],
    )
    assert res.status_code == 200
    body = res.json()["data"]
    assert body["pagination"]["total"] == 2
    assert len(body["logs"]) == 2

    # Date-filtered: only today
    res = await app_client.get(
        f"/nutrition/logs/{test_user['id']}",
        headers=test_user["headers"],
        params={"start_date": today.isoformat(), "end_date": today.isoformat()},
    )
    assert res.status_code == 200
    body = res.json()["data"]
    assert body["pagination"]["total"] == 1


# ============================================================================
# /nutrition/log/{log_id} DELETE
# ============================================================================

@pytest.mark.asyncio
async def test_delete_log(app_client, test_user, today):
    create = await app_client.post(
        "/nutrition/log",
        headers=test_user["headers"],
        json={
            "user_id": test_user["id"],
            "recipe_id": SEEDED_BIRYANI,
            "servings_consumed": 1,
            "meal_type": "Snack",
            "date": today.isoformat(),
        },
    )
    log_id = create.json()["data"]["id"]

    # Delete it
    res = await app_client.delete(
        f"/nutrition/log/{log_id}",
        headers=test_user["headers"],
    )
    assert res.status_code == 200

    # Confirm gone — daily summary now shows zero for that recipe
    res = await app_client.get(
        f"/nutrition/daily/{test_user['id']}/{today.isoformat()}",
        headers=test_user["headers"],
    )
    daily = res.json()["data"]
    assert all(m.get("log_id") != log_id for m in daily["meals"])

    # 404 when deleting again
    res = await app_client.delete(
        f"/nutrition/log/{log_id}",
        headers=test_user["headers"],
    )
    assert res.status_code == 404


# ============================================================================
# /nutrition/weekly
# ============================================================================

@pytest.mark.asyncio
async def test_weekly_summary_returns_seven_days(app_client, test_user, today):
    res = await app_client.get(
        f"/nutrition/weekly/{test_user['id']}",
        headers=test_user["headers"],
    )
    assert res.status_code == 200
    body = res.json()["data"]
    assert len(body["days"]) == 7
    # Days are contiguous and ordered
    parsed = [date.fromisoformat(d["date"]) for d in body["days"]]
    for i in range(1, 7):
        assert parsed[i] - parsed[i - 1] == timedelta(days=1)


# ============================================================================
# /nutrition/monthly
# ============================================================================

@pytest.mark.asyncio
async def test_monthly_summary(app_client, test_user, today):
    # Empty user — buckets list should be empty but request succeeds.
    res = await app_client.get(
        f"/nutrition/monthly/{test_user['id']}",
        headers=test_user["headers"],
    )
    assert res.status_code == 200
    body = res.json()["data"]
    assert isinstance(body["weeks"], list)
    assert body["total_calories"] == 0


# ============================================================================
# Calculation service unit tests (no DB needed)
# ============================================================================

def test_per_serving_math():
    from app.services.calculation_service import per_serving

    totals = NutritionTotals(calories=2000, protein_g=160, carbs_g=200, fat_g=80, fiber_g=20, sodium_mg=4000)
    out = per_serving(totals, 4)
    assert out.calories == 500
    assert out.protein_g == 40


def test_per_serving_zero_servings_is_noop():
    from app.services.calculation_service import per_serving

    totals = NutritionTotals(calories=400)
    out = per_serving(totals, 0)
    assert out.calories == 400
