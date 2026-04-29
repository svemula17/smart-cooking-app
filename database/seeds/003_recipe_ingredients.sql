-- 003_recipe_ingredients.sql
-- Ingredient lists for each seeded recipe.

INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, notes) VALUES
-- Chicken Biryani
('a0000001-0000-0000-0000-000000000001', 'basmati rice', 500, 'g', 'soaked 30 minutes'),
('a0000001-0000-0000-0000-000000000001', 'chicken thighs', 800, 'g', 'bone-in, skin off'),
('a0000001-0000-0000-0000-000000000001', 'yogurt', 200, 'g', 'full-fat'),
('a0000001-0000-0000-0000-000000000001', 'onion', 3, 'unit', 'thinly sliced'),
('a0000001-0000-0000-0000-000000000001', 'biryani masala', 2, 'tbsp', NULL),
('a0000001-0000-0000-0000-000000000001', 'saffron', 1, 'pinch', 'soaked in warm milk'),

-- Butter Chicken
('a0000001-0000-0000-0000-000000000002', 'chicken thighs', 600, 'g', 'cubed'),
('a0000001-0000-0000-0000-000000000002', 'tomato passata', 400, 'g', NULL),
('a0000001-0000-0000-0000-000000000002', 'heavy cream', 150, 'ml', NULL),
('a0000001-0000-0000-0000-000000000002', 'butter', 60, 'g', NULL),
('a0000001-0000-0000-0000-000000000002', 'garam masala', 1, 'tbsp', NULL),
('a0000001-0000-0000-0000-000000000002', 'kasuri methi', 1, 'tsp', 'crushed'),

-- Palak Paneer
('a0000001-0000-0000-0000-000000000003', 'spinach', 500, 'g', 'fresh, blanched'),
('a0000001-0000-0000-0000-000000000003', 'paneer', 250, 'g', 'cubed'),
('a0000001-0000-0000-0000-000000000003', 'onion', 1, 'unit', 'finely chopped'),
('a0000001-0000-0000-0000-000000000003', 'tomato', 2, 'unit', NULL),
('a0000001-0000-0000-0000-000000000003', 'ginger', 15, 'g', 'grated'),
('a0000001-0000-0000-0000-000000000003', 'cream', 50, 'ml', NULL),

-- Chana Masala
('a0000001-0000-0000-0000-000000000004', 'chickpeas', 400, 'g', 'cooked or canned'),
('a0000001-0000-0000-0000-000000000004', 'onion', 2, 'unit', 'pureed'),
('a0000001-0000-0000-0000-000000000004', 'tomato', 3, 'unit', 'pureed'),
('a0000001-0000-0000-0000-000000000004', 'chana masala', 2, 'tbsp', NULL),
('a0000001-0000-0000-0000-000000000004', 'ginger garlic paste', 1, 'tbsp', NULL),

-- Aloo Gobi
('a0000001-0000-0000-0000-000000000005', 'potato', 400, 'g', 'cubed'),
('a0000001-0000-0000-0000-000000000005', 'cauliflower', 500, 'g', 'florets'),
('a0000001-0000-0000-0000-000000000005', 'cumin seeds', 1, 'tsp', NULL),
('a0000001-0000-0000-0000-000000000005', 'turmeric', 0.5, 'tsp', NULL),
('a0000001-0000-0000-0000-000000000005', 'oil', 30, 'ml', NULL),

-- Dal Tadka
('a0000001-0000-0000-0000-000000000006', 'toor dal', 200, 'g', NULL),
('a0000001-0000-0000-0000-000000000006', 'ghee', 30, 'g', NULL),
('a0000001-0000-0000-0000-000000000006', 'cumin seeds', 1, 'tsp', NULL),
('a0000001-0000-0000-0000-000000000006', 'garlic', 4, 'clove', 'sliced'),
('a0000001-0000-0000-0000-000000000006', 'dried red chili', 2, 'unit', NULL),

