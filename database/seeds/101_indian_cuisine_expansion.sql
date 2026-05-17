-- 101_indian_cuisine_expansion.sql
-- Add ~92 Indian dishes across South Indian breakfast, rice mains, regional
-- specialties (Andhra/Telangana/Kerala/Karnataka/TN), street foods, North & South
-- Indian veg curries, simple home-style curries, and popular desserts.
--
-- Skipped (already exist in the recipes table): Masala Dosa, Chicken Biryani,
-- Dal Makhani, Palak Paneer, Paneer Tikka, Aloo Gobi, Samosa, Chana Masala.
--
-- All IDs start with c0000000- so they're easy to identify in audits.
-- Idempotent — uses ON CONFLICT (id) DO NOTHING.

BEGIN;

INSERT INTO recipes (id, name, cuisine_type, difficulty, prep_time_minutes, cook_time_minutes, servings, instructions) VALUES

-- ─── South Indian Breakfast ──────────────────────────────────────────────
('c0000001-0000-0000-0000-000000000001','Idli','Indian','Easy',480,20,4,
 '[{"step_number":1,"instruction":"Soak idli rice and urad dal separately for 6 hours. Grind to a smooth batter, mix, salt lightly, and ferment overnight (8–10 hr).","time_minutes":480},
   {"step_number":2,"instruction":"Grease idli molds with oil. Pour batter to fill each cup ~75%.","time_minutes":3},
   {"step_number":3,"instruction":"Steam in idli cooker on medium-high for 10–12 minutes until a skewer comes out clean.","time_minutes":12},
   {"step_number":4,"instruction":"Cool 2 minutes, then unmold. Serve hot with coconut chutney and sambar.","time_minutes":2}]'::jsonb),

('c0000001-0000-0000-0000-000000000002','Dosa','Indian','Medium',480,8,4,
 '[{"step_number":1,"instruction":"Soak rice and urad dal separately for 6 hr. Grind together to a flowy batter, salt, and ferment 8–10 hr.","time_minutes":480},
   {"step_number":2,"instruction":"Heat a flat cast-iron tawa. Sprinkle water — when it sizzles, wipe and pour a ladle of batter; spread in a circle from the center outward.","time_minutes":2},
   {"step_number":3,"instruction":"Drizzle oil around the edges. Cook on medium-high until the bottom is golden and edges lift. Flip 30 seconds (optional) or fold.","time_minutes":3},
   {"step_number":4,"instruction":"Serve hot with coconut chutney, tomato chutney, and sambar.","time_minutes":1}]'::jsonb),

('c0000001-0000-0000-0000-000000000003','Pesarattu','Indian','Easy',360,8,4,
 '[{"step_number":1,"instruction":"Soak whole green moong dal with a teaspoon of rice for 6 hours. Grind with ginger, green chilli, and cumin to a thick batter.","time_minutes":360},
   {"step_number":2,"instruction":"Heat tawa. Pour batter and spread thinner than a dosa. Top with finely chopped onion and grated ginger.","time_minutes":2},
   {"step_number":3,"instruction":"Drizzle oil, cook till crisp on bottom. Flip 30 seconds.","time_minutes":3},
   {"step_number":4,"instruction":"Serve with ginger chutney or allam pachadi.","time_minutes":1}]'::jsonb),

('c0000001-0000-0000-0000-000000000004','Uttapam','Indian','Easy',480,10,4,
 '[{"step_number":1,"instruction":"Use leftover or fresh dosa batter, slightly thicker. Optionally stir in chopped onion, tomato, green chilli, coriander.","time_minutes":5},
   {"step_number":2,"instruction":"Heat tawa, pour a ladle of batter, leave thick (not spread thin).","time_minutes":2},
   {"step_number":3,"instruction":"Scatter toppings on top, press lightly. Drizzle oil. Cover and cook 2 min, flip and cook 1–2 min.","time_minutes":5},
   {"step_number":4,"instruction":"Serve hot with coconut chutney.","time_minutes":1}]'::jsonb),

('c0000001-0000-0000-0000-000000000005','Upma','Indian','Easy',5,15,4,
 '[{"step_number":1,"instruction":"Dry-roast 1 cup rava (semolina) on low heat for 4–5 min until aromatic. Set aside.","time_minutes":5},
   {"step_number":2,"instruction":"In ghee, splutter mustard seeds, cumin, urad dal, curry leaves, chopped green chilli, ginger, onion. Sauté 3 min.","time_minutes":4},
   {"step_number":3,"instruction":"Add 2.5 cups boiling water and salt. Stir in the rava in a slow stream, whisking to avoid lumps.","time_minutes":3},
   {"step_number":4,"instruction":"Cover and simmer 3 min till fluffy. Finish with coriander and lemon. Serve hot.","time_minutes":3}]'::jsonb),

('c0000001-0000-0000-0000-000000000006','Pongal','Indian','Easy',5,25,4,
 '[{"step_number":1,"instruction":"Wash 1 cup rice and 1/2 cup moong dal together. Dry-roast moong dal first for nutty aroma.","time_minutes":4},
   {"step_number":2,"instruction":"Pressure cook rice + dal with 4 cups water, salt and a pinch of turmeric for 4 whistles.","time_minutes":15},
   {"step_number":3,"instruction":"In ghee, fry crushed black pepper, cumin, ginger, curry leaves, cashews. Pour over the cooked pongal and mix.","time_minutes":5},
   {"step_number":4,"instruction":"Serve hot with coconut chutney and sambar.","time_minutes":1}]'::jsonb),

('c0000001-0000-0000-0000-000000000007','Poori Masala','Indian','Medium',20,25,4,
 '[{"step_number":1,"instruction":"Boil potatoes, peel and break into rough chunks. Knead a stiff dough with wheat flour, salt, and water; rest 15 min.","time_minutes":20},
   {"step_number":2,"instruction":"For the masala: temper mustard, urad dal, curry leaves; sauté chopped onion, ginger, green chilli, turmeric. Add potato, water, salt; simmer 10 min until saucy.","time_minutes":12},
   {"step_number":3,"instruction":"Roll dough into small discs. Deep-fry in hot oil one at a time, pressing gently with the slotted spoon to puff. Cook till light golden, flip and drain.","time_minutes":12},
   {"step_number":4,"instruction":"Serve hot pooris with the potato masala.","time_minutes":1}]'::jsonb),

('c0000001-0000-0000-0000-000000000008','Medu Vada','Indian','Medium',240,15,4,
 '[{"step_number":1,"instruction":"Soak 1 cup whole urad dal for 4 hours. Grind to a fluffy thick batter with minimal water; aerate by hand for 2 min.","time_minutes":240},
   {"step_number":2,"instruction":"Mix in salt, chopped green chilli, ginger, curry leaves, peppercorns, coriander.","time_minutes":3},
   {"step_number":3,"instruction":"Heat oil to 170°C. Wet palm, shape batter into a disc with a hole in the middle, slide into oil. Fry till deep golden, turning once.","time_minutes":10},
   {"step_number":4,"instruction":"Drain on paper. Serve hot with sambar and coconut chutney.","time_minutes":1}]'::jsonb),

('c0000001-0000-0000-0000-000000000009','Appam','Indian','Medium',480,5,4,
 '[{"step_number":1,"instruction":"Soak 1 cup rice for 4 hr. Grind with 1/4 cup cooked rice, coconut, and a pinch of sugar + yeast. Ferment 6–8 hr.","time_minutes":480},
   {"step_number":2,"instruction":"Heat an appam pan (curved). Pour a ladle of batter, swirl to coat sides so center is thick and edges are thin and lacy.","time_minutes":1},
   {"step_number":3,"instruction":"Cover and cook 2 min on medium-low till the center looks fluffy and edges are crisp.","time_minutes":3},
   {"step_number":4,"instruction":"Lift carefully and serve hot with vegetable stew or chicken stew.","time_minutes":1}]'::jsonb),

('c0000001-0000-0000-0000-00000000000a','Puttu','Indian','Easy',10,15,3,
 '[{"step_number":1,"instruction":"Mix puttu rice flour with salt and just enough water so it clumps when squeezed but breaks easily.","time_minutes":5},
   {"step_number":2,"instruction":"Layer the puttu maker: grated coconut, then flour mixture, alternating; finish with coconut.","time_minutes":3},
   {"step_number":3,"instruction":"Steam over a boiling pressure cooker (without weight) for 7–8 minutes.","time_minutes":8},
   {"step_number":4,"instruction":"Push out gently. Serve with kadala curry or ripe banana and ghee + sugar.","time_minutes":1}]'::jsonb),

('c0000001-0000-0000-0000-00000000000b','Rava Dosa','Indian','Medium',15,8,4,
 '[{"step_number":1,"instruction":"Whisk rava, rice flour, maida (small amount), buttermilk, water, chopped onion, green chilli, ginger, cumin, curry leaves, salt into a thin watery batter. Rest 15 min.","time_minutes":15},
   {"step_number":2,"instruction":"Heat tawa on high, brush with oil. Stir batter (it settles) and pour from outside-in (not center-out) to get the lacy holes.","time_minutes":2},
   {"step_number":3,"instruction":"Drizzle ghee/oil around. Cook till deeply golden and crisp. Lift off.","time_minutes":4},
   {"step_number":4,"instruction":"Serve immediately with chutney.","time_minutes":1}]'::jsonb),

