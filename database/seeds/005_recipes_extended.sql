-- 005_recipes_extended.sql
-- Adds the recipes from the recipe-service spec that weren't already in
-- 002_recipes.sql, with ingredients and per-serving nutrition. After
-- running, the catalog has 30+ recipes covering Indian, Chinese, Italian,
-- Mexican, and Thai cuisines.

INSERT INTO recipes (id, name, cuisine_type, difficulty, prep_time_minutes, cook_time_minutes, servings, instructions, image_url, verified_by_dietitian)
VALUES
-- ===== Additional Indian (4) =====
('b0000001-0000-0000-0000-000000000001', 'Dal Makhani', 'Indian', 'Medium', 480, 60, 6,
 '[{"step_number":1,"instruction":"Soak black urad dal and rajma overnight."},
   {"step_number":2,"instruction":"Pressure cook dals until tender."},
   {"step_number":3,"instruction":"Simmer with tomato puree, butter, and cream for 45 minutes.","time_minutes":45},
   {"step_number":4,"instruction":"Finish with kasuri methi and a drizzle of cream."}]'::jsonb,
 'https://images.example.com/dal-makhani.jpg', TRUE),

('b0000001-0000-0000-0000-000000000002', 'Samosa', 'Indian', 'Medium', 30, 25, 8,
 '[{"step_number":1,"instruction":"Make dough with flour, oil, and water; rest 30 minutes.","time_minutes":30},
   {"step_number":2,"instruction":"Cook spiced potato-pea filling."},
   {"step_number":3,"instruction":"Fold dough cones, fill, and seal edges."},
   {"step_number":4,"instruction":"Deep fry at low heat until golden.","time_minutes":15}]'::jsonb,
 'https://images.example.com/samosa.jpg', FALSE),

('b0000001-0000-0000-0000-000000000003', 'Naan', 'Indian', 'Easy', 90, 8, 4,
 '[{"step_number":1,"instruction":"Mix flour, yogurt, yeast, sugar; knead and rest 1 hour.","time_minutes":60},
   {"step_number":2,"instruction":"Divide and stretch into oblong shapes."},
   {"step_number":3,"instruction":"Cook on hot tawa or under broiler until puffed and charred.","time_minutes":3},
   {"step_number":4,"instruction":"Brush with melted butter and cilantro."}]'::jsonb,
 'https://images.example.com/naan.jpg', TRUE),

('b0000001-0000-0000-0000-000000000004', 'Paneer Tikka', 'Indian', 'Medium', 60, 15, 4,
 '[{"step_number":1,"instruction":"Marinate paneer cubes in yogurt and spices for 45 minutes.","time_minutes":45},
   {"step_number":2,"instruction":"Skewer with onion and bell pepper."},
   {"step_number":3,"instruction":"Grill or broil until charred at the edges.","time_minutes":12}]'::jsonb,
 'https://images.example.com/paneer-tikka.jpg', TRUE),

-- ===== Additional Chinese (2) =====
('b0000002-0000-0000-0000-000000000001', 'Pork Dumplings', 'Chinese', 'Medium', 45, 15, 6,
 '[{"step_number":1,"instruction":"Mix ground pork, scallion, ginger, soy, sesame oil."},
   {"step_number":2,"instruction":"Wrap filling in dumpling skins, pleating one edge."},
   {"step_number":3,"instruction":"Pan-fry with water for steam-fry method.","time_minutes":12}]'::jsonb,
 'https://images.example.com/dumplings.jpg', TRUE),

('b0000002-0000-0000-0000-000000000002', 'Hot and Sour Soup', 'Chinese', 'Easy', 15, 20, 4,
 '[{"step_number":1,"instruction":"Bring chicken stock to a simmer with tofu, mushrooms, bamboo."},
   {"step_number":2,"instruction":"Add vinegar, soy sauce, white pepper for heat and tang."},
   {"step_number":3,"instruction":"Thicken with cornstarch slurry; stream in beaten egg."}]'::jsonb,
 'https://images.example.com/hot-sour-soup.jpg', FALSE),

-- ===== Additional Italian (1) =====
('b0000003-0000-0000-0000-000000000001', 'Tiramisu', 'Italian', 'Medium', 30, 0, 8,
 '[{"step_number":1,"instruction":"Whisk egg yolks with sugar; fold in mascarpone."},
   {"step_number":2,"instruction":"Whip cream to soft peaks; fold into mascarpone mix."},
   {"step_number":3,"instruction":"Dip ladyfingers in espresso; layer with cream."},
   {"step_number":4,"instruction":"Refrigerate 6+ hours; dust with cocoa before serving.","time_minutes":360}]'::jsonb,
 'https://images.example.com/tiramisu.jpg', FALSE),