-- Rogan Josh
('a0000001-0000-0000-0000-000000000007', 'lamb shoulder', 1000, 'g', 'cubed'),
('a0000001-0000-0000-0000-000000000007', 'yogurt', 200, 'g', NULL),
('a0000001-0000-0000-0000-000000000007', 'kashmiri chili powder', 1, 'tbsp', NULL),
('a0000001-0000-0000-0000-000000000007', 'fennel powder', 1, 'tsp', NULL),
('a0000001-0000-0000-0000-000000000007', 'ghee', 60, 'g', NULL),

-- Masala Dosa
('a0000001-0000-0000-0000-000000000008', 'dosa rice', 300, 'g', 'soaked overnight'),
('a0000001-0000-0000-0000-000000000008', 'urad dal', 100, 'g', 'soaked overnight'),
('a0000001-0000-0000-0000-000000000008', 'potato', 500, 'g', 'boiled'),
('a0000001-0000-0000-0000-000000000008', 'mustard seeds', 1, 'tsp', NULL),
('a0000001-0000-0000-0000-000000000008', 'curry leaves', 10, 'unit', NULL),

-- Tandoori Chicken
('a0000001-0000-0000-0000-000000000009', 'chicken legs', 800, 'g', 'scored'),
('a0000001-0000-0000-0000-000000000009', 'yogurt', 250, 'g', NULL),
('a0000001-0000-0000-0000-000000000009', 'tandoori masala', 2, 'tbsp', NULL),
('a0000001-0000-0000-0000-000000000009', 'ginger garlic paste', 2, 'tbsp', NULL),
('a0000001-0000-0000-0000-000000000009', 'lemon juice', 30, 'ml', NULL),

-- Vegetable Pulao
('a0000001-0000-0000-0000-000000000010', 'basmati rice', 300, 'g', NULL),
('a0000001-0000-0000-0000-000000000010', 'mixed vegetables', 250, 'g', 'carrots, peas, beans'),
('a0000001-0000-0000-0000-000000000010', 'ghee', 30, 'g', NULL),
('a0000001-0000-0000-0000-000000000010', 'whole spices', 1, 'tbsp', 'bay leaf, cardamom, cloves'),

-- Kung Pao Chicken
('a0000002-0000-0000-0000-000000000001', 'chicken breast', 500, 'g', 'diced'),
('a0000002-0000-0000-0000-000000000001', 'roasted peanuts', 80, 'g', NULL),
('a0000002-0000-0000-0000-000000000001', 'dried red chilies', 8, 'unit', NULL),
('a0000002-0000-0000-0000-000000000001', 'sichuan peppercorns', 1, 'tsp', NULL),
('a0000002-0000-0000-0000-000000000001', 'soy sauce', 30, 'ml', NULL),
('a0000002-0000-0000-0000-000000000001', 'black vinegar', 15, 'ml', NULL),

-- Mapo Tofu
('a0000002-0000-0000-0000-000000000002', 'silken tofu', 500, 'g', 'cubed'),
('a0000002-0000-0000-0000-000000000002', 'ground pork', 150, 'g', NULL),
('a0000002-0000-0000-0000-000000000002', 'doubanjiang', 2, 'tbsp', 'fermented broad bean paste'),
('a0000002-0000-0000-0000-000000000002', 'douchi', 1, 'tbsp', 'fermented black beans'),
('a0000002-0000-0000-0000-000000000002', 'chicken stock', 250, 'ml', NULL),

-- Yangzhou Fried Rice
('a0000002-0000-0000-0000-000000000003', 'cooked rice', 600, 'g', 'day-old, cold'),
('a0000002-0000-0000-0000-000000000003', 'eggs', 3, 'unit', NULL),
('a0000002-0000-0000-0000-000000000003', 'shrimp', 150, 'g', 'peeled'),
('a0000002-0000-0000-0000-000000000003', 'char siu', 100, 'g', 'diced'),
('a0000002-0000-0000-0000-000000000003', 'green peas', 80, 'g', NULL),

-- Sweet and Sour Pork
('a0000002-0000-0000-0000-000000000004', 'pork shoulder', 500, 'g', 'cubed'),
('a0000002-0000-0000-0000-000000000004', 'cornstarch', 60, 'g', NULL),
('a0000002-0000-0000-0000-000000000004', 'pineapple chunks', 200, 'g', NULL),
('a0000002-0000-0000-0000-000000000004', 'bell pepper', 1, 'unit', NULL),
('a0000002-0000-0000-0000-000000000004', 'rice vinegar', 60, 'ml', NULL),
('a0000002-0000-0000-0000-000000000004', 'ketchup', 60, 'g', NULL),

