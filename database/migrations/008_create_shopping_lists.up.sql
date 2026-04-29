-- 008_create_shopping_lists.up.sql

CREATE TABLE shopping_lists (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status      VARCHAR(20) NOT NULL DEFAULT 'active',

    CONSTRAINT shopping_lists_status_valid CHECK (status IN ('active', 'completed'))
);

CREATE INDEX idx_shopping_lists_user_id ON shopping_lists (user_id);
CREATE INDEX idx_shopping_lists_user_active ON shopping_lists (user_id) WHERE status = 'active';
CREATE INDEX idx_shopping_lists_created_at ON shopping_lists (created_at DESC);
