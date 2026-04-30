-- 012_add_recipe_soft_delete.up.sql
-- Adds soft-delete support to recipes. The recipe-service filters
-- `WHERE deleted_at IS NULL` on all read paths.

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_recipes_active_created
    ON recipes (created_at DESC)
    WHERE deleted_at IS NULL;
