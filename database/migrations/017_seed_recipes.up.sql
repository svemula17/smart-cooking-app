-- 017_seed_recipes.up.sql
-- Seeds 30 production-quality recipes used by recipe-service, nutrition-service,
-- and ai-service tests. Idempotent via ON CONFLICT DO NOTHING.

-- ============================================================
-- RECIPES
-- 10 Indian · 5 Chinese · 5 Italian · 5 Mexican · 5 Thai
-- ============================================================

INSERT INTO recipes
  (id, name, cuisine_type, difficulty, prep_time_minutes, cook_time_minutes,
   servings, instructions, image_url)
VALUES

-- ──────────────────────────── INDIAN ────────────────────────────

('a0000001-0000-0000-0000-000000000001', 'Chicken Biryani', 'Indian', 'Hard', 30, 60, 4,
 '[
   {"step_number":1,"instruction":"Wash and soak 2 cups basmati rice for 30 minutes. Drain well.","time_minutes":30},
   {"step_number":2,"instruction":"Marinate chicken pieces in yogurt, biryani masala, red chilli powder, ginger-garlic paste and salt for at least 1 hour.","time_minutes":60},
   {"step_number":3,"instruction":"Parboil the soaked rice with whole spices (bay leaf, cloves, cardamom, cinnamon) until 70% cooked. Drain and set aside.","time_minutes":15},
   {"step_number":4,"instruction":"Heat ghee in a heavy-bottomed pot. Fry thinly sliced onions until golden brown (birista). Remove half and reserve for garnish. Add marinated chicken and cook on high heat for 5 minutes.","time_minutes":20},
   {"step_number":5,"instruction":"Layer parboiled rice over the chicken. Top with fried onions, saffron milk, mint leaves and a drizzle of ghee. Seal pot with foil and a tight lid.","time_minutes":5},
   {"step_number":6,"instruction":"Cook on dum (low flame) for 25 minutes until chicken is fully cooked and rice is tender. Rest for 10 minutes before opening.","time_minutes":35}
 ]'::jsonb,
 null),

('a0000001-0000-0000-0000-000000000002', 'Butter Chicken', 'Indian', 'Medium', 20, 40, 4,
 '[
   {"step_number":1,"instruction":"Marinate chicken in yogurt, lemon juice, turmeric, red chilli powder, garam masala and ginger-garlic paste for 30 minutes.","time_minutes":30},
   {"step_number":2,"instruction":"Grill or pan-fry marinated chicken until slightly charred. Set aside.","time_minutes":10},
   {"step_number":3,"instruction":"Make makhani sauce: heat butter, sauté onions until golden. Add ginger-garlic paste, tomatoes, cashews and cook until mushy. Cool and blend smooth.","time_minutes":20},
   {"step_number":4,"instruction":"Strain the sauce back into the pan. Add cream, honey, kasuri methi, garam masala and salt. Simmer 10 minutes.","time_minutes":10},
   {"step_number":5,"instruction":"Add grilled chicken to the sauce. Simmer for 5–7 minutes until chicken absorbs the flavours.","time_minutes":7},
   {"step_number":6,"instruction":"Finish with a swirl of fresh cream and butter. Serve hot with naan or steamed rice.","time_minutes":3}
 ]'::jsonb,
 null),

('a0000001-0000-0000-0000-000000000003', 'Palak Paneer', 'Indian', 'Easy', 15, 25, 3,
 '[
   {"step_number":1,"instruction":"Blanch 500g fresh spinach in boiling salted water for 2 minutes. Immediately plunge into ice water. Drain and blend to a smooth purée.","time_minutes":10},
   {"step_number":2,"instruction":"Cube 200g paneer and lightly pan-fry in 1 tsp oil until golden. Soak in warm water to keep soft.","time_minutes":5},
   {"step_number":3,"instruction":"In the same pan, heat 2 tbsp oil. Splutter cumin, add finely chopped onion, ginger-garlic paste and cook until golden.","time_minutes":8},
   {"step_number":4,"instruction":"Add chopped tomato, all dry spices (coriander, cumin, garam masala, salt) and cook until oil separates.","time_minutes":7},
   {"step_number":5,"instruction":"Add spinach purée and simmer for 5 minutes. Stir in paneer, a splash of cream and adjust seasoning.","time_minutes":5}
 ]'::jsonb,
 null),

('a0000001-0000-0000-0000-000000000004', 'Dal Makhani', 'Indian', 'Medium', 480, 60, 6,
 '[
   {"step_number":1,"instruction":"Soak 1 cup whole black lentils (urad dal) and 1/4 cup kidney beans overnight in cold water.","time_minutes":480},
   {"step_number":2,"instruction":"Pressure cook soaked lentils with salt and water for 45 minutes on medium heat (or until very soft).","time_minutes":45},
   {"step_number":3,"instruction":"In a heavy pan, melt 2 tbsp butter with oil. Sauté finely diced onion until caramelised. Add ginger-garlic paste and cook 2 minutes.","time_minutes":12},
   {"step_number":4,"instruction":"Add tomato purée, all spices (coriander, cumin, garam masala, chilli powder) and cook 10 minutes until masala deepens in colour.","time_minutes":10},
   {"step_number":5,"instruction":"Add cooked lentils and stir well. Simmer on very low heat for 30 minutes, stirring every few minutes. The longer it cooks, the better.","time_minutes":30},
   {"step_number":6,"instruction":"Finish with fresh cream, a knob of butter and kasuri methi. Adjust salt and serve with naan.","time_minutes":5}
 ]'::jsonb,
 null),

('a0000001-0000-0000-0000-000000000005', 'Tandoori Chicken', 'Indian', 'Medium', 30, 25, 4,
 '[
   {"step_number":1,"instruction":"Score chicken pieces deeply with a sharp knife to allow marinade to penetrate.","time_minutes":5},
   {"step_number":2,"instruction":"First marinade: rub chicken with lemon juice, salt and chilli. Let rest 30 minutes.","time_minutes":30},
   {"step_number":3,"instruction":"Second marinade: mix thick yogurt, tandoori masala, ginger-garlic paste, red food colour (optional), chilli powder and mustard oil. Coat chicken thoroughly.","time_minutes":5},
   {"step_number":4,"instruction":"Marinate in the fridge for at least 4 hours (overnight is ideal).","time_minutes":240},
   {"step_number":5,"instruction":"Cook at 220°C (430°F) for 20–25 minutes, turning halfway. Finish under grill for 3 minutes for char.","time_minutes":25},
   {"step_number":6,"instruction":"Rest 5 minutes. Serve with mint chutney, sliced onion rings and lemon wedges.","time_minutes":5}
 ]'::jsonb,
 null),

('a0000001-0000-0000-0000-000000000006', 'Samosa', 'Indian', 'Hard', 60, 30, 12,
 '[
   {"step_number":1,"instruction":"Make dough: combine flour, carom seeds, oil and salt. Add warm water gradually to form a firm dough. Rest 20 minutes.","time_minutes":20},
   {"step_number":2,"instruction":"Filling: boil potatoes until soft, mash coarsely. Stir-fry with oil, cumin, peas, green chillies, ginger, spices and amchur. Cool completely.","time_minutes":20},
   {"step_number":3,"instruction":"Divide dough into balls. Roll each into an oval. Cut in half to get two semi-circles.","time_minutes":10},
   {"step_number":4,"instruction":"Form a cone from each semi-circle (use flour-water paste to seal seam). Fill with potato mixture. Seal the open edge firmly.","time_minutes":20},
   {"step_number":5,"instruction":"Deep fry samosas in oil at 160°C (325°F) for 8–10 minutes turning frequently until golden and crisp. Do not fry on high heat — the pastry will blister.","time_minutes":15},
   {"step_number":6,"instruction":"Drain on paper. Serve with mint chutney and tamarind chutney.","time_minutes":5}
 ]'::jsonb,
 null),