-- Beef and Broccoli
('a0000002-0000-0000-0000-000000000005', 'flank steak', 500, 'g', 'thinly sliced'),
('a0000002-0000-0000-0000-000000000005', 'broccoli', 400, 'g', 'florets'),
('a0000002-0000-0000-0000-000000000005', 'oyster sauce', 30, 'ml', NULL),
('a0000002-0000-0000-0000-000000000005', 'soy sauce', 30, 'ml', NULL),
('a0000002-0000-0000-0000-000000000005', 'garlic', 4, 'clove', NULL),
('a0000002-0000-0000-0000-000000000005', 'cornstarch', 15, 'g', NULL),

-- Spaghetti Carbonara
('a0000003-0000-0000-0000-000000000001', 'spaghetti', 400, 'g', NULL),
('a0000003-0000-0000-0000-000000000001', 'guanciale', 150, 'g', 'diced'),
('a0000003-0000-0000-0000-000000000001', 'egg yolks', 4, 'unit', NULL),
('a0000003-0000-0000-0000-000000000001', 'pecorino romano', 80, 'g', 'grated'),
('a0000003-0000-0000-0000-000000000001', 'black pepper', 1, 'tsp', 'coarsely ground'),

-- Margherita Pizza
('a0000003-0000-0000-0000-000000000002', 'pizza dough', 250, 'g', NULL),
('a0000003-0000-0000-0000-000000000002', 'san marzano tomatoes', 150, 'g', 'crushed'),
('a0000003-0000-0000-0000-000000000002', 'fresh mozzarella', 125, 'g', 'torn'),
('a0000003-0000-0000-0000-000000000002', 'fresh basil', 8, 'unit', 'leaves'),
('a0000003-0000-0000-0000-000000000002', 'olive oil', 15, 'ml', 'extra virgin'),

-- Lasagna Bolognese
('a0000003-0000-0000-0000-000000000003', 'lasagna sheets', 500, 'g', NULL),
('a0000003-0000-0000-0000-000000000003', 'ground beef', 500, 'g', NULL),
('a0000003-0000-0000-0000-000000000003', 'ground pork', 250, 'g', NULL),
('a0000003-0000-0000-0000-000000000003', 'tomato passata', 700, 'g', NULL),
('a0000003-0000-0000-0000-000000000003', 'milk', 1000, 'ml', 'for béchamel'),
('a0000003-0000-0000-0000-000000000003', 'butter', 100, 'g', NULL),
('a0000003-0000-0000-0000-000000000003', 'parmigiano reggiano', 150, 'g', 'grated'),

-- Risotto alla Milanese
('a0000003-0000-0000-0000-000000000004', 'arborio rice', 320, 'g', NULL),
('a0000003-0000-0000-0000-000000000004', 'beef stock', 1200, 'ml', 'hot'),
('a0000003-0000-0000-0000-000000000004', 'saffron', 1, 'pinch', NULL),
('a0000003-0000-0000-0000-000000000004', 'butter', 80, 'g', NULL),
('a0000003-0000-0000-0000-000000000004', 'parmigiano reggiano', 60, 'g', NULL),
('a0000003-0000-0000-0000-000000000004', 'white wine', 100, 'ml', 'dry'),

-- Caprese Salad
('a0000003-0000-0000-0000-000000000005', 'tomatoes', 300, 'g', 'ripe, sliced'),
('a0000003-0000-0000-0000-000000000005', 'fresh mozzarella', 200, 'g', 'sliced'),
('a0000003-0000-0000-0000-000000000005', 'fresh basil', 12, 'unit', 'leaves'),
('a0000003-0000-0000-0000-000000000005', 'olive oil', 30, 'ml', 'extra virgin'),
('a0000003-0000-0000-0000-000000000005', 'flaky salt', 1, 'pinch', NULL);
