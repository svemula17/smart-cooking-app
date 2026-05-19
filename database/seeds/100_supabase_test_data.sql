-- 100_supabase_test_data.sql
-- Populates the production Supabase database for the user
-- vemulasaikumar259@gmail.com / id e18126c0-cb01-4460-9520-11634dfb5084.
--
-- Idempotent — safe to re-run.

BEGIN;

\set USER_ID '''e18126c0-cb01-4460-9520-11634dfb5084'''

-- ─── User Preferences ────────────────────────────────────────────────────────
INSERT INTO user_preferences (
    user_id, daily_calories, daily_protein, daily_carbs, daily_fat,
    dietary_restrictions, favorite_cuisines
) VALUES (
    'e18126c0-cb01-4460-9520-11634dfb5084',
    2400, 150, 280, 75,
    '[]'::jsonb,
    '["Indian", "Chinese", "Italian", "Mexican"]'::jsonb
)
ON CONFLICT (user_id) DO UPDATE SET
    daily_calories = EXCLUDED.daily_calories,
    daily_protein  = EXCLUDED.daily_protein,
    daily_carbs    = EXCLUDED.daily_carbs,
    daily_fat      = EXCLUDED.daily_fat,
    favorite_cuisines = EXCLUDED.favorite_cuisines;

-- ─── Pantry (12 staples) ─────────────────────────────────────────────────────
INSERT INTO pantry_items (id, user_id, name, quantity, unit, category, location, expiry_date) VALUES
  ('b1000001-0000-0000-0000-000000000001','e18126c0-cb01-4460-9520-11634dfb5084','Basmati Rice', 2.0,'kg','grain','pantry', CURRENT_DATE + INTERVAL '180 days'),
  ('b1000001-0000-0000-0000-000000000002','e18126c0-cb01-4460-9520-11634dfb5084','Chicken Breast', 1.5,'kg','protein','fridge', CURRENT_DATE + INTERVAL '3 days'),
  ('b1000001-0000-0000-0000-000000000003','e18126c0-cb01-4460-9520-11634dfb5084','Tomatoes', 6.0,'units','vegetable','fridge', CURRENT_DATE + INTERVAL '7 days'),
  ('b1000001-0000-0000-0000-000000000004','e18126c0-cb01-4460-9520-11634dfb5084','Onions', 5.0,'units','vegetable','pantry', CURRENT_DATE + INTERVAL '14 days'),
  ('b1000001-0000-0000-0000-000000000005','e18126c0-cb01-4460-9520-11634dfb5084','Garlic', 1.0,'units','vegetable','pantry', CURRENT_DATE + INTERVAL '21 days'),
  ('b1000001-0000-0000-0000-000000000006','e18126c0-cb01-4460-9520-11634dfb5084','Olive Oil', 750.0,'ml','oil','pantry', CURRENT_DATE + INTERVAL '365 days'),
  ('b1000001-0000-0000-0000-000000000007','e18126c0-cb01-4460-9520-11634dfb5084','Spaghetti', 500.0,'g','grain','pantry', CURRENT_DATE + INTERVAL '300 days'),
  ('b1000001-0000-0000-0000-000000000008','e18126c0-cb01-4460-9520-11634dfb5084','Eggs', 12.0,'units','protein','fridge', CURRENT_DATE + INTERVAL '14 days'),
  ('b1000001-0000-0000-0000-000000000009','e18126c0-cb01-4460-9520-11634dfb5084','Milk', 1.0,'l','dairy','fridge', CURRENT_DATE + INTERVAL '5 days'),
  ('b1000001-0000-0000-0000-00000000000a','e18126c0-cb01-4460-9520-11634dfb5084','Greek Yogurt', 500.0,'g','dairy','fridge', CURRENT_DATE + INTERVAL '10 days'),
  ('b1000001-0000-0000-0000-00000000000b','e18126c0-cb01-4460-9520-11634dfb5084','Cumin Powder', 100.0,'g','spice','pantry', CURRENT_DATE + INTERVAL '365 days'),
  ('b1000001-0000-0000-0000-00000000000c','e18126c0-cb01-4460-9520-11634dfb5084','Chili Powder', 80.0,'g','spice','pantry', CURRENT_DATE + INTERVAL '365 days')
