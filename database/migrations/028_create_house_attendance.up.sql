CREATE TABLE IF NOT EXISTS house_attendance (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id       UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  is_attending   BOOLEAN NOT NULL DEFAULT true,
  responded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (house_id, user_id, attendance_date)
);

CREATE INDEX IF NOT EXISTS house_attendance_house_date_idx ON house_attendance (house_id, attendance_date);
CREATE INDEX IF NOT EXISTS house_attendance_user_idx       ON house_attendance (user_id);