('c0000001-0000-0000-0000-00000000000c','Akki Roti','Indian','Easy',10,15,3,
 '[{"step_number":1,"instruction":"Combine rice flour, finely chopped onion, green chilli, ginger, coriander, curry leaves, grated carrot, salt and water; mix to a soft dough.","time_minutes":8},
   {"step_number":2,"instruction":"Take a portion, pat directly onto a greased tawa (or banana leaf) into a thin disc. Poke a few holes.","time_minutes":3},
   {"step_number":3,"instruction":"Drizzle oil into the holes and around. Cover and cook on medium until golden and crisp on bottom, flip 30 sec.","time_minutes":6},
   {"step_number":4,"instruction":"Serve hot with coconut chutney or butter.","time_minutes":1}]'::jsonb),

('c0000001-0000-0000-0000-00000000000d','Parotta','Indian','Hard',60,20,4,
 '[{"step_number":1,"instruction":"Knead maida with milk, egg (optional), oil, salt and water into a smooth elastic dough. Rest covered for 30 min.","time_minutes":40},
   {"step_number":2,"instruction":"Divide into balls. Roll one paper-thin, smear oil, pleat into a ribbon, then coil into a spiral. Flatten and rest 15 min.","time_minutes":15},
   {"step_number":3,"instruction":"Roll the spirals into 5-inch discs. Cook on hot tawa with oil until brown spots appear, flip and cook other side.","time_minutes":12},
   {"step_number":4,"instruction":"While hot, crush gently from sides to expose the layers. Serve with salna or chicken kurma.","time_minutes":2}]'::jsonb),

('c0000001-0000-0000-0000-00000000000e','Idiappam','Indian','Medium',5,15,3,
 '[{"step_number":1,"instruction":"Mix rice flour with salt. Pour in boiling water gradually to make a soft, pliable dough.","time_minutes":5},
   {"step_number":2,"instruction":"Press through an idiappam (sevai) maker onto greased idli plates lined with sprinkled coconut.","time_minutes":7},
   {"step_number":3,"instruction":"Steam for 6–7 min until set.","time_minutes":7},
   {"step_number":4,"instruction":"Serve with coconut milk + jaggery, or with stew/kurma.","time_minutes":1}]'::jsonb),

-- ─── Rice & Main Dishes ──────────────────────────────────────────────────
('c0000002-0000-0000-0000-000000000001','Sambar Rice','Indian','Easy',15,30,4,
 '[{"step_number":1,"instruction":"Pressure cook 1 cup toor dal till mushy. In a pan sauté shallots, garlic, mixed vegetables (drumstick, carrot, beans).","time_minutes":15},
   {"step_number":2,"instruction":"Add tamarind extract, tomato, turmeric, sambar powder, salt; simmer 8 min till veg are tender.","time_minutes":8},
   {"step_number":3,"instruction":"Combine cooked dal, sambar mixture, and 3 cups cooked rice. Mash gently.","time_minutes":5},
   {"step_number":4,"instruction":"Temper mustard, urad dal, dried red chilli, curry leaves, hing in ghee — pour over. Serve hot with appalam.","time_minutes":2}]'::jsonb),

('c0000002-0000-0000-0000-000000000002','Curd Rice','Indian','Easy',5,10,4,
 '[{"step_number":1,"instruction":"Cook 1 cup rice soft, slightly overcooked. Cool a few minutes.","time_minutes":15},
   {"step_number":2,"instruction":"Mash gently with 1 cup whisked thick yogurt and 1/2 cup milk. Salt to taste.","time_minutes":3},
   {"step_number":3,"instruction":"In oil, temper mustard, urad dal, chana dal, curry leaves, ginger, green chilli, red chilli, hing, cashews.","time_minutes":3},
   {"step_number":4,"instruction":"Pour over the curd rice. Garnish with pomegranate seeds, coriander, grated carrot. Serve cool.","time_minutes":1}]'::jsonb),

('c0000002-0000-0000-0000-000000000003','Lemon Rice','Indian','Easy',5,10,3,
 '[{"step_number":1,"instruction":"Cook 1 cup rice. Spread on a plate, cool and fluff with a fork.","time_minutes":12},
   {"step_number":2,"instruction":"In oil, splutter mustard, urad dal, chana dal, peanuts, curry leaves, green chilli, ginger. Turn off when peanuts are golden.","time_minutes":4},
   {"step_number":3,"instruction":"Add turmeric and a few drops of water (so it does not burn). Pour over rice with salt and juice of 1 lemon.","time_minutes":2},
   {"step_number":4,"instruction":"Toss gently to coat. Serve.","time_minutes":1}]'::jsonb),

('c0000002-0000-0000-0000-000000000004','Tamarind Rice','Indian','Medium',10,15,4,
 '[{"step_number":1,"instruction":"Soak a lime-sized ball of tamarind in warm water and extract a thick pulp.","time_minutes":10},
   {"step_number":2,"instruction":"Dry-roast and grind: coriander seeds, fenugreek, sesame seeds, red chilli, chana dal to a coarse spice powder.","time_minutes":5},
   {"step_number":3,"instruction":"Heat sesame oil; temper mustard, dals, peanuts, curry leaves, hing. Add tamarind, jaggery, turmeric, salt; cook until oil separates.","time_minutes":8},
   {"step_number":4,"instruction":"Stir in the spice powder; mix with 3 cups cooked rice. Rest 10 min before serving.","time_minutes":2}]'::jsonb),

('c0000002-0000-0000-0000-000000000005','Coconut Rice','Indian','Easy',5,10,3,
 '[{"step_number":1,"instruction":"Cook 1 cup rice, cool. Grate or scrape 1 cup fresh coconut.","time_minutes":8},
   {"step_number":2,"instruction":"In ghee/oil, fry cashews till golden; remove. Splutter mustard, urad dal, chana dal, curry leaves, green chilli, red chilli, ginger.","time_minutes":4},
   {"step_number":3,"instruction":"Add coconut and toss 1 min on low (do not brown). Salt to taste.","time_minutes":2},
   {"step_number":4,"instruction":"Mix into cooled rice with the cashews. Serve.","time_minutes":1}]'::jsonb),

('c0000002-0000-0000-0000-000000000006','Bisibele Bath','Indian','Medium',15,40,4,
 '[{"step_number":1,"instruction":"Pressure cook 1 cup rice and 3/4 cup toor dal with mixed vegetables (carrot, beans, peas, capsicum) and salt.","time_minutes":20},
   {"step_number":2,"instruction":"Extract tamarind pulp and dry-roast/grind a fresh masala (coriander, chana dal, fenugreek, cinnamon, clove, copra, red chilli).","time_minutes":10},
   {"step_number":3,"instruction":"Combine cooked rice mix, tamarind, jaggery, the ground masala, hot water; simmer 8–10 min till one-pot consistency.","time_minutes":10},
   {"step_number":4,"instruction":"Top with a ghee tempering of mustard, curry leaves, cashews, hing. Serve hot with raita and chips.","time_minutes":5}]'::jsonb),

('c0000002-0000-0000-0000-000000000007','Hyderabadi Biryani','Indian','Hard',90,60,6,
 '[{"step_number":1,"instruction":"Marinate mutton/chicken in yogurt, ginger-garlic paste, red chilli, turmeric, garam masala, salt, fried onions, mint, coriander for 1 hour.","time_minutes":60},
   {"step_number":2,"instruction":"Parboil basmati with whole spices and salt to 70% done. Drain.","time_minutes":15},
   {"step_number":3,"instruction":"Layer raw marinated meat at the bottom of a heavy pot, then rice; top with saffron milk, fried onions, mint, ghee, kewra.","time_minutes":5},
   {"step_number":4,"instruction":"Seal lid with dough or foil. Cook on high 5 min then very low (dum) for 45 minutes. Rest 10 minutes before opening.","time_minutes":60}]'::jsonb),

('c0000002-0000-0000-0000-000000000008','Vegetable Pulao','Indian','Easy',10,25,4,
 '[{"step_number":1,"instruction":"Wash and soak 1.5 cups basmati for 20 min; drain.","time_minutes":20},
   {"step_number":2,"instruction":"In ghee, sauté whole spices (cinnamon, clove, cardamom, bay), onion till translucent, ginger-garlic, then mixed veg (carrot, beans, peas, capsicum, cauliflower).","time_minutes":7},
   {"step_number":3,"instruction":"Add salt, a pinch of garam masala, mint and coriander. Tip in rice and 3 cups hot water/stock.","time_minutes":3},
   {"step_number":4,"instruction":"Cover and cook on lowest flame 15 min. Rest 5 min, then fluff. Serve with raita.","time_minutes":15}]'::jsonb),

