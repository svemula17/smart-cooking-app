-- 104_japanese_med_indochinese_expansion.sql
-- Add ~42 new dishes across Japanese, Mediterranean, and Indo-Chinese
-- cuisines with full instructions, nutrition, and ingredient lists.
-- Idempotent via ON CONFLICT.

BEGIN;

-- ═══ RECIPES ═══════════════════════════════════════════════════════════════
INSERT INTO recipes (id, name, cuisine_type, difficulty, prep_time_minutes, cook_time_minutes, servings, instructions) VALUES

-- ─── Japanese ──────────────────────────────────────────────────────────────
('e0000001-0000-0000-0000-000000000001','Tonkotsu Ramen','Japanese','Hard',60,720,4,
 '[{"step_number":1,"instruction":"Blanch pork bones, scrub clean. Pressure cook 6 hours (or simmer rolling 12 hours) with aromatics until broth is milky and unctuous.","time_minutes":720},
   {"step_number":2,"instruction":"Make tare: simmer soy + mirin + sake + dashi + kombu + dried mushrooms 20 min; strain.","time_minutes":25},
   {"step_number":3,"instruction":"Cook ramen noodles to package; rinse. Soft-boil eggs, marinate in soy-mirin 2 hr.","time_minutes":15},
   {"step_number":4,"instruction":"In each bowl, add 2 tbsp tare and a generous ladle of hot broth. Add noodles, sliced chashu pork, soft egg, scallion, nori, bamboo shoots.","time_minutes":5}]'::jsonb),

('e0000001-0000-0000-0000-000000000002','Miso Ramen','Japanese','Medium',20,30,4,
 '[{"step_number":1,"instruction":"Whisk red + white miso with grated garlic, ginger, sesame paste, chilli bean paste, soy, mirin into a thick tare.","time_minutes":10},
   {"step_number":2,"instruction":"Bring chicken/pork stock to a simmer.","time_minutes":5},
   {"step_number":3,"instruction":"Cook ramen noodles per package. Stir-fry bean sprouts + corn + spring onion in sesame oil.","time_minutes":8},
   {"step_number":4,"instruction":"Whisk 3 tbsp tare into each bowl, pour hot stock, add noodles, the stir-fried veg, sliced pork, soft egg, butter, scallion, chilli oil.","time_minutes":5}]'::jsonb),

('e0000001-0000-0000-0000-000000000003','Shoyu Ramen','Japanese','Medium',15,30,4,
 '[{"step_number":1,"instruction":"Make shoyu tare: simmer soy sauce + mirin + sake + dried scallop/anchovy + kombu + bonito flakes; strain.","time_minutes":15},
   {"step_number":2,"instruction":"Have chicken broth simmering.","time_minutes":5},
   {"step_number":3,"instruction":"Cook noodles. Soft-boil eggs and marinate in tare 1 hour.","time_minutes":12},
   {"step_number":4,"instruction":"Per bowl: 2 tbsp tare, 1.5 cups hot broth, noodles, sliced chashu, marinated egg, menma, naruto, nori, scallion.","time_minutes":5}]'::jsonb),

('e0000001-0000-0000-0000-000000000004','Salmon Sushi Roll','Japanese','Medium',30,15,3,
 '[{"step_number":1,"instruction":"Rinse and cook sushi rice with a 1:1.2 rice-to-water ratio. While warm, fold in sushi vinegar (rice vinegar + sugar + salt). Fan-cool.","time_minutes":25},
   {"step_number":2,"instruction":"Slice sushi-grade salmon into thin strips. Cut cucumber and avocado into strips.","time_minutes":8},
   {"step_number":3,"instruction":"Place nori on a bamboo mat (shiny side down). Spread a thin layer of rice, leaving a 1cm border on far edge. Lay salmon, cucumber, avocado in a line.","time_minutes":5},
   {"step_number":4,"instruction":"Roll firmly using the mat. Wet a sharp knife and slice into 8 pieces. Serve with soy, wasabi, pickled ginger.","time_minutes":5}]'::jsonb),

('e0000001-0000-0000-0000-000000000005','California Roll','Japanese','Medium',30,15,3,
 '[{"step_number":1,"instruction":"Cook and season sushi rice. Mix imitation crab (or real lump crab) with mayo and a touch of sriracha.","time_minutes":25},
   {"step_number":2,"instruction":"Slice avocado and cucumber into strips.","time_minutes":5},
   {"step_number":3,"instruction":"Place nori on a plastic-wrapped bamboo mat. Spread rice over nori, then flip so rice is on the outside. Sprinkle sesame/tobiko on the rice.","time_minutes":6},
   {"step_number":4,"instruction":"Add crab, avocado, cucumber on the nori side. Roll firmly. Slice with a wet knife into 8 pieces. Serve.","time_minutes":4}]'::jsonb),

('e0000001-0000-0000-0000-000000000006','Tempura','Japanese','Medium',15,20,4,
 '[{"step_number":1,"instruction":"Heat oil to 175°C. Prepare ice-cold batter: lightly whisk 1 cup ice water with 1 egg, then briefly fold in 1 cup flour — leave lumpy.","time_minutes":10},
   {"step_number":2,"instruction":"Pat dry the shrimp, sliced sweet potato, eggplant, bell pepper, green beans, mushroom.","time_minutes":8},
   {"step_number":3,"instruction":"Dredge each piece lightly in flour, dip in cold batter, slide into hot oil. Fry 2 min until light gold and crisp; drain on rack.","time_minutes":15},
   {"step_number":4,"instruction":"Serve immediately with tentsuyu dipping sauce (dashi + soy + mirin + grated daikon).","time_minutes":2}]'::jsonb),

('e0000001-0000-0000-0000-000000000007','Yakitori','Japanese','Easy',30,20,4,
 '[{"step_number":1,"instruction":"Cut boneless chicken thigh into uniform 1-inch chunks. Cut spring onion into 1-inch lengths.","time_minutes":10},
   {"step_number":2,"instruction":"Thread chicken and spring onion alternately on bamboo skewers.","time_minutes":10},
   {"step_number":3,"instruction":"Make tare: simmer soy + mirin + sake + sugar + a chicken bone until reduced to a glaze.","time_minutes":15},
   {"step_number":4,"instruction":"Grill skewers over charcoal (or under a high broiler) basting with tare, turning every 2 min until golden and just cooked through. Sprinkle shichimi togarashi.","time_minutes":10}]'::jsonb),

('e0000001-0000-0000-0000-000000000008','Gyoza','Japanese','Medium',45,12,4,
 '[{"step_number":1,"instruction":"Salt finely chopped cabbage; squeeze dry. Mix with ground pork, garlic, ginger, scallion, soy, sesame oil, white pepper, cornstarch.","time_minutes":20},
   {"step_number":2,"instruction":"Place a teaspoon of filling on each round wrapper. Wet half the edge, pleat the front against the flat back to close.","time_minutes":25},
   {"step_number":3,"instruction":"Heat oil in a non-stick pan; place gyoza flat-side down. Fry 2 min until bottoms are crisp golden.","time_minutes":3},
   {"step_number":4,"instruction":"Add 1/3 cup water + a drop of oil, cover and steam 6 min until water evaporates. Serve with soy-vinegar-chilli oil.","time_minutes":9}]'::jsonb),

('e0000001-0000-0000-0000-000000000009','Onigiri','Japanese','Easy',10,20,4,
 '[{"step_number":1,"instruction":"Rinse and cook short-grain Japanese rice (1:1.1 water).","time_minutes":20},
   {"step_number":2,"instruction":"Cool rice slightly so you can handle it. Wet hands with salt water.","time_minutes":3},
   {"step_number":3,"instruction":"Press a small portion of rice into a triangle. Push your thumb into the center, add filling (umeboshi / tuna mayo / salmon flake), seal with more rice.","time_minutes":7},
   {"step_number":4,"instruction":"Wrap with a strip of nori. Serve at room temp.","time_minutes":2}]'::jsonb),

('e0000001-0000-0000-0000-00000000000a','Tonkatsu','Japanese','Easy',10,15,4,
 '[{"step_number":1,"instruction":"Pound boneless pork cutlets to even thickness. Score the silver skin to prevent curling. Season with salt and pepper.","time_minutes":7},
   {"step_number":2,"instruction":"Dredge in flour, dip in beaten egg, coat thoroughly in panko (press to adhere).","time_minutes":5},
   {"step_number":3,"instruction":"Heat 2 cm oil to 170°C. Fry cutlets 3 min per side until deep golden and cooked through.","time_minutes":8},
   {"step_number":4,"instruction":"Drain, slice across the grain. Serve with shredded cabbage, lemon, and a generous drizzle of tonkatsu sauce + rice.","time_minutes":4}]'::jsonb),