('a0000001-0000-0000-0000-000000000007', 'Butter Naan', 'Indian', 'Medium', 120, 15, 6,
 '[
   {"step_number":1,"instruction":"Combine flour, yeast, sugar, salt, yogurt and oil. Add warm water to form a soft dough. Knead 8 minutes until smooth.","time_minutes":10},
   {"step_number":2,"instruction":"Cover and let rise in a warm place for 1–2 hours until doubled.","time_minutes":120},
   {"step_number":3,"instruction":"Divide into 6 balls. Roll each into an oval about 3mm thick.","time_minutes":10},
   {"step_number":4,"instruction":"Heat a heavy tawa or cast iron skillet on high. Brush naan with water on one side, press water-side down onto skillet.","time_minutes":2},
   {"step_number":5,"instruction":"When bubbles form (about 1 minute), flip skillet over a direct gas flame to char the top, or use a broiler for 2 minutes.","time_minutes":3},
   {"step_number":6,"instruction":"Brush immediately with melted butter and sprinkle with fresh coriander. Wrap in cloth to keep soft.","time_minutes":1}
 ]'::jsonb,
 null),

('a0000001-0000-0000-0000-000000000008', 'Aloo Gobi', 'Indian', 'Easy', 10, 30, 4,
 '[
   {"step_number":1,"instruction":"Cut 300g potatoes into 1-inch cubes. Break 1 medium cauliflower into florets. Pat both dry.","time_minutes":10},
   {"step_number":2,"instruction":"Heat 3 tbsp oil in a kadai. Add cumin seeds and let splutter. Add potatoes and fry on medium-high for 5 minutes.","time_minutes":7},
   {"step_number":3,"instruction":"Add cauliflower florets and toss with potatoes. Sprinkle turmeric and salt. Cover and cook 10 minutes, stirring occasionally.","time_minutes":10},
   {"step_number":4,"instruction":"Uncover, add ginger-garlic paste, chopped green chillies, coriander powder, cumin powder and garam masala. Toss well.","time_minutes":3},
   {"step_number":5,"instruction":"Cook uncovered another 8–10 minutes until potatoes are tender and edges are lightly golden. Adjust salt.","time_minutes":10},
   {"step_number":6,"instruction":"Garnish with fresh coriander leaves. Serve with roti or rice.","time_minutes":1}
 ]'::jsonb,
 null),

('a0000001-0000-0000-0000-000000000009', 'Chana Masala', 'Indian', 'Easy', 480, 30, 4,
 '[
   {"step_number":1,"instruction":"Soak 1.5 cups dried chickpeas overnight. Pressure cook with salt until tender (about 20 minutes). Reserve cooking liquid.","time_minutes":480},
   {"step_number":2,"instruction":"Heat 2 tbsp oil. Add bay leaf, cloves and cinnamon. Sauté onions until deep golden brown — this step is crucial for flavour.","time_minutes":12},
   {"step_number":3,"instruction":"Add ginger-garlic paste, chopped tomatoes, chana masala powder, coriander, cumin and turmeric. Cook until oil separates.","time_minutes":10},
   {"step_number":4,"instruction":"Add cooked chickpeas along with some cooking liquid. Mash a few chickpeas into the gravy to thicken.","time_minutes":5},
   {"step_number":5,"instruction":"Simmer 10–15 minutes. Finish with amchur powder, garam masala, chopped coriander and lemon juice.","time_minutes":15}
 ]'::jsonb,
 null),

('a0000001-0000-0000-0000-000000000010', 'Paneer Tikka', 'Indian', 'Medium', 40, 15, 4,
 '[
   {"step_number":1,"instruction":"Cut 250g paneer into 1.5-inch cubes. Cut bell peppers and onion into similar chunks.","time_minutes":10},
   {"step_number":2,"instruction":"Marinade: whisk together thick yogurt, ginger-garlic paste, tikka masala, chilli powder, cumin, oil and salt. Coat paneer and vegetables well.","time_minutes":5},
   {"step_number":3,"instruction":"Marinate for at least 30 minutes (preferably 2 hours in the fridge).","time_minutes":30},
   {"step_number":4,"instruction":"Thread onto skewers, alternating paneer, peppers and onion.","time_minutes":5},
   {"step_number":5,"instruction":"Grill at 220°C / under broiler for 10–12 minutes, turning once, until slightly charred at edges.","time_minutes":12},
   {"step_number":6,"instruction":"Squeeze lemon juice over and serve with mint chutney and sliced red onion.","time_minutes":2}
 ]'::jsonb,
 null),

-- ──────────────────────────── CHINESE ────────────────────────────

('a0000002-0000-0000-0000-000000000011', 'Fried Rice', 'Chinese', 'Easy', 10, 15, 4,
 '[
   {"step_number":1,"instruction":"Use day-old cold cooked rice — fresh rice is too moist and clumps.","time_minutes":0},
   {"step_number":2,"instruction":"Beat 3 eggs with a pinch of salt. Scramble in a wok with 1 tbsp oil over high heat, breaking into small curds. Set aside.","time_minutes":3},
   {"step_number":3,"instruction":"Add 2 tbsp oil to the hot wok. Stir-fry diced carrots and peas for 2 minutes. Add chopped spring onions.","time_minutes":3},
   {"step_number":4,"instruction":"Add cold rice and spread across the wok. Let sit 30 seconds for slight crust to form, then toss vigorously.","time_minutes":4},
   {"step_number":5,"instruction":"Season with soy sauce, white pepper, oyster sauce and sesame oil. Fold in scrambled eggs.","time_minutes":3},
   {"step_number":6,"instruction":"Toss until heated through and evenly coated. Garnish with spring onion greens.","time_minutes":2}
 ]'::jsonb,
 null),

('a0000002-0000-0000-0000-000000000012', 'Sweet & Sour Chicken', 'Chinese', 'Medium', 20, 25, 4,
 '[
   {"step_number":1,"instruction":"Cut chicken breast into bite-size pieces. Coat in cornstarch, egg and a pinch of salt.","time_minutes":10},
   {"step_number":2,"instruction":"Deep fry chicken in 180°C oil until golden and crispy (5–6 minutes). Drain on paper towels. Fry in batches to avoid crowding.","time_minutes":12},
   {"step_number":3,"instruction":"Prepare sauce: mix ketchup, rice vinegar, soy sauce, sugar, water and cornstarch in a bowl.","time_minutes":3},
   {"step_number":4,"instruction":"In a separate pan, stir-fry chunks of bell peppers (red and green) and pineapple chunks for 2 minutes.","time_minutes":3},
   {"step_number":5,"instruction":"Pour sauce into pan and cook, stirring, until thickened (about 2 minutes).","time_minutes":2},
   {"step_number":6,"instruction":"Add crispy chicken and toss to coat evenly. Serve immediately with steamed rice.","time_minutes":2}
 ]'::jsonb,
 null),

('a0000002-0000-0000-0000-000000000013', 'Kung Pao Chicken', 'Chinese', 'Medium', 15, 15, 4,
 '[
   {"step_number":1,"instruction":"Dice chicken into small cubes. Marinate with soy sauce, cornstarch and Shaoxing wine for 15 minutes.","time_minutes":15},
   {"step_number":2,"instruction":"Prepare kung pao sauce: mix soy sauce, dark vinegar, sugar, sesame oil and cornstarch.","time_minutes":5},
   {"step_number":3,"instruction":"Heat wok until smoking. Fry dried red chillies and Sichuan peppercorns in oil for 30 seconds until fragrant.","time_minutes":2},
   {"step_number":4,"instruction":"Add marinated chicken, spread and cook without stirring for 1 minute, then toss until cooked.","time_minutes":4},
   {"step_number":5,"instruction":"Add sliced spring onions, minced garlic and ginger. Pour sauce over and toss to coat.","time_minutes":3},
   {"step_number":6,"instruction":"Fold in roasted peanuts. Plate and garnish with more Sichuan peppercorn powder.","time_minutes":1}
 ]'::jsonb,
 null),

