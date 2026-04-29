from app.variety_algorithm import suggest_variety


def test_excludes_recent():
    suggestions = suggest_variety(["r1", "r2"], count=3)
    ids = {s["id"] for s in suggestions}
    assert "r1" not in ids
    assert "r2" not in ids


def test_diversifies_cuisine():
    suggestions = suggest_variety([], count=3)
    cuisines = [s["cuisine"] for s in suggestions]
    assert len(cuisines) == len(set(cuisines))