('c0000002-0000-0000-0000-000000000009','Tomato Rice','Indian','Easy',10,20,3,
 '[{"step_number":1,"instruction":"Cook 1 cup rice and cool. Blend 3 ripe tomatoes with 2 green chillies and ginger.","time_minutes":12},
   {"step_number":2,"instruction":"In oil, splutter mustard, urad dal, chana dal, curry leaves; sauté sliced onion till soft.","time_minutes":4},
   {"step_number":3,"instruction":"Pour tomato puree, add turmeric, sambar powder, salt; cook till oil separates (8–10 min).","time_minutes":10},
   {"step_number":4,"instruction":"Fold in rice and chopped coriander. Serve.","time_minutes":2}]'::jsonb),

('c0000002-0000-0000-0000-00000000000a','Jeera Rice','Indian','Easy',5,15,3,
 '[{"step_number":1,"instruction":"Wash and soak 1 cup basmati for 15 min; drain.","time_minutes":15},
   {"step_number":2,"instruction":"In ghee, sizzle 1.5 tsp cumin seeds along with a bay leaf till fragrant.","time_minutes":2},
   {"step_number":3,"instruction":"Add rice, 2 cups water, salt; bring to a boil, then cover and cook on lowest flame 12 min.","time_minutes":12},
   {"step_number":4,"instruction":"Rest 5 min off heat; fluff with a fork. Serve with dal or curry.","time_minutes":5}]'::jsonb),

('c0000002-0000-0000-0000-00000000000b','Rasam','Indian','Easy',5,15,4,
 '[{"step_number":1,"instruction":"Extract tamarind pulp from a small lime-sized ball; simmer with turmeric, salt, jaggery, rasam powder, crushed garlic-pepper.","time_minutes":8},
   {"step_number":2,"instruction":"Add chopped tomato, crushed coriander stems; simmer 5 min, then add 1/4 cup cooked toor dal water.","time_minutes":5},
   {"step_number":3,"instruction":"Turn off when it just froths (do not boil rapidly). Garnish with coriander.","time_minutes":1},
   {"step_number":4,"instruction":"Temper mustard, cumin, dried chilli, curry leaves, hing in ghee — pour over. Serve over rice or as a drink.","time_minutes":2}]'::jsonb),

('c0000002-0000-0000-0000-00000000000c','Avial','Indian','Medium',15,25,4,
 '[{"step_number":1,"instruction":"Cut mixed vegetables (carrot, drumstick, beans, raw plantain, yam, snake gourd, ash gourd) into matchsticks.","time_minutes":12},
   {"step_number":2,"instruction":"Cook vegetables with turmeric, salt and just enough water till tender but firm.","time_minutes":12},
   {"step_number":3,"instruction":"Grind fresh coconut with green chillies, cumin and a splash of water to a coarse paste. Stir in.","time_minutes":5},
   {"step_number":4,"instruction":"Whisk in thick yogurt off the heat. Finish with coconut oil and curry leaves. Serve with rice.","time_minutes":2}]'::jsonb),

('c0000002-0000-0000-0000-00000000000d','Kootu','Indian','Easy',10,20,4,
 '[{"step_number":1,"instruction":"Pressure cook 1/2 cup moong dal and chopped vegetable (e.g., snake gourd or bottle gourd) with turmeric and salt.","time_minutes":12},
   {"step_number":2,"instruction":"Grind fresh coconut with green chillies, cumin, peppercorns and rice (1 tsp) to a paste.","time_minutes":5},
   {"step_number":3,"instruction":"Combine the cooked dal+veg with the coconut paste; simmer 5 min till thick.","time_minutes":5},
   {"step_number":4,"instruction":"Temper mustard, urad dal, red chilli, curry leaves, hing in coconut oil. Pour over and serve.","time_minutes":2}]'::jsonb),

('c0000002-0000-0000-0000-00000000000e','Poriyal','Indian','Easy',10,15,4,
 '[{"step_number":1,"instruction":"Chop the vegetable fine (beans / cabbage / carrot / beetroot etc.).","time_minutes":8},
   {"step_number":2,"instruction":"In oil, splutter mustard, urad dal, chana dal, dried red chilli, curry leaves, hing.","time_minutes":3},
   {"step_number":3,"instruction":"Add chopped veg, turmeric, salt; sprinkle a little water, cover and cook 8 min till tender.","time_minutes":8},
   {"step_number":4,"instruction":"Garnish with grated fresh coconut and serve.","time_minutes":1}]'::jsonb),

-- ─── Andhra & Telangana Specialties ──────────────────────────────────────
('c0000003-0000-0000-0000-000000000001','Gongura Mutton','Indian','Hard',30,60,4,
 '[{"step_number":1,"instruction":"Marinate mutton in turmeric, salt, ginger-garlic paste for 30 min. Wash and chop gongura (sorrel) leaves, sauté and blend coarse.","time_minutes":30},
   {"step_number":2,"instruction":"In a pressure cooker, sauté onions till golden, add the marinated mutton and brown.","time_minutes":12},
   {"step_number":3,"instruction":"Add tomato, coriander, cumin, red chilli, garam masala, salt and water. Pressure cook 5–6 whistles.","time_minutes":30},
   {"step_number":4,"instruction":"Open, add the gongura paste, simmer uncovered 12 min till oil separates. Finish with coriander.","time_minutes":15}]'::jsonb),

('c0000003-0000-0000-0000-000000000002','Andhra Chicken Curry','Indian','Medium',20,40,4,
 '[{"step_number":1,"instruction":"Marinate chicken in turmeric, salt, ginger-garlic paste, red chilli powder for 20 min.","time_minutes":20},
   {"step_number":2,"instruction":"In a heavy pan, fry sliced onions till deep brown, blend to a paste with cashew and a splash of water.","time_minutes":12},
   {"step_number":3,"instruction":"Sauté the onion paste, add tomato, coriander, cumin, more red chilli (this is spicy!), garam masala; cook till oil floats.","time_minutes":10},
   {"step_number":4,"instruction":"Add chicken, sauté 5 min, then add hot water; simmer covered 25 min till tender. Garnish with coriander.","time_minutes":25}]'::jsonb),

('c0000003-0000-0000-0000-000000000003','Kodi Vepudu','Indian','Medium',15,30,4,
 '[{"step_number":1,"instruction":"Marinate bite-size chicken pieces in turmeric, salt, ginger-garlic paste, red chilli, garam masala for 15 min.","time_minutes":15},
   {"step_number":2,"instruction":"In oil, sauté curry leaves, sliced onions till golden. Add marinated chicken; sear on high.","time_minutes":10},
   {"step_number":3,"instruction":"Reduce heat, cover and cook 12–15 min in own juices till mostly dry.","time_minutes":15},
   {"step_number":4,"instruction":"Uncover, raise heat and fry till deeply browned and dry. Sprinkle pepper, fresh coriander. Serve.","time_minutes":5}]'::jsonb),

('c0000003-0000-0000-0000-000000000004','Royyala Iguru','Indian','Medium',15,25,4,
 '[{"step_number":1,"instruction":"Clean and devein prawns; rub with turmeric, salt, ginger-garlic, lemon — rest 10 min.","time_minutes":12},
   {"step_number":2,"instruction":"In oil, fry chopped onions till golden, add tomato, green chilli, curry leaves; cook till mushy.","time_minutes":8},
   {"step_number":3,"instruction":"Add red chilli, coriander, garam masala; sauté 1 min. Tip in prawns and stir-fry 3 min on high.","time_minutes":5},
   {"step_number":4,"instruction":"Reduce, cover and simmer 8 min till thick. Finish with crushed pepper and coriander.","time_minutes":10}]'::jsonb),

('c0000003-0000-0000-0000-000000000005','Natu Kodi Pulusu','Indian','Hard',20,75,4,
 '[{"step_number":1,"instruction":"Cut country-style (natu) chicken into pieces. Marinate with turmeric, salt, ginger-garlic, red chilli, vinegar.","time_minutes":20},
   {"step_number":2,"instruction":"In a clay/heavy pot, sauté onions till brown, add tomato, tamarind pulp, green chilli, curry leaves.","time_minutes":12},
   {"step_number":3,"instruction":"Add chicken and dry masalas (coriander, cumin, red chilli, garam masala); sauté 8 min.","time_minutes":8},
   {"step_number":4,"instruction":"Add hot water and slow-simmer covered 50 min till chicken is tender and gravy is tangy and thick.","time_minutes":55}]'::jsonb),

('c0000003-0000-0000-0000-000000000006','Mirchi Bajji','Indian','Easy',10,15,4,
 '[{"step_number":1,"instruction":"Slit large green chillies (less-spicy variety), deseed if you like, stuff with a pinch of salt + lemon + chaat masala.","time_minutes":8},
   {"step_number":2,"instruction":"Whisk besan with rice flour, ajwain, baking soda, salt, turmeric, and water into a thick coating batter.","time_minutes":5},
   {"step_number":3,"instruction":"Heat oil. Dip each chilli in batter and deep-fry until golden and crisp; drain.","time_minutes":10},
   {"step_number":4,"instruction":"Serve hot with onion + lemon, or slit and stuff with chopped onion-coriander.","time_minutes":2}]'::jsonb),