('e0000001-0000-0000-0000-00000000000b','Oyakodon','Japanese','Easy',5,15,2,
 '[{"step_number":1,"instruction":"Simmer dashi + soy + mirin + sugar in a small pan; add sliced onion, cook 3 min until soft.","time_minutes":7},
   {"step_number":2,"instruction":"Add bite-size chicken thigh pieces; simmer 5 min until just cooked.","time_minutes":6},
   {"step_number":3,"instruction":"Beat 2 eggs lightly (do not over-whisk). Pour over chicken in a swirl. Cover and cook 1 minute until just set but still glossy.","time_minutes":2},
   {"step_number":4,"instruction":"Slide over a bowl of hot rice. Garnish with mitsuba/scallion and a sprinkle of shichimi.","time_minutes":1}]'::jsonb),

('e0000001-0000-0000-0000-00000000000c','Katsudon','Japanese','Medium',15,20,2,
 '[{"step_number":1,"instruction":"Make tonkatsu cutlets (see tonkatsu recipe) — fry until just done; slice across the grain.","time_minutes":15},
   {"step_number":2,"instruction":"In a wide pan, simmer dashi + soy + mirin + sugar + sliced onion 3 min.","time_minutes":5},
   {"step_number":3,"instruction":"Lay sliced tonkatsu over the onions. Pour beaten egg over in a swirl, cover and cook 1 min until egg is just set.","time_minutes":3},
   {"step_number":4,"instruction":"Slide gently over a bowl of hot rice. Top with mitsuba or scallion. Serve.","time_minutes":2}]'::jsonb),

('e0000001-0000-0000-0000-00000000000d','Yaki Soba','Japanese','Easy',10,12,4,
 '[{"step_number":1,"instruction":"Loosen soba (or yakisoba) noodles in a colander under hot water; drain.","time_minutes":4},
   {"step_number":2,"instruction":"Stir-fry sliced pork belly in oil, then cabbage, carrot, onion, bell pepper, bean sprouts.","time_minutes":6},
   {"step_number":3,"instruction":"Add noodles and yakisoba sauce (Worcestershire-based: tonkatsu + oyster + soy + sugar + ketchup); toss on high.","time_minutes":4},
   {"step_number":4,"instruction":"Top with aonori, beni shoga (pickled ginger), bonito flakes, Kewpie mayo. Serve.","time_minutes":3}]'::jsonb),

('e0000001-0000-0000-0000-00000000000e','Udon Noodle Soup','Japanese','Easy',5,15,2,
 '[{"step_number":1,"instruction":"Bring dashi to a simmer; season with soy, mirin, a pinch of sugar.","time_minutes":5},
   {"step_number":2,"instruction":"Cook udon noodles in a separate pot of water 8–10 min until tender; drain.","time_minutes":10},
   {"step_number":3,"instruction":"Divide noodles into bowls. Pour hot broth over.","time_minutes":2},
   {"step_number":4,"instruction":"Top with sliced spring onion, naruto fish cake, a tempura piece, soft-boiled egg, shichimi. Serve immediately.","time_minutes":3}]'::jsonb),

('e0000001-0000-0000-0000-00000000000f','Okonomiyaki','Japanese','Easy',10,15,2,
 '[{"step_number":1,"instruction":"Whisk batter: 1 cup flour, 3/4 cup dashi, 1 egg, grated nagaimo (yam) if available, salt. Stir in shredded cabbage and spring onion.","time_minutes":8},
   {"step_number":2,"instruction":"Heat oil on a flat pan. Pour a thick disc of batter; lay strips of pork belly on top.","time_minutes":3},
   {"step_number":3,"instruction":"Cook 5 min until bottom is set; flip and cook 5 min covered. Flip again for a final crisp 1 min.","time_minutes":11},
   {"step_number":4,"instruction":"Top with okonomi sauce, Kewpie mayo, bonito flakes (dancing), aonori. Serve immediately.","time_minutes":2}]'::jsonb),

-- ─── Mediterranean ─────────────────────────────────────────────────────────
('e0000002-0000-0000-0000-000000000001','Mediterranean Lemon Chicken','Mediterranean','Easy',15,40,4,
 '[{"step_number":1,"instruction":"Pat dry bone-in chicken thighs. Mix marinade: olive oil, lemon juice + zest, minced garlic, oregano, paprika, salt, pepper.","time_minutes":8},
   {"step_number":2,"instruction":"Rub chicken thoroughly. Marinate 15 min while oven preheats to 200°C.","time_minutes":15},
   {"step_number":3,"instruction":"Place chicken skin-up in a roasting pan with halved lemons, baby potatoes, olives, cherry tomatoes.","time_minutes":5},
   {"step_number":4,"instruction":"Roast 35–40 min until skin is golden and chicken reads 75°C inside. Drizzle pan juices; finish with parsley and feta.","time_minutes":40}]'::jsonb),

('e0000002-0000-0000-0000-000000000002','Spanakopita','Mediterranean','Medium',20,40,8,
 '[{"step_number":1,"instruction":"Sauté finely chopped onion and dill in olive oil. Add wilted/drained spinach, season.","time_minutes":12},
   {"step_number":2,"instruction":"Combine cooled spinach with crumbled feta, ricotta, beaten egg, lots of black pepper, nutmeg.","time_minutes":5},
   {"step_number":3,"instruction":"Layer 6 phyllo sheets in a buttered pan, brushing each with butter. Spread filling. Top with 6 more buttered phyllo sheets, scoring the top.","time_minutes":12},
   {"step_number":4,"instruction":"Bake at 180°C for 35 min until golden and crisp. Cool 10 min before cutting.","time_minutes":40}]'::jsonb),

('e0000002-0000-0000-0000-000000000003','Tzatziki','Mediterranean','Easy',15,0,4,
 '[{"step_number":1,"instruction":"Grate 1 cucumber. Salt and rest in a sieve 10 min, then squeeze dry.","time_minutes":12},
   {"step_number":2,"instruction":"Mix the cucumber with 2 cups thick Greek yogurt.","time_minutes":2},
   {"step_number":3,"instruction":"Stir in minced garlic, chopped dill, a splash of red wine vinegar or lemon, olive oil, salt and pepper.","time_minutes":3},
   {"step_number":4,"instruction":"Chill 30 min so flavors meld. Drizzle with olive oil and serve with pita.","time_minutes":1}]'::jsonb),

('e0000002-0000-0000-0000-000000000004','Baba Ganoush','Mediterranean','Easy',5,30,4,
 '[{"step_number":1,"instruction":"Char 2 eggplants directly over a flame (or roast at 230°C 30 min) until skin is blistered and flesh is collapsed.","time_minutes":30},
   {"step_number":2,"instruction":"Cool, peel and drain the flesh in a sieve 10 min.","time_minutes":12},
   {"step_number":3,"instruction":"Mash with tahini, lemon juice, minced garlic, salt, a pinch of cumin.","time_minutes":5},
   {"step_number":4,"instruction":"Plate, swirl, drizzle olive oil, sprinkle smoked paprika, parsley, pomegranate seeds. Serve with pita.","time_minutes":2}]'::jsonb),

('e0000002-0000-0000-0000-000000000005','Moussaka','Mediterranean','Hard',30,90,8,
 '[{"step_number":1,"instruction":"Slice eggplants 1cm; salt, rest 20 min, dry. Fry in olive oil till golden; drain.","time_minutes":35},
   {"step_number":2,"instruction":"Make meat sauce: brown ground lamb (or beef); add onion, garlic, cinnamon, allspice, oregano, red wine, tomato. Simmer 25 min.","time_minutes":30},
   {"step_number":3,"instruction":"Make béchamel: melt butter, whisk flour, add milk in stages to thick; off heat add yolk + grated kefalotyri/parmesan + nutmeg.","time_minutes":12},
   {"step_number":4,"instruction":"Layer in baking dish: potato slices, eggplant, meat sauce; cover with béchamel + extra cheese. Bake at 180°C for 45 min until deep golden. Rest 20 min.","time_minutes":50}]'::jsonb),

('e0000002-0000-0000-0000-000000000006','Pastitsio','Mediterranean','Hard',25,75,8,
 '[{"step_number":1,"instruction":"Cook bucatini or pastitsio pasta to just shy of al dente; drain, toss with egg + grated cheese.","time_minutes":15},
   {"step_number":2,"instruction":"Brown ground beef with onion, garlic, tomato passata, red wine, cinnamon, allspice, oregano; simmer 25 min.","time_minutes":30},
   {"step_number":3,"instruction":"Make béchamel: butter, flour, milk, salt, nutmeg. Off heat: yolks, grated cheese.","time_minutes":12},
   {"step_number":4,"instruction":"Layer: pasta, meat sauce, more pasta, all the béchamel + cheese top. Bake at 180°C for 45 min until golden. Cool 20 min before cutting.","time_minutes":45}]'::jsonb),