-- ===== Mexican (5) =====
('b0000004-0000-0000-0000-000000000001', 'Carne Asada Tacos', 'Mexican', 'Easy', 30, 10, 4,
 '[{"step_number":1,"instruction":"Marinate skirt steak in lime, garlic, cumin, chili."},
   {"step_number":2,"instruction":"Grill steak to medium-rare; rest 5 minutes.","time_minutes":8},
   {"step_number":3,"instruction":"Slice thin against the grain."},
   {"step_number":4,"instruction":"Serve in warm corn tortillas with onion, cilantro, lime."}]'::jsonb,
 'https://images.example.com/tacos.jpg', TRUE),

('b0000004-0000-0000-0000-000000000002', 'Bean and Cheese Burrito', 'Mexican', 'Easy', 10, 15, 4,
 '[{"step_number":1,"instruction":"Warm refried beans with cumin and a splash of stock."},
   {"step_number":2,"instruction":"Toast tortilla briefly to soften."},
   {"step_number":3,"instruction":"Fill with beans, rice, cheese, salsa; fold and roll tight."},
   {"step_number":4,"instruction":"Sear seam-side down in a dry skillet to crisp."}]'::jsonb,
 'https://images.example.com/burrito.jpg', FALSE),

('b0000004-0000-0000-0000-000000000003', 'Chicken Enchiladas Verdes', 'Mexican', 'Medium', 20, 30, 6,
 '[{"step_number":1,"instruction":"Poach and shred chicken; toss with cheese."},
   {"step_number":2,"instruction":"Roast tomatillos, onion, jalapeño; blend for green sauce."},
   {"step_number":3,"instruction":"Roll filled tortillas, top with sauce and cheese."},
   {"step_number":4,"instruction":"Bake at 375°F until bubbling.","time_minutes":20}]'::jsonb,
 'https://images.example.com/enchiladas.jpg', TRUE),

('b0000004-0000-0000-0000-000000000004', 'Guacamole', 'Mexican', 'Easy', 10, 0, 4,
 '[{"step_number":1,"instruction":"Mash ripe avocados with lime juice and salt."},
   {"step_number":2,"instruction":"Fold in diced onion, tomato, jalapeño, cilantro."},
   {"step_number":3,"instruction":"Taste and adjust salt and acid."}]'::jsonb,
 'https://images.example.com/guacamole.jpg', TRUE),

('b0000004-0000-0000-0000-000000000005', 'Cheese Quesadilla', 'Mexican', 'Easy', 5, 8, 2,
 '[{"step_number":1,"instruction":"Heat skillet over medium heat with a touch of oil."},
   {"step_number":2,"instruction":"Place tortilla, scatter cheese, top with second tortilla."},
   {"step_number":3,"instruction":"Cook until golden and cheese is melted; flip once.","time_minutes":6},
   {"step_number":4,"instruction":"Cut into wedges; serve with salsa."}]'::jsonb,
 'https://images.example.com/quesadilla.jpg', FALSE),

-- ===== Thai (5) =====
('b0000005-0000-0000-0000-000000000001', 'Pad Thai', 'Thai', 'Medium', 20, 15, 4,
 '[{"step_number":1,"instruction":"Soak rice noodles in warm water until pliable.","time_minutes":15},
   {"step_number":2,"instruction":"Stir-fry shrimp and tofu; push aside, scramble egg."},
   {"step_number":3,"instruction":"Add noodles and sauce; toss with bean sprouts and chives."},
   {"step_number":4,"instruction":"Serve with crushed peanuts and lime."}]'::jsonb,
 'https://images.example.com/pad-thai.jpg', TRUE),

('b0000005-0000-0000-0000-000000000002', 'Thai Green Curry', 'Thai', 'Medium', 15, 25, 4,
 '[{"step_number":1,"instruction":"Fry green curry paste in coconut cream until fragrant."},
   {"step_number":2,"instruction":"Add chicken and remaining coconut milk; simmer.","time_minutes":15},
   {"step_number":3,"instruction":"Add Thai eggplant, bamboo shoots, fish sauce, palm sugar."},
   {"step_number":4,"instruction":"Finish with Thai basil; serve over jasmine rice."}]'::jsonb,
 'https://images.example.com/green-curry.jpg', TRUE),

