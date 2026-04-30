-- 014_create_recipe_ratings.down.sql
DROP TRIGGER IF EXISTS recipe_reviews_rating_aggregate_trg ON recipe_reviews;
DROP FUNCTION IF EXISTS recipe_reviews_rating_aggregate();
DROP FUNCTION IF EXISTS recompute_recipe_rating(UUID);
DROP TABLE IF EXISTS recipe_ratings CASCADE;