('e0000002-0000-0000-0000-000000000007','Pork Souvlaki','Mediterranean','Easy',60,15,4,
 '[{"step_number":1,"instruction":"Cube pork shoulder. Marinate in olive oil, lemon juice, oregano, garlic, salt, pepper for at least 1 hour.","time_minutes":65},
   {"step_number":2,"instruction":"Thread cubes onto soaked wooden skewers.","time_minutes":5},
   {"step_number":3,"instruction":"Grill over high heat 3–4 min per side until charred outside and juicy inside.","time_minutes":12},
   {"step_number":4,"instruction":"Serve in warm pita with tzatziki, red onion, tomato, cucumber.","time_minutes":3}]'::jsonb),

('e0000002-0000-0000-0000-000000000008','Chicken Gyros','Mediterranean','Medium',60,20,4,
 '[{"step_number":1,"instruction":"Slice chicken thighs thin. Marinate in olive oil, lemon juice, garlic, oregano, paprika, cumin, salt for 1 hour.","time_minutes":65},
   {"step_number":2,"instruction":"Heat a heavy skillet hot. Cook chicken in a single layer 4 min per side until charred and cooked through. Rest, slice.","time_minutes":12},
   {"step_number":3,"instruction":"Warm pita on a dry pan or under a broiler.","time_minutes":3},
   {"step_number":4,"instruction":"Fill pita with chicken, tzatziki, sliced tomato, red onion, lettuce, a drizzle of olive oil. Optional fries inside.","time_minutes":3}]'::jsonb),

('e0000002-0000-0000-0000-000000000009','Avgolemono Soup','Mediterranean','Easy',10,30,4,
 '[{"step_number":1,"instruction":"Simmer chicken stock with bone-in chicken pieces and bay leaf 25 min. Remove chicken, shred. Strain stock.","time_minutes":30},
   {"step_number":2,"instruction":"Bring stock back to a simmer with orzo or rice; cook till tender.","time_minutes":12},
   {"step_number":3,"instruction":"Whisk 3 eggs with juice of 2 lemons in a bowl. Slowly ladle in hot stock while whisking constantly to temper.","time_minutes":3},
   {"step_number":4,"instruction":"Pour the tempered egg mix back into the pot off the heat, stirring. Return shredded chicken. Season; serve with dill.","time_minutes":2}]'::jsonb),

('e0000002-0000-0000-0000-00000000000a','Mediterranean Salmon','Mediterranean','Easy',10,20,4,
 '[{"step_number":1,"instruction":"Pat salmon fillets dry. Rub with olive oil, garlic, lemon zest, oregano, salt, pepper.","time_minutes":7},
   {"step_number":2,"instruction":"Arrange in a baking dish with halved cherry tomatoes, olives, capers, sliced red onion.","time_minutes":5},
   {"step_number":3,"instruction":"Drizzle olive oil and lemon juice. Roast at 200°C for 14–16 min until salmon flakes.","time_minutes":16},
   {"step_number":4,"instruction":"Top with crumbled feta and fresh parsley/dill. Serve with couscous or pita.","time_minutes":2}]'::jsonb),

('e0000002-0000-0000-0000-00000000000b','Stuffed Grape Leaves','Mediterranean','Medium',30,60,6,
 '[{"step_number":1,"instruction":"Rinse jarred grape leaves. Mix filling: short-grain rice, chopped onion, dill, mint, parsley, lemon juice, olive oil, pine nuts, salt.","time_minutes":15},
   {"step_number":2,"instruction":"Place a teaspoon of filling on each leaf (rough side up); fold sides in, roll tightly into thin cigars.","time_minutes":25},
   {"step_number":3,"instruction":"Line the bottom of a pot with extra leaves; pack the rolls seam-side down. Add lemon juice + olive oil + 1 cup water + a plate to weigh them down.","time_minutes":8},
   {"step_number":4,"instruction":"Simmer covered 50 min until rice is tender. Cool in the pot. Serve at room temp or chilled with yogurt.","time_minutes":50}]'::jsonb),

('e0000002-0000-0000-0000-00000000000c','Lamb Kofta','Mediterranean','Easy',20,15,4,
 '[{"step_number":1,"instruction":"Combine ground lamb with grated onion (squeezed dry), garlic, cumin, coriander, paprika, cinnamon, salt, parsley, mint, breadcrumb.","time_minutes":12},
   {"step_number":2,"instruction":"Knead well and chill 15 min. Shape into 12 long cigars or oval patties around skewers.","time_minutes":18},
   {"step_number":3,"instruction":"Grill over high heat 4 min per side, or pan-sear with a little oil.","time_minutes":10},
   {"step_number":4,"instruction":"Serve with warm pita, tzatziki, tomato salad, red onion, sumac.","time_minutes":3}]'::jsonb),

('e0000002-0000-0000-0000-00000000000d','Ratatouille','Mediterranean','Easy',20,50,6,
 '[{"step_number":1,"instruction":"Dice eggplant, zucchini, bell peppers, onion. Crush garlic. Score and peel tomatoes (or use canned diced).","time_minutes":18},
   {"step_number":2,"instruction":"In olive oil, sauté each vegetable separately till browned and slightly soft; remove. Sauté onion + garlic till soft.","time_minutes":20},
   {"step_number":3,"instruction":"Add tomato + thyme + bay + salt; simmer 10 min. Return all the sautéed veg.","time_minutes":12},
   {"step_number":4,"instruction":"Simmer covered 25 min on low. Finish with torn basil and a drizzle of olive oil. Serve warm or at room temp.","time_minutes":25}]'::jsonb),

('e0000002-0000-0000-0000-00000000000e','Baklava','Mediterranean','Hard',30,45,16,
 '[{"step_number":1,"instruction":"Make syrup: simmer 1.5 cups sugar with 1 cup water + lemon juice + a strip of zest for 15 min. Cool completely.","time_minutes":20},
   {"step_number":2,"instruction":"Pulse pistachios + walnuts coarse with cinnamon and a pinch of sugar.","time_minutes":5},
   {"step_number":3,"instruction":"Layer phyllo in a buttered pan: 8 sheets brushed with melted butter, then a thin layer of nuts; repeat for 5 nut layers, ending with 8 buttered sheets on top.","time_minutes":20},
   {"step_number":4,"instruction":"Score top into diamonds. Bake at 175°C for 45 min until golden. Immediately pour cooled syrup over hot baklava. Rest at least 4 hours before serving.","time_minutes":250}]'::jsonb),

('e0000002-0000-0000-0000-00000000000f','Mediterranean Couscous Salad','Mediterranean','Easy',10,10,4,
 '[{"step_number":1,"instruction":"Pour 1.5 cups boiling water + salt + olive oil + lemon zest over 1 cup couscous. Cover 5 min, then fluff.","time_minutes":10},
   {"step_number":2,"instruction":"Dice cucumber, cherry tomato, red onion, bell pepper. Crumble feta. Chop parsley, mint, dill.","time_minutes":8},
   {"step_number":3,"instruction":"Whisk dressing: olive oil, lemon juice, garlic, oregano, salt, pepper.","time_minutes":2},
   {"step_number":4,"instruction":"Toss couscous with veg, herbs, olives, feta. Pour dressing, toss again, taste, adjust salt/lemon. Serve at room temp.","time_minutes":3}]'::jsonb),

-- ─── Indo-Chinese ──────────────────────────────────────────────────────────
('e0000003-0000-0000-0000-000000000001','Veg Manchurian','Indo-Chinese','Medium',20,20,4,
 '[{"step_number":1,"instruction":"Make balls: combine finely chopped cabbage, carrot, capsicum, green chilli, ginger, garlic, salt, pepper with cornflour + maida. Squeeze water from cabbage first.","time_minutes":15},
   {"step_number":2,"instruction":"Shape walnut-size balls. Deep-fry in hot oil till deeply golden and crisp; drain.","time_minutes":12},
   {"step_number":3,"instruction":"Sauce: in oil, stir-fry ginger, garlic, green chilli, finely chopped spring onion whites. Add soy, vinegar, green chilli sauce, tomato ketchup, water, salt.","time_minutes":5},
   {"step_number":4,"instruction":"Thicken with cornstarch slurry. Add fried balls just before serving (so they stay crisp) for dry, OR simmer 2 min for gravy. Garnish spring onion greens.","time_minutes":4}]'::jsonb),

('e0000003-0000-0000-0000-000000000002','Chicken 65','Indo-Chinese','Medium',30,15,4,
 '[{"step_number":1,"instruction":"Cube chicken thigh. Marinate in yogurt, ginger-garlic paste, red chilli, garam masala, salt, lemon, cornstarch, rice flour. Rest 20 min.","time_minutes":25},
   {"step_number":2,"instruction":"Deep-fry the marinated chicken at 180°C till crisp; drain.","time_minutes":8},
   {"step_number":3,"instruction":"In a wok, splutter curry leaves + chopped green chillies + garlic in 2 tbsp oil. Add a tablespoon of yogurt + red chilli powder + a splash of water.","time_minutes":3},
   {"step_number":4,"instruction":"Toss fried chicken in this fiery sauce 1 min till coated. Serve hot with onion rings and lemon.","time_minutes":2}]'::jsonb),

