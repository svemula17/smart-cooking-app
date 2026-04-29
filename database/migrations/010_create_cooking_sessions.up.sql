-- 010_create_cooking_sessions.up.sql
-- Tracks an in-progress or completed cooking attempt. When status flips to
-- 'completed', the app should also write a nutrition_logs row with auto_logged=TRUE.

CREATE TABLE cooking_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id       UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    status          VARCHAR(20) NOT NULL DEFAULT 'in_progress',

    CONSTRAINT cooking_sessions_status_valid CHECK (
        status IN ('in_progress', 'completed', 'abandoned')
    ),
    CONSTRAINT cooking_sessions_completed_consistency CHECK (
        (status = 'in_progress' AND completed_at IS NULL)
        OR (status IN ('completed', 'abandoned'))
    ),
    CONSTRAINT cooking_sessions_completed_after_started CHECK (
        completed_at IS NULL OR completed_at >= started_at
    )
);

CREATE INDEX idx_cooking_sessions_user_id ON cooking_sessions (user_id);
CREATE INDEX idx_cooking_sessions_recipe_id ON cooking_sessions (recipe_id);
CREATE INDEX idx_cooking_sessions_user_active ON cooking_sessions (user_id) WHERE status = 'in_progress';
CREATE INDEX idx_cooking_sessions_started_at ON cooking_sessions (started_at DESC);
