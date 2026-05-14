CREATE TABLE IF NOT EXISTS meal_ratings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cook_schedule_id UUID NOT NULL REFERENCES cook_schedule(id) ON DELETE CASCADE,
  house_id         UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  rated_by         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating           INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cook_schedule_id, rated_by)
);

CREATE INDEX IF NOT EXISTS meal_ratings_house_idx    ON meal_ratings (house_id);
CREATE INDEX IF NOT EXISTS meal_ratings_schedule_idx ON meal_ratings (cook_schedule_id);
CREATE INDEX IF NOT EXISTS meal_ratings_user_idx     ON meal_ratings (rated_by);