('c0000003-0000-0000-0000-000000000007','Bagara Baingan','Indian','Medium',20,40,4,
 '[{"step_number":1,"instruction":"Slit small brinjals lengthwise without separating. Dry-roast peanuts, sesame seeds, coconut, coriander, cumin; grind with onion-garlic to a paste.","time_minutes":20},
   {"step_number":2,"instruction":"In oil, lightly fry the brinjals until softened; remove.","time_minutes":10},
   {"step_number":3,"instruction":"In the same oil, sauté the ground masala till oil separates. Add tamarind pulp, red chilli, turmeric, salt, water.","time_minutes":15},
   {"step_number":4,"instruction":"Return brinjals; simmer covered 15 min till gravy thickens. Garnish with coriander.","time_minutes":15}]'::jsonb),

('c0000003-0000-0000-0000-000000000008','Haleem','Indian','Hard',180,180,6,
 '[{"step_number":1,"instruction":"Soak broken wheat, barley, chana dal, masoor dal, moong dal overnight. Marinate mutton with ginger-garlic, yogurt, spices for 30 min.","time_minutes":120},
   {"step_number":2,"instruction":"Pressure cook the meat with the soaked grains, fried onions, whole spices and salt till everything is mush (3–4 hours of slow cooking traditionally).","time_minutes":180},
   {"step_number":3,"instruction":"Mash thoroughly with a wooden whisk till smooth and homogeneous; adjust seasoning.","time_minutes":15},
   {"step_number":4,"instruction":"Top with ghee tempering of caramelized onions, cashew, mint, coriander, fried curry leaves, lemon. Serve hot.","time_minutes":10}]'::jsonb),

-- ─── Kerala ──────────────────────────────────────────────────────────────
('c0000004-0000-0000-0000-000000000001','Kerala Fish Curry','Indian','Medium',15,25,4,
 '[{"step_number":1,"instruction":"Soak kudampuli (Malabar tamarind) in warm water for 10 min. Make a paste of red chilli, coriander, turmeric, water.","time_minutes":10},
   {"step_number":2,"instruction":"In coconut oil, sauté curry leaves, sliced shallot, ginger, garlic. Add the chilli paste; cook till raw smell goes.","time_minutes":7},
   {"step_number":3,"instruction":"Add water, salt, kudampuli, fish pieces (kingfish/seer). Simmer (do not stir vigorously) 12 min.","time_minutes":15},
   {"step_number":4,"instruction":"Drizzle a teaspoon of fresh coconut oil and a few curry leaves on top. Rest covered 30 min before serving with rice.","time_minutes":3}]'::jsonb),

('c0000004-0000-0000-0000-000000000002','Malabar Parotta','Indian','Hard',60,15,4,
 '[{"step_number":1,"instruction":"Knead maida with milk, oil, sugar, salt and water into a soft pliable dough; rest 30 min, then knead again with more oil.","time_minutes":45},
   {"step_number":2,"instruction":"Roll each ball as thin as possible, smear with oil and a dusting of flour. Pleat into a long ribbon, then coil into a spiral.","time_minutes":15},
   {"step_number":3,"instruction":"Rest the spirals 15 min. Flatten and roll into 5-inch discs.","time_minutes":10},
   {"step_number":4,"instruction":"Cook on hot tawa with oil till golden on both sides. While hot, crush gently between palms to open the layers.","time_minutes":12}]'::jsonb),

('c0000004-0000-0000-0000-000000000003','Chicken Stew','Indian','Easy',10,30,4,
 '[{"step_number":1,"instruction":"In coconut oil, fry whole spices (cinnamon, cloves, cardamom, fennel), sliced shallot, ginger, green chilli, curry leaves till soft.","time_minutes":7},
   {"step_number":2,"instruction":"Add chicken pieces, potato, carrot; salt and pepper. Sauté 4 min.","time_minutes":5},
   {"step_number":3,"instruction":"Pour in thin coconut milk and a little water; simmer covered 18 min till chicken is tender.","time_minutes":20},
   {"step_number":4,"instruction":"Stir in thick coconut milk; warm through (do not boil). Garnish with curry leaves. Serve with appam.","time_minutes":3}]'::jsonb),

('c0000004-0000-0000-0000-000000000004','Kadala Curry','Indian','Medium',360,40,4,
 '[{"step_number":1,"instruction":"Soak black chickpeas (kadala) overnight. Pressure cook till tender with salt and turmeric.","time_minutes":360},
   {"step_number":2,"instruction":"Roast and grind: coconut, coriander, fennel, cinnamon, cloves, red chilli, shallot, garlic to a dark paste.","time_minutes":12},
   {"step_number":3,"instruction":"In coconut oil, splutter mustard, curry leaves, sliced onion, ginger. Add the roasted masala; cook till fragrant.","time_minutes":8},
   {"step_number":4,"instruction":"Add cooked kadala with its water; simmer 12 min till thick. Serve with puttu or appam.","time_minutes":15}]'::jsonb),

-- ─── Karnataka & Tamil Nadu ──────────────────────────────────────────────
('c0000005-0000-0000-0000-000000000001','Mysore Pak','Indian','Hard',5,20,8,
 '[{"step_number":1,"instruction":"Sieve 1 cup besan. Have 2 cups ghee melted and hot (oil 2 cups also melted as backup).","time_minutes":5},
   {"step_number":2,"instruction":"In a heavy pan, cook 2 cups sugar with 1 cup water to one-string consistency.","time_minutes":10},
   {"step_number":3,"instruction":"Stir in besan in a steady stream, whisking briskly. Pour in ghee a ladle at a time, stirring constantly till frothy and pulling away.","time_minutes":12},
   {"step_number":4,"instruction":"Pour into a greased tray. Score into squares while warm. Cool fully and break.","time_minutes":5}]'::jsonb),

('c0000005-0000-0000-0000-000000000002','Mysore Masala Dosa','Indian','Medium',480,12,2,
 '[{"step_number":1,"instruction":"Have ready: fermented dosa batter, potato masala (sauté onion, curry leaves, mustard, turmeric, salt; mix with mashed potato), and red chutney (roasted chana dal, garlic, red chilli, salt, water).","time_minutes":480},
   {"step_number":2,"instruction":"Make a regular dosa on the tawa. Once the bottom begins to brown, smear a tablespoon of red chutney over the surface.","time_minutes":3},
   {"step_number":3,"instruction":"Spoon a few tablespoons of potato masala along the center; drizzle ghee.","time_minutes":2},
   {"step_number":4,"instruction":"Fold in half or roll. Serve immediately with coconut chutney and sambar.","time_minutes":2}]'::jsonb),

('c0000005-0000-0000-0000-000000000003','Chettinad Chicken','Indian','Medium',20,40,4,
 '[{"step_number":1,"instruction":"Dry-roast coriander, fennel, cumin, peppercorns, dried red chilli, cinnamon, cloves, star anise, poppy seeds, copra; grind with a splash of water.","time_minutes":12},
   {"step_number":2,"instruction":"Marinate chicken in turmeric, salt, ginger-garlic, half the masala for 15 min.","time_minutes":15},
   {"step_number":3,"instruction":"In oil, fry curry leaves and onions till golden. Add tomato; cook till mushy. Add chicken and the remaining masala; sauté 5 min.","time_minutes":12},
   {"step_number":4,"instruction":"Add hot water; cover and simmer 18 min till tender. Finish with coriander.","time_minutes":20}]'::jsonb),

('c0000005-0000-0000-0000-000000000004','Chettinad Fish Curry','Indian','Medium',15,25,4,
 '[{"step_number":1,"instruction":"Make Chettinad masala: dry-roast coriander, fennel, peppercorns, cumin, fenugreek, red chilli, copra, sesame; grind with water.","time_minutes":12},
   {"step_number":2,"instruction":"In gingelly (sesame) oil, splutter mustard, fenugreek, curry leaves; sauté shallots, garlic, tomato till soft.","time_minutes":8},
   {"step_number":3,"instruction":"Add tamarind pulp, the masala paste, turmeric, salt, water; bring to a gentle boil.","time_minutes":5},
   {"step_number":4,"instruction":"Slide in fish pieces; simmer 10 min without stirring. Rest covered 15 min. Serve with rice.","time_minutes":15}]'::jsonb),

('c0000005-0000-0000-0000-000000000005','Kara Kuzhambu','Indian','Medium',10,25,4,
 '[{"step_number":1,"instruction":"Soak tamarind in warm water; extract pulp. Dry-roast and grind coriander, fenugreek, chana dal, cumin, red chilli, coconut.","time_minutes":12},
   {"step_number":2,"instruction":"In sesame oil, temper mustard, urad dal, curry leaves, dried red chilli, hing; sauté shallots and small brinjals/drumsticks until softened.","time_minutes":8},
   {"step_number":3,"instruction":"Add the ground paste, tamarind, salt, turmeric, and water; simmer covered 15 min till thick and oil floats.","time_minutes":15},
   {"step_number":4,"instruction":"Garnish with curry leaves. Serve hot with rice.","time_minutes":1}]'::jsonb),

