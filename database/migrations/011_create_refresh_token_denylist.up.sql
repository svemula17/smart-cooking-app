-- 011_create_refresh_token_denylist.up.sql
-- Stores revoked refresh-token JTIs so /auth/logout can effectively
-- invalidate a token before its natural expiry.
--
-- Rows expire naturally and can be cleaned up periodically:
--   DELETE FROM refresh_token_denylist WHERE expires_at < NOW();

CREATE TABLE refresh_token_denylist (
    jti         UUID PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    revoked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMPTZ NOT NULL,

    CONSTRAINT refresh_token_denylist_expires_after_revoked CHECK (expires_at >= revoked_at)
);

CREATE INDEX idx_refresh_token_denylist_user_id ON refresh_token_denylist (user_id);
CREATE INDEX idx_refresh_token_denylist_expires_at ON refresh_token_denylist (expires_at);
