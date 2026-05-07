CREATE TABLE IF NOT EXISTS pantry_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  name        TEXT NOT NULL,
  quantity    NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit        TEXT NOT NULL DEFAULT 'units',
  category    TEXT NOT NULL DEFAULT 'other',
  location    TEXT NOT NULL DEFAULT 'pantry',
  expiry_date DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pantry_items_user_id_idx ON pantry_items (user_id);
