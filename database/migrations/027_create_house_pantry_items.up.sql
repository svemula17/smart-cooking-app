CREATE TABLE IF NOT EXISTS house_pantry_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id    UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  added_by    UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  name        TEXT NOT NULL,
  quantity    NUMERIC(10,2) NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  unit        TEXT NOT NULL DEFAULT 'units',
  category    TEXT NOT NULL DEFAULT 'other',
  location    TEXT NOT NULL DEFAULT 'pantry',
  expiry_date DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS house_pantry_items_house_id_idx   ON house_pantry_items (house_id);
CREATE INDEX IF NOT EXISTS house_pantry_items_expiry_idx     ON house_pantry_items (house_id, expiry_date) WHERE expiry_date IS NOT NULL;