('e0000003-0000-0000-0000-000000000003','Chilli Chicken','Indo-Chinese','Medium',20,15,4,
 '[{"step_number":1,"instruction":"Marinate chicken cubes in soy, salt, white pepper, egg, cornstarch, ginger-garlic 15 min.","time_minutes":15},
   {"step_number":2,"instruction":"Deep-fry till crisp; drain.","time_minutes":8},
   {"step_number":3,"instruction":"In hot oil, stir-fry ginger, garlic, green chillies, onion chunks, capsicum chunks. Add soy, green chilli sauce, vinegar, sugar, ketchup.","time_minutes":4},
   {"step_number":4,"instruction":"Thicken with cornstarch slurry. Toss chicken in; finish with spring onion greens. Serve dry or with a little gravy.","time_minutes":3}]'::jsonb),

('e0000003-0000-0000-0000-000000000004','Chicken Lollipop','Indo-Chinese','Medium',30,20,4,
 '[{"step_number":1,"instruction":"Buy or shape frenched chicken winglets/drumettes into lollipops (push meat down to expose a clean bone).","time_minutes":15},
   {"step_number":2,"instruction":"Marinate in ginger-garlic, red chilli, soy, salt, vinegar, egg, cornstarch, rice flour. Rest 20 min.","time_minutes":25},
   {"step_number":3,"instruction":"Deep-fry at 170°C in batches till crisp and cooked, 6 min.","time_minutes":12},
   {"step_number":4,"instruction":"Optional toss in a hot-and-sweet schezwan sauce. Serve with mint chutney + onion rings.","time_minutes":3}]'::jsonb),

('e0000003-0000-0000-0000-000000000005','Manchow Soup','Indo-Chinese','Easy',10,15,4,
 '[{"step_number":1,"instruction":"Finely chop carrot, cabbage, capsicum, spring onion, mushroom. Crush garlic and ginger.","time_minutes":10},
   {"step_number":2,"instruction":"In oil, stir-fry ginger, garlic. Add vegetables; toss 2 min. Add soy, vinegar, chilli sauce, white pepper, salt and 4 cups stock.","time_minutes":6},
   {"step_number":3,"instruction":"Simmer 5 min. Thicken with cornstarch slurry; adjust seasoning.","time_minutes":4},
   {"step_number":4,"instruction":"Serve hot topped with crispy fried noodles, chopped spring onion greens.","time_minutes":2}]'::jsonb),

('e0000003-0000-0000-0000-000000000006','Honey Chilli Potato','Indo-Chinese','Easy',15,15,4,
 '[{"step_number":1,"instruction":"Cut potatoes into thin batons. Soak in cold water 10 min to remove starch; pat dry. Toss with cornflour + salt.","time_minutes":15},
   {"step_number":2,"instruction":"Deep-fry twice: first at 160°C till light gold, then at 180°C till crisp.","time_minutes":12},
   {"step_number":3,"instruction":"In oil, stir-fry chopped garlic, sliced red chilli, capsicum chunks. Add soy, vinegar, red chilli sauce, ketchup, honey, salt.","time_minutes":3},
   {"step_number":4,"instruction":"Thicken with cornflour slurry. Toss the crisp potatoes; sprinkle sesame seeds and spring onion. Serve immediately.","time_minutes":2}]'::jsonb),

('e0000003-0000-0000-0000-000000000007','Chicken Schezwan','Indo-Chinese','Medium',15,20,4,
 '[{"step_number":1,"instruction":"Marinate chicken strips in soy, salt, white pepper, egg, cornstarch. Deep-fry till crisp.","time_minutes":20},
   {"step_number":2,"instruction":"Make/use schezwan sauce: ground soaked dried red chillies + garlic + ginger + onion + soy + vinegar + sugar — fried in oil till deeply fragrant.","time_minutes":8},
   {"step_number":3,"instruction":"Stir-fry diced onion, capsicum, spring onion whites. Add schezwan sauce + a little stock + cornstarch slurry; bring to a glossy simmer.","time_minutes":5},
   {"step_number":4,"instruction":"Toss fried chicken in. Garnish with spring onion greens. Serve over noodles or rice.","time_minutes":3}]'::jsonb),

('e0000003-0000-0000-0000-000000000008','American Chopsuey','Indo-Chinese','Easy',15,20,4,
 '[{"step_number":1,"instruction":"Cook noodles; toss with a little oil and spread to crisp under broiler (or deep-fry till crispy). Set aside.","time_minutes":12},
   {"step_number":2,"instruction":"Stir-fry julienned veg (carrot, capsicum, cabbage, beans, onion) + chicken if using. Add salt, white pepper.","time_minutes":6},
   {"step_number":3,"instruction":"Add ketchup, soy, vinegar, sugar, a little chilli sauce; pour in stock or water.","time_minutes":3},
   {"step_number":4,"instruction":"Thicken with cornstarch slurry. Ladle over crispy noodles. Top with fried egg if you like. Garnish spring onion.","time_minutes":4}]'::jsonb),

('e0000003-0000-0000-0000-000000000009','Dragon Chicken','Indo-Chinese','Medium',20,20,4,
 '[{"step_number":1,"instruction":"Cut chicken into strips. Marinate in soy, ginger-garlic, white pepper, egg, cornstarch.","time_minutes":15},
   {"step_number":2,"instruction":"Deep-fry till crisp; drain.","time_minutes":10},
   {"step_number":3,"instruction":"Stir-fry sliced garlic, ginger, dried red chillies, capsicum, onion, cashews in oil.","time_minutes":4},
   {"step_number":4,"instruction":"Add tomato puree + soy + vinegar + sugar + red chilli sauce + cornstarch slurry. Toss chicken till glossy and coated. Garnish spring onion.","time_minutes":4}]'::jsonb),

('e0000003-0000-0000-0000-00000000000a','Sweet Corn Soup','Indo-Chinese','Easy',5,15,4,
 '[{"step_number":1,"instruction":"Pulse 1 cup boiled corn coarse; reserve the rest whole.","time_minutes":4},
   {"step_number":2,"instruction":"Bring 4 cups chicken/veg stock to a simmer. Stir in the corn (puree + whole), salt, white pepper, a touch of sugar.","time_minutes":6},
   {"step_number":3,"instruction":"Thicken with cornstarch slurry. Stream in a beaten egg for ribbons (optional).","time_minutes":3},
   {"step_number":4,"instruction":"Serve with green chilli vinegar, soy, and chopped spring onion at the table.","time_minutes":2}]'::jsonb),

('e0000003-0000-0000-0000-00000000000b','Chilli Garlic Noodles','Indo-Chinese','Easy',10,10,3,
 '[{"step_number":1,"instruction":"Boil noodles per package; drain and toss with sesame oil.","time_minutes":8},
   {"step_number":2,"instruction":"In smoking-hot oil, stir-fry lots of chopped garlic till just golden. Add red chilli flakes, sliced fresh red chilli.","time_minutes":2},
   {"step_number":3,"instruction":"Add julienned cabbage + spring onion whites; toss on high 1 min.","time_minutes":2},
   {"step_number":4,"instruction":"Add noodles + soy + a dash of vinegar + salt. Toss until everything is hot and aromatic. Garnish spring onion greens.","time_minutes":3}]'::jsonb),

('e0000003-0000-0000-0000-00000000000c','Crispy Chilli Baby Corn','Indo-Chinese','Easy',10,15,4,
 '[{"step_number":1,"instruction":"Slit baby corn lengthwise. Whisk a batter of cornflour, maida, salt, white pepper, soy, water — thick coating consistency.","time_minutes":7},
   {"step_number":2,"instruction":"Dip baby corn in batter, deep-fry in batches till crisp golden; drain.","time_minutes":10},
   {"step_number":3,"instruction":"In a wok, stir-fry chopped garlic, ginger, green chilli, capsicum, onion. Add soy, vinegar, sugar, red chilli sauce, ketchup.","time_minutes":4},
   {"step_number":4,"instruction":"Thicken with cornflour slurry. Toss baby corn in. Garnish sesame + spring onion. Serve immediately.","time_minutes":3}]'::jsonb)

ON CONFLICT (id) DO NOTHING;


