-- 041_add_recipe_meal_types.down.sql

DROP INDEX IF EXISTS idx_recipes_meal_types;

ALTER TABLE recipes
  DROP CONSTRAINT IF EXISTS recipes_meal_types_valid;

ALTER TABLE recipes
  DROP COLUMN IF EXISTS meal_types;
