CREATE TABLE IF NOT EXISTS prep_meals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id          UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  cooked_by         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  recipe_id         UUID NOT NULL REFERENCES recipes(id) ON DELETE RESTRICT,
  total_portions    INTEGER NOT NULL CHECK (total_portions > 0),
  remaining_portions INTEGER NOT NULL CHECK (remaining_portions >= 0),
  cooked_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  available_until   DATE
);

CREATE INDEX IF NOT EXISTS prep_meals_house_idx          ON prep_meals (house_id);
CREATE INDEX IF NOT EXISTS prep_meals_available_idx      ON prep_meals (house_id, available_until) WHERE remaining_portions > 0;
