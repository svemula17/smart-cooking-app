DROP TRIGGER IF EXISTS shopping_items_set_updated_at ON shopping_items;
DROP TRIGGER IF EXISTS shopping_lists_set_updated_at ON shopping_lists;

ALTER TABLE shopping_items RENAME COLUMN is_checked TO checked;

ALTER TABLE shopping_items
  DROP COLUMN IF EXISTS notes,
  DROP COLUMN IF EXISTS created_at,
  DROP COLUMN IF EXISTS updated_at;

ALTER TABLE shopping_lists
  DROP COLUMN IF EXISTS name,
  DROP COLUMN IF EXISTS recipe_ids,
  DROP COLUMN IF EXISTS updated_at,
  DROP COLUMN IF EXISTS completed_at;
