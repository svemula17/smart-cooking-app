-- 007_create_daily_nutrition.up.sql
-- Daily macro rollup, one row per (user, date). Maintained via aggregation
-- jobs from nutrition_logs.

CREATE TABLE daily_nutrition (
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date                DATE NOT NULL,
    total_calories      INTEGER NOT NULL DEFAULT 0,
    total_protein_g     DECIMAL(8, 2) NOT NULL DEFAULT 0,
    total_carbs_g       DECIMAL(8, 2) NOT NULL DEFAULT 0,
    total_fat_g         DECIMAL(8, 2) NOT NULL DEFAULT 0,
    goal_calories       INTEGER NOT NULL DEFAULT 2000,
    goal_protein_g      DECIMAL(8, 2) NOT NULL DEFAULT 100,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id, date),

    CONSTRAINT daily_nutrition_calories_nonneg CHECK (total_calories >= 0),
    CONSTRAINT daily_nutrition_protein_nonneg CHECK (total_protein_g >= 0),
    CONSTRAINT daily_nutrition_carbs_nonneg CHECK (total_carbs_g >= 0),
    CONSTRAINT daily_nutrition_fat_nonneg CHECK (total_fat_g >= 0),
    CONSTRAINT daily_nutrition_goal_calories_positive CHECK (goal_calories > 0),
    CONSTRAINT daily_nutrition_goal_protein_nonneg CHECK (goal_protein_g >= 0)
);

CREATE INDEX idx_daily_nutrition_date ON daily_nutrition (date DESC);

CREATE TRIGGER daily_nutrition_set_updated_at
    BEFORE UPDATE ON daily_nutrition
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
