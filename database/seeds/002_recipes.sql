-- 002_recipes.sql
-- 20 recipes: 10 Indian, 5 Chinese, 5 Italian. Fixed UUIDs allow downstream
-- seed files (ingredients, nutrition) to reference them.

INSERT INTO recipes (id, name, cuisine_type, difficulty, prep_time_minutes, cook_time_minutes, servings, instructions, image_url, verified_by_dietitian)
VALUES
-- ===== INDIAN (10) =====
('a0000001-0000-0000-0000-000000000001', 'Chicken Biryani', 'Indian', 'Hard', 30, 60, 6,
 '[{"order":1,"instruction":"Marinate chicken with yogurt and spices for 30 minutes."},
   {"order":2,"instruction":"Parboil basmati rice with whole spices."},
   {"order":3,"instruction":"Sauté onions until golden brown."},
   {"order":4,"instruction":"Layer rice and chicken; dum-cook on low heat for 25 minutes."}]'::jsonb,
 'https://images.example.com/biryani.jpg', TRUE),

('a0000001-0000-0000-0000-000000000002', 'Butter Chicken', 'Indian', 'Medium', 20, 40, 4,
 '[{"order":1,"instruction":"Marinate chicken in yogurt and tandoori masala."},
   {"order":2,"instruction":"Grill chicken until charred."},
   {"order":3,"instruction":"Simmer tomato gravy with butter and cream."},
   {"order":4,"instruction":"Add chicken; finish with kasuri methi."}]'::jsonb,
 'https://images.example.com/butter-chicken.jpg', TRUE),

('a0000001-0000-0000-0000-000000000003', 'Palak Paneer', 'Indian', 'Easy', 15, 25, 4,
 '[{"order":1,"instruction":"Blanch and purée spinach."},
   {"order":2,"instruction":"Sauté onion, ginger, garlic, tomato."},
   {"order":3,"instruction":"Add spinach purée and simmer."},
   {"order":4,"instruction":"Fold in pan-fried paneer cubes."}]'::jsonb,
 'https://images.example.com/palak-paneer.jpg', TRUE),

('a0000001-0000-0000-0000-000000000004', 'Chana Masala', 'Indian', 'Easy', 10, 30, 4,
 '[{"order":1,"instruction":"Soak and pressure-cook chickpeas."},
   {"order":2,"instruction":"Make tomato-onion masala with whole spices."},
   {"order":3,"instruction":"Combine and simmer until thickened."}]'::jsonb,
 'https://images.example.com/chana-masala.jpg', TRUE),

('a0000001-0000-0000-0000-000000000005', 'Aloo Gobi', 'Indian', 'Easy', 10, 25, 4,
 '[{"order":1,"instruction":"Cube potato and cauliflower florets."},
   {"order":2,"instruction":"Temper cumin in oil; add turmeric, ginger."},
   {"order":3,"instruction":"Add vegetables; cover and cook until tender."}]'::jsonb,
 'https://images.example.com/aloo-gobi.jpg', FALSE),

('a0000001-0000-0000-0000-000000000006', 'Dal Tadka', 'Indian', 'Easy', 10, 30, 4,
 '[{"order":1,"instruction":"Pressure-cook toor dal with turmeric."},
   {"order":2,"instruction":"Prepare tadka: ghee, cumin, garlic, dried chili."},
   {"order":3,"instruction":"Pour tadka over dal; finish with cilantro."}]'::jsonb,
 'https://images.example.com/dal-tadka.jpg', TRUE),

('a0000001-0000-0000-0000-000000000007', 'Rogan Josh', 'Indian', 'Hard', 25, 90, 6,
 '[{"order":1,"instruction":"Brown lamb pieces in ghee."},
   {"order":2,"instruction":"Add yogurt, Kashmiri chili, fennel, ginger powder."},
   {"order":3,"instruction":"Simmer covered for 75 minutes until tender."}]'::jsonb,
 'https://images.example.com/rogan-josh.jpg', TRUE),

('a0000001-0000-0000-0000-000000000008', 'Masala Dosa', 'Indian', 'Hard', 480, 30, 4,
 '[{"order":1,"instruction":"Ferment dosa batter overnight."},
   {"order":2,"instruction":"Prepare potato masala filling."},
   {"order":3,"instruction":"Spread batter thin on hot tawa; fill and fold."}]'::jsonb,
 'https://images.example.com/masala-dosa.jpg', FALSE),

('a0000001-0000-0000-0000-000000000009', 'Tandoori Chicken', 'Indian', 'Medium', 240, 25, 4,
 '[{"order":1,"instruction":"Score chicken; marinate in yogurt and tandoori spices for 4 hours."},
   {"order":2,"instruction":"Roast at 450°F until charred and cooked through."},
   {"order":3,"instruction":"Rest 5 minutes; serve with mint chutney."}]'::jsonb,
 'https://images.example.com/tandoori-chicken.jpg', TRUE),

('a0000001-0000-0000-0000-000000000010', 'Vegetable Pulao', 'Indian', 'Easy', 10, 25, 4,
 '[{"order":1,"instruction":"Sauté whole spices in ghee."},
   {"order":2,"instruction":"Add mixed vegetables and basmati rice."},
   {"order":3,"instruction":"Add water; cover and cook 18 minutes."}]'::jsonb,
 'https://images.example.com/veg-pulao.jpg', FALSE),

