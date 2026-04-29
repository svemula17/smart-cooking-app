CREATE TABLE IF NOT EXISTS recipes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               TEXT NOT NULL,
    cuisine             TEXT NOT NULL,
    image_url           TEXT,
    prep_time_minutes   INTEGER NOT NULL DEFAULT 0,
    cook_time_minutes   INTEGER NOT NULL DEFAULT 0,
    servings            INTEGER NOT NULL DEFAULT 1,
    difficulty          TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    instructions        JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON recipes (cuisine);
CREATE INDEX IF NOT EXISTS idx_recipes_title_trgm ON recipes USING gin (title gin_trgm_ops);
