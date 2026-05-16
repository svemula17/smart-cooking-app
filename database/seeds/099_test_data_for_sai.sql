-- 099_test_data_for_sai.sql
-- Comprehensive test data tied to user Sai Kumar (saikumarvemula.us@gmail.com).
-- Idempotent: safe to re-run.
-- Target user: e71b4d59-3561-4f5f-ab82-435128e8ec57

BEGIN;

-- ─── User Preferences (Macros + Cuisine likes) ────────────────────────────────
INSERT INTO user_preferences (
    user_id, daily_calories, daily_protein, daily_carbs, daily_fat,
    dietary_restrictions, favorite_cuisines
) VALUES (
    'e71b4d59-3561-4f5f-ab82-435128e8ec57',
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

-- ─── Pantry Items (12 staples) ────────────────────────────────────────────────
INSERT INTO pantry_items (id, user_id, name, quantity, unit, category, location, expiry_date) VALUES
  ('a1000001-0000-0000-0000-000000000001','e71b4d59-3561-4f5f-ab82-435128e8ec57','Basmati Rice', 2.0,'kg','grain','pantry', CURRENT_DATE + INTERVAL '180 days'),
  ('a1000001-0000-0000-0000-000000000002','e71b4d59-3561-4f5f-ab82-435128e8ec57','Chicken Breast', 1.5,'kg','protein','fridge', CURRENT_DATE + INTERVAL '3 days'),
  ('a1000001-0000-0000-0000-000000000003','e71b4d59-3561-4f5f-ab82-435128e8ec57','Tomatoes', 6.0,'units','vegetable','fridge', CURRENT_DATE + INTERVAL '7 days'),
  ('a1000001-0000-0000-0000-000000000004','e71b4d59-3561-4f5f-ab82-435128e8ec57','Onions', 5.0,'units','vegetable','pantry', CURRENT_DATE + INTERVAL '14 days'),
  ('a1000001-0000-0000-0000-000000000005','e71b4d59-3561-4f5f-ab82-435128e8ec57','Garlic', 1.0,'units','vegetable','pantry', CURRENT_DATE + INTERVAL '21 days'),
  ('a1000001-0000-0000-0000-000000000006','e71b4d59-3561-4f5f-ab82-435128e8ec57','Olive Oil', 750.0,'ml','oil','pantry', CURRENT_DATE + INTERVAL '365 days'),
  ('a1000001-0000-0000-0000-000000000007','e71b4d59-3561-4f5f-ab82-435128e8ec57','Spaghetti', 500.0,'g','grain','pantry', CURRENT_DATE + INTERVAL '300 days'),
  ('a1000001-0000-0000-0000-000000000008','e71b4d59-3561-4f5f-ab82-435128e8ec57','Eggs', 12.0,'units','protein','fridge', CURRENT_DATE + INTERVAL '14 days'),
  ('a1000001-0000-0000-0000-000000000009','e71b4d59-3561-4f5f-ab82-435128e8ec57','Milk', 1.0,'l','dairy','fridge', CURRENT_DATE + INTERVAL '5 days'),
  ('a1000001-0000-0000-0000-00000000000a','e71b4d59-3561-4f5f-ab82-435128e8ec57','Greek Yogurt', 500.0,'g','dairy','fridge', CURRENT_DATE + INTERVAL '10 days'),
  ('a1000001-0000-0000-0000-00000000000b','e71b4d59-3561-4f5f-ab82-435128e8ec57','Cumin Powder', 100.0,'g','spice','pantry', CURRENT_DATE + INTERVAL '365 days'),
  ('a1000001-0000-0000-0000-00000000000c','e71b4d59-3561-4f5f-ab82-435128e8ec57','Chili Powder', 80.0,'g','spice','pantry', CURRENT_DATE + INTERVAL '365 days')
ON CONFLICT (id) DO NOTHING;

-- ─── Meal Plans (last 7 days × 3 meals) ───────────────────────────────────────
-- Real recipe IDs verified to exist.
INSERT INTO meal_plans (user_id, recipe_id, scheduled_date, meal_type, cooking_time, completed) VALUES
  -- Today
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57','a0000001-0000-0000-0000-000000000003', CURRENT_DATE, 'breakfast', '08:00', false),
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57','a0000002-0000-0000-0000-000000000011', CURRENT_DATE, 'lunch',     '13:00', false),
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57','a0000001-0000-0000-0000-000000000002', CURRENT_DATE, 'dinner',    '19:00', false),
  -- +1 day
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57','a0000001-0000-0000-0000-000000000008', CURRENT_DATE + 1, 'breakfast','08:00', false),
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57','a0000002-0000-0000-0000-000000000013', CURRENT_DATE + 1, 'lunch',    '13:00', false),
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57','a0000001-0000-0000-0000-000000000001', CURRENT_DATE + 1, 'dinner',   '19:30', false),
  -- +2 day
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57','a0000001-0000-0000-0000-000000000009', CURRENT_DATE + 2, 'breakfast','08:00', false),
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57','a0000001-0000-0000-0000-000000000004', CURRENT_DATE + 2, 'lunch',    '13:00', false),
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57','a0000002-0000-0000-0000-000000000012', CURRENT_DATE + 2, 'dinner',   '19:00', false),
  -- +3 day
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57','a0000001-0000-0000-0000-000000000010', CURRENT_DATE + 3, 'breakfast','08:00', false),
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57','a0000001-0000-0000-0000-000000000003', CURRENT_DATE + 3, 'lunch',    '13:00', false),
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57','a0000001-0000-0000-0000-000000000002', CURRENT_DATE + 3, 'dinner',   '19:00', false),
  -- Yesterday
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57','a0000001-0000-0000-0000-000000000008', CURRENT_DATE - 1, 'breakfast','08:00', true),
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57','a0000001-0000-0000-0000-000000000003', CURRENT_DATE - 1, 'lunch',    '13:00', true),
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57','a0000001-0000-0000-0000-000000000001', CURRENT_DATE - 1, 'dinner',   '19:30', true),
  -- 2 days ago
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57','a0000001-0000-0000-0000-000000000009', CURRENT_DATE - 2, 'breakfast','08:00', true),
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57','a0000002-0000-0000-0000-000000000013', CURRENT_DATE - 2, 'lunch',    '13:00', true),
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57','a0000001-0000-0000-0000-000000000004', CURRENT_DATE - 2, 'dinner',   '19:00', true),
  -- 3 days ago
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57','a0000001-0000-0000-0000-000000000010', CURRENT_DATE - 3, 'breakfast','08:00', true),
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57','a0000001-0000-0000-0000-000000000003', CURRENT_DATE - 3, 'lunch',    '13:00', true),
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57','a0000002-0000-0000-0000-000000000011', CURRENT_DATE - 3, 'dinner',   '19:00', true)
ON CONFLICT (user_id, scheduled_date, meal_type) DO NOTHING;

-- ─── Daily Nutrition (last 7 days) ────────────────────────────────────────────
INSERT INTO daily_nutrition (user_id, date, total_calories, total_protein_g, total_carbs_g, total_fat_g, goal_calories, goal_protein_g) VALUES
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57', CURRENT_DATE,     1850, 110, 220, 60, 2400, 150),
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57', CURRENT_DATE - 1, 2310, 145, 270, 72, 2400, 150),
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57', CURRENT_DATE - 2, 2180, 138, 255, 68, 2400, 150),
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57', CURRENT_DATE - 3, 2425, 158, 290, 78, 2400, 150),
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57', CURRENT_DATE - 4, 2050, 125, 245, 65, 2400, 150),
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57', CURRENT_DATE - 5, 2380, 152, 275, 74, 2400, 150),
  ('e71b4d59-3561-4f5f-ab82-435128e8ec57', CURRENT_DATE - 6, 2240, 140, 265, 70, 2400, 150)
ON CONFLICT (user_id, date) DO UPDATE SET
    total_calories  = EXCLUDED.total_calories,
    total_protein_g = EXCLUDED.total_protein_g,
    total_carbs_g   = EXCLUDED.total_carbs_g,
    total_fat_g     = EXCLUDED.total_fat_g;

-- ─── Nutrition Logs (matching yesterday's meals) ──────────────────────────────
INSERT INTO nutrition_logs (id, user_id, recipe_id, date, meal_type, servings_consumed, calories, protein_g, carbs_g, fat_g) VALUES
  ('c1000001-0000-0000-0000-000000000001','e71b4d59-3561-4f5f-ab82-435128e8ec57','a0000001-0000-0000-0000-000000000008', CURRENT_DATE - 1, 'Breakfast', 1, 420, 14, 60, 14),
  ('c1000001-0000-0000-0000-000000000002','e71b4d59-3561-4f5f-ab82-435128e8ec57','a0000001-0000-0000-0000-000000000003', CURRENT_DATE - 1, 'Lunch',     1, 680, 38, 55, 28),
  ('c1000001-0000-0000-0000-000000000003','e71b4d59-3561-4f5f-ab82-435128e8ec57','a0000001-0000-0000-0000-000000000001', CURRENT_DATE - 1, 'Dinner',    1, 820, 52, 95, 22)
ON CONFLICT (id) DO NOTHING;

-- ─── House: "Sai's Apartment" ─────────────────────────────────────────────────
INSERT INTO houses (id, name, invite_code, created_by) VALUES
  ('d1000001-0000-0000-0000-000000000001', 'Sai''s Apartment', 'SAIHOME', 'e71b4d59-3561-4f5f-ab82-435128e8ec57')
ON CONFLICT (id) DO NOTHING;

-- House members: Sai (admin) + Test Chef + Demo User
INSERT INTO house_members (id, house_id, user_id, role) VALUES
  ('d2000001-0000-0000-0000-000000000001','d1000001-0000-0000-0000-000000000001','e71b4d59-3561-4f5f-ab82-435128e8ec57','admin'),
  ('d2000001-0000-0000-0000-000000000002','d1000001-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','member'),
  ('d2000001-0000-0000-0000-000000000003','d1000001-0000-0000-0000-000000000001','19e80a95-eb13-4536-954a-a0e8f8dd0fec','member')
ON CONFLICT (house_id, user_id) DO NOTHING;

-- ─── House Chore Types ────────────────────────────────────────────────────────
INSERT INTO house_chore_types (id, house_id, name, emoji, frequency) VALUES
  ('d3000001-0000-0000-0000-000000000001','d1000001-0000-0000-0000-000000000001','Dishes',   '🍽️','daily'),
  ('d3000001-0000-0000-0000-000000000002','d1000001-0000-0000-0000-000000000001','Trash',    '🗑️','daily'),
  ('d3000001-0000-0000-0000-000000000003','d1000001-0000-0000-0000-000000000001','Vacuum',   '🧹','weekly'),
  ('d3000001-0000-0000-0000-000000000004','d1000001-0000-0000-0000-000000000001','Bathroom', '🛁','weekly'),
  ('d3000001-0000-0000-0000-000000000005','d1000001-0000-0000-0000-000000000001','Laundry',  '🧺','weekly')
ON CONFLICT (house_id, name) DO NOTHING;

-- ─── Cook Schedule (next 7 days, rotating cooks) ──────────────────────────────
INSERT INTO cook_schedule (house_id, user_id, scheduled_date, recipe_id, status, notes) VALUES
  ('d1000001-0000-0000-0000-000000000001','e71b4d59-3561-4f5f-ab82-435128e8ec57', CURRENT_DATE,     'a0000001-0000-0000-0000-000000000002', 'pending', 'Sai cooks tonight'),
  ('d1000001-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111', CURRENT_DATE + 1, 'a0000001-0000-0000-0000-000000000001', 'pending', 'Test Chef on biryani'),
  ('d1000001-0000-0000-0000-000000000001','19e80a95-eb13-4536-954a-a0e8f8dd0fec', CURRENT_DATE + 2, 'a0000002-0000-0000-0000-000000000012', 'pending', 'Demo''s turn'),
  ('d1000001-0000-0000-0000-000000000001','e71b4d59-3561-4f5f-ab82-435128e8ec57', CURRENT_DATE + 3, 'a0000001-0000-0000-0000-000000000003', 'pending', NULL),
  ('d1000001-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111', CURRENT_DATE + 4, 'a0000001-0000-0000-0000-000000000004', 'pending', NULL),
  ('d1000001-0000-0000-0000-000000000001','19e80a95-eb13-4536-954a-a0e8f8dd0fec', CURRENT_DATE + 5, 'a0000002-0000-0000-0000-000000000013', 'pending', NULL),
  ('d1000001-0000-0000-0000-000000000001','e71b4d59-3561-4f5f-ab82-435128e8ec57', CURRENT_DATE + 6, 'a0000001-0000-0000-0000-000000000010', 'pending', NULL)
ON CONFLICT (house_id, scheduled_date) DO NOTHING;

-- ─── Chore Schedule (next 7 days, rotating) ───────────────────────────────────
INSERT INTO chore_schedule (house_id, chore_type_id, user_id, scheduled_date, status) VALUES
  ('d1000001-0000-0000-0000-000000000001','d3000001-0000-0000-0000-000000000001','e71b4d59-3561-4f5f-ab82-435128e8ec57', CURRENT_DATE,     'pending'),
  ('d1000001-0000-0000-0000-000000000001','d3000001-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111', CURRENT_DATE,     'pending'),
  ('d1000001-0000-0000-0000-000000000001','d3000001-0000-0000-0000-000000000001','19e80a95-eb13-4536-954a-a0e8f8dd0fec', CURRENT_DATE + 1, 'pending'),
  ('d1000001-0000-0000-0000-000000000001','d3000001-0000-0000-0000-000000000002','e71b4d59-3561-4f5f-ab82-435128e8ec57', CURRENT_DATE + 1, 'pending'),
  ('d1000001-0000-0000-0000-000000000001','d3000001-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111', CURRENT_DATE + 2, 'pending'),
  ('d1000001-0000-0000-0000-000000000001','d3000001-0000-0000-0000-000000000004','19e80a95-eb13-4536-954a-a0e8f8dd0fec', CURRENT_DATE + 3, 'pending'),
  ('d1000001-0000-0000-0000-000000000001','d3000001-0000-0000-0000-000000000005','e71b4d59-3561-4f5f-ab82-435128e8ec57', CURRENT_DATE + 4, 'pending')
ON CONFLICT (house_id, chore_type_id, scheduled_date) DO NOTHING;

-- ─── Shopping List + Items ────────────────────────────────────────────────────
INSERT INTO shopping_lists (id, user_id, name, status, recipe_ids, house_id) VALUES
  ('e1000001-0000-0000-0000-000000000001','e71b4d59-3561-4f5f-ab82-435128e8ec57','Weekly Groceries','active','["a0000001-0000-0000-0000-000000000001","a0000001-0000-0000-0000-000000000002"]'::jsonb,'d1000001-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO shopping_items (id, list_id, ingredient_name, quantity, unit, is_checked, aisle) VALUES
  ('e2000001-0000-0000-0000-000000000001','e1000001-0000-0000-0000-000000000001','Basmati Rice', 2,'kg', false,'Grains'),
  ('e2000001-0000-0000-0000-000000000002','e1000001-0000-0000-0000-000000000001','Chicken Thighs',1.5,'kg', false,'Meat'),
  ('e2000001-0000-0000-0000-000000000003','e1000001-0000-0000-0000-000000000001','Yogurt',         500,'g',  false,'Dairy'),
  ('e2000001-0000-0000-0000-000000000004','e1000001-0000-0000-0000-000000000001','Onions',           5,'units',true, 'Produce'),
  ('e2000001-0000-0000-0000-000000000005','e1000001-0000-0000-0000-000000000001','Tomatoes',         6,'units',true, 'Produce'),
  ('e2000001-0000-0000-0000-000000000006','e1000001-0000-0000-0000-000000000001','Ginger',         100,'g',  false,'Produce'),
  ('e2000001-0000-0000-0000-000000000007','e1000001-0000-0000-0000-000000000001','Garam Masala',    50,'g',  false,'Spices'),
  ('e2000001-0000-0000-0000-000000000008','e1000001-0000-0000-0000-000000000001','Heavy Cream',    250,'ml', false,'Dairy')
ON CONFLICT (id) DO NOTHING;

-- ─── Expenses (recent grocery runs) ───────────────────────────────────────────
INSERT INTO expenses (id, house_id, paid_by, amount, description, category) VALUES
  ('f1000001-0000-0000-0000-000000000001','d1000001-0000-0000-0000-000000000001','e71b4d59-3561-4f5f-ab82-435128e8ec57', 87.42, 'Costco trip',           'groceries'),
  ('f1000001-0000-0000-0000-000000000002','d1000001-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111', 42.15, 'Trader Joe''s produce', 'groceries'),
  ('f1000001-0000-0000-0000-000000000003','d1000001-0000-0000-0000-000000000001','19e80a95-eb13-4536-954a-a0e8f8dd0fec', 23.80, 'Indian grocery spices', 'groceries'),
  ('f1000001-0000-0000-0000-000000000004','d1000001-0000-0000-0000-000000000001','e71b4d59-3561-4f5f-ab82-435128e8ec57', 18.50, 'Milk + eggs run',       'groceries'),
  ('f1000001-0000-0000-0000-000000000005','d1000001-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111', 56.30, 'Whole Foods meat',      'groceries')
ON CONFLICT (id) DO NOTHING;

-- Even splits across 3 members for each expense
INSERT INTO expense_splits (expense_id, user_id, amount)
SELECT e.id, hm.user_id, ROUND(e.amount / 3.0, 2)
FROM expenses e
JOIN house_members hm ON hm.house_id = e.house_id
WHERE e.house_id = 'd1000001-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

COMMIT;
