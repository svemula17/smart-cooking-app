-- 003_create_recipes.up.sql
-- Recipe catalog. instructions stored as JSONB array of step objects:
--   [{"order": 1, "instruction": "...", "duration_seconds": 120}, ...]

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE recipes (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    VARCHAR(255) NOT NULL,
    cuisine_type            VARCHAR(50),
    difficulty              VARCHAR(20),
    prep_time_minutes       INTEGER NOT NULL DEFAULT 0,
    cook_time_minutes       INTEGER NOT NULL DEFAULT 0,
    servings                INTEGER NOT NULL DEFAULT 1,
    instructions            JSONB NOT NULL DEFAULT '[]'::jsonb,
    image_url               VARCHAR(500),
    verified_by_dietitian   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT recipes_difficulty_valid CHECK (
        difficulty IS NULL OR difficulty IN ('Easy', 'Medium', 'Hard')
    ),
    CONSTRAINT recipes_prep_time_nonneg CHECK (prep_time_minutes >= 0),
    CONSTRAINT recipes_cook_time_nonneg CHECK (cook_time_minutes >= 0),
    CONSTRAINT recipes_servings_positive CHECK (servings > 0),
    CONSTRAINT recipes_instructions_is_array CHECK (jsonb_typeof(instructions) = 'array')
);

CREATE INDEX idx_recipes_cuisine_type ON recipes (cuisine_type);
CREATE INDEX idx_recipes_difficulty ON recipes (difficulty);
CREATE INDEX idx_recipes_verified ON recipes (verified_by_dietitian) WHERE verified_by_dietitian = TRUE;
CREATE INDEX idx_recipes_created_at ON recipes (created_at DESC);
CREATE INDEX idx_recipes_name_trgm ON recipes USING gin (name gin_trgm_ops);
