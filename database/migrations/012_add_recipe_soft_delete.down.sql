-- 012_add_recipe_soft_delete.down.sql
DROP INDEX IF EXISTS idx_recipes_active_created;
ALTER TABLE recipes DROP COLUMN IF EXISTS deleted_at;
