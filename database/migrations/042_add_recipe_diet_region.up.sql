-- 042_add_recipe_diet_region.up.sql
-- Adds `diet` (veg/egg/nonveg — universal, derived from ingredients) and
-- `region` (Indian sub-cuisine, e.g. South Indian / Punjabi) to recipes.
-- Backfill lives in database/seeds/116_classify_diet_and_region.sql.

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS diet   TEXT;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS region TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recipes_diet_valid') THEN
    ALTER TABLE recipes
      ADD CONSTRAINT recipes_diet_valid
      CHECK (diet IS NULL OR diet IN ('veg', 'egg', 'nonveg'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_recipes_diet   ON recipes (diet);
CREATE INDEX IF NOT EXISTS idx_recipes_region ON recipes (region);
