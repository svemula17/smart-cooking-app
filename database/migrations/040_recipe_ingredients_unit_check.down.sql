-- 040_recipe_ingredients_unit_check.down.sql

ALTER TABLE recipe_ingredients
  DROP CONSTRAINT IF EXISTS recipe_ingredients_unit_valid;
