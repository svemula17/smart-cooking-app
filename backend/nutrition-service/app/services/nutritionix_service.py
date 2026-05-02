"""Nutritionix integration.

Hits the natural-language endpoint with a query like ``"100 g chicken breast"``
and parses the per-ingredient macro response. When credentials are absent
(typical in dev/test), falls back to a small lookup table so the rest of the
service can be exercised without an external dependency.
"""

from __future__ import annotations

from typing import Iterable, Optional

import httpx

from app.config.settings import settings
from app.schemas.nutrition import IngredientInput, NutritionTotals


# Per-100g lookup used when Nutritionix credentials aren't configured.
# Values approximate USDA FDC entries; intentionally small to keep the dev
# stub self-contained.
_FALLBACK_PER_100G: dict[str, dict[str, float]] = {
    "chicken breast": {"calories": 165, "protein_g": 31.0, "carbs_g": 0.0,  "fat_g": 3.6,  "fiber_g": 0.0, "sodium_mg": 74.0},
    "chicken thigh":  {"calories": 209, "protein_g": 26.0, "carbs_g": 0.0,  "fat_g": 11.0, "fiber_g": 0.0, "sodium_mg": 95.0},
    "white rice":     {"calories": 130, "protein_g": 2.7,  "carbs_g": 28.0, "fat_g": 0.3,  "fiber_g": 0.4, "sodium_mg": 1.0},
    "basmati rice":   {"calories": 121, "protein_g": 3.5,  "carbs_g": 25.2, "fat_g": 0.4,  "fiber_g": 0.4, "sodium_mg": 1.0},
    "olive oil":      {"calories": 884, "protein_g": 0.0,  "carbs_g": 0.0,  "fat_g": 100.0,"fiber_g": 0.0, "sodium_mg": 2.0},
    "broccoli":       {"calories": 34,  "protein_g": 2.8,  "carbs_g": 7.0,  "fat_g": 0.4,  "fiber_g": 2.6, "sodium_mg": 33.0},
    "salmon":         {"calories": 208, "protein_g": 20.0, "carbs_g": 0.0,  "fat_g": 13.0, "fiber_g": 0.0, "sodium_mg": 59.0},
    "paneer":         {"calories": 296, "protein_g": 25.0, "carbs_g": 3.6,  "fat_g": 20.0, "fiber_g": 0.0, "sodium_mg": 22.0},
    "potato":         {"calories": 77,  "protein_g": 2.0,  "carbs_g": 17.0, "fat_g": 0.1,  "fiber_g": 2.2, "sodium_mg": 6.0},
    "onion":          {"calories": 40,  "protein_g": 1.1,  "carbs_g": 9.3,  "fat_g": 0.1,  "fiber_g": 1.7, "sodium_mg": 4.0},
    "tomato":         {"calories": 18,  "protein_g": 0.9,  "carbs_g": 3.9,  "fat_g": 0.2,  "fiber_g": 1.2, "sodium_mg": 5.0},
}


def _normalize_unit_to_grams(quantity: float, unit: str) -> float:
    """Coarse unit → grams conversion for the fallback path. Handles common
    weight units; for volume / count we approximate (1 cup ≈ 240g, 1 unit ≈ 100g)
    so that fallback queries still produce reasonable numbers."""
    u = unit.strip().lower()
    if u in ("g", "gram", "grams"):
        return quantity
    if u in ("kg", "kilogram", "kilograms"):
        return quantity * 1000
    if u in ("mg",):
        return quantity / 1000
    if u in ("oz", "ounce", "ounces"):
        return quantity * 28.3495
    if u in ("lb", "pound", "pounds"):
        return quantity * 453.592
    if u in ("ml", "milliliter", "milliliters"):
        return quantity  # treat ml as g for water-density approximation
    if u in ("l", "liter", "liters"):
        return quantity * 1000
    if u in ("cup", "cups"):
        return quantity * 240
    if u in ("tbsp", "tablespoon", "tablespoons"):
        return quantity * 15
    if u in ("tsp", "teaspoon", "teaspoons"):
        return quantity * 5
    if u in ("clove", "cloves"):
        return quantity * 5
    if u in ("unit", "piece", "pieces", "whole"):
        return quantity * 100
    return quantity * 100  # safe fallback