('a0000002-0000-0000-0000-000000000014', 'Dumplings (Jiaozi)', 'Chinese', 'Hard', 60, 15, 4,
 '[
   {"step_number":1,"instruction":"Dough: add boiling water gradually to flour and mix until cool enough to knead. Rest 30 minutes under a damp cloth.","time_minutes":30},
   {"step_number":2,"instruction":"Filling: combine minced pork, napa cabbage (salted, squeezed dry), ginger, soy sauce, sesame oil, egg and white pepper.","time_minutes":15},
   {"step_number":3,"instruction":"Roll dough into a rope, cut into small pieces. Roll each into a thin round wrapper (~8cm diameter).","time_minutes":20},
   {"step_number":4,"instruction":"Place 1 tsp filling in the centre of each wrapper. Fold and pleat the edge to seal tightly.","time_minutes":15},
   {"step_number":5,"instruction":"Boil in salted water until dumplings float and skins are translucent, about 6–8 minutes. Or pan-fry until bottoms are golden.","time_minutes":8},
   {"step_number":6,"instruction":"Serve with dipping sauce: soy sauce, rice vinegar, chilli oil and sesame seeds.","time_minutes":2}
 ]'::jsonb,
 null),

('a0000002-0000-0000-0000-000000000015', 'Hot & Sour Soup', 'Chinese', 'Easy', 15, 20, 4,
 '[
   {"step_number":1,"instruction":"Prepare all toppings: cut tofu into thin strips, slice mushrooms (shiitake and wood ear), shred bamboo shoots and carrot.","time_minutes":15},
   {"step_number":2,"instruction":"Bring 4 cups chicken stock to a boil. Add mushrooms and bamboo shoots. Simmer 5 minutes.","time_minutes":7},
   {"step_number":3,"instruction":"Add tofu strips and carrot. Season with soy sauce, white pepper, rice vinegar and a touch of dark soy.","time_minutes":5},
   {"step_number":4,"instruction":"Mix 3 tbsp cornstarch with cold water. Stream into soup while stirring to thicken.","time_minutes":3},
   {"step_number":5,"instruction":"Beat 2 eggs. Pour in a thin stream while stirring the soup in circles to create silky egg ribbons.","time_minutes":2},
   {"step_number":6,"instruction":"Finish with sesame oil, more white pepper and sliced spring onions.","time_minutes":2}
 ]'::jsonb,
 null),

-- ──────────────────────────── ITALIAN ────────────────────────────

('a0000003-0000-0000-0000-000000000016', 'Pasta Carbonara', 'Italian', 'Medium', 10, 20, 4,
 '[
   {"step_number":1,"instruction":"Bring a large pot of heavily salted water to boil. Cook 400g spaghetti until al dente. Reserve 1 cup pasta water before draining.","time_minutes":12},
   {"step_number":2,"instruction":"Whisk together 4 egg yolks, 2 whole eggs and 80g finely grated Pecorino Romano. Season with black pepper. Do not add salt yet.","time_minutes":5},
   {"step_number":3,"instruction":"Fry 150g guanciale (or pancetta) in a dry pan until fat renders and meat is crispy. Remove and set aside. Keep the rendered fat.","time_minutes":8},
   {"step_number":4,"instruction":"Off the heat, add the hot drained pasta to the guanciale fat and toss.","time_minutes":1},
   {"step_number":5,"instruction":"Immediately pour egg mixture over pasta and toss rapidly, adding reserved pasta water splash by splash to create a creamy sauce. The residual heat cooks the eggs — never let them scramble.","time_minutes":3},
   {"step_number":6,"instruction":"Fold in guanciale, adjust seasoning, and serve immediately with extra Pecorino and black pepper.","time_minutes":1}
 ]'::jsonb,
 null),

('a0000003-0000-0000-0000-000000000017', 'Margherita Pizza', 'Italian', 'Hard', 120, 15, 4,
 '[
   {"step_number":1,"instruction":"Dough: dissolve yeast in warm water with a pinch of sugar. Mix into flour with salt and olive oil. Knead 10 minutes. Rise 1–2 hours.","time_minutes":120},
   {"step_number":2,"instruction":"Preheat oven to maximum (250–280°C / 480–540°F) with a pizza stone or heavy baking sheet inside for at least 30 minutes.","time_minutes":30},
   {"step_number":3,"instruction":"Crush san Marzano tomatoes by hand with salt, olive oil and a pinch of sugar. This is the sauce — no cooking needed.","time_minutes":5},
   {"step_number":4,"instruction":"Stretch dough on a floured surface into a thin 12-inch round. Transfer to a peel or parchment.","time_minutes":5},
   {"step_number":5,"instruction":"Spread sauce thinly to 1cm from edge. Tear fresh mozzarella over. Drizzle olive oil. Slide onto hot stone.","time_minutes":5},
   {"step_number":6,"instruction":"Bake 8–12 minutes until crust is leopard-spotted and cheese is bubbling. Top with fresh basil after removing from oven.","time_minutes":12}
 ]'::jsonb,
 null),

('a0000003-0000-0000-0000-000000000018', 'Mushroom Risotto', 'Italian', 'Medium', 15, 35, 4,
 '[
   {"step_number":1,"instruction":"Soak 20g dried porcini mushrooms in 250ml warm water for 30 minutes. Strain, reserving liquid. Roughly chop.","time_minutes":30},
   {"step_number":2,"instruction":"Heat 1 litre chicken or vegetable stock in a saucepan. Keep warm throughout cooking.","time_minutes":5},
   {"step_number":3,"instruction":"In a wide pan, soften diced shallots and garlic in butter and olive oil. Add 400g sliced fresh mushrooms and cook until golden.","time_minutes":10},
   {"step_number":4,"instruction":"Add 350g Arborio or Carnaroli rice. Toast for 2 minutes, stirring constantly. Add white wine and let absorb.","time_minutes":5},
   {"step_number":5,"instruction":"Add warm stock one ladle at a time, stirring after each addition until absorbed. Repeat for 20–22 minutes until rice is creamy and al dente.","time_minutes":22},
   {"step_number":6,"instruction":"Off heat, stir in cold butter and grated Parmigiano. Rest 2 minutes. Season and serve immediately.","time_minutes":3}
 ]'::jsonb,
 null),

('a0000003-0000-0000-0000-000000000019', 'Beef Lasagna', 'Italian', 'Hard', 30, 90, 8,
 '[
   {"step_number":1,"instruction":"Bolognese: fry diced onion, carrot and celery in olive oil. Brown ground beef. Add wine, tomatoes, stock and herbs. Simmer 45 minutes.","time_minutes":60},
   {"step_number":2,"instruction":"Béchamel: melt butter, whisk in flour, gradually add warm milk. Cook 5 minutes until thickened. Season with nutmeg and salt.","time_minutes":10},
   {"step_number":3,"instruction":"Cook lasagna sheets in salted water until barely al dente. Pat dry.","time_minutes":10},
   {"step_number":4,"instruction":"Build layers in a greased 33x23cm dish: Bolognese → pasta sheets → Béchamel → Parmigiano. Repeat 4 times.","time_minutes":15},
   {"step_number":5,"instruction":"Top with remaining Béchamel and a generous layer of Parmigiano. Cover with foil.","time_minutes":5},
   {"step_number":6,"instruction":"Bake at 180°C for 45 minutes. Remove foil and bake another 15 minutes until golden and bubbling. Rest 15 minutes before cutting.","time_minutes":60}
 ]'::jsonb,
 null),