('b0000005-0000-0000-0000-000000000003', 'Tom Yum Soup', 'Thai', 'Easy', 10, 20, 4,
 '[{"step_number":1,"instruction":"Simmer stock with lemongrass, galangal, kaffir lime leaves."},
   {"step_number":2,"instruction":"Add mushrooms, then shrimp; cook just until pink."},
   {"step_number":3,"instruction":"Off heat, add lime juice, fish sauce, chili paste."}]'::jsonb,
 'https://images.example.com/tom-yum.jpg', TRUE),

('b0000005-0000-0000-0000-000000000004', 'Fresh Spring Rolls', 'Thai', 'Easy', 25, 0, 4,
 '[{"step_number":1,"instruction":"Cook vermicelli noodles; drain."},
   {"step_number":2,"instruction":"Soften rice paper in warm water briefly."},
   {"step_number":3,"instruction":"Fill with shrimp, herbs, lettuce, noodles; roll tight."},
   {"step_number":4,"instruction":"Serve with peanut or hoisin dipping sauce."}]'::jsonb,
 'https://images.example.com/spring-rolls.jpg', TRUE),

('b0000005-0000-0000-0000-000000000005', 'Mango Sticky Rice', 'Thai', 'Easy', 240, 25, 4,
 '[{"step_number":1,"instruction":"Soak glutinous rice for 4 hours.","time_minutes":240},
   {"step_number":2,"instruction":"Steam rice 20 minutes until tender.","time_minutes":20},
   {"step_number":3,"instruction":"Pour sweetened salted coconut cream over rice."},
   {"step_number":4,"instruction":"Serve with sliced ripe mango."}]'::jsonb,
 'https://images.example.com/mango-sticky-rice.jpg', FALSE);

-- Per-serving nutrition for the new recipes.
INSERT INTO recipe_nutrition (recipe_id, calories, protein_g, carbs_g, fat_g, fiber_g, sodium_mg)
VALUES
  ('b0000001-0000-0000-0000-000000000001', 410, 16.0, 38.0, 22.0, 9.0,  580),
  ('b0000001-0000-0000-0000-000000000002', 220,  5.0, 28.0, 10.0, 2.5,  420),
  ('b0000001-0000-0000-0000-000000000003', 280,  8.0, 46.0,  6.0, 2.0,  480),
  ('b0000001-0000-0000-0000-000000000004', 320, 18.0, 10.0, 24.0, 2.0,  520),
  ('b0000002-0000-0000-0000-000000000001', 360, 14.0, 38.0, 16.0, 2.0,  720),
  ('b0000002-0000-0000-0000-000000000002', 180, 12.0, 14.0,  8.0, 2.0,  920),
  ('b0000003-0000-0000-0000-000000000001', 460,  6.0, 38.0, 32.0, 1.0,   90),
  ('b0000004-0000-0000-0000-000000000001', 420, 28.0, 28.0, 22.0, 4.0,  680),
  ('b0000004-0000-0000-0000-000000000002', 480, 18.0, 64.0, 16.0, 9.0,  820),
  ('b0000004-0000-0000-0000-000000000003', 520, 32.0, 40.0, 26.0, 5.0,  860),
  ('b0000004-0000-0000-0000-000000000004', 220,  3.0, 12.0, 20.0, 8.0,  380),
  ('b0000004-0000-0000-0000-000000000005', 360, 16.0, 32.0, 18.0, 2.0,  720),
  ('b0000005-0000-0000-0000-000000000001', 480, 22.0, 64.0, 16.0, 4.0,  920),
  ('b0000005-0000-0000-0000-000000000002', 460, 28.0, 22.0, 28.0, 4.0,  860),
  ('b0000005-0000-0000-0000-000000000003', 180, 22.0,  8.0,  6.0, 2.0,  920),
  ('b0000005-0000-0000-0000-000000000004', 220, 12.0, 36.0,  4.0, 4.0,  480),
  ('b0000005-0000-0000-0000-000000000005', 380,  5.0, 70.0, 10.0, 3.0,  120);