('c0000005-0000-0000-0000-000000000006','Thalassery Biryani','Indian','Hard',60,45,4,
 '[{"step_number":1,"instruction":"Use short-grain Kaima/Jeerakasala rice. Marinate chicken in yogurt, ginger-garlic, green chilli, turmeric, garam masala, salt 30 min.","time_minutes":40},
   {"step_number":2,"instruction":"Fry sliced onions till golden, set aside. In ghee, sauté whole spices (cinnamon, clove, cardamom, fennel), tomato; add the marinated chicken till the masala thickens.","time_minutes":15},
   {"step_number":3,"instruction":"Separately cook the rice with whole spices in salted water till 90% done; drain.","time_minutes":12},
   {"step_number":4,"instruction":"Layer chicken masala, rice, fried onions, mint-coriander, ghee, rosewater. Dum-cook on lowest flame 20 min. Rest, then fluff.","time_minutes":25}]'::jsonb),

-- ─── Indian Street Foods ─────────────────────────────────────────────────
('c0000006-0000-0000-0000-000000000001','Pani Puri','Indian','Medium',30,15,4,
 '[{"step_number":1,"instruction":"Pani: blend mint, coriander, green chilli, ginger, tamarind, jaggery, roasted cumin, black salt, regular salt with chilled water; strain and chill 30 min.","time_minutes":35},
   {"step_number":2,"instruction":"Filling: combine boiled potato chunks, boiled chickpeas, finely chopped onion, chaat masala, lemon, coriander, salt.","time_minutes":10},
   {"step_number":3,"instruction":"Open small puris by tapping; spoon a teaspoon of filling, a drizzle of sweet tamarind chutney.","time_minutes":5},
   {"step_number":4,"instruction":"Dunk into the cold pani and eat in one bite. Repeat.","time_minutes":1}]'::jsonb),

-- ─── South Indian Veg Curries ────────────────────────────────────────────
('c0000007-0000-0000-0000-000000000001','Sambar','Indian','Easy',10,25,4,
 '[{"step_number":1,"instruction":"Pressure cook 3/4 cup toor dal with turmeric till mushy. Extract tamarind pulp.","time_minutes":15},
   {"step_number":2,"instruction":"Cook chopped vegetable (drumstick, brinjal, pumpkin, okra, onion) with tamarind, sambar powder, salt, water till tender.","time_minutes":12},
   {"step_number":3,"instruction":"Mash the dal and stir into the vegetable mixture; simmer 5 min. Adjust salt.","time_minutes":5},
   {"step_number":4,"instruction":"Temper mustard, methi, dried red chilli, curry leaves, hing in ghee; pour over. Serve hot.","time_minutes":3}]'::jsonb),

('c0000007-0000-0000-0000-000000000002','Mor Kuzhambu','Indian','Easy',5,20,4,
 '[{"step_number":1,"instruction":"Cook a small chopped vegetable (ash gourd / okra / colocasia) with turmeric and salt till tender.","time_minutes":10},
   {"step_number":2,"instruction":"Grind fresh coconut with green chilli, ginger, cumin, soaked rice + chana dal to a smooth paste.","time_minutes":5},
   {"step_number":3,"instruction":"Whisk sour buttermilk (curd + water) with the coconut paste, salt, turmeric. Heat gently — do not boil.","time_minutes":5},
   {"step_number":4,"instruction":"Add cooked veg; turn off when steaming. Temper mustard, methi, curry leaves, dried chilli in coconut oil; pour over.","time_minutes":3}]'::jsonb),

('c0000007-0000-0000-0000-000000000003','Pulusu','Indian','Easy',10,25,4,
 '[{"step_number":1,"instruction":"Extract tamarind pulp. Chop the vegetable / fish of choice (often raw mango, brinjal, okra, or fish).","time_minutes":10},
   {"step_number":2,"instruction":"In oil, temper mustard, fenugreek, dried chilli, curry leaves; sauté onion, green chilli, garlic.","time_minutes":5},
   {"step_number":3,"instruction":"Add the vegetable, tamarind pulp, jaggery, turmeric, red chilli powder, coriander powder, salt and water; simmer covered 15 min.","time_minutes":15},
   {"step_number":4,"instruction":"Adjust sour-sweet balance. Serve over rice.","time_minutes":2}]'::jsonb),

('c0000007-0000-0000-0000-000000000004','Majjiga Pulusu','Indian','Easy',10,20,4,
 '[{"step_number":1,"instruction":"Chop and cook a tender vegetable (ash gourd / pumpkin / okra) with turmeric, salt till just done.","time_minutes":10},
   {"step_number":2,"instruction":"Grind coconut with green chilli, cumin, ginger and soaked rice to a smooth paste.","time_minutes":5},
   {"step_number":3,"instruction":"Whisk sour buttermilk with the coconut paste, salt. Heat with constant stirring till just steaming.","time_minutes":5},
   {"step_number":4,"instruction":"Add cooked veg. Temper mustard, fenugreek, dried chilli, curry leaves, hing in ghee; pour over.","time_minutes":2}]'::jsonb),

('c0000007-0000-0000-0000-000000000005','Gutti Vankaya Curry','Indian','Medium',20,30,4,
 '[{"step_number":1,"instruction":"Slit small brinjals lengthwise into four without separating. Dry-roast and grind peanuts, sesame, coconut, coriander, cumin, red chilli with onion, garlic to a thick paste.","time_minutes":20},
   {"step_number":2,"instruction":"Stuff the brinjals with as much of the masala as they will hold.","time_minutes":5},
   {"step_number":3,"instruction":"In oil, place the stuffed brinjals along with any remaining paste; sauté gently, then add tamarind, jaggery, turmeric, salt and water.","time_minutes":10},
   {"step_number":4,"instruction":"Cover and simmer 20 min, basting once or twice till brinjals are tender and oil floats. Garnish with coriander.","time_minutes":20}]'::jsonb),

('c0000007-0000-0000-0000-000000000006','Bendakaya Pulusu','Indian','Easy',10,20,4,
 '[{"step_number":1,"instruction":"Wash and dry okra thoroughly; cut into 1-inch pieces.","time_minutes":7},
   {"step_number":2,"instruction":"In oil, fry the okra till slime is gone and edges crisp.","time_minutes":8},
   {"step_number":3,"instruction":"Add chopped onion, green chilli, ginger-garlic; sauté. Pour in tamarind pulp, jaggery, sambar powder, turmeric, salt, water.","time_minutes":7},
   {"step_number":4,"instruction":"Simmer 12 min till saucy. Temper mustard, fenugreek, curry leaves; finish. Serve with rice.","time_minutes":12}]'::jsonb),

('c0000007-0000-0000-0000-000000000007','Sorakaya Curry','Indian','Easy',10,15,4,
 '[{"step_number":1,"instruction":"Peel and cube bottle gourd (sorakaya); rinse.","time_minutes":7},
   {"step_number":2,"instruction":"In oil, splutter mustard, urad dal, chana dal, curry leaves, dried red chilli; sauté onion, ginger, green chilli.","time_minutes":4},
   {"step_number":3,"instruction":"Add the gourd, turmeric, salt; sprinkle water, cover and cook 10–12 min till tender.","time_minutes":12},
   {"step_number":4,"instruction":"Optionally finish with a coconut+cumin paste. Serve with roti or rice.","time_minutes":2}]'::jsonb),

('c0000007-0000-0000-0000-000000000008','Beerakaya Curry','Indian','Easy',10,15,4,
 '[{"step_number":1,"instruction":"Peel ridge gourd (beerakaya), reserve the peels (they can be turned into chutney); chop the flesh.","time_minutes":7},
   {"step_number":2,"instruction":"Temper mustard, urad dal, chana dal, curry leaves, red chilli; sauté chopped onion and green chilli.","time_minutes":4},
   {"step_number":3,"instruction":"Add the gourd, turmeric, salt; cover and cook 10 min — it releases water and softens.","time_minutes":10},
   {"step_number":4,"instruction":"Stir in a tablespoon of besan or moong dal paste to thicken. Serve.","time_minutes":2}]'::jsonb),

('c0000007-0000-0000-0000-000000000009','Dosakaya Curry','Indian','Easy',10,20,4,
 '[{"step_number":1,"instruction":"Peel and dice dosakaya (yellow cucumber). Soak chana dal for 10 min.","time_minutes":10},
   {"step_number":2,"instruction":"In oil, splutter mustard, cumin, urad dal, curry leaves, dried red chilli; add chopped onion and the soaked chana dal.","time_minutes":5},
   {"step_number":3,"instruction":"Add dosakaya, tamarind pulp, turmeric, salt, sambar powder; cover and cook 12 min.","time_minutes":12},
   {"step_number":4,"instruction":"Mash a little for body. Garnish with coriander. Serve with rice.","time_minutes":2}]'::jsonb),

('c0000007-0000-0000-0000-00000000000a','Tomato Pappu','Indian','Easy',5,25,4,
 '[{"step_number":1,"instruction":"Pressure cook 3/4 cup toor dal with chopped tomatoes, green chilli, turmeric, and salt for 3 whistles.","time_minutes":18},
   {"step_number":2,"instruction":"Mash lightly. Adjust salt and consistency with hot water.","time_minutes":3},
   {"step_number":3,"instruction":"In ghee, splutter mustard, cumin, dried red chilli, garlic, curry leaves, hing.","time_minutes":3},
   {"step_number":4,"instruction":"Pour the tempering over the dal. Garnish with coriander. Serve over rice.","time_minutes":2}]'::jsonb),