('a0000003-0000-0000-0000-000000000020', 'Tiramisu', 'Italian', 'Medium', 30, 0, 8,
 '[
   {"step_number":1,"instruction":"Separate 6 eggs. Beat yolks with 150g caster sugar until pale and doubled in volume.","time_minutes":8},
   {"step_number":2,"instruction":"Fold 500g mascarpone into the yolk mixture until smooth.","time_minutes":5},
   {"step_number":3,"instruction":"Whisk egg whites to stiff peaks. Gently fold into mascarpone mixture in three additions.","time_minutes":7},
   {"step_number":4,"instruction":"Make strong espresso (300ml). Cool slightly and add Marsala wine or rum (optional).","time_minutes":5},
   {"step_number":5,"instruction":"Dip Savoiardi biscuits briefly (1 second per side) in coffee. Lay in a single layer in a 25x18cm dish.","time_minutes":5},
   {"step_number":6,"instruction":"Spread half the mascarpone cream over. Repeat layer of soaked biscuits and remaining cream. Dust generously with cocoa powder. Refrigerate at least 4 hours before serving.","time_minutes":10}
 ]'::jsonb,
 null),

-- ──────────────────────────── MEXICAN ────────────────────────────

('a0000004-0000-0000-0000-000000000021', 'Street Tacos', 'Mexican', 'Easy', 15, 15, 4,
 '[
   {"step_number":1,"instruction":"Marinate beef strips or chicken in lime juice, cumin, chilli powder, garlic and salt for 15 minutes.","time_minutes":15},
   {"step_number":2,"instruction":"Heat a griddle or cast-iron pan on high. Cook meat in batches until charred at edges. Chop finely.","time_minutes":10},
   {"step_number":3,"instruction":"Warm small corn tortillas directly over a gas flame or in a dry pan until pliable and slightly charred.","time_minutes":3},
   {"step_number":4,"instruction":"Prepare toppings: finely diced white onion, chopped coriander, halved limes, salsa verde and thinly sliced radishes.","time_minutes":5},
   {"step_number":5,"instruction":"Double up two tortillas per taco (authentic style). Fill with meat and top generously.","time_minutes":2},
   {"step_number":6,"instruction":"Squeeze fresh lime juice over each taco. Serve immediately with salsa and pickled jalapeños.","time_minutes":1}
 ]'::jsonb,
 null),

('a0000004-0000-0000-0000-000000000022', 'Chicken Burrito', 'Mexican', 'Easy', 20, 20, 4,
 '[
   {"step_number":1,"instruction":"Season chicken with fajita spice mix. Pan-fry until cooked through and slightly browned. Rest 5 minutes, then slice.","time_minutes":15},
   {"step_number":2,"instruction":"Cook cilantro-lime rice: rinse basmati, cook with chicken stock. When done, stir in lime zest, lime juice and chopped coriander.","time_minutes":20},
   {"step_number":3,"instruction":"Warm black beans (canned) in a small pan with cumin and pinch of salt.","time_minutes":5},
   {"step_number":4,"instruction":"Prepare fixings: sour cream, guacamole, shredded cheddar, salsa and iceberg lettuce.","time_minutes":5},
   {"step_number":5,"instruction":"Warm large flour tortillas in a dry pan. Arrange rice, beans, chicken and fixings in a horizontal line in the centre.","time_minutes":3},
   {"step_number":6,"instruction":"Fold sides in, then roll tightly from the bottom, tucking firmly. Optionally toast seam-side down on the pan for 1 minute.","time_minutes":2}
 ]'::jsonb,
 null),

('a0000004-0000-0000-0000-000000000023', 'Cheese Enchiladas', 'Mexican', 'Medium', 20, 30, 4,
 '[
   {"step_number":1,"instruction":"Make red enchilada sauce: toast dried guajillo and ancho chillies. Blend with onion, garlic, cumin, oregano and chicken stock until smooth. Simmer 10 minutes.","time_minutes":20},
   {"step_number":2,"instruction":"Warm corn tortillas briefly in a dry pan to make pliable.","time_minutes":5},
   {"step_number":3,"instruction":"Lightly coat each tortilla in sauce. Fill with a mix of shredded cheese (Monterey Jack + cheddar) and diced white onion. Roll tightly.","time_minutes":10},
   {"step_number":4,"instruction":"Arrange seam-side down in a greased baking dish. Pour remaining sauce over, ensuring all tortillas are covered.","time_minutes":5},
   {"step_number":5,"instruction":"Sprinkle remaining cheese generously over top.","time_minutes":2},
   {"step_number":6,"instruction":"Bake uncovered at 180°C for 20–25 minutes until cheese is bubbling. Garnish with sour cream, coriander and pickled jalapeños.","time_minutes":25}
 ]'::jsonb,
 null),

('a0000004-0000-0000-0000-000000000024', 'Classic Guacamole', 'Mexican', 'Easy', 10, 0, 4,
 '[
   {"step_number":1,"instruction":"Choose ripe Hass avocados — they should yield to gentle pressure. Halve, remove stone and scoop flesh into a molcajete or bowl.","time_minutes":3},
   {"step_number":2,"instruction":"Mash avocado to your preferred texture (chunky or smooth) with a fork or pestle.","time_minutes":2},
   {"step_number":3,"instruction":"Finely dice half a white onion. Chop 1–2 jalapeño chillies (seeds removed for less heat). Add to avocado.","time_minutes":3},
   {"step_number":4,"instruction":"Add finely chopped fresh coriander (a generous handful), juice of 1 large lime and salt to taste.","time_minutes":1},
   {"step_number":5,"instruction":"Taste and adjust: more lime, salt or chilli as needed. Guacamole should be bright and acidic.","time_minutes":1},
   {"step_number":6,"instruction":"Serve immediately. If making ahead, press cling film directly onto the surface to prevent browning.","time_minutes":1}
 ]'::jsonb,
 null),

('a0000004-0000-0000-0000-000000000025', 'Quesadillas', 'Mexican', 'Easy', 10, 10, 4,
 '[
   {"step_number":1,"instruction":"Prepare filling: cook sliced chicken or vegetables with onion, peppers and fajita seasoning until soft and lightly charred.","time_minutes":8},
   {"step_number":2,"instruction":"Shred or cube cheese: use Oaxacan cheese, Monterey Jack or mozzarella for best melt.","time_minutes":2},
   {"step_number":3,"instruction":"Heat a large non-stick pan on medium. Place a flour tortilla flat. Spread filling on half, then cheese.","time_minutes":2},
   {"step_number":4,"instruction":"Fold tortilla in half. Press gently with spatula. Cook 2–3 minutes until golden on the bottom.","time_minutes":3},
   {"step_number":5,"instruction":"Flip and cook another 2 minutes until cheese is fully melted and second side is golden.","time_minutes":2},
   {"step_number":6,"instruction":"Cut into wedges. Serve with sour cream, guacamole and fresh salsa.","time_minutes":1}
 ]'::jsonb,
 null),

-- ──────────────────────────── THAI ────────────────────────────