-- ═══ NUTRITION ═════════════════════════════════════════════════════════════
INSERT INTO recipe_nutrition (recipe_id, calories, protein_g, carbs_g, fat_g, fiber_g, sodium_mg) VALUES
-- Japanese
('e0000001-0000-0000-0000-000000000001', 620, 35, 70, 22, 3, 1480),  -- Tonkotsu Ramen
('e0000001-0000-0000-0000-000000000002', 580, 28, 65, 22, 4, 1380),  -- Miso Ramen
('e0000001-0000-0000-0000-000000000003', 520, 30, 65, 16, 3, 1320),  -- Shoyu Ramen
('e0000001-0000-0000-0000-000000000004', 380, 18, 55, 9, 2, 520),    -- Salmon Sushi Roll
('e0000001-0000-0000-0000-000000000005', 320, 10, 52, 9, 3, 480),    -- California Roll
('e0000001-0000-0000-0000-000000000006', 480, 20, 38, 28, 4, 580),   -- Tempura
('e0000001-0000-0000-0000-000000000007', 320, 32, 12, 16, 1, 820),   -- Yakitori
('e0000001-0000-0000-0000-000000000008', 320, 18, 32, 14, 2, 720),   -- Gyoza
('e0000001-0000-0000-0000-000000000009', 220, 6, 42, 3, 1, 380),     -- Onigiri
('e0000001-0000-0000-0000-00000000000a', 520, 35, 38, 24, 2, 780),   -- Tonkatsu
('e0000001-0000-0000-0000-00000000000b', 520, 28, 65, 14, 2, 920),   -- Oyakodon
('e0000001-0000-0000-0000-00000000000c', 720, 38, 70, 30, 3, 1080),  -- Katsudon
('e0000001-0000-0000-0000-00000000000d', 420, 16, 55, 14, 4, 920),   -- Yaki Soba
('e0000001-0000-0000-0000-00000000000e', 380, 14, 60, 8, 3, 980),    -- Udon Soup
('e0000001-0000-0000-0000-00000000000f', 480, 20, 45, 22, 5, 1120),  -- Okonomiyaki

-- Mediterranean
('e0000002-0000-0000-0000-000000000001', 480, 38, 18, 28, 3, 680),   -- Med Lemon Chicken
('e0000002-0000-0000-0000-000000000002', 380, 14, 28, 22, 3, 720),   -- Spanakopita
('e0000002-0000-0000-0000-000000000003', 120, 6, 8, 7, 1, 320),      -- Tzatziki
('e0000002-0000-0000-0000-000000000004', 180, 4, 14, 12, 6, 380),    -- Baba Ganoush
('e0000002-0000-0000-0000-000000000005', 580, 32, 32, 32, 6, 820),   -- Moussaka
('e0000002-0000-0000-0000-000000000006', 620, 28, 55, 30, 3, 920),   -- Pastitsio
('e0000002-0000-0000-0000-000000000007', 380, 32, 28, 16, 2, 680),   -- Pork Souvlaki
('e0000002-0000-0000-0000-000000000008', 420, 35, 32, 18, 3, 820),   -- Chicken Gyros
('e0000002-0000-0000-0000-000000000009', 280, 18, 28, 9, 1, 880),    -- Avgolemono
('e0000002-0000-0000-0000-00000000000a', 420, 35, 8, 26, 2, 680),    -- Med Salmon
('e0000002-0000-0000-0000-00000000000b', 280, 6, 38, 14, 4, 580),    -- Stuffed Grape Leaves
('e0000002-0000-0000-0000-00000000000c', 380, 28, 14, 24, 2, 720),   -- Lamb Kofta
('e0000002-0000-0000-0000-00000000000d', 180, 4, 22, 9, 6, 480),     -- Ratatouille
('e0000002-0000-0000-0000-00000000000e', 380, 6, 48, 20, 2, 80),     -- Baklava
('e0000002-0000-0000-0000-00000000000f', 320, 10, 45, 12, 4, 580),   -- Med Couscous Salad

-- Indo-Chinese
('e0000003-0000-0000-0000-000000000001', 380, 8, 38, 22, 5, 880),    -- Veg Manchurian
('e0000003-0000-0000-0000-000000000002', 380, 30, 14, 22, 1, 820),   -- Chicken 65
('e0000003-0000-0000-0000-000000000003', 420, 32, 18, 24, 2, 920),   -- Chilli Chicken
('e0000003-0000-0000-0000-000000000004', 420, 32, 16, 26, 1, 880),   -- Chicken Lollipop
('e0000003-0000-0000-0000-000000000005', 180, 6, 22, 8, 3, 920),     -- Manchow Soup
('e0000003-0000-0000-0000-000000000006', 380, 5, 48, 18, 4, 720),    -- Honey Chilli Potato
('e0000003-0000-0000-0000-000000000007', 480, 32, 22, 28, 2, 1120),  -- Chicken Schezwan
('e0000003-0000-0000-0000-000000000008', 480, 18, 55, 20, 4, 980),   -- American Chopsuey
('e0000003-0000-0000-0000-000000000009', 480, 32, 22, 28, 2, 1020),  -- Dragon Chicken
('e0000003-0000-0000-0000-00000000000a', 180, 6, 28, 5, 3, 720),     -- Sweet Corn Soup
('e0000003-0000-0000-0000-00000000000b', 380, 10, 50, 14, 4, 820),   -- Chilli Garlic Noodles
('e0000003-0000-0000-0000-00000000000c', 320, 6, 32, 18, 3, 820)     -- Crispy Chilli Baby Corn

ON CONFLICT (recipe_id) DO NOTHING;