-- ===== CHINESE (5) =====
('a0000002-0000-0000-0000-000000000001', 'Kung Pao Chicken', 'Chinese', 'Medium', 15, 15, 4,
 '[{"order":1,"instruction":"Velvet diced chicken with cornstarch and soy."},
   {"order":2,"instruction":"Stir-fry dried chilies and Sichuan peppercorns."},
   {"order":3,"instruction":"Add chicken, peanuts, scallions; toss with sauce."}]'::jsonb,
 'https://images.example.com/kung-pao.jpg', TRUE),

('a0000002-0000-0000-0000-000000000002', 'Mapo Tofu', 'Chinese', 'Medium', 10, 15, 4,
 '[{"order":1,"instruction":"Brown ground pork; add doubanjiang and douchi."},
   {"order":2,"instruction":"Add stock and silken tofu; simmer gently."},
   {"order":3,"instruction":"Thicken with cornstarch slurry; finish with Sichuan pepper."}]'::jsonb,
 'https://images.example.com/mapo-tofu.jpg', TRUE),

('a0000002-0000-0000-0000-000000000003', 'Yangzhou Fried Rice', 'Chinese', 'Easy', 10, 10, 4,
 '[{"order":1,"instruction":"Beat eggs; scramble briefly in wok."},
   {"order":2,"instruction":"Add cold cooked rice; toss until separated."},
   {"order":3,"instruction":"Add char siu, shrimp, peas, scallions, soy."}]'::jsonb,
 'https://images.example.com/yangzhou-rice.jpg', FALSE),

('a0000002-0000-0000-0000-000000000004', 'Sweet and Sour Pork', 'Chinese', 'Medium', 20, 20, 4,
 '[{"order":1,"instruction":"Coat pork pieces in cornstarch; deep-fry until crisp."},
   {"order":2,"instruction":"Make sauce with vinegar, ketchup, sugar, pineapple juice."},
   {"order":3,"instruction":"Toss pork with bell peppers, pineapple, and sauce."}]'::jsonb,
 'https://images.example.com/sweet-sour-pork.jpg', FALSE),

('a0000002-0000-0000-0000-000000000005', 'Beef and Broccoli', 'Chinese', 'Easy', 15, 10, 4,
 '[{"order":1,"instruction":"Slice flank steak thin; marinate in soy and cornstarch."},
   {"order":2,"instruction":"Blanch broccoli florets."},
   {"order":3,"instruction":"Stir-fry beef hot and fast; add broccoli and oyster sauce."}]'::jsonb,
 'https://images.example.com/beef-broccoli.jpg', TRUE),

-- ===== ITALIAN (5) =====
('a0000003-0000-0000-0000-000000000001', 'Spaghetti Carbonara', 'Italian', 'Medium', 5, 15, 4,
 '[{"order":1,"instruction":"Render guanciale until crisp."},
   {"order":2,"instruction":"Whisk egg yolks with pecorino."},
   {"order":3,"instruction":"Toss hot pasta with guanciale, then egg mixture off heat."}]'::jsonb,
 'https://images.example.com/carbonara.jpg', TRUE),

('a0000003-0000-0000-0000-000000000002', 'Margherita Pizza', 'Italian', 'Medium', 60, 10, 2,
 '[{"order":1,"instruction":"Stretch pizza dough thin."},
   {"order":2,"instruction":"Top with crushed San Marzano tomatoes and fresh mozzarella."},
   {"order":3,"instruction":"Bake at 500°F until crust is charred."},
   {"order":4,"instruction":"Top with basil and olive oil."}]'::jsonb,
 'https://images.example.com/margherita.jpg', TRUE),

('a0000003-0000-0000-0000-000000000003', 'Lasagna Bolognese', 'Italian', 'Hard', 30, 90, 8,
 '[{"order":1,"instruction":"Simmer bolognese ragù for 2 hours."},
   {"order":2,"instruction":"Make béchamel sauce."},
   {"order":3,"instruction":"Layer pasta sheets, ragù, béchamel, parmigiano."},
   {"order":4,"instruction":"Bake at 375°F for 45 minutes; rest before slicing."}]'::jsonb,
 'https://images.example.com/lasagna.jpg', TRUE),

('a0000003-0000-0000-0000-000000000004', 'Risotto alla Milanese', 'Italian', 'Medium', 5, 25, 4,
 '[{"order":1,"instruction":"Toast arborio rice in butter and onion."},
   {"order":2,"instruction":"Deglaze with white wine."},
   {"order":3,"instruction":"Add saffron stock ladle by ladle, stirring constantly."},
   {"order":4,"instruction":"Mantecare off heat with butter and parmigiano."}]'::jsonb,
 'https://images.example.com/risotto-milanese.jpg', FALSE),

('a0000003-0000-0000-0000-000000000005', 'Caprese Salad', 'Italian', 'Easy', 10, 0, 2,
 '[{"order":1,"instruction":"Slice tomatoes and fresh mozzarella."},
   {"order":2,"instruction":"Layer with basil leaves."},
   {"order":3,"instruction":"Drizzle with olive oil; finish with flaky salt."}]'::jsonb,
 'https://images.example.com/caprese.jpg', TRUE);
