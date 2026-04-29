-- Seed a handful of starter recipes for local development.
INSERT INTO recipes (id, title, cuisine, image_url, prep_time_minutes, cook_time_minutes, servings, difficulty, instructions)
VALUES
  (gen_random_uuid(), 'Spaghetti Aglio e Olio', 'Italian',
    'https://images.example.com/aglio-e-olio.jpg', 5, 15, 2, 'easy',
    '[{"order":1,"instruction":"Boil pasta in salted water."},
      {"order":2,"instruction":"Sauté garlic in olive oil with chili flakes."},
      {"order":3,"instruction":"Toss pasta with garlic oil and parsley."}]'::jsonb),
  (gen_random_uuid(), 'Salmon Teriyaki Bowl', 'Japanese',
    'https://images.example.com/salmon-teriyaki.jpg', 10, 15, 2, 'medium',
    '[{"order":1,"instruction":"Sear salmon, skin-side down."},
      {"order":2,"instruction":"Glaze with teriyaki sauce."},
      {"order":3,"instruction":"Serve over rice with steamed broccoli."}]'::jsonb),
  (gen_random_uuid(), 'Chicken Tinga Tacos', 'Mexican',
    'https://images.example.com/tinga.jpg', 15, 25, 4, 'medium',
    '[{"order":1,"instruction":"Poach chicken; shred."},
      {"order":2,"instruction":"Blend chipotle, tomato, onion; simmer with chicken."},
      {"order":3,"instruction":"Serve in warm tortillas with crema."}]'::jsonb);

INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g)
VALUES
  ('chicken breast', 165, 31, 0, 3.6),
  ('white rice', 130, 2.7, 28, 0.3),
  ('olive oil', 884, 0, 0, 100),
  ('broccoli', 34, 2.8, 7, 0.4),
  ('salmon', 208, 20, 0, 13)
ON CONFLICT (name) DO NOTHING;