('a0000005-0000-0000-0000-000000000026', 'Pad Thai', 'Thai', 'Medium', 20, 15, 4,
 '[
   {"step_number":1,"instruction":"Soak 200g flat rice noodles in room-temperature water for 30 minutes. They should be pliable but still firm.","time_minutes":30},
   {"step_number":2,"instruction":"Pad Thai sauce: mix tamarind paste, fish sauce, palm sugar and sriracha. Adjust for sweet-sour-salty balance.","time_minutes":5},
   {"step_number":3,"instruction":"Heat wok on very high heat. Stir-fry 200g prawns or tofu cubes in oil until just cooked. Set aside.","time_minutes":4},
   {"step_number":4,"instruction":"In the same wok, scramble 2 eggs lightly. Add drained noodles and sauce. Toss vigorously.","time_minutes":4},
   {"step_number":5,"instruction":"Add prawns/tofu, bean sprouts and sliced spring onions. Toss 1 minute.","time_minutes":2},
   {"step_number":6,"instruction":"Plate and serve with crushed peanuts, lime wedge, chilli flakes and dried shrimp on the side.","time_minutes":1}
 ]'::jsonb,
 null),

('a0000005-0000-0000-0000-000000000027', 'Thai Green Curry', 'Thai', 'Medium', 15, 25, 4,
 '[
   {"step_number":1,"instruction":"Heat 1 tbsp oil in a wok. Fry 2–3 tbsp green curry paste for 1–2 minutes until fragrant.","time_minutes":3},
   {"step_number":2,"instruction":"Add 400ml thick coconut milk. Stir well and bring to a simmer.","time_minutes":5},
   {"step_number":3,"instruction":"Add 400g sliced chicken breast or tofu. Cook on medium heat for 10 minutes.","time_minutes":10},
   {"step_number":4,"instruction":"Add vegetables: Thai eggplant, courgette, baby corn and red bell pepper. Simmer 5 minutes.","time_minutes":5},
   {"step_number":5,"instruction":"Season with fish sauce, palm sugar and lime leaves. Taste and balance.","time_minutes":3},
   {"step_number":6,"instruction":"Finish with Thai basil leaves and sliced red chilli. Serve with jasmine rice.","time_minutes":2}
 ]'::jsonb,
 null),

('a0000005-0000-0000-0000-000000000028', 'Tom Yum Soup', 'Thai', 'Easy', 10, 20, 4,
 '[
   {"step_number":1,"instruction":"Bring 1 litre chicken or shrimp stock to a boil. Add bruised lemongrass stalks, galangal slices, kaffir lime leaves and dried chillies. Simmer 10 minutes to infuse.","time_minutes":10},
   {"step_number":2,"instruction":"Add halved mushrooms (shiitake or oyster) and cherry tomatoes to the broth.","time_minutes":5},
   {"step_number":3,"instruction":"Add 300g prawns (shell-on for more flavour). Cook until pink, 2–3 minutes.","time_minutes":3},
   {"step_number":4,"instruction":"Season with fish sauce and lime juice. Taste — it should be intensely sour, savoury and spicy.","time_minutes":2},
   {"step_number":5,"instruction":"Ladle into bowls. Garnish with fresh coriander and a squeeze of lime.","time_minutes":1}
 ]'::jsonb,
 null),

('a0000005-0000-0000-0000-000000000029', 'Fresh Spring Rolls', 'Thai', 'Easy', 30, 0, 4,
 '[
   {"step_number":1,"instruction":"Prep all fillings: cook vermicelli noodles, cool in cold water; poach prawns until pink, halve lengthways; shred lettuce; julienne carrot and cucumber; pick coriander and mint.","time_minutes":20},
   {"step_number":2,"instruction":"Lay out all components in bowls ready for assembly line rolling.","time_minutes":5},
   {"step_number":3,"instruction":"Fill a wide bowl with warm water. Dip one rice paper sheet for 10–15 seconds until just pliable (it will continue softening).","time_minutes":1},
   {"step_number":4,"instruction":"Lay flat on a damp surface. Place a few herb leaves on the lower third (they will show through). Layer noodles, carrot, cucumber, lettuce and prawns (pink-side down) on top.","time_minutes":2},
   {"step_number":5,"instruction":"Fold the sides in, then roll from the bottom up firmly, tucking as you go.","time_minutes":2},
   {"step_number":6,"instruction":"Serve immediately with peanut dipping sauce or sweet chilli sauce.","time_minutes":1}
 ]'::jsonb,
 null),

('a0000005-0000-0000-0000-000000000030', 'Mango Sticky Rice', 'Thai', 'Easy', 120, 30, 4,
 '[
   {"step_number":1,"instruction":"Soak 400g Thai glutinous rice in cold water for 2 hours. Drain well.","time_minutes":120},
   {"step_number":2,"instruction":"Steam drained rice in a bamboo or metal steamer for 25–30 minutes until translucent and cooked through.","time_minutes":30},
   {"step_number":3,"instruction":"While rice steams, warm 400ml coconut milk with 80g sugar and 1 tsp salt, stirring until dissolved. Do not boil.","time_minutes":5},
   {"step_number":4,"instruction":"Pour 2/3 of the warm coconut milk over hot cooked rice. Stir gently. Cover and rest 20 minutes — rice will absorb the milk.","time_minutes":20},
   {"step_number":5,"instruction":"Peel and slice 4 ripe mangoes. Arrange beside a mound of coconut-infused sticky rice.","time_minutes":5},
   {"step_number":6,"instruction":"Drizzle remaining coconut sauce over rice and mango. Garnish with toasted sesame seeds and a pandan leaf.","time_minutes":2}
 ]'::jsonb,
 null)

ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- RECIPE INGREDIENTS
-- ============================================================

INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, notes) VALUES

-- Chicken Biryani
('a0000001-0000-0000-0000-000000000001', 'chicken thighs', 800, 'g', 'bone-in for more flavour'),
('a0000001-0000-0000-0000-000000000001', 'basmati rice', 400, 'g', 'aged variety preferred'),
('a0000001-0000-0000-0000-000000000001', 'yogurt', 200, 'g', 'full-fat, thick'),
('a0000001-0000-0000-0000-000000000001', 'onion', 3, 'medium', 'thinly sliced for birista'),
('a0000001-0000-0000-0000-000000000001', 'ginger-garlic paste', 2, 'tbsp', null),
('a0000001-0000-0000-0000-000000000001', 'biryani masala', 2, 'tbsp', null),
('a0000001-0000-0000-0000-000000000001', 'saffron', 0.25, 'tsp', 'soaked in warm milk'),
('a0000001-0000-0000-0000-000000000001', 'ghee', 3, 'tbsp', null),
('a0000001-0000-0000-0000-000000000001', 'mint leaves', 20, 'g', 'fresh'),
('a0000001-0000-0000-0000-000000000001', 'red chilli powder', 1, 'tsp', null),

-- Butter Chicken
('a0000001-0000-0000-0000-000000000002', 'chicken breast', 700, 'g', 'cut into large pieces'),
('a0000001-0000-0000-0000-000000000002', 'tomatoes', 4, 'medium', 'chopped or pureed'),
('a0000001-0000-0000-0000-000000000002', 'butter', 3, 'tbsp', null),
('a0000001-0000-0000-0000-000000000002', 'fresh cream', 100, 'ml', null),
('a0000001-0000-0000-0000-000000000002', 'cashews', 20, 'g', 'for sauce body'),
('a0000001-0000-0000-0000-000000000002', 'ginger-garlic paste', 2, 'tbsp', null),
('a0000001-0000-0000-0000-000000000002', 'yogurt', 100, 'g', null),
('a0000001-0000-0000-0000-000000000002', 'kasuri methi', 1, 'tbsp', 'dried fenugreek leaves'),
('a0000001-0000-0000-0000-000000000002', 'garam masala', 1, 'tsp', null),
('a0000001-0000-0000-0000-000000000002', 'honey', 1, 'tsp', 'to balance acidity'),

