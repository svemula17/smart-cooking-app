-- 006_create_nutrition_logs.up.sql
-- Per-meal log entries. auto_logged = TRUE when populated by a completed
-- cooking session (key UX feature: log meals automatically when user finishes
-- cooking a recipe).

CREATE TABLE nutrition_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id           UUID REFERENCES recipes(id) ON DELETE SET NULL,
    date                DATE NOT NULL,
    meal_type           VARCHAR(20) NOT NULL,
    servings_consumed   DECIMAL(6, 2) NOT NULL DEFAULT 1,
    calories            INTEGER NOT NULL,
    protein_g           DECIMAL(8, 2) NOT NULL,
    carbs_g             DECIMAL(8, 2) NOT NULL,
    fat_g               DECIMAL(8, 2) NOT NULL,
    logged_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    auto_logged         BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT nutrition_logs_meal_type_valid CHECK (
        meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')
    ),
    CONSTRAINT nutrition_logs_servings_positive CHECK (servings_consumed > 0),
    CONSTRAINT nutrition_logs_calories_nonneg CHECK (calories >= 0),
    CONSTRAINT nutrition_logs_protein_nonneg CHECK (protein_g >= 0),
    CONSTRAINT nutrition_logs_carbs_nonneg CHECK (carbs_g >= 0),
    CONSTRAINT nutrition_logs_fat_nonneg CHECK (fat_g >= 0)
);

CREATE INDEX idx_nutrition_logs_user_id ON nutrition_logs (user_id);
CREATE INDEX idx_nutrition_logs_recipe_id ON nutrition_logs (recipe_id);
CREATE INDEX idx_nutrition_logs_date ON nutrition_logs (date DESC);
CREATE INDEX idx_nutrition_logs_user_date ON nutrition_logs (user_id, date DESC);
CREATE INDEX idx_nutrition_logs_auto ON nutrition_logs (user_id, auto_logged) WHERE auto_logged = TRUE;
