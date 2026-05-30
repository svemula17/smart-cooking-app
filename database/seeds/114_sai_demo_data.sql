-- 114_sai_demo_data.sql
-- Seeds realistic demo data for Sai's account so every tab feels alive:
--   • 3 housemates added (Priya, Raj, Anjali)
--   • Cook schedule for next 7 days (rotating)
--   • Chore types + 7-day chore rotation
--   • Shared expenses + splits
--   • Refreshed meal plans for today + next 7 days
--   • 14 days of nutrition logs (for the Stats chart)
--   • Refreshed pantry with realistic expiry dates
--   • Active shopping list with items
--
-- User: vemulasaikumar259@gmail.com (id e18126c0-cb01-4460-9520-11634dfb5084)
-- House: Sai's Place (id d2000001-0000-0000-0000-000000000001)
--
-- Idempotent — uses ON CONFLICT DO NOTHING.

BEGIN;

-- ─── HOUSEMATES ──────────────────────────────────────────────────────────
-- bcrypt hash for password "Demo@123" (cost=12) — purely placeholder; demo
-- accounts aren't meant to be logged into.
INSERT INTO users (id, email, password_hash, name, created_at) VALUES
  ('f1000001-0000-0000-0000-000000000001','priya.demo@smartcooking.app','$2b$12$KIXM6w8YgCq6cKbWHHK2u.cV5b9rg8.aRr5xj9bNFqEHnIxJ0wIza','Priya Sharma',NOW()),
  ('f1000001-0000-0000-0000-000000000002','raj.demo@smartcooking.app',  '$2b$12$KIXM6w8YgCq6cKbWHHK2u.cV5b9rg8.aRr5xj9bNFqEHnIxJ0wIza','Raj Patel',    NOW()),
  ('f1000001-0000-0000-0000-000000000003','anjali.demo@smartcooking.app','$2b$12$KIXM6w8YgCq6cKbWHHK2u.cV5b9rg8.aRr5xj9bNFqEHnIxJ0wIza','Anjali Reddy', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO house_members (house_id, user_id, role, joined_at) VALUES
  ('d2000001-0000-0000-0000-000000000001','f1000001-0000-0000-0000-000000000001','member',NOW()),
  ('d2000001-0000-0000-0000-000000000001','f1000001-0000-0000-0000-000000000002','member',NOW()),
  ('d2000001-0000-0000-0000-000000000001','f1000001-0000-0000-0000-000000000003','member',NOW())
ON CONFLICT (house_id, user_id) DO NOTHING;

-- ─── COOK SCHEDULE: today + next 7 days, rotating ───────────────────────
INSERT INTO cook_schedule (house_id, user_id, scheduled_date, recipe_id, status) VALUES
  ('d2000001-0000-0000-0000-000000000001','e18126c0-cb01-4460-9520-11634dfb5084',CURRENT_DATE,    'a0000001-0000-0000-0000-000000000001','pending'),
  ('d2000001-0000-0000-0000-000000000001','f1000001-0000-0000-0000-000000000001',CURRENT_DATE+1,'a0000001-0000-0000-0000-000000000003','pending'),
  ('d2000001-0000-0000-0000-000000000001','f1000001-0000-0000-0000-000000000002',CURRENT_DATE+2,'b0000005-0000-0000-0000-000000000001','pending'),
  ('d2000001-0000-0000-0000-000000000001','f1000001-0000-0000-0000-000000000003',CURRENT_DATE+3,'a0000003-0000-0000-0000-000000000017','pending'),
  ('d2000001-0000-0000-0000-000000000001','e18126c0-cb01-4460-9520-11634dfb5084',CURRENT_DATE+4,'a0000001-0000-0000-0000-000000000002','pending'),
  ('d2000001-0000-0000-0000-000000000001','f1000001-0000-0000-0000-000000000001',CURRENT_DATE+5,'b1000000-0000-0000-0000-000000000002','pending'),
  ('d2000001-0000-0000-0000-000000000001','f1000001-0000-0000-0000-000000000002',CURRENT_DATE+6,'b2000000-0000-0000-0000-000000000001','pending')
ON CONFLICT DO NOTHING;

-- ─── CHORES ──────────────────────────────────────────────────────────────
-- Use existing chore types (Dishes, Trash, Vacuum, Bathroom, Laundry — d4000001-* series).
-- Today's chores (Sai gets Dishes so he sees a "your chore" prompt).
INSERT INTO chore_schedule (house_id, chore_type_id, user_id, scheduled_date, status) VALUES
  ('d2000001-0000-0000-0000-000000000001','d4000001-0000-0000-0000-000000000001','e18126c0-cb01-4460-9520-11634dfb5084',CURRENT_DATE,  'pending'),
  ('d2000001-0000-0000-0000-000000000001','d4000001-0000-0000-0000-000000000002','f1000001-0000-0000-0000-000000000001',CURRENT_DATE,  'pending'),
  ('d2000001-0000-0000-0000-000000000001','d4000001-0000-0000-0000-000000000003','f1000001-0000-0000-0000-000000000002',CURRENT_DATE+1,'pending'),
  ('d2000001-0000-0000-0000-000000000001','d4000001-0000-0000-0000-000000000004','f1000001-0000-0000-0000-000000000003',CURRENT_DATE+2,'pending'),
  ('d2000001-0000-0000-0000-000000000001','d4000001-0000-0000-0000-000000000005','e18126c0-cb01-4460-9520-11634dfb5084',CURRENT_DATE+3,'pending'),
  ('d2000001-0000-0000-0000-000000000001','d4000001-0000-0000-0000-000000000001','f1000001-0000-0000-0000-000000000001',CURRENT_DATE+1,'pending'),
  ('d2000001-0000-0000-0000-000000000001','d4000001-0000-0000-0000-000000000001','f1000001-0000-0000-0000-000000000002',CURRENT_DATE+2,'pending'),
  ('d2000001-0000-0000-0000-000000000001','d4000001-0000-0000-0000-000000000001','f1000001-0000-0000-0000-000000000003',CURRENT_DATE+3,'pending')
ON CONFLICT DO NOTHING;

-- ─── EXPENSES + SPLITS ──────────────────────────────────────────────────
-- Mix of recent shared expenses across food, utilities, subscriptions
INSERT INTO expenses (id, house_id, paid_by, amount, description, category, created_at) VALUES
  ('f3000001-0000-0000-0000-000000000001','d2000001-0000-0000-0000-000000000001','e18126c0-cb01-4460-9520-11634dfb5084',2400.00,'Big grocery run (Costco)','groceries',NOW() - INTERVAL '3 days'),
  ('f3000001-0000-0000-0000-000000000002','d2000001-0000-0000-0000-000000000001','f1000001-0000-0000-0000-000000000001',6000.00,'Internet bill (May)','utilities',NOW() - INTERVAL '6 days'),
  ('f3000001-0000-0000-0000-000000000003','d2000001-0000-0000-0000-000000000001','f1000001-0000-0000-0000-000000000002',1299.00,'Netflix family plan','subscriptions',NOW() - INTERVAL '2 days'),
  ('f3000001-0000-0000-0000-000000000004','d2000001-0000-0000-0000-000000000001','f1000001-0000-0000-0000-000000000003', 800.00,'Cleaning supplies','household',NOW() - INTERVAL '1 day'),
  ('f3000001-0000-0000-0000-000000000005','d2000001-0000-0000-0000-000000000001','e18126c0-cb01-4460-9520-11634dfb5084',1850.00,'Vegetables + dairy weekly','groceries',NOW() - INTERVAL '8 hours')
ON CONFLICT (id) DO NOTHING;

-- Equal 4-way split for each expense
INSERT INTO expense_splits (expense_id, user_id, amount) VALUES
  -- grocery 2400 / 4 = 600
  ('f3000001-0000-0000-0000-000000000001','e18126c0-cb01-4460-9520-11634dfb5084',600),
  ('f3000001-0000-0000-0000-000000000001','f1000001-0000-0000-0000-000000000001',600),
  ('f3000001-0000-0000-0000-000000000001','f1000001-0000-0000-0000-000000000002',600),
  ('f3000001-0000-0000-0000-000000000001','f1000001-0000-0000-0000-000000000003',600),
  -- internet 6000 / 4 = 1500
  ('f3000001-0000-0000-0000-000000000002','e18126c0-cb01-4460-9520-11634dfb5084',1500),
  ('f3000001-0000-0000-0000-000000000002','f1000001-0000-0000-0000-000000000001',1500),
  ('f3000001-0000-0000-0000-000000000002','f1000001-0000-0000-0000-000000000002',1500),
  ('f3000001-0000-0000-0000-000000000002','f1000001-0000-0000-0000-000000000003',1500),
  -- netflix 1299 / 4 ≈ 324.75
  ('f3000001-0000-0000-0000-000000000003','e18126c0-cb01-4460-9520-11634dfb5084',324.75),
  ('f3000001-0000-0000-0000-000000000003','f1000001-0000-0000-0000-000000000001',324.75),
  ('f3000001-0000-0000-0000-000000000003','f1000001-0000-0000-0000-000000000002',324.75),
  ('f3000001-0000-0000-0000-000000000003','f1000001-0000-0000-0000-000000000003',324.75),
  -- cleaning 800 / 4 = 200
  ('f3000001-0000-0000-0000-000000000004','e18126c0-cb01-4460-9520-11634dfb5084',200),
  ('f3000001-0000-0000-0000-000000000004','f1000001-0000-0000-0000-000000000001',200),
  ('f3000001-0000-0000-0000-000000000004','f1000001-0000-0000-0000-000000000002',200),
  ('f3000001-0000-0000-0000-000000000004','f1000001-0000-0000-0000-000000000003',200),
  -- veggies 1850 / 4 = 462.50
  ('f3000001-0000-0000-0000-000000000005','e18126c0-cb01-4460-9520-11634dfb5084',462.50),
  ('f3000001-0000-0000-0000-000000000005','f1000001-0000-0000-0000-000000000001',462.50),
  ('f3000001-0000-0000-0000-000000000005','f1000001-0000-0000-0000-000000000002',462.50),
  ('f3000001-0000-0000-0000-000000000005','f1000001-0000-0000-0000-000000000003',462.50)
ON CONFLICT (expense_id, user_id) DO NOTHING;

-- ─── REFRESH MEAL PLAN: today + next 7 days ──────────────────────────────
-- Delete future + today entries first so re-running gives consistent shape.
DELETE FROM meal_plans WHERE user_id='e18126c0-cb01-4460-9520-11634dfb5084' AND scheduled_date >= CURRENT_DATE;

INSERT INTO meal_plans (user_id, recipe_id, scheduled_date, meal_type, completed) VALUES
  -- Today (Sat)
  ('e18126c0-cb01-4460-9520-11634dfb5084','c0000001-0000-0000-0000-000000000001',CURRENT_DATE,    'breakfast', false),
  ('e18126c0-cb01-4460-9520-11634dfb5084','b4000000-0000-0000-0000-000000000002',CURRENT_DATE,    'lunch', false),
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000001-0000-0000-0000-000000000001',CURRENT_DATE,    'dinner', false),
  -- Sun
  ('e18126c0-cb01-4460-9520-11634dfb5084','c0000007-0000-0000-0000-000000000001',CURRENT_DATE+1,'breakfast', false),
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000001-0000-0000-0000-000000000003',CURRENT_DATE+1,'lunch', false),
  ('e18126c0-cb01-4460-9520-11634dfb5084','b0000005-0000-0000-0000-000000000001',CURRENT_DATE+1,'dinner', false),
  -- Mon
  ('e18126c0-cb01-4460-9520-11634dfb5084','c0000001-0000-0000-0000-000000000001',CURRENT_DATE+2,'breakfast', false),
  ('e18126c0-cb01-4460-9520-11634dfb5084','b3000000-0000-0000-0000-000000000002',CURRENT_DATE+2,'lunch', false),
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000003-0000-0000-0000-000000000017',CURRENT_DATE+2,'dinner', false),
  -- Tue
  ('e18126c0-cb01-4460-9520-11634dfb5084','c0000002-0000-0000-0000-00000000000b',CURRENT_DATE+3,'lunch', false),
  ('e18126c0-cb01-4460-9520-11634dfb5084','a0000001-0000-0000-0000-000000000002',CURRENT_DATE+3,'dinner', false),
  -- Wed
  ('e18126c0-cb01-4460-9520-11634dfb5084','b4000000-0000-0000-0000-000000000002',CURRENT_DATE+4,'breakfast', false),
  ('e18126c0-cb01-4460-9520-11634dfb5084','b1000000-0000-0000-0000-000000000002',CURRENT_DATE+4,'dinner', false),
  -- Thu
  ('e18126c0-cb01-4460-9520-11634dfb5084','b2000000-0000-0000-0000-000000000001',CURRENT_DATE+5,'dinner', false),
  -- Fri
  ('e18126c0-cb01-4460-9520-11634dfb5084','c0000008-0000-0000-0000-000000000005',CURRENT_DATE+6,'dinner', false);

-- ─── NUTRITION LOGS: last 14 days (so the Stats chart has data) ──────────
-- We'll log breakfast/lunch/dinner with realistic macros for each day.
DELETE FROM nutrition_logs WHERE user_id='e18126c0-cb01-4460-9520-11634dfb5084' AND date >= CURRENT_DATE - INTERVAL '14 days';

INSERT INTO nutrition_logs (user_id, recipe_id, date, meal_type, servings_consumed, calories, protein_g, carbs_g, fat_g, auto_logged)
SELECT
  'e18126c0-cb01-4460-9520-11634dfb5084'::uuid,
  recipe_id::uuid,
  (CURRENT_DATE - (offset_days || ' days')::INTERVAL)::date,
  meal_type::text,
  1,
  base_cal + (random()*100)::int,
  base_pro + (random()*8)::numeric(5,1),
  base_carb + (random()*15)::numeric(5,1),
  base_fat + (random()*5)::numeric(5,1),
  true
FROM (VALUES
  -- (day_offset, recipe_id, meal, base_cal, base_pro, base_carb, base_fat)
  (0,  'c0000001-0000-0000-0000-000000000001', 'breakfast', 280, 12.0, 48.0, 4.0),
  (0,  'b4000000-0000-0000-0000-000000000002', 'lunch',     420, 11.0, 65.0, 14.0),
  (1,  'c0000001-0000-0000-0000-000000000001', 'breakfast', 280, 12.0, 48.0, 4.0),
  (1,  'a0000001-0000-0000-0000-000000000001', 'dinner',    520, 28.0, 60.0, 16.0),
  (2,  'b3000000-0000-0000-0000-000000000002', 'lunch',     310, 14.0, 22.0, 18.0),
  (2,  'a0000001-0000-0000-0000-000000000002', 'dinner',    580, 32.0, 35.0, 30.0),
  (3,  'c0000001-0000-0000-0000-000000000001', 'breakfast', 280, 12.0, 48.0, 4.0),
  (3,  'a0000001-0000-0000-0000-000000000003', 'lunch',     440, 18.0, 28.0, 26.0),
  (3,  'a0000003-0000-0000-0000-000000000017','dinner',    620, 24.0, 78.0, 22.0),
  (4,  'b0000005-0000-0000-0000-000000000001', 'dinner',    510, 22.0, 68.0, 14.0),
  (5,  'c0000007-0000-0000-0000-000000000001', 'breakfast', 220, 8.0,  44.0, 2.0),
  (5,  'b2000000-0000-0000-0000-000000000001', 'dinner',    480, 30.0, 42.0, 16.0),
  (6,  'a0000001-0000-0000-0000-000000000001', 'dinner',    520, 28.0, 60.0, 16.0),
  (7,  'b4000000-0000-0000-0000-000000000002', 'lunch',     420, 11.0, 65.0, 14.0),
  (8,  'a0000001-0000-0000-0000-000000000002', 'dinner',    580, 32.0, 35.0, 30.0),
  (9,  'b3000000-0000-0000-0000-000000000002', 'lunch',     310, 14.0, 22.0, 18.0),
  (10, 'b1000000-0000-0000-0000-000000000002', 'dinner',    450, 14.0, 70.0, 12.0),
  (11, 'a0000001-0000-0000-0000-000000000003', 'lunch',     440, 18.0, 28.0, 26.0),
  (12, 'd0000001-0000-0000-0000-000000000001', 'lunch',     380, 20.0, 30.0, 18.0),
  (13, 'a0000003-0000-0000-0000-000000000017','dinner',    620, 24.0, 78.0, 22.0)
) AS t(offset_days, recipe_id, meal_type, base_cal, base_pro, base_carb, base_fat);

-- ─── PANTRY REFRESH ──────────────────────────────────────────────────────
-- Wipe existing pantry, install a varied set with mixed expiry dates so the
-- "use first tonight" widget on dashboard has something to show.
DELETE FROM pantry_items WHERE user_id='e18126c0-cb01-4460-9520-11634dfb5084';

INSERT INTO pantry_items (id, user_id, name, quantity, unit, category, location, expiry_date) VALUES
  -- Use soon (expires in 1-3 days)
  (gen_random_uuid(),'e18126c0-cb01-4460-9520-11634dfb5084','Spinach',         200,'g',    'produce', 'fridge', CURRENT_DATE+2),
  (gen_random_uuid(),'e18126c0-cb01-4460-9520-11634dfb5084','Paneer',          250,'g',    'dairy',   'fridge', CURRENT_DATE+1),
  (gen_random_uuid(),'e18126c0-cb01-4460-9520-11634dfb5084','Milk',             1,'L',    'dairy',   'fridge', CURRENT_DATE+3),
  (gen_random_uuid(),'e18126c0-cb01-4460-9520-11634dfb5084','Cilantro',        30,'g',    'produce', 'fridge', CURRENT_DATE+2),
  -- Comfortable (this week)
  (gen_random_uuid(),'e18126c0-cb01-4460-9520-11634dfb5084','Tomatoes',         6,'unit', 'produce', 'fridge', CURRENT_DATE+5),
  (gen_random_uuid(),'e18126c0-cb01-4460-9520-11634dfb5084','Onions',           5,'unit', 'produce', 'counter',CURRENT_DATE+10),
  (gen_random_uuid(),'e18126c0-cb01-4460-9520-11634dfb5084','Chicken Thighs', 500,'g',    'meat',    'freezer',CURRENT_DATE+30),
  (gen_random_uuid(),'e18126c0-cb01-4460-9520-11634dfb5084','Eggs',            12,'unit', 'dairy',   'fridge', CURRENT_DATE+12),
  (gen_random_uuid(),'e18126c0-cb01-4460-9520-11634dfb5084','Yogurt',         400,'g',    'dairy',   'fridge', CURRENT_DATE+7),
  (gen_random_uuid(),'e18126c0-cb01-4460-9520-11634dfb5084','Bell Peppers',     3,'unit', 'produce', 'fridge', CURRENT_DATE+6),
  -- Pantry staples (no expiry pressure)
  (gen_random_uuid(),'e18126c0-cb01-4460-9520-11634dfb5084','Basmati Rice',     2,'kg',   'grains',  'pantry', NULL),
  (gen_random_uuid(),'e18126c0-cb01-4460-9520-11634dfb5084','Toor Dal',         1,'kg',   'grains',  'pantry', NULL),
  (gen_random_uuid(),'e18126c0-cb01-4460-9520-11634dfb5084','Cumin Seeds',    100,'g',    'spices',  'pantry', NULL),
  (gen_random_uuid(),'e18126c0-cb01-4460-9520-11634dfb5084','Turmeric',         50,'g',   'spices',  'pantry', NULL),
  (gen_random_uuid(),'e18126c0-cb01-4460-9520-11634dfb5084','Olive Oil',      500,'ml',   'oils',    'pantry', NULL),
  (gen_random_uuid(),'e18126c0-cb01-4460-9520-11634dfb5084','Garam Masala',    50,'g',    'spices',  'pantry', NULL);

-- ─── SHOPPING LIST ──────────────────────────────────────────────────────
-- Active weekly list with mix of bought/not-bought
DELETE FROM shopping_items WHERE list_id IN (SELECT id FROM shopping_lists WHERE user_id='e18126c0-cb01-4460-9520-11634dfb5084' AND status='active');
DELETE FROM shopping_lists WHERE user_id='e18126c0-cb01-4460-9520-11634dfb5084' AND status='active';

INSERT INTO shopping_lists (id, user_id, name, status, recipe_ids, house_id) VALUES
  ('f4000001-0000-0000-0000-000000000001','e18126c0-cb01-4460-9520-11634dfb5084','This Week','active','{}','d2000001-0000-0000-0000-000000000001');

INSERT INTO shopping_items (id, list_id, ingredient_name, quantity, unit, is_checked, aisle) VALUES
  (gen_random_uuid(),'f4000001-0000-0000-0000-000000000001','Boneless Chicken',     1,'kg', false,'meat'),
  (gen_random_uuid(),'f4000001-0000-0000-0000-000000000001','Greek Yogurt',       500,'g',  false,'dairy'),
  (gen_random_uuid(),'f4000001-0000-0000-0000-000000000001','Coconut Milk',         2,'can',false,'pantry'),
  (gen_random_uuid(),'f4000001-0000-0000-0000-000000000001','Cucumber',             4,'unit',true,'produce'),
  (gen_random_uuid(),'f4000001-0000-0000-0000-000000000001','Lemons',               6,'unit',true,'produce'),
  (gen_random_uuid(),'f4000001-0000-0000-0000-000000000001','Mint Leaves',         50,'g',  false,'produce'),
  (gen_random_uuid(),'f4000001-0000-0000-0000-000000000001','Ginger',             100,'g',  true,'produce'),
  (gen_random_uuid(),'f4000001-0000-0000-0000-000000000001','Garlic',             200,'g',  false,'produce'),
  (gen_random_uuid(),'f4000001-0000-0000-0000-000000000001','Basmati Rice',         5,'kg', false,'grains'),
  (gen_random_uuid(),'f4000001-0000-0000-0000-000000000001','Whole Wheat Flour',    5,'kg', false,'grains'),
  (gen_random_uuid(),'f4000001-0000-0000-0000-000000000001','Eggs',                30,'unit',false,'dairy'),
  (gen_random_uuid(),'f4000001-0000-0000-0000-000000000001','Tofu',               400,'g',  false,'protein'),
  (gen_random_uuid(),'f4000001-0000-0000-0000-000000000001','Spinach',            500,'g',  false,'produce'),
  (gen_random_uuid(),'f4000001-0000-0000-0000-000000000001','Bell Peppers',         6,'unit',false,'produce');

COMMIT;
