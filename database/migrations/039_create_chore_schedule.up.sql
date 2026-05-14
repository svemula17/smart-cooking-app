CREATE TABLE IF NOT EXISTS chore_schedule (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id       UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  chore_type_id  UUID NOT NULL REFERENCES house_chore_types(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'skipped')),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (house_id, chore_type_id, scheduled_date)
);

CREATE INDEX IF NOT EXISTS chore_schedule_house_date_idx  ON chore_schedule (house_id, scheduled_date);
CREATE INDEX IF NOT EXISTS chore_schedule_type_idx        ON chore_schedule (house_id, chore_type_id);
CREATE INDEX IF NOT EXISTS chore_schedule_user_idx        ON chore_schedule (user_id);
CREATE INDEX IF NOT EXISTS chore_schedule_pending_idx     ON chore_schedule (house_id, scheduled_date) WHERE status = 'pending';
