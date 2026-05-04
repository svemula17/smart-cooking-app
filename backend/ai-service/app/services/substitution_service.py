"""Ingredient substitution lookup.

A small curated database covers the most common cooking substitutions; the
table is intentionally small and easy to extend. For unknown ingredients we
fall back to a generic message so the endpoint never returns nothing.

Dietary restrictions filter the result set: ``vegan`` and ``vegetarian``
remove animal-derived options; ``gluten-free`` and ``dairy-free`` likewise.
"""

from __future__ import annotations

from typing import Iterable

# Tag set used both to filter and to surface in the notes string.
_DAIRY_TAGS = {"dairy"}
_VEGAN_BLOCK_TAGS = {"dairy", "egg", "honey", "meat", "fish"}
_VEGETARIAN_BLOCK_TAGS = {"meat", "fish"}
_GLUTEN_TAGS = {"gluten"}


SUBSTITUTION_DB: dict[str, list[dict]] = {
    "yogurt": [
        {"name": "sour cream", "ratio": "1:1", "notes": "Similar tang and consistency.", "tags": ["dairy"]},
        {"name": "buttermilk", "ratio": "1:1", "notes": "Reduce other liquids by 1/4 cup.", "tags": ["dairy"]},
        {"name": "coconut yogurt", "ratio": "1:1", "notes": "Dairy-free, slightly sweeter.", "tags": ["vegan", "dairy-free"]},
        {"name": "silken tofu (blended)", "ratio": "1:1", "notes": "Vegan; whisk until smooth before using.", "tags": ["vegan", "dairy-free"]},
    ],
    "butter": [
        {"name": "ghee", "ratio": "1:1", "notes": "Higher smoke point, lactose-free.", "tags": ["dairy"]},
        {"name": "olive oil", "ratio": "3:4", "notes": "Use 3/4 cup oil per 1 cup butter; best for sautés.", "tags": ["vegan", "dairy-free"]},
        {"name": "coconut oil", "ratio": "1:1", "notes": "Solid at cool temp; good for baking.", "tags": ["vegan", "dairy-free"]},
        {"name": "vegan butter", "ratio": "1:1", "notes": "Designed as a 1:1 replacement.", "tags": ["vegan", "dairy-free"]},
    ],
    "milk": [
        {"name": "almond milk", "ratio": "1:1", "notes": "Mild flavor; avoid if cooking down for sweetness.", "tags": ["vegan", "dairy-free"]},
        {"name": "oat milk", "ratio": "1:1", "notes": "Creamy; great for baking and coffee.", "tags": ["vegan", "dairy-free"]},
        {"name": "soy milk", "ratio": "1:1", "notes": "Most protein of plant milks; good for béchamel.", "tags": ["vegan", "dairy-free"]},
    ],
    "egg": [
        {"name": "flax egg (1 tbsp ground flax + 3 tbsp water)", "ratio": "1 egg", "notes": "Best for baking quick breads and muffins.", "tags": ["vegan", "dairy-free"]},
        {"name": "chia egg (1 tbsp chia + 3 tbsp water)", "ratio": "1 egg", "notes": "Sets thicker than flax — good for cookies.", "tags": ["vegan", "dairy-free"]},
        {"name": "applesauce (1/4 cup)", "ratio": "1 egg", "notes": "Adds sweetness and moisture; not for savory dishes.", "tags": ["vegan", "dairy-free"]},
    ],
    "all-purpose flour": [
        {"name": "1-to-1 gluten-free flour blend", "ratio": "1:1", "notes": "Look for blends with xanthan gum included.", "tags": ["gluten-free"]},
        {"name": "almond flour", "ratio": "1:1 (with adjustments)", "notes": "Reduce liquid; best for cookies and quick breads.", "tags": ["gluten-free"]},
        {"name": "oat flour", "ratio": "1:1", "notes": "Use certified gluten-free oats for celiac diets.", "tags": ["gluten-free"]},
    ],
    "soy sauce": [
        {"name": "tamari", "ratio": "1:1", "notes": "Naturally gluten-free Japanese soy sauce.", "tags": ["gluten-free"]},
        {"name": "coconut aminos", "ratio": "1:1", "notes": "Soy-free, slightly sweeter.", "tags": ["gluten-free", "soy-free"]},
    ],
    "heavy cream": [
        {"name": "evaporated milk", "ratio": "1:1", "notes": "Lower fat; thinner final sauce.", "tags": ["dairy"]},
        {"name": "coconut cream", "ratio": "1:1", "notes": "Imparts a faint coconut flavor.", "tags": ["vegan", "dairy-free"]},
        {"name": "cashew cream", "ratio": "1:1", "notes": "Soak cashews 4h then blend with water.", "tags": ["vegan", "dairy-free"]},
    ],
    "sugar": [
        {"name": "honey", "ratio": "3:4", "notes": "Reduce liquid by 1/4 cup; lower oven by 25°F.", "tags": []},
        {"name": "maple syrup", "ratio": "3:4", "notes": "Reduce liquid; pairs well with warm spices.", "tags": ["vegan"]},
    ],
    "wine": [
        {"name": "stock + lemon juice", "ratio": "1 cup wine = 1 cup stock + 1 tbsp lemon", "notes": "Brings acidity without alcohol.", "tags": []},
    ],
}


def _matches_restrictions(sub: dict, restrictions: Iterable[str]) -> bool:
    """Return True if a substitution is compatible with all restrictions.

    The match is conservative — if a restriction blocks any tag the sub has,
    the sub is excluded.
    """
    sub_tags = set(sub.get("tags", []))
    for r in (s.lower() for s in restrictions):
        if r == "vegan" and sub_tags & _VEGAN_BLOCK_TAGS:
            return False
        if r == "vegetarian" and sub_tags & _VEGETARIAN_BLOCK_TAGS:
            return False
        if r in {"dairy-free", "lactose-free"} and sub_tags & _DAIRY_TAGS:
            return False
        if r == "gluten-free" and sub_tags & _GLUTEN_TAGS:
            return False
    return True


def get_substitutes(
    *, ingredient: str, dietary_restrictions: list[str] | None = None
) -> list[dict]:
    """Return substitutions for an ingredient, filtered by dietary restrictions.

    The match is case-insensitive and tolerant of trailing whitespace; common
    plurals are stripped (``eggs`` → ``egg``).
    """
    key = ingredient.strip().lower()
    if key.endswith("s") and key[:-1] in SUBSTITUTION_DB:
        key = key[:-1]

    raw = SUBSTITUTION_DB.get(key, [])
    restrictions = [r for r in (dietary_restrictions or [])]
    filtered = [
        {k: v for k, v in sub.items() if k != "tags"}
        for sub in raw
        if _matches_restrictions(sub, restrictions)
    ]
    if filtered:
        return filtered

    # Fallback: a single generic suggestion so the UI always has something.
    return [
        {
            "name": "Search a substitution database",
            "ratio": "varies",
            "notes": (
                f"No curated substitution found for '{ingredient}'. "
                "Search Cook's Illustrated or your culinary reference for guidance."
            ),
        }
    ]
