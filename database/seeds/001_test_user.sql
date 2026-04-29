-- 001_test_user.sql
-- Test account: test@smartcooking.dev / password = "TestPass123!"
-- bcrypt hash generated with cost factor 12.

INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'test@smartcooking.dev',
    '$2b$12$KIXfJDrPQ8b3yqQHk9Yh3uX2cM5oVQ1LZ5wQqWqYxC8vJ6fW0t9Su',
    'Test Chef',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_preferences (
    user_id, daily_calories, daily_protein, daily_carbs, daily_fat,
    dietary_restrictions, favorite_cuisines
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    2200, 130, 250, 70,
    '["vegetarian-friendly"]'::jsonb,
    '["Indian", "Italian", "Chinese"]'::jsonb
)
ON CONFLICT (user_id) DO NOTHING;
