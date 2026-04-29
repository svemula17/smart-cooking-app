-- 002_create_user_preferences.up.sql
-- One row per user holding macro goals and dietary preferences.

CREATE TABLE user_preferences (
    user_id                 UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    daily_calories          INTEGER NOT NULL DEFAULT 2000,
    daily_protein           INTEGER NOT NULL DEFAULT 100,
    daily_carbs             INTEGER NOT NULL DEFAULT 250,
    daily_fat               INTEGER NOT NULL DEFAULT 65,
    dietary_restrictions    JSONB NOT NULL DEFAULT '[]'::jsonb,
    favorite_cuisines       JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT user_preferences_calories_positive CHECK (daily_calories > 0),
    CONSTRAINT user_preferences_protein_positive CHECK (daily_protein >= 0),
    CONSTRAINT user_preferences_carbs_positive CHECK (daily_carbs >= 0),
    CONSTRAINT user_preferences_fat_positive CHECK (daily_fat >= 0),
    CONSTRAINT user_preferences_restrictions_is_array CHECK (jsonb_typeof(dietary_restrictions) = 'array'),
    CONSTRAINT user_preferences_cuisines_is_array CHECK (jsonb_typeof(favorite_cuisines) = 'array')
);

CREATE INDEX idx_user_preferences_restrictions ON user_preferences USING gin (dietary_restrictions);
CREATE INDEX idx_user_preferences_cuisines ON user_preferences USING gin (favorite_cuisines);

CREATE TRIGGER user_preferences_set_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
