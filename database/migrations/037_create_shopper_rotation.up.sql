CREATE TABLE IF NOT EXISTS shopping_shopper_rotation (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id   UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  completed  BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (house_id, week_start)
);

CREATE INDEX IF NOT EXISTS shopper_rotation_house_idx ON shopping_shopper_rotation (house_id);
CREATE INDEX IF NOT EXISTS shopper_rotation_week_idx  ON shopping_shopper_rotation (house_id, week_start);
