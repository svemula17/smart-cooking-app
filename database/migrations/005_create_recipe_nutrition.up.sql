-- 005_create_recipe_nutrition.up.sql
-- One row per recipe with macro data and dietitian verification metadata.

CREATE TABLE recipe_nutrition (
    recipe_id       UUID PRIMARY KEY REFERENCES recipes(id) ON DELETE CASCADE,
    calories        INTEGER NOT NULL,
    protein_g       DECIMAL(8, 2) NOT NULL,
    carbs_g         DECIMAL(8, 2) NOT NULL,
    fat_g           DECIMAL(8, 2) NOT NULL,
    fiber_g         DECIMAL(8, 2) NOT NULL DEFAULT 0,
    sodium_mg       DECIMAL(10, 2) NOT NULL DEFAULT 0,
    verified_date   TIMESTAMPTZ,
    verified_by     UUID REFERENCES users(id) ON DELETE SET NULL,

    CONSTRAINT recipe_nutrition_calories_nonneg CHECK (calories >= 0),
    CONSTRAINT recipe_nutrition_protein_nonneg CHECK (protein_g >= 0),
    CONSTRAINT recipe_nutrition_carbs_nonneg CHECK (carbs_g >= 0),
    CONSTRAINT recipe_nutrition_fat_nonneg CHECK (fat_g >= 0),
    CONSTRAINT recipe_nutrition_fiber_nonneg CHECK (fiber_g >= 0),
    CONSTRAINT recipe_nutrition_sodium_nonneg CHECK (sodium_mg >= 0),
    CONSTRAINT recipe_nutrition_verified_consistency CHECK (
        (verified_date IS NULL AND verified_by IS NULL)
        OR (verified_date IS NOT NULL AND verified_by IS NOT NULL)
    )
);

CREATE INDEX idx_recipe_nutrition_verified_by ON recipe_nutrition (verified_by);
CREATE INDEX idx_recipe_nutrition_calories ON recipe_nutrition (calories);