-- Palak Paneer
('a0000001-0000-0000-0000-000000000003', 'paneer', 200, 'g', 'cubed and lightly fried'),
('a0000001-0000-0000-0000-000000000003', 'spinach', 500, 'g', 'fresh, blanched and pureed'),
('a0000001-0000-0000-0000-000000000003', 'onion', 1, 'medium', 'finely chopped'),
('a0000001-0000-0000-0000-000000000003', 'tomato', 2, 'medium', 'chopped'),
('a0000001-0000-0000-0000-000000000003', 'cream', 2, 'tbsp', 'to finish'),
('a0000001-0000-0000-0000-000000000003', 'cumin seeds', 1, 'tsp', null),
('a0000001-0000-0000-0000-000000000003', 'ginger-garlic paste', 1, 'tbsp', null),

-- Dal Makhani
('a0000001-0000-0000-0000-000000000004', 'black lentils', 200, 'g', 'whole urad dal'),
('a0000001-0000-0000-0000-000000000004', 'kidney beans', 50, 'g', 'dried'),
('a0000001-0000-0000-0000-000000000004', 'butter', 3, 'tbsp', null),
('a0000001-0000-0000-0000-000000000004', 'tomato puree', 200, 'ml', null),
('a0000001-0000-0000-0000-000000000004', 'cream', 50, 'ml', null),
('a0000001-0000-0000-0000-000000000004', 'onion', 1, 'large', 'finely diced'),
('a0000001-0000-0000-0000-000000000004', 'ginger-garlic paste', 1, 'tbsp', null),

-- Tandoori Chicken
('a0000001-0000-0000-0000-000000000005', 'chicken legs', 800, 'g', 'scored deeply'),
('a0000001-0000-0000-0000-000000000005', 'yogurt', 200, 'g', 'hung or thick'),
('a0000001-0000-0000-0000-000000000005', 'tandoori masala', 2, 'tbsp', null),
('a0000001-0000-0000-0000-000000000005', 'lemon juice', 2, 'tbsp', null),
('a0000001-0000-0000-0000-000000000005', 'ginger-garlic paste', 2, 'tbsp', null),
('a0000001-0000-0000-0000-000000000005', 'mustard oil', 1, 'tbsp', null),
('a0000001-0000-0000-0000-000000000005', 'red chilli powder', 1.5, 'tsp', null),

-- Samosa
('a0000001-0000-0000-0000-000000000006', 'all-purpose flour', 300, 'g', null),
('a0000001-0000-0000-0000-000000000006', 'potato', 400, 'g', 'boiled and mashed'),
('a0000001-0000-0000-0000-000000000006', 'green peas', 100, 'g', null),
('a0000001-0000-0000-0000-000000000006', 'carom seeds', 0.5, 'tsp', null),
('a0000001-0000-0000-0000-000000000006', 'amchur powder', 1, 'tsp', 'dried mango powder'),
('a0000001-0000-0000-0000-000000000006', 'oil', 500, 'ml', 'for deep frying'),

-- Butter Naan
('a0000001-0000-0000-0000-000000000007', 'all-purpose flour', 400, 'g', null),
('a0000001-0000-0000-0000-000000000007', 'yogurt', 100, 'g', null),
('a0000001-0000-0000-0000-000000000007', 'butter', 50, 'g', 'for brushing'),
('a0000001-0000-0000-0000-000000000007', 'active dry yeast', 7, 'g', null),
('a0000001-0000-0000-0000-000000000007', 'sugar', 1, 'tsp', null),

-- Aloo Gobi
('a0000001-0000-0000-0000-000000000008', 'potato', 300, 'g', null),
('a0000001-0000-0000-0000-000000000008', 'cauliflower', 500, 'g', null),
('a0000001-0000-0000-0000-000000000008', 'cumin seeds', 1, 'tsp', null),
('a0000001-0000-0000-0000-000000000008', 'turmeric', 0.5, 'tsp', null),
('a0000001-0000-0000-0000-000000000008', 'coriander powder', 1, 'tsp', null),
('a0000001-0000-0000-0000-000000000008', 'ginger', 1, 'inch', 'grated'),

-- Chana Masala
('a0000001-0000-0000-0000-000000000009', 'dried chickpeas', 300, 'g', 'soaked overnight'),
('a0000001-0000-0000-0000-000000000009', 'onion', 2, 'medium', null),
('a0000001-0000-0000-0000-000000000009', 'tomato', 2, 'large', null),
('a0000001-0000-0000-0000-000000000009', 'chana masala powder', 2, 'tbsp', null),
('a0000001-0000-0000-0000-000000000009', 'amchur powder', 1, 'tsp', null),
('a0000001-0000-0000-0000-000000000009', 'lemon juice', 1, 'tbsp', null),

-- Paneer Tikka
('a0000001-0000-0000-0000-000000000010', 'paneer', 250, 'g', 'cubed'),
('a0000001-0000-0000-0000-000000000010', 'yogurt', 150, 'g', 'thick'),
('a0000001-0000-0000-0000-000000000010', 'bell pepper', 2, 'medium', 'mixed colours'),
('a0000001-0000-0000-0000-000000000010', 'onion', 1, 'large', 'cut in chunks'),
('a0000001-0000-0000-0000-000000000010', 'tikka masala', 2, 'tbsp', null),
('a0000001-0000-0000-0000-000000000010', 'lemon', 1, 'whole', 'for garnish'),

-- Fried Rice
('a0000002-0000-0000-0000-000000000011', 'cooked rice', 600, 'g', 'day-old cold rice'),
('a0000002-0000-0000-0000-000000000011', 'eggs', 3, 'whole', null),
('a0000002-0000-0000-0000-000000000011', 'carrot', 1, 'medium', 'diced'),
('a0000002-0000-0000-0000-000000000011', 'green peas', 100, 'g', null),
('a0000002-0000-0000-0000-000000000011', 'spring onions', 4, 'stalks', null),
('a0000002-0000-0000-0000-000000000011', 'soy sauce', 3, 'tbsp', null),
('a0000002-0000-0000-0000-000000000011', 'sesame oil', 1, 'tsp', null),

-- Sweet & Sour Chicken
('a0000002-0000-0000-0000-000000000012', 'chicken breast', 500, 'g', null),
('a0000002-0000-0000-0000-000000000012', 'pineapple chunks', 200, 'g', null),
('a0000002-0000-0000-0000-000000000012', 'bell pepper', 2, 'medium', null),
('a0000002-0000-0000-0000-000000000012', 'ketchup', 4, 'tbsp', null),
('a0000002-0000-0000-0000-000000000012', 'rice vinegar', 3, 'tbsp', null),
('a0000002-0000-0000-0000-000000000012', 'cornstarch', 4, 'tbsp', null),

-- Kung Pao Chicken
('a0000002-0000-0000-0000-000000000013', 'chicken breast', 500, 'g', null),
('a0000002-0000-0000-0000-000000000013', 'roasted peanuts', 80, 'g', null),
('a0000002-0000-0000-0000-000000000013', 'dried red chillies', 8, 'whole', null),
('a0000002-0000-0000-0000-000000000013', 'Sichuan peppercorn', 1, 'tsp', null),
('a0000002-0000-0000-0000-000000000013', 'soy sauce', 2, 'tbsp', null),
('a0000002-0000-0000-0000-000000000013', 'dark vinegar', 1, 'tbsp', null),

-- Dumplings
('a0000002-0000-0000-0000-000000000014', 'all-purpose flour', 300, 'g', null),
('a0000002-0000-0000-0000-000000000014', 'minced pork', 300, 'g', null),
('a0000002-0000-0000-0000-000000000014', 'napa cabbage', 200, 'g', 'salted and squeezed'),
('a0000002-0000-0000-0000-000000000014', 'ginger', 2, 'cm', 'finely minced'),
('a0000002-0000-0000-0000-000000000014', 'sesame oil', 1, 'tbsp', null),
('a0000002-0000-0000-0000-000000000014', 'soy sauce', 2, 'tbsp', null),

