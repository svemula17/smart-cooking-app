-- 109_unify_meal_type_to_lowercase.sql
-- Unifies the two diverging meal_type enums into one canonical lowercase form.
--
-- BEFORE this migration:
--   meal_plans.meal_type    ∈ {'breakfast','lunch','dinner'}          (lowercase, no snack)
--   nutrition_logs.meal_type ∈ {'Breakfast','Lunch','Dinner','Snack'} (capitalized + snack)
--
-- AFTER:
--   Both tables use {'breakfast','lunch','dinner','snack'} — lowercase
--   wins because (a) it's the wider usage today, (b) it matches the
--   Python convention used in nutrition-service routes, and (c) it
--   avoids forcing callers to know which casing to use per endpoint.
--
-- Idempotent: subsequent runs are no-ops because the data is already
-- lowercased and the new check constraint is already in place.

BEGIN;

-- ─── nutrition_logs: drop old (capitalized-only) constraint FIRST ────────
-- Otherwise the lowercase UPDATE below trips the old CHECK.
ALTER TABLE nutrition_logs DROP CONSTRAINT IF EXISTS nutrition_logs_meal_type_valid;

-- ─── nutrition_logs: lowercase existing rows ─────────────────────────────
UPDATE nutrition_logs
SET meal_type = LOWER(meal_type)
WHERE meal_type ~ '[A-Z]';

-- ─── nutrition_logs: install the new (lowercase + snack) constraint ──────
ALTER TABLE nutrition_logs ADD CONSTRAINT nutrition_logs_meal_type_valid
  CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack'));

-- ─── meal_plans: add 'snack' to the allowed set ──────────────────────────
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_meal_type_check;
ALTER TABLE meal_plans ADD CONSTRAINT meal_plans_meal_type_check
  CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack'));

COMMIT;
