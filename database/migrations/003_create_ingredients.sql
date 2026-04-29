CREATE TABLE IF NOT EXISTS ingredients (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT UNIQUE NOT NULL,
    fdc_id      TEXT,
    calories_per_100g  NUMERIC(8, 2),
    protein_per_100g   NUMERIC(8, 2),
    carbs_per_100g     NUMERIC(8, 2),
    fat_per_100g       NUMERIC(8, 2),
    fiber_per_100g     NUMERIC(8, 2),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
    recipe_id       UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id   UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    quantity        NUMERIC(10, 2) NOT NULL,
    unit            TEXT NOT NULL,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (recipe_id, ingredient_id)
);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe ON recipe_ingredients (recipe_id);
