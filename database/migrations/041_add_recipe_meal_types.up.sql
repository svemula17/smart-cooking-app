-- 041_add_recipe_meal_types.up.sql
-- Recipes gain a `meal_types` array so the app can filter a cuisine by meal
-- type (breakfast / lunch / dinner). A dish may belong to several meals, so an
-- array (not a single value) is used. Backfill lives in
-- database/seeds/115_classify_recipe_meal_types.sql.

ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS meal_types TEXT[] NOT NULL DEFAULT '{}';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'recipes_meal_types_valid'
  ) THEN
    ALTER TABLE recipes
      ADD CONSTRAINT recipes_meal_types_valid
      CHECK (meal_types <@ ARRAY['breakfast','lunch','dinner']::text[]);
  END IF;
END $$;

-- GIN index so `'breakfast' = ANY(meal_types)` / `meal_types && '{...}'` filters
-- stay fast.
CREATE INDEX IF NOT EXISTS idx_recipes_meal_types
  ON recipes USING gin (meal_types);