('c0000007-0000-0000-0000-00000000000b','Palakura Pappu','Indian','Easy',5,25,4,
 '[{"step_number":1,"instruction":"Wash and chop palakura (spinach). Pressure cook 3/4 cup toor dal with spinach, green chilli, turmeric, salt.","time_minutes":18},
   {"step_number":2,"instruction":"Mash to a coarse texture; adjust salt and water.","time_minutes":3},
   {"step_number":3,"instruction":"In ghee, temper cumin, mustard, dried red chilli, garlic, curry leaves, hing.","time_minutes":3},
   {"step_number":4,"instruction":"Pour over the dal. Serve with rice, ghee and a wedge of lemon.","time_minutes":2}]'::jsonb),

('c0000007-0000-0000-0000-00000000000c','Mamidikaya Pappu','Indian','Easy',5,25,4,
 '[{"step_number":1,"instruction":"Peel and chop raw mango (mamidikaya). Pressure cook 3/4 cup toor dal with mango, green chilli, turmeric, salt — 3 whistles.","time_minutes":18},
   {"step_number":2,"instruction":"Whisk lightly; the mango will collapse into the dal. Adjust salt (mango is tart).","time_minutes":3},
   {"step_number":3,"instruction":"In ghee, temper cumin, mustard, garlic slivers, curry leaves, dried chilli, hing.","time_minutes":3},
   {"step_number":4,"instruction":"Pour over. Serve hot with rice.","time_minutes":2}]'::jsonb),

-- ─── North Indian Veg Curries ────────────────────────────────────────────
('c0000008-0000-0000-0000-000000000001','Paneer Butter Masala','Indian','Medium',15,25,4,
 '[{"step_number":1,"instruction":"Simmer cashews and tomato chunks with ginger, garlic, red chilli, salt and water for 10 min. Blend smooth and strain.","time_minutes":15},
   {"step_number":2,"instruction":"In butter, add the tomato-cashew puree; cook till oil separates. Add kasuri methi, garam masala, sugar.","time_minutes":12},
   {"step_number":3,"instruction":"Add lightly fried paneer cubes; simmer 5 min so paneer absorbs flavour.","time_minutes":6},
   {"step_number":4,"instruction":"Stir in cream and a knob of butter. Serve with naan or jeera rice.","time_minutes":2}]'::jsonb),

('c0000008-0000-0000-0000-000000000002','Shahi Paneer','Indian','Medium',15,25,4,
 '[{"step_number":1,"instruction":"Soak cashews and almonds 15 min; blend with onion, ginger, garlic, green chilli, melon seeds to a fine paste.","time_minutes":15},
   {"step_number":2,"instruction":"In ghee, sauté the white paste on medium-low without browning till oil separates — 10 min.","time_minutes":10},
   {"step_number":3,"instruction":"Add yogurt one spoon at a time, whisking, then garam masala, white pepper, salt, a touch of sugar, milk/water for body.","time_minutes":8},
   {"step_number":4,"instruction":"Add paneer cubes and saffron-soaked milk; simmer 4 min. Finish with cream and rose water. Serve.","time_minutes":5}]'::jsonb),

('c0000008-0000-0000-0000-000000000003','Kadai Paneer','Indian','Medium',15,20,4,
 '[{"step_number":1,"instruction":"Dry-roast and crush coarse: coriander seeds, dried red chilli, kasuri methi, peppercorns, cumin — this is kadai masala.","time_minutes":10},
   {"step_number":2,"instruction":"In oil/ghee, sauté chopped onion till translucent; add ginger-garlic, then tomato puree; cook till oil floats.","time_minutes":10},
   {"step_number":3,"instruction":"Add half the kadai masala, salt, a splash of water; add diced capsicum and onion chunks; sauté 3 min on high.","time_minutes":4},
   {"step_number":4,"instruction":"Fold in paneer cubes and remaining masala; toss 2 min. Serve hot with roti.","time_minutes":5}]'::jsonb),

('c0000008-0000-0000-0000-000000000004','Matar Paneer','Indian','Medium',10,25,4,
 '[{"step_number":1,"instruction":"Blanch and blend 2 tomatoes with cashew and ginger-garlic to a smooth puree.","time_minutes":8},
   {"step_number":2,"instruction":"In oil, sauté chopped onion till golden, add the puree; cook till oil separates.","time_minutes":10},
   {"step_number":3,"instruction":"Add red chilli, coriander powder, turmeric, salt, garam masala. Pour water and stir in green peas; simmer 8 min till peas are tender.","time_minutes":10},
   {"step_number":4,"instruction":"Add paneer cubes; simmer 3 min. Finish with cream and kasuri methi. Serve.","time_minutes":5}]'::jsonb),

('c0000008-0000-0000-0000-000000000005','Rajma Masala','Indian','Medium',480,40,4,
 '[{"step_number":1,"instruction":"Soak 1 cup rajma overnight. Pressure cook till very soft with salt — 6 whistles + 10 min low.","time_minutes":480},
   {"step_number":2,"instruction":"In ghee, sauté chopped onion till golden, ginger-garlic, then tomato puree till oil separates.","time_minutes":12},
   {"step_number":3,"instruction":"Add coriander, red chilli, turmeric, garam masala; cook 1 min. Tip in cooked rajma with the water; mash 1/4 of the beans for body.","time_minutes":15},
   {"step_number":4,"instruction":"Simmer 12–15 min till the gravy thickens. Finish with kasuri methi. Serve with steamed rice.","time_minutes":15}]'::jsonb),

('c0000008-0000-0000-0000-000000000006','Baingan Bharta','Indian','Medium',20,25,4,
 '[{"step_number":1,"instruction":"Char a large brinjal directly over a flame or in a 220°C oven till the skin is blackened and the inside soft. Cool, peel, mash.","time_minutes":20},
   {"step_number":2,"instruction":"In mustard oil, sauté chopped onion, ginger, garlic, green chilli till golden. Add tomato; cook till mushy.","time_minutes":10},
   {"step_number":3,"instruction":"Add red chilli, coriander, turmeric, salt; then the mashed brinjal. Mash and sauté 8 min so flavors meld.","time_minutes":8},
   {"step_number":4,"instruction":"Sprinkle garam masala and lots of coriander. Serve with roti or parathas.","time_minutes":2}]'::jsonb),

('c0000008-0000-0000-0000-000000000007','Malai Kofta','Indian','Hard',30,30,4,
 '[{"step_number":1,"instruction":"Knead grated paneer + boiled mashed potato + crushed cashew + raisin + spices + a little maida or cornflour into a dough; shape balls. Deep-fry till golden.","time_minutes":25},
   {"step_number":2,"instruction":"For the gravy: blend simmered tomato, onion, cashew, ginger-garlic to a smooth puree.","time_minutes":12},
   {"step_number":3,"instruction":"Cook the puree in butter with red chilli, coriander, garam masala, salt, sugar till oil separates.","time_minutes":12},
   {"step_number":4,"instruction":"Add cream and kasuri methi; warm through. Place koftas in serving bowl and pour gravy over only at serving time. Garnish with cream and coriander.","time_minutes":5}]'::jsonb),

('c0000008-0000-0000-0000-000000000008','Bhindi Masala','Indian','Easy',15,20,4,
 '[{"step_number":1,"instruction":"Wash okra and dry thoroughly. Slit and cut into 1-inch pieces.","time_minutes":10},
   {"step_number":2,"instruction":"Sauté okra in oil on medium-high till the slime is gone and edges crisp (10–12 min). Set aside.","time_minutes":12},
   {"step_number":3,"instruction":"In the same pan, sauté chopped onion, ginger-garlic, tomato till mushy. Add red chilli, coriander, turmeric, garam masala, salt.","time_minutes":8},
   {"step_number":4,"instruction":"Return the okra; toss 2 min so it picks up the masala. Serve hot.","time_minutes":3}]'::jsonb),

('c0000008-0000-0000-0000-000000000009','Dum Aloo','Indian','Medium',20,30,4,
 '[{"step_number":1,"instruction":"Boil baby potatoes till just done, peel, and prick them all over. Lightly fry till golden.","time_minutes":15},
   {"step_number":2,"instruction":"Blend cashew + yogurt + ginger + garlic + dry spices into a creamy paste.","time_minutes":5},
   {"step_number":3,"instruction":"In ghee, sauté the paste till the raw smell vanishes; add Kashmiri red chilli, fennel powder, salt, water for gravy.","time_minutes":10},
   {"step_number":4,"instruction":"Add the potatoes, cover and simmer (dum) on lowest flame 15 min. Finish with cream and garam masala. Serve.","time_minutes":15}]'::jsonb),

('c0000008-0000-0000-0000-00000000000a','Mixed Vegetable Curry','Indian','Easy',15,25,4,
 '[{"step_number":1,"instruction":"Chop a colourful mix (carrot, beans, cauliflower, potato, peas, capsicum, paneer) into bite-size pieces.","time_minutes":12},
   {"step_number":2,"instruction":"In oil, sauté chopped onion, ginger-garlic till golden, then tomato till mushy.","time_minutes":10},
   {"step_number":3,"instruction":"Add the harder vegetables first with red chilli, coriander, turmeric, garam masala, salt, water; cover and simmer 8 min.","time_minutes":10},
   {"step_number":4,"instruction":"Add quicker-cooking veg; finish 6 min till everything is just tender. Stir in cream/kasuri methi. Serve.","time_minutes":6}]'::jsonb),

