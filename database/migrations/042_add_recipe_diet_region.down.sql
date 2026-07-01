-- 042_add_recipe_diet_region.down.sql

DROP INDEX IF EXISTS idx_recipes_region;
DROP INDEX IF EXISTS idx_recipes_diet;

ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_diet_valid;

ALTER TABLE recipes DROP COLUMN IF EXISTS region;
ALTER TABLE recipes DROP COLUMN IF EXISTS diet;
