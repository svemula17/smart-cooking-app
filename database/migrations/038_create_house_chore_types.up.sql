CREATE TABLE IF NOT EXISTS house_chore_types (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id   UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  emoji      TEXT NOT NULL DEFAULT '🧹',
  frequency  TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (house_id, name)
);

CREATE INDEX IF NOT EXISTS house_chore_types_house_idx ON house_chore_types (house_id);