ON CONFLICT (id) DO NOTHING;

-- ─── Meal Plans (a week of breakfast/lunch/dinner) ───────────────────────────
INSERT INTO meal_plans (user_id, recipe_id, scheduled_date, meal_type, cooking_time, completed) VALUES
  -- Today
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000001-0000-0000-0000-000000000003', CURRENT_DATE, 'breakfast', '08:00', false),
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000002-0000-0000-0000-000000000011', CURRENT_DATE, 'lunch',     '13:00', false),
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000001-0000-0000-0000-000000000002', CURRENT_DATE, 'dinner',    '19:00', false),
  -- Tomorrow
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000001-0000-0000-0000-000000000008', CURRENT_DATE + 1, 'breakfast','08:00', false),
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000002-0000-0000-0000-000000000013', CURRENT_DATE + 1, 'lunch',    '13:00', false),
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000001-0000-0000-0000-000000000001', CURRENT_DATE + 1, 'dinner',   '19:30', false),
  -- +2
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000001-0000-0000-0000-000000000009', CURRENT_DATE + 2, 'breakfast','08:00', false),
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000001-0000-0000-0000-000000000004', CURRENT_DATE + 2, 'lunch',    '13:00', false),
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000002-0000-0000-0000-000000000012', CURRENT_DATE + 2, 'dinner',   '19:00', false),
  -- +3
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000001-0000-0000-0000-000000000010', CURRENT_DATE + 3, 'breakfast','08:00', false),
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000001-0000-0000-0000-000000000003', CURRENT_DATE + 3, 'lunch',    '13:00', false),
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000001-0000-0000-0000-000000000002', CURRENT_DATE + 3, 'dinner',   '19:00', false),
  -- Yesterday
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000001-0000-0000-0000-000000000008', CURRENT_DATE - 1, 'breakfast','08:00', true),
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000001-0000-0000-0000-000000000003', CURRENT_DATE - 1, 'lunch',    '13:00', true),
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000001-0000-0000-0000-000000000001', CURRENT_DATE - 1, 'dinner',   '19:30', true),
  -- 2 days ago
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000001-0000-0000-0000-000000000009', CURRENT_DATE - 2, 'breakfast','08:00', true),
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000002-0000-0000-0000-000000000013', CURRENT_DATE - 2, 'lunch',    '13:00', true),
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000001-0000-0000-0000-000000000004', CURRENT_DATE - 2, 'dinner',   '19:00', true),
  -- 3 days ago
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000001-0000-0000-0000-000000000010', CURRENT_DATE - 3, 'breakfast','08:00', true),
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000001-0000-0000-0000-000000000003', CURRENT_DATE - 3, 'lunch',    '13:00', true),
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000002-0000-0000-0000-000000000011', CURRENT_DATE - 3, 'dinner',   '19:00', true)
ON CONFLICT (user_id, scheduled_date, meal_type) DO NOTHING;

-- ─── Daily Nutrition (last 7 days) ───────────────────────────────────────────
INSERT INTO daily_nutrition (user_id, date, total_calories, total_protein_g, total_carbs_g, total_fat_g, goal_calories, goal_protein_g) VALUES
  ('e18126c0-cb01-4460-9520-11634dfb5084', CURRENT_DATE,     1850, 110, 220, 60, 2400, 150),
  ('e18126c0-cb01-4460-9520-11634dfb5084', CURRENT_DATE - 1, 2310, 145, 270, 72, 2400, 150),
  ('e18126c0-cb01-4460-9520-11634dfb5084', CURRENT_DATE - 2, 2180, 138, 255, 68, 2400, 150),
  ('e18126c0-cb01-4460-9520-11634dfb5084', CURRENT_DATE - 3, 2425, 158, 290, 78, 2400, 150),
  ('e18126c0-cb01-4460-9520-11634dfb5084', CURRENT_DATE - 4, 2050, 125, 245, 65, 2400, 150),
  ('e18126c0-cb01-4460-9520-11634dfb5084', CURRENT_DATE - 5, 2380, 152, 275, 74, 2400, 150),
  ('e18126c0-cb01-4460-9520-11634dfb5084', CURRENT_DATE - 6, 2240, 140, 265, 70, 2400, 150)
