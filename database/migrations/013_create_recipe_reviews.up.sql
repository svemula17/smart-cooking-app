-- 013_create_recipe_reviews.up.sql
-- One review per (recipe, user). Rating is 1-5 inclusive.

CREATE TABLE recipe_reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id   UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating      INTEGER NOT NULL,
    comment     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT recipe_reviews_rating_range CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT recipe_reviews_unique_per_user UNIQUE (recipe_id, user_id)
);

CREATE INDEX idx_recipe_reviews_recipe_id ON recipe_reviews (recipe_id);
CREATE INDEX idx_recipe_reviews_user_id ON recipe_reviews (user_id);
CREATE INDEX idx_recipe_reviews_recipe_created ON recipe_reviews (recipe_id, created_at DESC);

CREATE TRIGGER recipe_reviews_set_updated_at
    BEFORE UPDATE ON recipe_reviews
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
