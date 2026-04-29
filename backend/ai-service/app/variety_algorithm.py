"""Variety algorithm: pick recipes that diversify cuisine, protein, and technique
relative to recently-cooked recipes."""

# Placeholder catalog. Production version queries recipe-service.
_CANDIDATE_POOL = [
    {"id": "r1", "cuisine": "Italian", "protein": "chicken", "technique": "saute"},
    {"id": "r2", "cuisine": "Japanese", "protein": "salmon", "technique": "grill"},
    {"id": "r3", "cuisine": "Mexican", "protein": "beef", "technique": "braise"},
    {"id": "r4", "cuisine": "Indian", "protein": "lentils", "technique": "simmer"},
    {"id": "r5", "cuisine": "Thai", "protein": "tofu", "technique": "stir-fry"},
    {"id": "r6", "cuisine": "French", "protein": "pork", "technique": "roast"},
]


def suggest_variety(recent_recipe_ids: list[str], count: int = 5) -> list[dict]:
    recent_set = set(recent_recipe_ids)
    candidates = [c for c in _CANDIDATE_POOL if c["id"] not in recent_set]

    seen_cuisines: set[str] = set()
    seen_proteins: set[str] = set()
    picked: list[dict] = []

    for cand in candidates:
        score = 0
        if cand["cuisine"] not in seen_cuisines:
            score += 2
        if cand["protein"] not in seen_proteins:
            score += 1
        if score > 0:
            picked.append(cand)
            seen_cuisines.add(cand["cuisine"])
            seen_proteins.add(cand["protein"])
        if len(picked) >= count:
            break
    return picked