-- Hot & Sour Soup
('a0000002-0000-0000-0000-000000000015', 'firm tofu', 200, 'g', null),
('a0000002-0000-0000-0000-000000000015', 'shiitake mushrooms', 100, 'g', null),
('a0000002-0000-0000-0000-000000000015', 'bamboo shoots', 100, 'g', null),
('a0000002-0000-0000-0000-000000000015', 'chicken stock', 1000, 'ml', null),
('a0000002-0000-0000-0000-000000000015', 'eggs', 2, 'whole', null),
('a0000002-0000-0000-0000-000000000015', 'rice vinegar', 3, 'tbsp', null),

-- Pasta Carbonara
('a0000003-0000-0000-0000-000000000016', 'spaghetti', 400, 'g', null),
('a0000003-0000-0000-0000-000000000016', 'guanciale', 150, 'g', 'or pancetta'),
('a0000003-0000-0000-0000-000000000016', 'eggs', 2, 'whole', null),
('a0000003-0000-0000-0000-000000000016', 'egg yolks', 4, 'whole', null),
('a0000003-0000-0000-0000-000000000016', 'Pecorino Romano', 80, 'g', 'finely grated'),
('a0000003-0000-0000-0000-000000000016', 'black pepper', 2, 'tsp', 'freshly cracked'),

-- Margherita Pizza
('a0000003-0000-0000-0000-000000000017', 'bread flour', 500, 'g', 'high gluten'),
('a0000003-0000-0000-0000-000000000017', 'San Marzano tomatoes', 400, 'g', 'canned'),
('a0000003-0000-0000-0000-000000000017', 'fresh mozzarella', 300, 'g', 'fior di latte'),
('a0000003-0000-0000-0000-000000000017', 'fresh basil', 15, 'g', null),
('a0000003-0000-0000-0000-000000000017', 'olive oil', 2, 'tbsp', 'extra virgin'),
('a0000003-0000-0000-0000-000000000017', 'active dry yeast', 7, 'g', null),

-- Mushroom Risotto
('a0000003-0000-0000-0000-000000000018', 'Arborio rice', 350, 'g', null),
('a0000003-0000-0000-0000-000000000018', 'fresh mushrooms', 400, 'g', 'mixed'),
('a0000003-0000-0000-0000-000000000018', 'dried porcini', 20, 'g', null),
('a0000003-0000-0000-0000-000000000018', 'chicken stock', 1000, 'ml', null),
('a0000003-0000-0000-0000-000000000018', 'Parmigiano Reggiano', 80, 'g', null),
('a0000003-0000-0000-0000-000000000018', 'white wine', 100, 'ml', 'dry'),
('a0000003-0000-0000-0000-000000000018', 'butter', 60, 'g', null),
('a0000003-0000-0000-0000-000000000018', 'shallots', 3, 'whole', null),

-- Beef Lasagna
('a0000003-0000-0000-0000-000000000019', 'ground beef', 500, 'g', null),
('a0000003-0000-0000-0000-000000000019', 'lasagna sheets', 250, 'g', null),
('a0000003-0000-0000-0000-000000000019', 'whole milk', 750, 'ml', null),
('a0000003-0000-0000-0000-000000000019', 'Parmigiano Reggiano', 100, 'g', null),
('a0000003-0000-0000-0000-000000000019', 'crushed tomatoes', 800, 'g', 'canned'),
('a0000003-0000-0000-0000-000000000019', 'butter', 60, 'g', null),
('a0000003-0000-0000-0000-000000000019', 'all-purpose flour', 60, 'g', null),

-- Tiramisu
('a0000003-0000-0000-0000-000000000020', 'mascarpone', 500, 'g', null),
('a0000003-0000-0000-0000-000000000020', 'eggs', 6, 'whole', null),
('a0000003-0000-0000-0000-000000000020', 'caster sugar', 150, 'g', null),
('a0000003-0000-0000-0000-000000000020', 'Savoiardi biscuits', 200, 'g', 'ladyfingers'),
('a0000003-0000-0000-0000-000000000020', 'espresso', 300, 'ml', 'strong, cooled'),
('a0000003-0000-0000-0000-000000000020', 'cocoa powder', 20, 'g', 'for dusting'),

-- Street Tacos
('a0000004-0000-0000-0000-000000000021', 'beef skirt steak', 500, 'g', 'or chicken thighs'),
('a0000004-0000-0000-0000-000000000021', 'corn tortillas', 16, 'small', null),
('a0000004-0000-0000-0000-000000000021', 'white onion', 1, 'medium', 'finely diced'),
('a0000004-0000-0000-0000-000000000021', 'fresh coriander', 30, 'g', null),
('a0000004-0000-0000-0000-000000000021', 'lime', 3, 'whole', null),
('a0000004-0000-0000-0000-000000000021', 'cumin', 1, 'tsp', null),

-- Chicken Burrito
('a0000004-0000-0000-0000-000000000022', 'chicken breast', 500, 'g', null),
('a0000004-0000-0000-0000-000000000022', 'flour tortillas', 4, 'large', null),
('a0000004-0000-0000-0000-000000000022', 'basmati rice', 200, 'g', null),
('a0000004-0000-0000-0000-000000000022', 'black beans', 400, 'g', 'canned'),
('a0000004-0000-0000-0000-000000000022', 'sour cream', 100, 'g', null),
('a0000004-0000-0000-0000-000000000022', 'cheddar cheese', 80, 'g', null),
('a0000004-0000-0000-0000-000000000022', 'guacamole', 100, 'g', null),

-- Cheese Enchiladas
('a0000004-0000-0000-0000-000000000023', 'corn tortillas', 12, 'small', null),
('a0000004-0000-0000-0000-000000000023', 'Monterey Jack cheese', 300, 'g', null),
('a0000004-0000-0000-0000-000000000023', 'guajillo chillies', 4, 'dried', null),
('a0000004-0000-0000-0000-000000000023', 'ancho chillies', 2, 'dried', null),
('a0000004-0000-0000-0000-000000000023', 'chicken stock', 500, 'ml', null),
('a0000004-0000-0000-0000-000000000023', 'white onion', 1, 'medium', null),

-- Classic Guacamole
('a0000004-0000-0000-0000-000000000024', 'avocado', 3, 'ripe Hass', null),
('a0000004-0000-0000-0000-000000000024', 'lime', 1, 'large', null),
('a0000004-0000-0000-0000-000000000024', 'white onion', 0.5, 'medium', null),
('a0000004-0000-0000-0000-000000000024', 'jalapeño', 1, 'fresh', null),
('a0000004-0000-0000-0000-000000000024', 'fresh coriander', 15, 'g', null),
('a0000004-0000-0000-0000-000000000024', 'salt', 0.5, 'tsp', null),

-- Quesadillas
('a0000004-0000-0000-0000-000000000025', 'flour tortillas', 4, 'large', null),
('a0000004-0000-0000-0000-000000000025', 'Oaxacan cheese', 200, 'g', null),
('a0000004-0000-0000-0000-000000000025', 'chicken breast', 300, 'g', null),
('a0000004-0000-0000-0000-000000000025', 'bell pepper', 1, 'medium', null),
('a0000004-0000-0000-0000-000000000025', 'fajita seasoning', 2, 'tsp', null),
('a0000004-0000-0000-0000-000000000025', 'sour cream', 60, 'g', 'to serve'),