class NutritionixService:
    """Async client for Nutritionix's natural-language endpoint.

    Construct once per app instance (httpx.AsyncClient is reusable). In tests,
    inject a stub via ``monkeypatch`` or pass ``client`` directly."""

    def __init__(self, client: Optional[httpx.AsyncClient] = None) -> None:
        self._client = client

    async def _ensure_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=10.0)
        return self._client

    async def close(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None

    async def lookup(self, ingredients: Iterable[IngredientInput]) -> NutritionTotals:
        """Return summed macro totals for a list of ingredients."""
        if settings.has_nutritionix_credentials:
            return await self._lookup_via_api(list(ingredients))
        return self._lookup_via_fallback(list(ingredients))

    # ----- Live path ------------------------------------------------------

    async def _lookup_via_api(self, ingredients: list[IngredientInput]) -> NutritionTotals:
        client = await self._ensure_client()
        # Combine all ingredients into one query — Nutritionix supports
        # newline-delimited natural-language items. Cuts API calls per recipe
        # to one regardless of ingredient count.
        query = "\n".join(f"{ing.quantity} {ing.unit} {ing.name}" for ing in ingredients)
        try:
            resp = await client.post(
                f"{settings.nutritionix_base_url}/natural/nutrients",
                headers={
                    "x-app-id": settings.nutritionix_app_id,
                    "x-app-key": settings.nutritionix_api_key,
                    "Content-Type": "application/json",
                },
                json={"query": query},
            )
        except httpx.HTTPError as exc:
            raise NutritionixUnavailableError(str(exc)) from exc

        if resp.status_code >= 500:
            raise NutritionixUnavailableError(f"Nutritionix returned {resp.status_code}")
        if resp.status_code >= 400:
            # Treat client errors (bad query, etc.) as no-data-found; the
            # caller decides whether to fall back to the recipe's stored
            # nutrition. Don't propagate the exact upstream message.
            return NutritionTotals()

        return self._parse_api_response(resp.json())

    @staticmethod
    def _parse_api_response(payload: dict) -> NutritionTotals:
        totals = NutritionTotals()
        for food in payload.get("foods", []) or []:
            totals.calories += float(food.get("nf_calories", 0) or 0)
            totals.protein_g += float(food.get("nf_protein", 0) or 0)
            totals.carbs_g += float(food.get("nf_total_carbohydrate", 0) or 0)
            totals.fat_g += float(food.get("nf_total_fat", 0) or 0)
            totals.fiber_g += float(food.get("nf_dietary_fiber", 0) or 0)
            totals.sodium_mg += float(food.get("nf_sodium", 0) or 0)
        return totals

    # ----- Fallback path --------------------------------------------------

    @staticmethod
    def _lookup_via_fallback(ingredients: list[IngredientInput]) -> NutritionTotals:
        totals = NutritionTotals()
        for ing in ingredients:
            entry = _FALLBACK_PER_100G.get(ing.name.strip().lower())
            if entry is None:
                continue
            grams = _normalize_unit_to_grams(ing.quantity, ing.unit)
            factor = grams / 100.0
            totals.calories += entry["calories"] * factor
            totals.protein_g += entry["protein_g"] * factor
            totals.carbs_g += entry["carbs_g"] * factor
            totals.fat_g += entry["fat_g"] * factor
            totals.fiber_g += entry["fiber_g"] * factor
            totals.sodium_mg += entry["sodium_mg"] * factor
        return totals


class NutritionixUnavailableError(Exception):
    """Raised on transport errors or 5xx upstream — caller maps to 503."""


# Module-level singleton; lifecycle managed in main.py.
nutritionix_service = NutritionixService()
