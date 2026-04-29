-- 009_create_shopping_items.up.sql

CREATE TABLE shopping_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id         UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
    ingredient_name VARCHAR(255) NOT NULL,
    quantity        DECIMAL(10, 3) NOT NULL DEFAULT 1,
    unit            VARCHAR(50) NOT NULL DEFAULT 'unit',
    checked         BOOLEAN NOT NULL DEFAULT FALSE,
    aisle           VARCHAR(100),

    CONSTRAINT shopping_items_quantity_positive CHECK (quantity > 0)
);

CREATE INDEX idx_shopping_items_list_id ON shopping_items (list_id);
CREATE INDEX idx_shopping_items_list_unchecked ON shopping_items (list_id) WHERE checked = FALSE;
