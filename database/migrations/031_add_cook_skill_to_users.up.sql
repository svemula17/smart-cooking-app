ALTER TABLE users
  ADD COLUMN IF NOT EXISTS cook_skill TEXT NOT NULL DEFAULT 'beginner'
    CHECK (cook_skill IN ('beginner', 'intermediate', 'advanced'));

CREATE INDEX IF NOT EXISTS users_cook_skill_idx ON users (cook_skill);
