-- 015_add_user_is_admin.down.sql
DROP INDEX IF EXISTS idx_users_admins;
ALTER TABLE users DROP COLUMN IF EXISTS is_admin;
