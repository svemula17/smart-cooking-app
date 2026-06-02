-- 114_dedupe_recipes.sql
-- 8 dish names existed twice in the recipes table because they were
-- inserted both by an early seed (id prefix b00000*) AND the
-- cuisine-expansion seeds (id prefix a00000* / a000005*). They had
-- different UUIDs but identical names, so the UI showed each one twice
-- in browse + search.
--
-- Strategy:
--   1. For each pair, KEEP the older `a00000*` ID and DROP the `b00000*` ID.
--   2. Before dropping, re-point FK references in child tables
--      (meal_plans, nutrition_logs, cook_schedule, shopping_list_items)
--      from the to-be-dropped ID to the kept ID — so user data is not lost.
--   3. recipe_ingredients + recipe_nutrition CASCADE delete automatically
--      with the dropped recipe row.
--
-- Idempotent: if the `b00000*` rows are already gone, the DELETE matches
-- zero rows and nothing happens.

BEGIN;

-- ─── Pair: (kept_id, doomed_id) ──────────────────────────────────────────
WITH pairs (kept, doomed) AS (VALUES
  ('a0000001-0000-0000-0000-000000000004'::uuid, 'b0000001-0000-0000-0000-000000000001'::uuid), -- Dal Makhani
  ('a0000001-0000-0000-0000-000000000006'::uuid, 'b0000001-0000-0000-0000-000000000002'::uuid), -- Samosa
  ('a0000003-0000-0000-0000-000000000020'::uuid, 'b0000003-0000-0000-0000-000000000001'::uuid), -- Tiramisu
  ('a0000005-0000-0000-0000-000000000026'::uuid, 'b0000005-0000-0000-0000-000000000001'::uuid), -- Pad Thai
  ('a0000005-0000-0000-0000-000000000027'::uuid, 'b0000005-0000-0000-0000-000000000002'::uuid), -- Thai Green Curry
  ('a0000005-0000-0000-0000-000000000028'::uuid, 'b0000005-0000-0000-0000-000000000003'::uuid), -- Tom Yum Soup
  ('a0000005-0000-0000-0000-000000000029'::uuid, 'b0000005-0000-0000-0000-000000000004'::uuid), -- Fresh Spring Rolls
  ('a0000005-0000-0000-0000-000000000030'::uuid, 'b0000005-0000-0000-0000-000000000005'::uuid)  -- Mango Sticky Rice
),
-- Re-point meal_plans first. We swallow the unique constraint hit by
-- deleting any meal_plan that would collide (same user+date+meal+recipe).
mp_dedupe AS (
  DELETE FROM meal_plans mp
  USING pairs p
  WHERE mp.recipe_id = p.doomed
    AND EXISTS (
      SELECT 1 FROM meal_plans mp2
      WHERE mp2.recipe_id = p.kept
        AND mp2.user_id = mp.user_id
        AND mp2.scheduled_date = mp.scheduled_date
        AND mp2.meal_type = mp.meal_type
    )
  RETURNING mp.id
),
mp_update AS (
  UPDATE meal_plans mp SET recipe_id = p.kept
  FROM pairs p WHERE mp.recipe_id = p.doomed
  RETURNING mp.id
),
nl_update AS (
  UPDATE nutrition_logs nl SET recipe_id = p.kept
  FROM pairs p WHERE nl.recipe_id = p.doomed
  RETURNING nl.id
),
cs_update AS (
  UPDATE cook_schedule cs SET recipe_id = p.kept
  FROM pairs p WHERE cs.recipe_id = p.doomed
  RETURNING cs.id
)
-- Finally, drop the doomed rows. CASCADE removes their ingredients +
-- nutrition.
DELETE FROM recipes r USING pairs p WHERE r.id = p.doomed;

COMMIT;
