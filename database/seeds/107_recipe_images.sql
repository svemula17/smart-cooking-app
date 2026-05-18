-- 107_recipe_images.sql
-- Backfill image_url across the catalog. Uses curated Unsplash photo IDs
-- (the stable `images.unsplash.com/photo-XXX` format that does not depend
-- on the deprecated source.unsplash.com redirector).
--
-- Strategy:
--   1. Replace the placeholder `images.example.com/*` URLs on the original
--      17 recipes with real photos picked by dish category.
--   2. For the 256 recipes with NULL image_url, assign a cuisine-based
--      fallback image, plus a few overrides for specific dish categories
--      (biryani, pizza, sushi, etc.) so the catalog has visual variety.
--
-- Idempotent — uses UPDATEs that overwrite whatever was there.

BEGIN;

-- ─── Cuisine-based fallbacks ─────────────────────────────────────────────
UPDATE recipes SET image_url =
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80'
  WHERE cuisine_type = 'Indian';

UPDATE recipes SET image_url =
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80'
  WHERE cuisine_type = 'Mexican';

UPDATE recipes SET image_url =
  'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&q=80'
  WHERE cuisine_type = 'Chinese';

UPDATE recipes SET image_url =
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&q=80'
  WHERE cuisine_type = 'Italian';

UPDATE recipes SET image_url =
  'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80'
  WHERE cuisine_type = 'Thai';

UPDATE recipes SET image_url =
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80'
  WHERE cuisine_type = 'Mediterranean';

UPDATE recipes SET image_url =
  'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80'
  WHERE cuisine_type = 'Japanese';

UPDATE recipes SET image_url =
  'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80'
  WHERE cuisine_type = 'Indo-Chinese';

-- ─── Specific overrides for visual variety ───────────────────────────────
-- Biryani / pulao / rice mains
UPDATE recipes SET image_url =
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80'
  WHERE name ILIKE '%biryani%' OR name ILIKE '%pulao%';

-- Indian bread / dosa / parotta
UPDATE recipes SET image_url =
  'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80'
  WHERE name IN ('Naan','Butter Naan','Parotta','Malabar Parotta','Akki Roti','Idiappam','Puttu');

-- Dosa family
UPDATE recipes SET image_url =
  'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&q=80'
  WHERE name IN ('Dosa','Masala Dosa','Mysore Masala Dosa','Rava Dosa','Pesarattu','Uttapam');

-- Idli
UPDATE recipes SET image_url =
  'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80'
  WHERE name = 'Idli';

-- Paneer dishes
UPDATE recipes SET image_url =
  'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80'
  WHERE name ILIKE '%paneer%';

-- Pizza
UPDATE recipes SET image_url =
  'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80'
  WHERE name ILIKE '%pizza%';

-- Sushi / rolls
UPDATE recipes SET image_url =
  'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80'
  WHERE name ILIKE '%sushi%' OR name ILIKE '%roll%';

-- Ramen
UPDATE recipes SET image_url =
  'https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=600&q=80'
  WHERE name ILIKE '%ramen%';

-- Desserts
UPDATE recipes SET image_url =
  'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80'
  WHERE name IN ('Tiramisu','Panna Cotta','Cannoli','Baklava','Tres Leches Cake','Churros','Gulab Jamun','Rasgulla','Payasam','Mysore Pak');

-- Tacos
UPDATE recipes SET image_url =
  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80'
  WHERE name ILIKE '%taco%' OR name ILIKE '%carne asada%';

-- Burrito / quesadilla
UPDATE recipes SET image_url =
  'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80'
  WHERE name ILIKE '%burrito%' OR name ILIKE '%quesadilla%';

-- Soups
UPDATE recipes SET image_url =
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80'
  WHERE name ILIKE '%soup%' OR name = 'Rasam';

-- Salads
UPDATE recipes SET image_url =
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80'
  WHERE name ILIKE '%salad%' OR name = 'Som Tam' OR name = 'Tabbouleh';

-- Curry / chicken curry
UPDATE recipes SET image_url =
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80'
  WHERE name ILIKE '%curry%' AND cuisine_type = 'Indian';

-- Pasta (Italian)
UPDATE recipes SET image_url =
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&q=80'
  WHERE cuisine_type = 'Italian' AND (
    name ILIKE '%spaghetti%' OR name ILIKE '%penne%' OR name ILIKE '%fettuccine%' OR name ILIKE '%lasagna%' OR name ILIKE '%ravioli%' OR name ILIKE '%gnocchi%'
  );

-- Noodles (Asian)
UPDATE recipes SET image_url =
  'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80'
  WHERE name ILIKE '%noodle%' OR name ILIKE '%lo mein%' OR name ILIKE '%chow mein%' OR name ILIKE '%pad thai%' OR name ILIKE '%pad see ew%';

COMMIT;