-- ═══ INGREDIENTS ═══════════════════════════════════════════════════════════
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit) VALUES
-- Japanese: Tonkotsu Ramen
('e0000001-0000-0000-0000-000000000001','pork bones',2,'kg'),
('e0000001-0000-0000-0000-000000000001','ramen noodles',400,'g'),
('e0000001-0000-0000-0000-000000000001','chashu pork',300,'g'),
('e0000001-0000-0000-0000-000000000001','eggs',4,'units'),
('e0000001-0000-0000-0000-000000000001','soy sauce',60,'ml'),
('e0000001-0000-0000-0000-000000000001','mirin',30,'ml'),
('e0000001-0000-0000-0000-000000000001','scallion',4,'units'),
('e0000001-0000-0000-0000-000000000001','nori',4,'sheets'),
('e0000001-0000-0000-0000-000000000001','bamboo shoots',100,'g'),
-- Miso Ramen
('e0000001-0000-0000-0000-000000000002','ramen noodles',400,'g'),
('e0000001-0000-0000-0000-000000000002','miso paste',80,'g'),
('e0000001-0000-0000-0000-000000000002','garlic',4,'cloves'),
('e0000001-0000-0000-0000-000000000002','ginger',20,'g'),
('e0000001-0000-0000-0000-000000000002','sesame paste',2,'tbsp'),
('e0000001-0000-0000-0000-000000000002','chicken stock',1.5,'l'),
('e0000001-0000-0000-0000-000000000002','bean sprouts',150,'g'),
('e0000001-0000-0000-0000-000000000002','corn',100,'g'),
('e0000001-0000-0000-0000-000000000002','butter',30,'g'),
('e0000001-0000-0000-0000-000000000002','scallion',4,'units'),
-- Shoyu Ramen
('e0000001-0000-0000-0000-000000000003','ramen noodles',400,'g'),
('e0000001-0000-0000-0000-000000000003','soy sauce',100,'ml'),
('e0000001-0000-0000-0000-000000000003','mirin',50,'ml'),
('e0000001-0000-0000-0000-000000000003','sake',50,'ml'),
('e0000001-0000-0000-0000-000000000003','chicken stock',1.5,'l'),
('e0000001-0000-0000-0000-000000000003','chashu pork',200,'g'),
('e0000001-0000-0000-0000-000000000003','eggs',4,'units'),
('e0000001-0000-0000-0000-000000000003','nori',4,'sheets'),
('e0000001-0000-0000-0000-000000000003','scallion',4,'units'),
-- Salmon Sushi Roll
('e0000001-0000-0000-0000-000000000004','sushi rice',2,'cups'),
('e0000001-0000-0000-0000-000000000004','rice vinegar',60,'ml'),
('e0000001-0000-0000-0000-000000000004','sugar',2,'tbsp'),
('e0000001-0000-0000-0000-000000000004','salmon',200,'g'),
('e0000001-0000-0000-0000-000000000004','nori',3,'sheets'),
('e0000001-0000-0000-0000-000000000004','cucumber',1,'medium'),
('e0000001-0000-0000-0000-000000000004','avocado',1,'medium'),
('e0000001-0000-0000-0000-000000000004','soy sauce',60,'ml'),
('e0000001-0000-0000-0000-000000000004','wasabi',1,'tsp'),
-- California Roll
('e0000001-0000-0000-0000-000000000005','sushi rice',2,'cups'),
('e0000001-0000-0000-0000-000000000005','rice vinegar',60,'ml'),
('e0000001-0000-0000-0000-000000000005','imitation crab',200,'g'),
('e0000001-0000-0000-0000-000000000005','mayonnaise',3,'tbsp'),
('e0000001-0000-0000-0000-000000000005','cucumber',1,'medium'),
('e0000001-0000-0000-0000-000000000005','avocado',1,'medium'),
('e0000001-0000-0000-0000-000000000005','sesame seeds',2,'tbsp'),
('e0000001-0000-0000-0000-000000000005','nori',3,'sheets'),
-- Tempura
('e0000001-0000-0000-0000-000000000006','shrimp',300,'g'),
('e0000001-0000-0000-0000-000000000006','sweet potato',1,'medium'),
('e0000001-0000-0000-0000-000000000006','eggplant',1,'small'),
('e0000001-0000-0000-0000-000000000006','green beans',100,'g'),
('e0000001-0000-0000-0000-000000000006','flour',1,'cup'),
('e0000001-0000-0000-0000-000000000006','ice water',1,'cup'),
('e0000001-0000-0000-0000-000000000006','egg',1,'units'),
('e0000001-0000-0000-0000-000000000006','vegetable oil',1,'l'),
('e0000001-0000-0000-0000-000000000006','soy sauce',60,'ml'),
('e0000001-0000-0000-0000-000000000006','dashi',200,'ml'),
-- Yakitori
('e0000001-0000-0000-0000-000000000007','chicken thigh',600,'g'),
('e0000001-0000-0000-0000-000000000007','scallion',8,'units'),
('e0000001-0000-0000-0000-000000000007','soy sauce',100,'ml'),
('e0000001-0000-0000-0000-000000000007','mirin',80,'ml'),
('e0000001-0000-0000-0000-000000000007','sake',50,'ml'),
('e0000001-0000-0000-0000-000000000007','sugar',2,'tbsp'),
('e0000001-0000-0000-0000-000000000007','shichimi togarashi',1,'tsp'),
-- Gyoza
('e0000001-0000-0000-0000-000000000008','gyoza wrappers',24,'units'),
('e0000001-0000-0000-0000-000000000008','ground pork',300,'g'),
('e0000001-0000-0000-0000-000000000008','cabbage',150,'g'),
('e0000001-0000-0000-0000-000000000008','garlic',3,'cloves'),
('e0000001-0000-0000-0000-000000000008','ginger',20,'g'),
('e0000001-0000-0000-0000-000000000008','scallion',2,'units'),
('e0000001-0000-0000-0000-000000000008','soy sauce',2,'tbsp'),
('e0000001-0000-0000-0000-000000000008','sesame oil',1,'tbsp'),
-- Onigiri
('e0000001-0000-0000-0000-000000000009','japanese short-grain rice',2,'cups'),
('e0000001-0000-0000-0000-000000000009','nori',2,'sheets'),
('e0000001-0000-0000-0000-000000000009','salt',1,'tsp'),
('e0000001-0000-0000-0000-000000000009','umeboshi',4,'units'),
('e0000001-0000-0000-0000-000000000009','tuna',100,'g'),
('e0000001-0000-0000-0000-000000000009','mayonnaise',2,'tbsp'),
-- Tonkatsu
('e0000001-0000-0000-0000-00000000000a','pork loin',600,'g'),
('e0000001-0000-0000-0000-00000000000a','panko breadcrumbs',1.5,'cups'),
('e0000001-0000-0000-0000-00000000000a','flour',0.5,'cup'),
('e0000001-0000-0000-0000-00000000000a','egg',2,'units'),
('e0000001-0000-0000-0000-00000000000a','cabbage',200,'g'),
('e0000001-0000-0000-0000-00000000000a','tonkatsu sauce',100,'ml'),
('e0000001-0000-0000-0000-00000000000a','vegetable oil',500,'ml'),
-- Oyakodon
('e0000001-0000-0000-0000-00000000000b','chicken thigh',300,'g'),
('e0000001-0000-0000-0000-00000000000b','onion',1,'medium'),
('e0000001-0000-0000-0000-00000000000b','eggs',4,'units'),
('e0000001-0000-0000-0000-00000000000b','dashi',300,'ml'),
('e0000001-0000-0000-0000-00000000000b','soy sauce',3,'tbsp'),
('e0000001-0000-0000-0000-00000000000b','mirin',3,'tbsp'),
('e0000001-0000-0000-0000-00000000000b','rice',2,'cups'),
-- Katsudon
('e0000001-0000-0000-0000-00000000000c','pork loin',300,'g'),
('e0000001-0000-0000-0000-00000000000c','panko breadcrumbs',1,'cup'),
('e0000001-0000-0000-0000-00000000000c','egg',4,'units'),
('e0000001-0000-0000-0000-00000000000c','onion',1,'medium'),
('e0000001-0000-0000-0000-00000000000c','dashi',300,'ml'),
('e0000001-0000-0000-0000-00000000000c','soy sauce',3,'tbsp'),
('e0000001-0000-0000-0000-00000000000c','mirin',3,'tbsp'),
('e0000001-0000-0000-0000-00000000000c','rice',2,'cups'),
-- Yaki Soba
('e0000001-0000-0000-0000-00000000000d','yakisoba noodles',400,'g'),
('e0000001-0000-0000-0000-00000000000d','pork belly',200,'g'),
('e0000001-0000-0000-0000-00000000000d','cabbage',200,'g'),
('e0000001-0000-0000-0000-00000000000d','carrot',1,'medium'),
('e0000001-0000-0000-0000-00000000000d','bell pepper',1,'medium'),
('e0000001-0000-0000-0000-00000000000d','yakisoba sauce',100,'ml'),
('e0000001-0000-0000-0000-00000000000d','aonori',1,'tbsp'),
-- Udon Soup
('e0000001-0000-0000-0000-00000000000e','udon noodles',300,'g'),
('e0000001-0000-0000-0000-00000000000e','dashi',1,'l'),
('e0000001-0000-0000-0000-00000000000e','soy sauce',3,'tbsp'),
('e0000001-0000-0000-0000-00000000000e','mirin',2,'tbsp'),
('e0000001-0000-0000-0000-00000000000e','scallion',2,'units'),
('e0000001-0000-0000-0000-00000000000e','eggs',2,'units'),
-- Okonomiyaki
('e0000001-0000-0000-0000-00000000000f','flour',1,'cup'),
('e0000001-0000-0000-0000-00000000000f','cabbage',300,'g'),
('e0000001-0000-0000-0000-00000000000f','dashi',180,'ml'),
('e0000001-0000-0000-0000-00000000000f','eggs',2,'units'),
('e0000001-0000-0000-0000-00000000000f','pork belly',150,'g'),
('e0000001-0000-0000-0000-00000000000f','okonomi sauce',60,'ml'),
('e0000001-0000-0000-0000-00000000000f','mayonnaise',3,'tbsp'),
('e0000001-0000-0000-0000-00000000000f','bonito flakes',10,'g'),

