CREATE TABLE IF NOT EXISTS user_achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  house_id        UUID REFERENCES houses(id) ON DELETE SET NULL,
  achievement_key TEXT NOT NULL,
  earned_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, achievement_key)
);

CREATE TABLE IF NOT EXISTS house_achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id        UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  earned_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (house_id, achievement_key)
);

CREATE INDEX IF NOT EXISTS user_achievements_user_idx  ON user_achievements (user_id);
CREATE INDEX IF NOT EXISTS user_achievements_house_idx ON user_achievements (house_id);
CREATE INDEX IF NOT EXISTS house_achievements_idx      ON house_achievements (house_id);
