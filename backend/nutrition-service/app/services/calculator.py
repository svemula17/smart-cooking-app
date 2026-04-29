from app.models.schemas import IngredientInput, NutritionInfo

# Lookup table per 100g — replace with USDA FDC API in production.
_PER_100G: dict[str, dict[str, float]] = {
    "chicken breast": {"calories": 165, "protein_g": 31, "carbs_g": 0, "fat_g": 3.6},
    "white rice":     {"calories": 130, "protein_g": 2.7, "carbs_g": 28, "fat_g": 0.3},
    "olive oil":      {"calories": 884, "protein_g": 0,   "carbs_g": 0,  "fat_g": 100},
    "broccoli":       {"calories": 34,  "protein_g": 2.8, "carbs_g": 7,  "fat_g": 0.4},
}


async def calculate_nutrition(ingredients: list[IngredientInput]) -> NutritionInfo:
    total = NutritionInfo(calories=0, protein_g=0, carbs_g=0, fat_g=0)
    for item in ingredients:
        per100 = _PER_100G.get(item.name.lower())
        if not per100:
            continue
        factor = item.quantity_g / 100.0
        total.calories += per100["calories"] * factor
        total.protein_g += per100["protein_g"] * factor
        total.carbs_g += per100["carbs_g"] * factor
        total.fat_g += per100["fat_g"] * factor
    return total