-- Mediterranean: Lemon Chicken
('e0000002-0000-0000-0000-000000000001','chicken thighs',800,'g'),
('e0000002-0000-0000-0000-000000000001','olive oil',60,'ml'),
('e0000002-0000-0000-0000-000000000001','lemons',2,'units'),
('e0000002-0000-0000-0000-000000000001','garlic',5,'cloves'),
('e0000002-0000-0000-0000-000000000001','oregano',2,'tbsp'),
('e0000002-0000-0000-0000-000000000001','baby potatoes',500,'g'),
('e0000002-0000-0000-0000-000000000001','cherry tomatoes',200,'g'),
('e0000002-0000-0000-0000-000000000001','feta cheese',100,'g'),
('e0000002-0000-0000-0000-000000000001','kalamata olives',80,'g'),
-- Spanakopita
('e0000002-0000-0000-0000-000000000002','phyllo dough',1,'package'),
('e0000002-0000-0000-0000-000000000002','spinach',500,'g'),
('e0000002-0000-0000-0000-000000000002','feta cheese',300,'g'),
('e0000002-0000-0000-0000-000000000002','ricotta',150,'g'),
('e0000002-0000-0000-0000-000000000002','onion',1,'medium'),
('e0000002-0000-0000-0000-000000000002','butter',150,'g'),
('e0000002-0000-0000-0000-000000000002','dill',20,'g'),
('e0000002-0000-0000-0000-000000000002','eggs',2,'units'),
-- Tzatziki
('e0000002-0000-0000-0000-000000000003','greek yogurt',500,'g'),
('e0000002-0000-0000-0000-000000000003','cucumber',1,'large'),
('e0000002-0000-0000-0000-000000000003','garlic',3,'cloves'),
('e0000002-0000-0000-0000-000000000003','dill',15,'g'),
('e0000002-0000-0000-0000-000000000003','lemon juice',2,'tbsp'),
('e0000002-0000-0000-0000-000000000003','olive oil',2,'tbsp'),
-- Baba Ganoush
('e0000002-0000-0000-0000-000000000004','eggplant',2,'large'),
('e0000002-0000-0000-0000-000000000004','tahini',3,'tbsp'),
('e0000002-0000-0000-0000-000000000004','lemon juice',2,'tbsp'),
('e0000002-0000-0000-0000-000000000004','garlic',2,'cloves'),
('e0000002-0000-0000-0000-000000000004','olive oil',2,'tbsp'),
('e0000002-0000-0000-0000-000000000004','smoked paprika',1,'tsp'),
('e0000002-0000-0000-0000-000000000004','parsley',10,'g'),
-- Moussaka
('e0000002-0000-0000-0000-000000000005','eggplant',3,'large'),
('e0000002-0000-0000-0000-000000000005','potatoes',500,'g'),
('e0000002-0000-0000-0000-000000000005','ground lamb',500,'g'),
('e0000002-0000-0000-0000-000000000005','onion',2,'medium'),
('e0000002-0000-0000-0000-000000000005','tomato passata',400,'ml'),
('e0000002-0000-0000-0000-000000000005','red wine',125,'ml'),
('e0000002-0000-0000-0000-000000000005','butter',80,'g'),
('e0000002-0000-0000-0000-000000000005','flour',80,'g'),
('e0000002-0000-0000-0000-000000000005','milk',600,'ml'),
('e0000002-0000-0000-0000-000000000005','kefalotyri cheese',150,'g'),
-- Pastitsio
('e0000002-0000-0000-0000-000000000006','bucatini pasta',500,'g'),
('e0000002-0000-0000-0000-000000000006','ground beef',500,'g'),
('e0000002-0000-0000-0000-000000000006','tomato passata',400,'ml'),
('e0000002-0000-0000-0000-000000000006','onion',2,'medium'),
('e0000002-0000-0000-0000-000000000006','red wine',125,'ml'),
('e0000002-0000-0000-0000-000000000006','butter',80,'g'),
('e0000002-0000-0000-0000-000000000006','flour',80,'g'),
('e0000002-0000-0000-0000-000000000006','milk',700,'ml'),
('e0000002-0000-0000-0000-000000000006','parmesan',150,'g'),
('e0000002-0000-0000-0000-000000000006','cinnamon',1,'tsp'),
-- Pork Souvlaki
('e0000002-0000-0000-0000-000000000007','pork shoulder',700,'g'),
('e0000002-0000-0000-0000-000000000007','olive oil',60,'ml'),
('e0000002-0000-0000-0000-000000000007','lemon juice',60,'ml'),
('e0000002-0000-0000-0000-000000000007','oregano',2,'tbsp'),
('e0000002-0000-0000-0000-000000000007','garlic',4,'cloves'),
('e0000002-0000-0000-0000-000000000007','pita bread',4,'units'),
('e0000002-0000-0000-0000-000000000007','red onion',1,'medium'),
('e0000002-0000-0000-0000-000000000007','tomato',2,'medium'),
-- Chicken Gyros
('e0000002-0000-0000-0000-000000000008','chicken thighs',700,'g'),
('e0000002-0000-0000-0000-000000000008','olive oil',60,'ml'),
('e0000002-0000-0000-0000-000000000008','lemon juice',60,'ml'),
('e0000002-0000-0000-0000-000000000008','oregano',1,'tbsp'),
('e0000002-0000-0000-0000-000000000008','paprika',1,'tbsp'),
('e0000002-0000-0000-0000-000000000008','garlic',4,'cloves'),
('e0000002-0000-0000-0000-000000000008','pita bread',4,'units'),
('e0000002-0000-0000-0000-000000000008','tomato',2,'medium'),
('e0000002-0000-0000-0000-000000000008','red onion',1,'medium'),
('e0000002-0000-0000-0000-000000000008','tzatziki',200,'g'),
-- Avgolemono
('e0000002-0000-0000-0000-000000000009','chicken stock',1.5,'l'),
('e0000002-0000-0000-0000-000000000009','chicken thighs',400,'g'),
('e0000002-0000-0000-0000-000000000009','orzo pasta',150,'g'),
('e0000002-0000-0000-0000-000000000009','eggs',3,'units'),
('e0000002-0000-0000-0000-000000000009','lemons',2,'units'),
('e0000002-0000-0000-0000-000000000009','dill',10,'g'),
-- Med Salmon
('e0000002-0000-0000-0000-00000000000a','salmon fillets',600,'g'),
('e0000002-0000-0000-0000-00000000000a','cherry tomatoes',200,'g'),
('e0000002-0000-0000-0000-00000000000a','kalamata olives',80,'g'),
('e0000002-0000-0000-0000-00000000000a','capers',2,'tbsp'),
('e0000002-0000-0000-0000-00000000000a','red onion',1,'small'),
('e0000002-0000-0000-0000-00000000000a','olive oil',45,'ml'),
('e0000002-0000-0000-0000-00000000000a','lemon',1,'units'),
('e0000002-0000-0000-0000-00000000000a','feta',80,'g'),
('e0000002-0000-0000-0000-00000000000a','garlic',3,'cloves'),
-- Stuffed Grape Leaves
('e0000002-0000-0000-0000-00000000000b','grape leaves',40,'units'),
('e0000002-0000-0000-0000-00000000000b','short-grain rice',1,'cup'),
('e0000002-0000-0000-0000-00000000000b','onion',1,'medium'),
('e0000002-0000-0000-0000-00000000000b','dill',20,'g'),
('e0000002-0000-0000-0000-00000000000b','mint',15,'g'),
('e0000002-0000-0000-0000-00000000000b','parsley',20,'g'),
('e0000002-0000-0000-0000-00000000000b','olive oil',80,'ml'),
('e0000002-0000-0000-0000-00000000000b','lemon juice',60,'ml'),
('e0000002-0000-0000-0000-00000000000b','pine nuts',2,'tbsp'),
-- Lamb Kofta
('e0000002-0000-0000-0000-00000000000c','ground lamb',600,'g'),
('e0000002-0000-0000-0000-00000000000c','onion',1,'medium'),
('e0000002-0000-0000-0000-00000000000c','garlic',4,'cloves'),
('e0000002-0000-0000-0000-00000000000c','parsley',20,'g'),
('e0000002-0000-0000-0000-00000000000c','mint',10,'g'),
('e0000002-0000-0000-0000-00000000000c','cumin',1,'tbsp'),
('e0000002-0000-0000-0000-00000000000c','coriander',1,'tbsp'),
('e0000002-0000-0000-0000-00000000000c','breadcrumbs',50,'g'),
('e0000002-0000-0000-0000-00000000000c','pita bread',4,'units'),
-- Ratatouille
('e0000002-0000-0000-0000-00000000000d','eggplant',2,'medium'),
('e0000002-0000-0000-0000-00000000000d','zucchini',2,'medium'),
('e0000002-0000-0000-0000-00000000000d','bell pepper',2,'medium'),
('e0000002-0000-0000-0000-00000000000d','onion',2,'medium'),
('e0000002-0000-0000-0000-00000000000d','tomatoes',500,'g'),
('e0000002-0000-0000-0000-00000000000d','garlic',5,'cloves'),
('e0000002-0000-0000-0000-00000000000d','olive oil',80,'ml'),
('e0000002-0000-0000-0000-00000000000d','thyme',1,'tbsp'),
('e0000002-0000-0000-0000-00000000000d','basil',20,'g'),
-- Baklava
('e0000002-0000-0000-0000-00000000000e','phyllo dough',1,'package'),
('e0000002-0000-0000-0000-00000000000e','pistachios',200,'g'),
('e0000002-0000-0000-0000-00000000000e','walnuts',200,'g'),
('e0000002-0000-0000-0000-00000000000e','butter',300,'g'),
('e0000002-0000-0000-0000-00000000000e','sugar',300,'g'),
('e0000002-0000-0000-0000-00000000000e','lemon juice',2,'tbsp'),
('e0000002-0000-0000-0000-00000000000e','cinnamon',1,'tsp'),
-- Med Couscous Salad
('e0000002-0000-0000-0000-00000000000f','couscous',1,'cup'),
('e0000002-0000-0000-0000-00000000000f','cucumber',1,'medium'),
('e0000002-0000-0000-0000-00000000000f','cherry tomatoes',200,'g'),
('e0000002-0000-0000-0000-00000000000f','red onion',1,'small'),
('e0000002-0000-0000-0000-00000000000f','bell pepper',1,'medium'),
('e0000002-0000-0000-0000-00000000000f','feta cheese',100,'g'),
('e0000002-0000-0000-0000-00000000000f','kalamata olives',80,'g'),
('e0000002-0000-0000-0000-00000000000f','parsley',20,'g'),
('e0000002-0000-0000-0000-00000000000f','olive oil',60,'ml'),
('e0000002-0000-0000-0000-00000000000f','lemon juice',45,'ml'),

