CREATE TABLE IF NOT EXISTS nutrition_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id   UUID REFERENCES recipes(id) ON DELETE SET NULL,
    meal_type   TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    calories    NUMERIC(8, 2) NOT NULL,
    protein_g   NUMERIC(8, 2) NOT NULL,
    carbs_g     NUMERIC(8, 2) NOT NULL,
    fat_g       NUMERIC(8, 2) NOT NULL,
    fiber_g     NUMERIC(8, 2) DEFAULT 0,
    sugar_g     NUMERIC(8, 2) DEFAULT 0,
    consumed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_consumed ON nutrition_logs (user_id, consumed_at DESC);
