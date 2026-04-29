CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           CITEXT UNIQUE NOT NULL,
    name            TEXT NOT NULL DEFAULT '',
    password_hash   TEXT NOT NULL,
    dietary_preferences TEXT[] NOT NULL DEFAULT '{}',
    allergies       TEXT[] NOT NULL DEFAULT '{}',
    daily_calorie_goal INTEGER NOT NULL DEFAULT 2000,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
