-- 004_create_recipe_ingredients.up.sql

CREATE TABLE recipe_ingredients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id       UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_name VARCHAR(255) NOT NULL,
    quantity        DECIMAL(10, 3) NOT NULL,
    unit            VARCHAR(50) NOT NULL,
    notes           TEXT,

    CONSTRAINT recipe_ingredients_quantity_positive CHECK (quantity > 0)
);

CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients (recipe_id);
CREATE INDEX idx_recipe_ingredients_name_trgm ON recipe_ingredients USING gin (ingredient_name gin_trgm_ops);