('c0000008-0000-0000-0000-00000000000b','Navratan Korma','Indian','Hard',20,30,4,
 '[{"step_number":1,"instruction":"Lightly fry the nine \"jewels\": paneer, cashew, raisin, pomegranate, pineapple, almonds, cauliflower, carrot, peas.","time_minutes":15},
   {"step_number":2,"instruction":"Blend cashew, melon seeds, blanched almonds, fresh cream into a smooth white paste.","time_minutes":5},
   {"step_number":3,"instruction":"In ghee, sauté the white paste gently, add a touch of garam masala, salt, sugar, milk; simmer 8 min till silky.","time_minutes":12},
   {"step_number":4,"instruction":"Fold in the fried items, simmer 5 min so flavours marry. Finish with saffron milk and rose water. Garnish with pomegranate and cream.","time_minutes":8}]'::jsonb),

-- ─── Simple Daily Veg Curries ────────────────────────────────────────────
('c0000009-0000-0000-0000-000000000001','Potato Curry','Indian','Easy',10,20,4,
 '[{"step_number":1,"instruction":"Boil potatoes, peel, cube. Chop onion, tomato, green chilli, ginger.","time_minutes":12},
   {"step_number":2,"instruction":"In oil, splutter cumin/mustard; sauté onion till translucent, then ginger-garlic, then tomato.","time_minutes":7},
   {"step_number":3,"instruction":"Add red chilli, coriander, turmeric, garam masala, salt; cook till oil floats.","time_minutes":4},
   {"step_number":4,"instruction":"Add potato cubes and water; simmer 8 min, mashing a few cubes for body. Garnish with coriander.","time_minutes":8}]'::jsonb),

('c0000009-0000-0000-0000-000000000002','Cabbage Curry','Indian','Easy',10,15,4,
 '[{"step_number":1,"instruction":"Shred cabbage finely; chop onion, green chilli, ginger.","time_minutes":8},
   {"step_number":2,"instruction":"In oil, splutter mustard, urad dal, chana dal, curry leaves, peanuts.","time_minutes":4},
   {"step_number":3,"instruction":"Add onion, green chilli, ginger; sauté 3 min. Add cabbage, turmeric, salt; cover and cook 8–10 min till just tender.","time_minutes":10},
   {"step_number":4,"instruction":"Garnish with grated coconut. Serve.","time_minutes":1}]'::jsonb),

('c0000009-0000-0000-0000-000000000003','Beans Fry','Indian','Easy',10,15,3,
 '[{"step_number":1,"instruction":"Trim and chop french beans into 1/4-inch pieces.","time_minutes":8},
   {"step_number":2,"instruction":"In oil, temper mustard, urad dal, chana dal, dried red chilli, curry leaves, hing.","time_minutes":3},
   {"step_number":3,"instruction":"Add the beans with turmeric, salt; sprinkle a little water, cover and cook 8 min till tender-crisp.","time_minutes":8},
   {"step_number":4,"instruction":"Uncover, add grated fresh coconut, toss 1 min. Serve.","time_minutes":2}]'::jsonb),

('c0000009-0000-0000-0000-000000000004','Carrot Peas Curry','Indian','Easy',10,15,4,
 '[{"step_number":1,"instruction":"Peel and dice carrots; shell peas (or use frozen).","time_minutes":8},
   {"step_number":2,"instruction":"In oil, splutter cumin; sauté chopped onion, ginger, green chilli.","time_minutes":4},
   {"step_number":3,"instruction":"Add carrot, peas, turmeric, salt, a pinch of garam masala; cover and cook 10 min, stirring once.","time_minutes":10},
   {"step_number":4,"instruction":"Stir in a tablespoon of fresh cream or coconut milk for richness. Garnish with coriander.","time_minutes":1}]'::jsonb),

('c0000009-0000-0000-0000-000000000005','Cauliflower Curry','Indian','Easy',10,20,4,
 '[{"step_number":1,"instruction":"Break cauliflower into florets; rinse in salted hot water 5 min to clean. Drain.","time_minutes":8},
   {"step_number":2,"instruction":"In oil, sauté onion, ginger-garlic, tomato till soft. Add red chilli, coriander, turmeric, garam masala.","time_minutes":8},
   {"step_number":3,"instruction":"Add the cauliflower, salt, a splash of water; cover and cook 10 min till just tender.","time_minutes":10},
   {"step_number":4,"instruction":"Uncover and dry off any extra liquid. Garnish with coriander.","time_minutes":2}]'::jsonb),

('c0000009-0000-0000-0000-000000000006','Drumstick Curry','Indian','Easy',10,25,4,
 '[{"step_number":1,"instruction":"Cut drumsticks into 2-inch pieces; scrape lightly to remove fibrous skin.","time_minutes":8},
   {"step_number":2,"instruction":"In oil, splutter mustard, urad dal, curry leaves; sauté onion, green chilli, ginger.","time_minutes":5},
   {"step_number":3,"instruction":"Add tomato, turmeric, sambar powder, salt and a little water; cover and cook drumsticks 12–14 min till the flesh inside is creamy.","time_minutes":15},
   {"step_number":4,"instruction":"Optionally finish with coconut paste. Serve with rice.","time_minutes":2}]'::jsonb),

('c0000009-0000-0000-0000-000000000007','Capsicum Masala','Indian','Easy',10,15,3,
 '[{"step_number":1,"instruction":"Slice 3 capsicums (mixed colours) into thin strips.","time_minutes":5},
   {"step_number":2,"instruction":"In oil, sauté onion, ginger-garlic, then tomato puree till oil separates.","time_minutes":7},
   {"step_number":3,"instruction":"Add red chilli, coriander, turmeric, garam masala, salt; cook 1 min. Add capsicums and toss on high heat 4 min — keep them crisp.","time_minutes":6},
   {"step_number":4,"instruction":"Sprinkle a teaspoon of kasuri methi and a squeeze of lemon. Serve.","time_minutes":1}]'::jsonb),

('c0000009-0000-0000-0000-000000000008','Mushroom Masala','Indian','Easy',10,20,4,
 '[{"step_number":1,"instruction":"Wipe button mushrooms with damp cloth; slice. Chop onion, tomato, ginger, garlic.","time_minutes":8},
   {"step_number":2,"instruction":"In oil, sauté onion till translucent, then ginger-garlic, then tomato till mushy.","time_minutes":8},
   {"step_number":3,"instruction":"Add red chilli, coriander, turmeric, garam masala, salt; cook 1 min. Add mushrooms and toss 5 min.","time_minutes":6},
   {"step_number":4,"instruction":"Cover briefly so mushrooms release moisture; uncover and reduce till thick. Finish with cream and kasuri methi.","time_minutes":6}]'::jsonb),

('c0000009-0000-0000-0000-000000000009','Corn Masala','Indian','Easy',10,15,3,
 '[{"step_number":1,"instruction":"Steam or microwave 1.5 cups corn kernels till tender.","time_minutes":7},
   {"step_number":2,"instruction":"In butter, sauté chopped onion, ginger-garlic, then tomato puree till oil floats.","time_minutes":7},
   {"step_number":3,"instruction":"Add red chilli, coriander, turmeric, garam masala, salt. Tip in corn; toss on high 4 min.","time_minutes":5},
   {"step_number":4,"instruction":"Stir in a tablespoon of cream and squeeze of lemon. Garnish with coriander.","time_minutes":1}]'::jsonb),

('c0000009-0000-0000-0000-00000000000a','Green Peas Curry','Indian','Easy',10,20,4,
 '[{"step_number":1,"instruction":"In oil, sauté chopped onion, ginger-garlic till golden. Blend with tomato to a smooth puree (or sauté further with tomato).","time_minutes":10},
   {"step_number":2,"instruction":"Cook the puree till oil separates. Add red chilli, coriander, turmeric, garam masala, salt.","time_minutes":8},
   {"step_number":3,"instruction":"Add 2 cups green peas (fresh or frozen) and water; simmer 8 min till peas are tender.","time_minutes":8},
   {"step_number":4,"instruction":"Finish with kasuri methi and a tablespoon of cream. Serve with paratha.","time_minutes":2}]'::jsonb),

-- ─── Hotel-Style Veg Curries ─────────────────────────────────────────────
('c000000a-0000-0000-0000-000000000001','Veg Kolhapuri','Indian','Medium',20,30,4,
 '[{"step_number":1,"instruction":"Dry-roast and grind: coconut, sesame, poppy seeds, coriander, cumin, peppercorn, cinnamon, clove, dried red chilli, onion to a dark masala.","time_minutes":15},
   {"step_number":2,"instruction":"Parboil mixed vegetables (carrot, beans, cauliflower, potato, peas) till just tender.","time_minutes":10},
   {"step_number":3,"instruction":"In oil, sauté the ground masala with ginger-garlic till deeply fragrant. Add tomato puree, salt, water.","time_minutes":12},
   {"step_number":4,"instruction":"Add the vegetables; simmer 8 min so flavours soak in. Garnish with coriander. Serve with bhakri or rice.","time_minutes":8}]'::jsonb),