-- Indo-Chinese: Veg Manchurian
('e0000003-0000-0000-0000-000000000001','cabbage',200,'g'),
('e0000003-0000-0000-0000-000000000001','carrot',100,'g'),
('e0000003-0000-0000-0000-000000000001','bell pepper',1,'medium'),
('e0000003-0000-0000-0000-000000000001','cornflour',6,'tbsp'),
('e0000003-0000-0000-0000-000000000001','flour',3,'tbsp'),
('e0000003-0000-0000-0000-000000000001','soy sauce',2,'tbsp'),
('e0000003-0000-0000-0000-000000000001','vinegar',1,'tbsp'),
('e0000003-0000-0000-0000-000000000001','green chilli sauce',1,'tbsp'),
('e0000003-0000-0000-0000-000000000001','garlic',6,'cloves'),
('e0000003-0000-0000-0000-000000000001','spring onion',4,'units'),
-- Chicken 65
('e0000003-0000-0000-0000-000000000002','chicken thighs',600,'g'),
('e0000003-0000-0000-0000-000000000002','yogurt',3,'tbsp'),
('e0000003-0000-0000-0000-000000000002','ginger-garlic paste',2,'tbsp'),
('e0000003-0000-0000-0000-000000000002','red chilli powder',2,'tbsp'),
('e0000003-0000-0000-0000-000000000002','cornstarch',3,'tbsp'),
('e0000003-0000-0000-0000-000000000002','rice flour',2,'tbsp'),
('e0000003-0000-0000-0000-000000000002','curry leaves',20,'leaves'),
('e0000003-0000-0000-0000-000000000002','green chilli',4,'units'),
('e0000003-0000-0000-0000-000000000002','lemon',1,'units'),
-- Chilli Chicken
('e0000003-0000-0000-0000-000000000003','chicken breast',500,'g'),
('e0000003-0000-0000-0000-000000000003','soy sauce',3,'tbsp'),
('e0000003-0000-0000-0000-000000000003','cornstarch',4,'tbsp'),
('e0000003-0000-0000-0000-000000000003','egg',1,'units'),
('e0000003-0000-0000-0000-000000000003','green chilli',6,'units'),
('e0000003-0000-0000-0000-000000000003','bell pepper',1,'medium'),
('e0000003-0000-0000-0000-000000000003','onion',1,'medium'),
('e0000003-0000-0000-0000-000000000003','ginger',20,'g'),
('e0000003-0000-0000-0000-000000000003','garlic',8,'cloves'),
('e0000003-0000-0000-0000-000000000003','vinegar',2,'tbsp'),
-- Chicken Lollipop
('e0000003-0000-0000-0000-000000000004','chicken winglets',12,'units'),
('e0000003-0000-0000-0000-000000000004','ginger-garlic paste',2,'tbsp'),
('e0000003-0000-0000-0000-000000000004','red chilli powder',2,'tbsp'),
('e0000003-0000-0000-0000-000000000004','soy sauce',2,'tbsp'),
('e0000003-0000-0000-0000-000000000004','cornstarch',3,'tbsp'),
('e0000003-0000-0000-0000-000000000004','rice flour',2,'tbsp'),
('e0000003-0000-0000-0000-000000000004','egg',1,'units'),
('e0000003-0000-0000-0000-000000000004','schezwan sauce',3,'tbsp'),
-- Manchow Soup
('e0000003-0000-0000-0000-000000000005','vegetable stock',1,'l'),
('e0000003-0000-0000-0000-000000000005','carrot',1,'medium'),
('e0000003-0000-0000-0000-000000000005','cabbage',100,'g'),
('e0000003-0000-0000-0000-000000000005','mushrooms',100,'g'),
('e0000003-0000-0000-0000-000000000005','garlic',6,'cloves'),
('e0000003-0000-0000-0000-000000000005','ginger',20,'g'),
('e0000003-0000-0000-0000-000000000005','soy sauce',2,'tbsp'),
('e0000003-0000-0000-0000-000000000005','vinegar',1,'tbsp'),
('e0000003-0000-0000-0000-000000000005','cornstarch',2,'tbsp'),
('e0000003-0000-0000-0000-000000000005','crispy noodles',50,'g'),
-- Honey Chilli Potato
('e0000003-0000-0000-0000-000000000006','potatoes',500,'g'),
('e0000003-0000-0000-0000-000000000006','cornflour',4,'tbsp'),
('e0000003-0000-0000-0000-000000000006','garlic',8,'cloves'),
('e0000003-0000-0000-0000-000000000006','red chilli',2,'units'),
('e0000003-0000-0000-0000-000000000006','bell pepper',1,'medium'),
('e0000003-0000-0000-0000-000000000006','soy sauce',2,'tbsp'),
('e0000003-0000-0000-0000-000000000006','vinegar',1,'tbsp'),
('e0000003-0000-0000-0000-000000000006','red chilli sauce',2,'tbsp'),
('e0000003-0000-0000-0000-000000000006','honey',3,'tbsp'),
('e0000003-0000-0000-0000-000000000006','sesame seeds',1,'tbsp'),
-- Chicken Schezwan
('e0000003-0000-0000-0000-000000000007','chicken breast',500,'g'),
('e0000003-0000-0000-0000-000000000007','schezwan sauce',4,'tbsp'),
('e0000003-0000-0000-0000-000000000007','dried red chillies',8,'units'),
('e0000003-0000-0000-0000-000000000007','garlic',10,'cloves'),
('e0000003-0000-0000-0000-000000000007','ginger',20,'g'),
('e0000003-0000-0000-0000-000000000007','onion',1,'medium'),
('e0000003-0000-0000-0000-000000000007','bell pepper',1,'medium'),
('e0000003-0000-0000-0000-000000000007','soy sauce',2,'tbsp'),
('e0000003-0000-0000-0000-000000000007','vinegar',1,'tbsp'),
('e0000003-0000-0000-0000-000000000007','cornstarch',3,'tbsp'),
-- American Chopsuey
('e0000003-0000-0000-0000-000000000008','egg noodles',300,'g'),
('e0000003-0000-0000-0000-000000000008','chicken breast',300,'g'),
('e0000003-0000-0000-0000-000000000008','carrot',1,'medium'),
('e0000003-0000-0000-0000-000000000008','cabbage',150,'g'),
('e0000003-0000-0000-0000-000000000008','bell pepper',1,'medium'),
('e0000003-0000-0000-0000-000000000008','tomato ketchup',4,'tbsp'),
('e0000003-0000-0000-0000-000000000008','soy sauce',2,'tbsp'),
('e0000003-0000-0000-0000-000000000008','vinegar',1,'tbsp'),
('e0000003-0000-0000-0000-000000000008','cornstarch',3,'tbsp'),
('e0000003-0000-0000-0000-000000000008','eggs',2,'units'),
-- Dragon Chicken
('e0000003-0000-0000-0000-000000000009','chicken breast',500,'g'),
('e0000003-0000-0000-0000-000000000009','cashews',60,'g'),
('e0000003-0000-0000-0000-000000000009','dried red chillies',8,'units'),
('e0000003-0000-0000-0000-000000000009','garlic',8,'cloves'),
('e0000003-0000-0000-0000-000000000009','ginger',20,'g'),
('e0000003-0000-0000-0000-000000000009','bell pepper',1,'medium'),
('e0000003-0000-0000-0000-000000000009','onion',1,'medium'),
('e0000003-0000-0000-0000-000000000009','tomato puree',100,'ml'),
('e0000003-0000-0000-0000-000000000009','soy sauce',3,'tbsp'),
('e0000003-0000-0000-0000-000000000009','red chilli sauce',2,'tbsp'),
-- Sweet Corn Soup
('e0000003-0000-0000-0000-00000000000a','sweet corn',300,'g'),
('e0000003-0000-0000-0000-00000000000a','vegetable stock',1,'l'),
('e0000003-0000-0000-0000-00000000000a','cornstarch',2,'tbsp'),
('e0000003-0000-0000-0000-00000000000a','egg',1,'units'),
('e0000003-0000-0000-0000-00000000000a','white pepper',1,'tsp'),
('e0000003-0000-0000-0000-00000000000a','spring onion',2,'units'),
-- Chilli Garlic Noodles
('e0000003-0000-0000-0000-00000000000b','noodles',300,'g'),
('e0000003-0000-0000-0000-00000000000b','garlic',15,'cloves'),
('e0000003-0000-0000-0000-00000000000b','red chilli flakes',2,'tbsp'),
('e0000003-0000-0000-0000-00000000000b','red chilli',2,'units'),
('e0000003-0000-0000-0000-00000000000b','cabbage',150,'g'),
('e0000003-0000-0000-0000-00000000000b','spring onion',4,'units'),
('e0000003-0000-0000-0000-00000000000b','soy sauce',3,'tbsp'),
('e0000003-0000-0000-0000-00000000000b','sesame oil',2,'tbsp'),
-- Crispy Chilli Baby Corn
('e0000003-0000-0000-0000-00000000000c','baby corn',400,'g'),
('e0000003-0000-0000-0000-00000000000c','cornflour',4,'tbsp'),
('e0000003-0000-0000-0000-00000000000c','flour',2,'tbsp'),
('e0000003-0000-0000-0000-00000000000c','garlic',8,'cloves'),
('e0000003-0000-0000-0000-00000000000c','ginger',20,'g'),
('e0000003-0000-0000-0000-00000000000c','green chilli',4,'units'),
('e0000003-0000-0000-0000-00000000000c','bell pepper',1,'medium'),
('e0000003-0000-0000-0000-00000000000c','soy sauce',2,'tbsp'),
('e0000003-0000-0000-0000-00000000000c','red chilli sauce',2,'tbsp'),
('e0000003-0000-0000-0000-00000000000c','vinegar',1,'tbsp')

ON CONFLICT DO NOTHING;

COMMIT;
