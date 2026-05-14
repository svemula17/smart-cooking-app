CREATE TABLE IF NOT EXISTS house_members (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id  UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (house_id, user_id)
);

CREATE INDEX IF NOT EXISTS house_members_house_id_idx ON house_members (house_id);
CREATE INDEX IF NOT EXISTS house_members_user_id_idx  ON house_members (user_id);
