-- Add missing columns to shopping_lists
ALTER TABLE shopping_lists
  ADD COLUMN IF NOT EXISTS name        VARCHAR(255)             NOT NULL DEFAULT 'My Shopping List',
  ADD COLUMN IF NOT EXISTS recipe_ids  JSONB                    NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ              NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Add missing columns to shopping_items
ALTER TABLE shopping_items
  ADD COLUMN IF NOT EXISTS notes      TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Rename checked → is_checked for consistency
ALTER TABLE shopping_items
  RENAME COLUMN checked TO is_checked;

-- Add set_updated_at trigger to shopping_lists
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER shopping_lists_set_updated_at
  BEFORE UPDATE ON shopping_lists
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER shopping_items_set_updated_at
  BEFORE UPDATE ON shopping_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