-- Compact ingredient lists (4-6 per recipe).
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, notes) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'whole urad dal', 250, 'g', 'soaked overnight'),
  ('b0000001-0000-0000-0000-000000000001', 'rajma', 50, 'g', 'soaked overnight'),
  ('b0000001-0000-0000-0000-000000000001', 'tomato puree', 250, 'ml', NULL),
  ('b0000001-0000-0000-0000-000000000001', 'butter', 100, 'g', NULL),
  ('b0000001-0000-0000-0000-000000000001', 'heavy cream', 100, 'ml', NULL),

  ('b0000001-0000-0000-0000-000000000002', 'all-purpose flour', 300, 'g', NULL),
  ('b0000001-0000-0000-0000-000000000002', 'potatoes', 400, 'g', 'boiled, mashed'),
  ('b0000001-0000-0000-0000-000000000002', 'green peas', 100, 'g', NULL),
  ('b0000001-0000-0000-0000-000000000002', 'cumin seeds', 1, 'tsp', NULL),
  ('b0000001-0000-0000-0000-000000000002', 'oil', 1, 'l', 'for frying'),

  ('b0000001-0000-0000-0000-000000000003', 'all-purpose flour', 300, 'g', NULL),
  ('b0000001-0000-0000-0000-000000000003', 'yogurt', 80, 'g', NULL),
  ('b0000001-0000-0000-0000-000000000003', 'instant yeast', 1, 'tsp', NULL),
  ('b0000001-0000-0000-0000-000000000003', 'butter', 30, 'g', 'melted'),

  ('b0000001-0000-0000-0000-000000000004', 'paneer', 400, 'g', 'cubed'),
  ('b0000001-0000-0000-0000-000000000004', 'yogurt', 150, 'g', NULL),
  ('b0000001-0000-0000-0000-000000000004', 'tandoori masala', 2, 'tbsp', NULL),
  ('b0000001-0000-0000-0000-000000000004', 'red onion', 1, 'unit', 'in chunks'),
  ('b0000001-0000-0000-0000-000000000004', 'bell pepper', 1, 'unit', 'in chunks'),

  ('b0000002-0000-0000-0000-000000000001', 'ground pork', 400, 'g', NULL),
  ('b0000002-0000-0000-0000-000000000001', 'scallion', 4, 'unit', 'minced'),
  ('b0000002-0000-0000-0000-000000000001', 'ginger', 15, 'g', 'grated'),
  ('b0000002-0000-0000-0000-000000000001', 'soy sauce', 30, 'ml', NULL),
  ('b0000002-0000-0000-0000-000000000001', 'dumpling wrappers', 36, 'unit', NULL),

  ('b0000002-0000-0000-0000-000000000002', 'chicken stock', 1500, 'ml', NULL),
  ('b0000002-0000-0000-0000-000000000002', 'firm tofu', 200, 'g', 'cubed'),
  ('b0000002-0000-0000-0000-000000000002', 'wood ear mushroom', 30, 'g', 'soaked'),
  ('b0000002-0000-0000-0000-000000000002', 'rice vinegar', 60, 'ml', NULL),
  ('b0000002-0000-0000-0000-000000000002', 'eggs', 2, 'unit', 'beaten'),

  ('b0000003-0000-0000-0000-000000000001', 'ladyfingers', 24, 'unit', NULL),
  ('b0000003-0000-0000-0000-000000000001', 'mascarpone', 500, 'g', NULL),
  ('b0000003-0000-0000-0000-000000000001', 'egg yolks', 4, 'unit', NULL),
  ('b0000003-0000-0000-0000-000000000001', 'sugar', 100, 'g', NULL),
  ('b0000003-0000-0000-0000-000000000001', 'espresso', 250, 'ml', 'cooled'),
  ('b0000003-0000-0000-0000-000000000001', 'cocoa powder', 20, 'g', NULL),

  ('b0000004-0000-0000-0000-000000000001', 'skirt steak', 500, 'g', NULL),
  ('b0000004-0000-0000-0000-000000000001', 'lime juice', 60, 'ml', NULL),
  ('b0000004-0000-0000-0000-000000000001', 'corn tortillas', 12, 'unit', NULL),
  ('b0000004-0000-0000-0000-000000000001', 'white onion', 1, 'unit', 'diced'),
  ('b0000004-0000-0000-0000-000000000001', 'cilantro', 1, 'bunch', NULL),

  ('b0000004-0000-0000-0000-000000000002', 'flour tortillas', 4, 'unit', 'large'),
  ('b0000004-0000-0000-0000-000000000002', 'refried beans', 400, 'g', NULL),
  ('b0000004-0000-0000-0000-000000000002', 'cooked rice', 200, 'g', NULL),
  ('b0000004-0000-0000-0000-000000000002', 'cheddar cheese', 150, 'g', 'shredded'),
  ('b0000004-0000-0000-0000-000000000002', 'salsa', 120, 'ml', NULL),

  ('b0000004-0000-0000-0000-000000000003', 'chicken breast', 500, 'g', NULL),
  ('b0000004-0000-0000-0000-000000000003', 'tomatillos', 500, 'g', NULL),
  ('b0000004-0000-0000-0000-000000000003', 'jalapeño', 2, 'unit', NULL),
  ('b0000004-0000-0000-0000-000000000003', 'corn tortillas', 12, 'unit', NULL),
  ('b0000004-0000-0000-0000-000000000003', 'monterey jack cheese', 200, 'g', 'shredded'),

  ('b0000004-0000-0000-0000-000000000004', 'avocados', 3, 'unit', 'ripe'),
  ('b0000004-0000-0000-0000-000000000004', 'lime juice', 30, 'ml', NULL),
  ('b0000004-0000-0000-0000-000000000004', 'red onion', 0.5, 'unit', 'diced'),
  ('b0000004-0000-0000-0000-000000000004', 'tomato', 1, 'unit', 'diced'),
  ('b0000004-0000-0000-0000-000000000004', 'cilantro', 0.25, 'bunch', NULL),

  ('b0000004-0000-0000-0000-000000000005', 'flour tortillas', 4, 'unit', NULL),
  ('b0000004-0000-0000-0000-000000000005', 'monterey jack cheese', 200, 'g', 'shredded'),
  ('b0000004-0000-0000-0000-000000000005', 'cheddar cheese', 100, 'g', 'shredded'),

  ('b0000005-0000-0000-0000-000000000001', 'rice noodles', 300, 'g', 'flat, dried'),
  ('b0000005-0000-0000-0000-000000000001', 'shrimp', 250, 'g', NULL),
  ('b0000005-0000-0000-0000-000000000001', 'firm tofu', 150, 'g', 'cubed'),
  ('b0000005-0000-0000-0000-000000000001', 'tamarind paste', 30, 'g', NULL),
  ('b0000005-0000-0000-0000-000000000001', 'fish sauce', 30, 'ml', NULL),
  ('b0000005-0000-0000-0000-000000000001', 'roasted peanuts', 60, 'g', 'crushed'),

  ('b0000005-0000-0000-0000-000000000002', 'green curry paste', 60, 'g', NULL),
  ('b0000005-0000-0000-0000-000000000002', 'coconut milk', 800, 'ml', NULL),
  ('b0000005-0000-0000-0000-000000000002', 'chicken thigh', 500, 'g', 'sliced'),
  ('b0000005-0000-0000-0000-000000000002', 'thai eggplant', 200, 'g', NULL),
  ('b0000005-0000-0000-0000-000000000002', 'fish sauce', 30, 'ml', NULL),
  ('b0000005-0000-0000-0000-000000000002', 'thai basil', 1, 'bunch', NULL),

  ('b0000005-0000-0000-0000-000000000003', 'shrimp', 300, 'g', NULL),
  ('b0000005-0000-0000-0000-000000000003', 'lemongrass', 2, 'stalk', 'bruised'),
  ('b0000005-0000-0000-0000-000000000003', 'galangal', 30, 'g', 'sliced'),
  ('b0000005-0000-0000-0000-000000000003', 'kaffir lime leaves', 6, 'unit', NULL),
  ('b0000005-0000-0000-0000-000000000003', 'lime juice', 45, 'ml', NULL),
  ('b0000005-0000-0000-0000-000000000003', 'thai chili paste', 1, 'tbsp', NULL),

  ('b0000005-0000-0000-0000-000000000004', 'rice paper wrappers', 12, 'unit', NULL),
  ('b0000005-0000-0000-0000-000000000004', 'shrimp', 200, 'g', 'cooked, halved'),
  ('b0000005-0000-0000-0000-000000000004', 'rice vermicelli', 80, 'g', NULL),
  ('b0000005-0000-0000-0000-000000000004', 'lettuce', 1, 'head', NULL),
  ('b0000005-0000-0000-0000-000000000004', 'mint and cilantro', 1, 'bunch', NULL),

  ('b0000005-0000-0000-0000-000000000005', 'glutinous rice', 300, 'g', 'soaked'),
  ('b0000005-0000-0000-0000-000000000005', 'coconut milk', 250, 'ml', NULL),
  ('b0000005-0000-0000-0000-000000000005', 'sugar', 60, 'g', NULL),
  ('b0000005-0000-0000-0000-000000000005', 'salt', 0.5, 'tsp', NULL),
  ('b0000005-0000-0000-0000-000000000005', 'ripe mango', 2, 'unit', 'sliced');
