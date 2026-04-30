-- 015_add_user_is_admin.up.sql
-- Marks a user as an administrator. Recipe-service mutations require this flag.

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_users_admins ON users (is_admin) WHERE is_admin = TRUE;