-- Pad Thai
('a0000005-0000-0000-0000-000000000026', 'rice noodles', 200, 'g', 'flat, medium width'),
('a0000005-0000-0000-0000-000000000026', 'prawns', 200, 'g', 'or tofu for vegan'),
('a0000005-0000-0000-0000-000000000026', 'eggs', 2, 'whole', null),
('a0000005-0000-0000-0000-000000000026', 'tamarind paste', 3, 'tbsp', null),
('a0000005-0000-0000-0000-000000000026', 'fish sauce', 2, 'tbsp', null),
('a0000005-0000-0000-0000-000000000026', 'roasted peanuts', 60, 'g', 'crushed'),
('a0000005-0000-0000-0000-000000000026', 'bean sprouts', 100, 'g', null),

-- Thai Green Curry
('a0000005-0000-0000-0000-000000000027', 'chicken breast', 400, 'g', null),
('a0000005-0000-0000-0000-000000000027', 'coconut milk', 400, 'ml', 'full-fat'),
('a0000005-0000-0000-0000-000000000027', 'green curry paste', 3, 'tbsp', null),
('a0000005-0000-0000-0000-000000000027', 'Thai eggplant', 150, 'g', null),
('a0000005-0000-0000-0000-000000000027', 'kaffir lime leaves', 4, 'leaves', null),
('a0000005-0000-0000-0000-000000000027', 'fish sauce', 2, 'tbsp', null),
('a0000005-0000-0000-0000-000000000027', 'palm sugar', 1, 'tbsp', null),

-- Tom Yum Soup
('a0000005-0000-0000-0000-000000000028', 'prawns', 300, 'g', 'shell-on for stock'),
('a0000005-0000-0000-0000-000000000028', 'lemongrass', 3, 'stalks', 'bruised'),
('a0000005-0000-0000-0000-000000000028', 'galangal', 4, 'slices', null),
('a0000005-0000-0000-0000-000000000028', 'kaffir lime leaves', 5, 'leaves', null),
('a0000005-0000-0000-0000-000000000028', 'mushrooms', 150, 'g', null),
('a0000005-0000-0000-0000-000000000028', 'fish sauce', 2, 'tbsp', null),
('a0000005-0000-0000-0000-000000000028', 'lime juice', 3, 'tbsp', null),

-- Fresh Spring Rolls
('a0000005-0000-0000-0000-000000000029', 'rice paper', 12, 'sheets', '22cm diameter'),
('a0000005-0000-0000-0000-000000000029', 'prawns', 200, 'g', 'cooked, halved lengthways'),
('a0000005-0000-0000-0000-000000000029', 'vermicelli noodles', 100, 'g', null),
('a0000005-0000-0000-0000-000000000029', 'carrot', 2, 'medium', 'julienned'),
('a0000005-0000-0000-0000-000000000029', 'cucumber', 1, 'medium', 'julienned'),
('a0000005-0000-0000-0000-000000000029', 'fresh mint', 20, 'g', null),
('a0000005-0000-0000-0000-000000000029', 'fresh coriander', 15, 'g', null),

-- Mango Sticky Rice
('a0000005-0000-0000-0000-000000000030', 'glutinous rice', 400, 'g', 'Thai jasmine variety'),
('a0000005-0000-0000-0000-000000000030', 'coconut milk', 400, 'ml', 'full-fat'),
('a0000005-0000-0000-0000-000000000030', 'ripe mango', 4, 'whole', 'Alphonso or Ataulfo'),
('a0000005-0000-0000-0000-000000000030', 'sugar', 80, 'g', null),
('a0000005-0000-0000-0000-000000000030', 'salt', 1, 'tsp', null),
('a0000005-0000-0000-0000-000000000030', 'sesame seeds', 2, 'tsp', 'toasted, for garnish')

ON CONFLICT DO NOTHING;


-- ============================================================
-- RECIPE NUTRITION  (per-serving values)
-- ============================================================

INSERT INTO recipe_nutrition
  (recipe_id, calories, protein_g, carbs_g, fat_g, fiber_g, sodium_mg)
VALUES
-- Indian
('a0000001-0000-0000-0000-000000000001', 520, 42, 58, 12, 2, 980),   -- Chicken Biryani
('a0000001-0000-0000-0000-000000000002', 450, 38, 22, 24, 2, 820),   -- Butter Chicken
('a0000001-0000-0000-0000-000000000003', 320, 18, 14, 22, 4, 560),   -- Palak Paneer
('a0000001-0000-0000-0000-000000000004', 380, 15, 52, 11, 12, 640),  -- Dal Makhani
('a0000001-0000-0000-0000-000000000005', 290, 35,  4, 14,  1, 720),  -- Tandoori Chicken
('a0000001-0000-0000-0000-000000000006', 250,  6, 30, 12,  3, 480),  -- Samosa
('a0000001-0000-0000-0000-000000000007', 260,  8, 44,  5,  2, 320),  -- Butter Naan
('a0000001-0000-0000-0000-000000000008', 180,  4, 28,  6,  5, 380),  -- Aloo Gobi
('a0000001-0000-0000-0000-000000000009', 240, 12, 38,  4, 10, 420),  -- Chana Masala
('a0000001-0000-0000-0000-000000000010', 310, 20,  8, 22,  2, 540),  -- Paneer Tikka
-- Chinese
('a0000002-0000-0000-0000-000000000011', 420, 12, 68, 10,  3, 920),  -- Fried Rice
('a0000002-0000-0000-0000-000000000012', 480, 28, 44, 18,  2, 840),  -- Sweet & Sour Chicken
('a0000002-0000-0000-0000-000000000013', 350, 30, 16, 18,  2, 980),  -- Kung Pao Chicken
('a0000002-0000-0000-0000-000000000014', 280, 14, 34, 10,  2, 720),  -- Dumplings
('a0000002-0000-0000-0000-000000000015', 120,  8, 14,  4,  2, 1200), -- Hot & Sour Soup
-- Italian
('a0000003-0000-0000-0000-000000000016', 580, 24, 58, 28,  3, 880),  -- Pasta Carbonara
('a0000003-0000-0000-0000-000000000017', 620, 22, 80, 22,  4, 780),  -- Margherita Pizza
('a0000003-0000-0000-0000-000000000018', 450, 14, 62, 16,  3, 680),  -- Mushroom Risotto
('a0000003-0000-0000-0000-000000000019', 640, 30, 52, 30,  4, 920),  -- Beef Lasagna
('a0000003-0000-0000-0000-000000000020', 380,  8, 42, 20,  1, 120),  -- Tiramisu
-- Mexican
('a0000004-0000-0000-0000-000000000021', 340, 18, 30, 14,  4, 620),  -- Street Tacos
('a0000004-0000-0000-0000-000000000022', 520, 26, 60, 18,  8, 780),  -- Chicken Burrito
('a0000004-0000-0000-0000-000000000023', 480, 22, 42, 24,  5, 840),  -- Cheese Enchiladas
('a0000004-0000-0000-0000-000000000024', 160,  2, 10, 14,  7, 180),  -- Classic Guacamole
('a0000004-0000-0000-0000-000000000025', 420, 18, 32, 24,  3, 720),  -- Quesadillas
-- Thai
('a0000005-0000-0000-0000-000000000026', 450, 20, 60, 14,  3, 1200), -- Pad Thai
('a0000005-0000-0000-0000-000000000027', 380, 24, 18, 24,  3, 980),  -- Thai Green Curry
('a0000005-0000-0000-0000-000000000028', 150, 12, 12,  4,  2, 1400), -- Tom Yum Soup
('a0000005-0000-0000-0000-000000000029', 220,  8, 38,  4,  3, 680),  -- Fresh Spring Rolls
('a0000005-0000-0000-0000-000000000030', 360,  5, 70,  8,  2, 240)   -- Mango Sticky Rice

ON CONFLICT (recipe_id) DO NOTHING;
