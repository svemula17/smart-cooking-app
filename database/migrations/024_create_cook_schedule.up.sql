CREATE TABLE IF NOT EXISTS cook_schedule (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id       UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  recipe_id      UUID REFERENCES recipes(id) ON DELETE SET NULL,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cooking', 'done', 'skipped')),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (house_id, scheduled_date)
);

CREATE INDEX IF NOT EXISTS cook_schedule_house_id_idx        ON cook_schedule (house_id);
CREATE INDEX IF NOT EXISTS cook_schedule_user_id_idx         ON cook_schedule (user_id);
CREATE INDEX IF NOT EXISTS cook_schedule_house_date_idx      ON cook_schedule (house_id, scheduled_date);
CREATE INDEX IF NOT EXISTS cook_schedule_scheduled_date_idx  ON cook_schedule (scheduled_date);