('c000000a-0000-0000-0000-000000000002','Veg Jalfrezi','Indian','Easy',15,20,4,
 '[{"step_number":1,"instruction":"Cut all vegetables (capsicum, carrot, beans, baby corn, onion, tomato, paneer) into uniform julienne / batons.","time_minutes":12},
   {"step_number":2,"instruction":"Heat oil on high; stir-fry the harder veg first (carrot, beans) for 3 min.","time_minutes":4},
   {"step_number":3,"instruction":"Add ginger-garlic, capsicum, onion; toss 2 min. Add chopped tomato, red chilli, coriander, garam masala, salt, vinegar.","time_minutes":5},
   {"step_number":4,"instruction":"Finish with paneer batons, kasuri methi and a splash of ketchup. Serve with naan.","time_minutes":4}]'::jsonb),

('c000000a-0000-0000-0000-000000000003','Paneer Tikka Masala','Indian','Medium',30,30,4,
 '[{"step_number":1,"instruction":"Marinate paneer + capsicum + onion chunks in yogurt, ginger-garlic, tikka masala, lemon, oil, salt for 30 min.","time_minutes":30},
   {"step_number":2,"instruction":"Grill or pan-fry on skewers/tawa till lightly charred.","time_minutes":8},
   {"step_number":3,"instruction":"For gravy: sauté onion, ginger-garlic, tomato puree, cashew paste, red chilli, coriander, garam masala, salt till oil separates.","time_minutes":15},
   {"step_number":4,"instruction":"Add the tikka pieces; simmer 5 min. Finish with cream and kasuri methi. Serve with naan.","time_minutes":7}]'::jsonb),

('c000000a-0000-0000-0000-000000000004','Veg Kurma','Indian','Medium',15,25,4,
 '[{"step_number":1,"instruction":"Cube mixed veg (carrot, beans, peas, potato, cauliflower). Grind a fresh paste of coconut, cashew, poppy seeds, ginger, garlic, green chilli, fennel, cinnamon, clove.","time_minutes":15},
   {"step_number":2,"instruction":"In ghee, sauté sliced onion till translucent; add the white paste, cook till the raw smell vanishes.","time_minutes":10},
   {"step_number":3,"instruction":"Add coriander powder, turmeric, salt and water; bring to a simmer. Add the vegetables; cover and cook till tender.","time_minutes":12},
   {"step_number":4,"instruction":"Finish with cream and coriander. Serve with parotta or rice.","time_minutes":3}]'::jsonb),

('c000000a-0000-0000-0000-000000000005','Cashew Curry','Indian','Medium',60,20,4,
 '[{"step_number":1,"instruction":"Soak 1 cup cashews 30 min in hot water; drain.","time_minutes":30},
   {"step_number":2,"instruction":"Blend half the cashew with onion, tomato, ginger, garlic, green chilli, melon seeds into a creamy paste.","time_minutes":5},
   {"step_number":3,"instruction":"In ghee, cook the paste till oil separates; add red chilli, coriander, garam masala, salt, milk/water for body.","time_minutes":10},
   {"step_number":4,"instruction":"Add the whole cashews; simmer gently 6 min. Finish with cream and kasuri methi. Serve with naan.","time_minutes":8}]'::jsonb),

('c000000a-0000-0000-0000-000000000006','Methi Malai Matar','Indian','Medium',15,20,4,
 '[{"step_number":1,"instruction":"Wash, chop, and blanch 2 cups methi (fenugreek) leaves in salted water 1 min; rinse in cold water to keep green.","time_minutes":12},
   {"step_number":2,"instruction":"Blend cashews, onion, ginger, garlic, green chilli to a smooth white paste.","time_minutes":5},
   {"step_number":3,"instruction":"In ghee, sauté the paste gently till the raw smell goes (do not brown). Add green peas; sauté 4 min.","time_minutes":10},
   {"step_number":4,"instruction":"Add the methi, salt, milk, cream and a pinch of sugar; simmer 6 min till silky. Serve.","time_minutes":7}]'::jsonb),

('c000000a-0000-0000-0000-000000000007','Paneer Bhurji','Indian','Easy',5,15,3,
 '[{"step_number":1,"instruction":"Grate or crumble 250g paneer.","time_minutes":4},
   {"step_number":2,"instruction":"In butter, splutter cumin; sauté chopped onion, ginger, green chilli till translucent. Add tomato; cook till mushy.","time_minutes":8},
   {"step_number":3,"instruction":"Add red chilli, coriander, turmeric, garam masala, salt; cook 1 min. Tip in the crumbled paneer and toss 3 min.","time_minutes":4},
   {"step_number":4,"instruction":"Finish with kasuri methi, coriander and a squeeze of lemon. Serve with toast or roti.","time_minutes":2}]'::jsonb),

('c000000a-0000-0000-0000-000000000008','Tawa Vegetable Curry','Indian','Easy',15,15,4,
 '[{"step_number":1,"instruction":"Dice mixed veg (capsicum, onion, tomato, paneer, cauliflower, peas) small.","time_minutes":12},
   {"step_number":2,"instruction":"Heat a flat tawa with butter; sauté ginger-garlic, then onion-capsicum till slightly charred.","time_minutes":5},
   {"step_number":3,"instruction":"Add tomato, the other veg, pav-bhaji masala (or red chilli + garam masala), salt; mash slightly with the back of a spoon.","time_minutes":6},
   {"step_number":4,"instruction":"Toss for another 3 min so flavours marry. Finish with lemon, coriander and a knob of butter. Serve with pav.","time_minutes":4}]'::jsonb),

('c000000a-0000-0000-0000-000000000009','Paneer Lababdar','Indian','Medium',20,25,4,
 '[{"step_number":1,"instruction":"Blend simmered tomato, cashew, melon seeds, ginger, garlic to a smooth puree and strain.","time_minutes":12},
   {"step_number":2,"instruction":"In butter, sauté finely chopped onion till translucent; add the smooth puree, red chilli, coriander, garam masala, sugar, salt.","time_minutes":12},
   {"step_number":3,"instruction":"Cook till oil separates. Stir in cream and a knob of butter.","time_minutes":5},
   {"step_number":4,"instruction":"Add grated paneer (half) and paneer cubes (half) — the grated paneer gives the dish its signature texture. Simmer 4 min. Finish with kasuri methi.","time_minutes":6}]'::jsonb),

-- ─── Popular Indian Desserts ─────────────────────────────────────────────
('c000000b-0000-0000-0000-000000000001','Gulab Jamun','Indian','Medium',15,25,8,
 '[{"step_number":1,"instruction":"Knead khoya/mawa with a teaspoon of maida and a pinch of baking soda, adding milk only if needed, into a smooth soft dough. Rest 5 min.","time_minutes":12},
   {"step_number":2,"instruction":"Roll crack-free small balls. Heat ghee/oil to a gentle 130°C — too hot and the outside browns before the inside cooks.","time_minutes":5},
   {"step_number":3,"instruction":"Fry the balls turning gently till an even rich brown.","time_minutes":10},
   {"step_number":4,"instruction":"Drop hot fried balls directly into warm cardamom-rose sugar syrup. Soak at least 1 hour. Serve warm or chilled.","time_minutes":60}]'::jsonb),

('c000000b-0000-0000-0000-000000000002','Payasam','Indian','Easy',10,30,4,
 '[{"step_number":1,"instruction":"Wash 1/2 cup rice or vermicelli or moong dal. (Choose your base.) Roast vermicelli/moong dal in ghee till golden.","time_minutes":7},
   {"step_number":2,"instruction":"Boil with 4 cups milk on low, stirring often, till the base is fully cooked and the milk thickens.","time_minutes":25},
   {"step_number":3,"instruction":"Stir in sugar or jaggery (off the heat for jaggery, to avoid curdling), cardamom, a pinch of saffron.","time_minutes":3},
   {"step_number":4,"instruction":"Fry cashew and raisin in ghee; pour over. Serve warm or chilled.","time_minutes":3}]'::jsonb),

('c000000b-0000-0000-0000-000000000003','Rasgulla','Indian','Hard',60,30,8,
 '[{"step_number":1,"instruction":"Boil 1 litre full-cream milk; turn off and add lemon juice/vinegar to curdle. Strain into a muslin, rinse with cold water, hang 30 min.","time_minutes":45},
   {"step_number":2,"instruction":"Knead the chenna for 5–7 min till smooth and slightly oily — it should not crack when rolled. Shape small crack-free balls.","time_minutes":10},
   {"step_number":3,"instruction":"Prepare a thin sugar syrup (1 cup sugar : 4 cups water) and bring to a rolling boil. Slide in the balls; cover and cook on high 12 min — they will double in size.","time_minutes":15},
   {"step_number":4,"instruction":"Cool completely in the syrup before refrigerating. Serve cold.","time_minutes":120}]'::jsonb)

ON CONFLICT (id) DO NOTHING;

COMMIT;