ON CONFLICT (user_id, date) DO UPDATE SET
    total_calories  = EXCLUDED.total_calories,
    total_protein_g = EXCLUDED.total_protein_g,
    total_carbs_g   = EXCLUDED.total_carbs_g,
    total_fat_g     = EXCLUDED.total_fat_g;

-- ─── Nutrition Logs (yesterday's meals) ──────────────────────────────────────
-- meal_type is lowercase, unified with meal_plans via migration 109.
INSERT INTO nutrition_logs (id, user_id, recipe_id, date, meal_type, servings_consumed, calories, protein_g, carbs_g, fat_g) VALUES
  ('c2000001-0000-0000-0000-000000000001','e18126c0-cb01-4460-9520-11634dfb5084','a0000001-0000-0000-0000-000000000008', CURRENT_DATE - 1, 'breakfast', 1, 420, 14, 60, 14),
  ('c2000001-0000-0000-0000-000000000002','e18126c0-cb01-4460-9520-11634dfb5084','a0000001-0000-0000-0000-000000000003', CURRENT_DATE - 1, 'lunch',     1, 680, 38, 55, 28),
  ('c2000001-0000-0000-0000-000000000003','e18126c0-cb01-4460-9520-11634dfb5084','a0000001-0000-0000-0000-000000000001', CURRENT_DATE - 1, 'dinner',    1, 820, 52, 95, 22)
ON CONFLICT (id) DO NOTHING;

-- ─── Solo House: "Sai's Place" ───────────────────────────────────────────────
INSERT INTO houses (id, name, invite_code, created_by) VALUES
  ('d2000001-0000-0000-0000-000000000001', 'Sai''s Place', 'SAIPLACE', 'e18126c0-cb01-4460-9520-11634dfb5084')
ON CONFLICT (id) DO NOTHING;

INSERT INTO house_members (id, house_id, user_id, role) VALUES
  ('d3000001-0000-0000-0000-000000000001','d2000001-0000-0000-0000-000000000001','e18126c0-cb01-4460-9520-11634dfb5084','admin')
ON CONFLICT (house_id, user_id) DO NOTHING;

-- House chore types
INSERT INTO house_chore_types (id, house_id, name, emoji, frequency) VALUES
  ('d4000001-0000-0000-0000-000000000001','d2000001-0000-0000-0000-000000000001','Dishes',   '🍽️','daily'),
  ('d4000001-0000-0000-0000-000000000002','d2000001-0000-0000-0000-000000000001','Trash',    '🗑️','daily'),
  ('d4000001-0000-0000-0000-000000000003','d2000001-0000-0000-0000-000000000001','Vacuum',   '🧹','weekly'),
  ('d4000001-0000-0000-0000-000000000004','d2000001-0000-0000-0000-000000000001','Bathroom', '🛁','weekly'),
  ('d4000001-0000-0000-0000-000000000005','d2000001-0000-0000-0000-000000000001','Laundry',  '🧺','weekly')
ON CONFLICT (house_id, name) DO NOTHING;

-- ─── Cook Schedule (Sai cooks every day in solo mode) ────────────────────────
INSERT INTO cook_schedule (house_id, user_id, scheduled_date, recipe_id, status) VALUES
  ('d2000001-0000-0000-0000-000000000001','e18126c0-cb01-4460-9520-11634dfb5084', CURRENT_DATE,     'a0000001-0000-0000-0000-000000000002', 'pending'),
  ('d2000001-0000-0000-0000-000000000001','e18126c0-cb01-4460-9520-11634dfb5084', CURRENT_DATE + 1, 'a0000001-0000-0000-0000-000000000001', 'pending'),
  ('d2000001-0000-0000-0000-000000000001','e18126c0-cb01-4460-9520-11634dfb5084', CURRENT_DATE + 2, 'a0000002-0000-0000-0000-000000000012', 'pending'),
  ('d2000001-0000-0000-0000-000000000001','e18126c0-cb01-4460-9520-11634dfb5084', CURRENT_DATE + 3, 'a0000001-0000-0000-0000-000000000003', 'pending')
ON CONFLICT (house_id, scheduled_date) DO NOTHING;

-- ─── Chore Schedule (next few days) ──────────────────────────────────────────
INSERT INTO chore_schedule (house_id, chore_type_id, user_id, scheduled_date, status) VALUES
  ('d2000001-0000-0000-0000-000000000001','d4000001-0000-0000-0000-000000000001','e18126c0-cb01-4460-9520-11634dfb5084', CURRENT_DATE,     'pending'),
  ('d2000001-0000-0000-0000-000000000001','d4000001-0000-0000-0000-000000000002','e18126c0-cb01-4460-9520-11634dfb5084', CURRENT_DATE,     'pending'),
  ('d2000001-0000-0000-0000-000000000001','d4000001-0000-0000-0000-000000000003','e18126c0-cb01-4460-9520-11634dfb5084', CURRENT_DATE + 1, 'pending'),
  ('d2000001-0000-0000-0000-000000000001','d4000001-0000-0000-0000-000000000004','e18126c0-cb01-4460-9520-11634dfb5084', CURRENT_DATE + 2, 'pending')
ON CONFLICT (house_id, chore_type_id, scheduled_date) DO NOTHING;

-- ─── Shopping List + Items ───────────────────────────────────────────────────
INSERT INTO shopping_lists (id, user_id, name, status, recipe_ids, house_id) VALUES
  ('e3000001-0000-0000-0000-000000000001','e18126c0-cb01-4460-9520-11634dfb5084','Weekly Groceries','active','["a0000001-0000-0000-0000-000000000001","a0000001-0000-0000-0000-000000000002"]'::jsonb,'d2000001-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO shopping_items (id, list_id, ingredient_name, quantity, unit, is_checked, aisle) VALUES
  ('e4000001-0000-0000-0000-000000000001','e3000001-0000-0000-0000-000000000001','Basmati Rice',    2,  'kg',    false, 'Grains'),
  ('e4000001-0000-0000-0000-000000000002','e3000001-0000-0000-0000-000000000001','Chicken Thighs',  1.5,'kg',    false, 'Meat'),
  ('e4000001-0000-0000-0000-000000000003','e3000001-0000-0000-0000-000000000001','Yogurt',          500,'g',     false, 'Dairy'),
  ('e4000001-0000-0000-0000-000000000004','e3000001-0000-0000-0000-000000000001','Onions',          5,  'units', true,  'Produce'),
  ('e4000001-0000-0000-0000-000000000005','e3000001-0000-0000-0000-000000000001','Tomatoes',        6,  'units', true,  'Produce'),
  ('e4000001-0000-0000-0000-000000000006','e3000001-0000-0000-0000-000000000001','Ginger',          100,'g',     false, 'Produce'),
  ('e4000001-0000-0000-0000-000000000007','e3000001-0000-0000-0000-000000000001','Garam Masala',    50, 'g',     false, 'Spices'),
  ('e4000001-0000-0000-0000-000000000008','e3000001-0000-0000-0000-000000000001','Heavy Cream',     250,'ml',    false, 'Dairy')
ON CONFLICT (id) DO NOTHING;

-- ─── Expenses (solo — all paid by Sai) ───────────────────────────────────────
INSERT INTO expenses (id, house_id, paid_by, amount, description, category) VALUES
  ('f2000001-0000-0000-0000-000000000001','d2000001-0000-0000-0000-000000000001','e18126c0-cb01-4460-9520-11634dfb5084', 87.42, 'Costco trip',           'groceries'),
  ('f2000001-0000-0000-0000-000000000002','d2000001-0000-0000-0000-000000000001','e18126c0-cb01-4460-9520-11634dfb5084', 42.15, 'Trader Joe''s produce', 'groceries'),
  ('f2000001-0000-0000-0000-000000000003','d2000001-0000-0000-0000-000000000001','e18126c0-cb01-4460-9520-11634dfb5084', 23.80, 'Indian grocery spices', 'groceries')
ON CONFLICT (id) DO NOTHING;

-- Expense splits = full amount on Sai (solo house)
INSERT INTO expense_splits (expense_id, user_id, amount)
SELECT id, paid_by, amount FROM expenses
WHERE house_id = 'd2000001-0000-0000-0000-000000000001'
ON CONFLICT (expense_id, user_id) DO NOTHING;

COMMIT;
