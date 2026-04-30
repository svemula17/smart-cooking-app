-- 014_create_recipe_ratings.up.sql
-- Pre-aggregated rating data per recipe. Maintained by a trigger on
-- recipe_reviews so reads stay cheap (no AVG/COUNT scans).

CREATE TABLE recipe_ratings (
    recipe_id       UUID PRIMARY KEY REFERENCES recipes(id) ON DELETE CASCADE,
    average_rating  NUMERIC(3, 2) NOT NULL DEFAULT 0,
    total_ratings   INTEGER NOT NULL DEFAULT 0,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT recipe_ratings_avg_range CHECK (average_rating BETWEEN 0 AND 5),
    CONSTRAINT recipe_ratings_total_nonneg CHECK (total_ratings >= 0)
);

CREATE INDEX idx_recipe_ratings_avg ON recipe_ratings (average_rating DESC, total_ratings DESC);

-- Recompute average + count for a single recipe and upsert.
CREATE OR REPLACE FUNCTION recompute_recipe_rating(p_recipe_id UUID)
RETURNS VOID AS $$
DECLARE
    v_avg   NUMERIC(3, 2);
    v_total INTEGER;
BEGIN
    SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0),
           COUNT(*)
      INTO v_avg, v_total
      FROM recipe_reviews
     WHERE recipe_id = p_recipe_id;

    INSERT INTO recipe_ratings (recipe_id, average_rating, total_ratings, updated_at)
    VALUES (p_recipe_id, v_avg, v_total, NOW())
    ON CONFLICT (recipe_id) DO UPDATE SET
        average_rating = EXCLUDED.average_rating,
        total_ratings  = EXCLUDED.total_ratings,
        updated_at     = NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION recipe_reviews_rating_aggregate()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM recompute_recipe_rating(OLD.recipe_id);
        RETURN OLD;
    END IF;

    PERFORM recompute_recipe_rating(NEW.recipe_id);
    -- Handle UPDATE that changes recipe_id (very unusual but possible).
    IF TG_OP = 'UPDATE' AND OLD.recipe_id <> NEW.recipe_id THEN
        PERFORM recompute_recipe_rating(OLD.recipe_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recipe_reviews_rating_aggregate_trg
    AFTER INSERT OR UPDATE OR DELETE ON recipe_reviews
    FOR EACH ROW EXECUTE FUNCTION recipe_reviews_rating_aggregate();
