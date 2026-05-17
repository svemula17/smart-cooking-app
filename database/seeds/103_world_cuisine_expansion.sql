-- 103_world_cuisine_expansion.sql
-- Expand Mexican, Chinese, Italian, and Thai cuisines with ~70 new dishes,
-- each with 4-step instructions and per-serving nutrition.
-- Skips dishes already in the catalog. Idempotent via ON CONFLICT.

BEGIN;

INSERT INTO recipes (id, name, cuisine_type, difficulty, prep_time_minutes, cook_time_minutes, servings, instructions) VALUES

-- ═══ MEXICAN ═════════════════════════════════════════════════════════════
('d0000001-0000-0000-0000-000000000001','Chicken Tacos','Mexican','Easy',15,15,4,
 '[{"step_number":1,"instruction":"Marinate diced chicken in lime juice, garlic, cumin, paprika, oregano, salt, pepper for 10 min.","time_minutes":10},
   {"step_number":2,"instruction":"Heat a skillet, sauté the chicken on high heat 8 min till browned and cooked through.","time_minutes":8},
   {"step_number":3,"instruction":"Warm corn tortillas on a dry skillet 30 sec each side.","time_minutes":3},
   {"step_number":4,"instruction":"Fill with chicken, top with diced onion, cilantro, salsa verde, and a squeeze of lime.","time_minutes":3}]'::jsonb),

('d0000001-0000-0000-0000-000000000002','Fish Tacos','Mexican','Easy',15,12,4,
 '[{"step_number":1,"instruction":"Season white fish fillets (cod / mahi mahi) with cumin, chilli, paprika, salt, pepper, lime.","time_minutes":8},
   {"step_number":2,"instruction":"Pan-sear in oil 3 min per side till flakes easily. Flake into chunks.","time_minutes":8},
   {"step_number":3,"instruction":"Mix shredded cabbage with lime juice, salt, a touch of mayo or yogurt for slaw.","time_minutes":5},
   {"step_number":4,"instruction":"Warm tortillas, fill with fish, top with slaw, sliced avocado, chipotle crema, cilantro.","time_minutes":3}]'::jsonb),

('d0000001-0000-0000-0000-000000000003','Carnitas Tacos','Mexican','Medium',15,180,6,
 '[{"step_number":1,"instruction":"Cube pork shoulder. Season generously with salt, cumin, oregano, black pepper, orange juice, garlic.","time_minutes":12},
   {"step_number":2,"instruction":"Braise covered in oven at 150°C for 2.5 hours until fork-tender.","time_minutes":150},
   {"step_number":3,"instruction":"Shred with two forks. Spread on a sheet pan and broil 5 min for crispy edges.","time_minutes":15},
   {"step_number":4,"instruction":"Serve in warm tortillas with diced onion, cilantro, salsa, and lime wedges.","time_minutes":5}]'::jsonb),

('d0000001-0000-0000-0000-000000000004','Enchiladas Rojas','Mexican','Medium',20,30,4,
 '[{"step_number":1,"instruction":"Simmer dried ancho and guajillo chillies until soft. Blend with garlic, onion, tomato, cumin, oregano, salt into a smooth red sauce.","time_minutes":18},
   {"step_number":2,"instruction":"Briefly fry corn tortillas in oil till pliable. Dip in warm sauce.","time_minutes":7},
   {"step_number":3,"instruction":"Fill with shredded chicken or cheese; roll and place in a baking dish. Pour remaining sauce over.","time_minutes":7},
   {"step_number":4,"instruction":"Sprinkle cheese and bake 15 min at 200°C. Garnish with crema, sliced onion, queso fresco.","time_minutes":15}]'::jsonb),

('d0000001-0000-0000-0000-000000000005','Chiles Rellenos','Mexican','Hard',30,25,4,
 '[{"step_number":1,"instruction":"Char poblano peppers over flame until skins blister. Steam in a bag, peel, slit and remove seeds keeping stems intact.","time_minutes":20},
   {"step_number":2,"instruction":"Stuff with Oaxaca/Monterey cheese (or picadillo meat); close with toothpicks.","time_minutes":8},
   {"step_number":3,"instruction":"Whisk egg whites stiff, fold in yolks. Dredge peppers in flour, dip in egg batter.","time_minutes":7},
   {"step_number":4,"instruction":"Pan-fry in 2 cm oil until golden on all sides. Drain, serve with warm tomato-onion sauce.","time_minutes":12}]'::jsonb),

('d0000001-0000-0000-0000-000000000006','Mole Poblano','Mexican','Hard',60,90,8,
 '[{"step_number":1,"instruction":"Toast dried mulato, ancho, pasilla chillies. Soak till soft.","time_minutes":20},
   {"step_number":2,"instruction":"Fry separately: onion, garlic, raisins, almonds, sesame, peanuts, plantain, tortilla, charred tomato. Add cinnamon, clove, anise, pepper.","time_minutes":30},
   {"step_number":3,"instruction":"Blend everything with chillies and stock to a velvety smooth sauce; strain. Cook in lard 30 min stirring constantly. Stir in melted Mexican chocolate; season.","time_minutes":45},
   {"step_number":4,"instruction":"Serve over poached chicken or turkey, with sesame seeds and white rice.","time_minutes":5}]'::jsonb),

('d0000001-0000-0000-0000-000000000007','Pozole Rojo','Mexican','Medium',30,120,6,
 '[{"step_number":1,"instruction":"Simmer pork shoulder with garlic, onion, bay, salt for 1.5 hours until tender. Reserve broth, shred meat.","time_minutes":90},
   {"step_number":2,"instruction":"Toast and rehydrate guajillo + ancho chillies; blend with garlic, onion, oregano, salt and broth into a red sauce. Strain.","time_minutes":15},
   {"step_number":3,"instruction":"Combine broth, shredded pork, drained hominy and red sauce. Simmer 20 min; taste and adjust salt.","time_minutes":25},
   {"step_number":4,"instruction":"Serve with shredded cabbage, radish, onion, lime, oregano, tostadas at the table.","time_minutes":5}]'::jsonb),

('d0000001-0000-0000-0000-000000000008','Tortilla Soup','Mexican','Easy',15,25,4,
 '[{"step_number":1,"instruction":"In oil, sauté onion, garlic, jalapeño. Add tomato puree, chicken stock, cumin, oregano, salt; simmer 15 min.","time_minutes":20},
   {"step_number":2,"instruction":"Stir in shredded cooked chicken and a squeeze of lime; warm through.","time_minutes":5},
   {"step_number":3,"instruction":"Cut corn tortillas into strips; fry until crisp, drain on paper.","time_minutes":6},
   {"step_number":4,"instruction":"Ladle soup; top with tortilla strips, avocado, queso fresco, crema, cilantro.","time_minutes":4}]'::jsonb),

('d0000001-0000-0000-0000-000000000009','Salsa Verde','Mexican','Easy',10,10,6,
 '[{"step_number":1,"instruction":"Husk and rinse tomatillos. Char in a dry skillet or under broiler with onion, garlic, jalapeño until blackened in spots.","time_minutes":10},
   {"step_number":2,"instruction":"Cool slightly, then blend with cilantro, salt, a pinch of sugar, and a splash of water.","time_minutes":3},
   {"step_number":3,"instruction":"Taste — add more chilli for heat or lime for tang.","time_minutes":2},
   {"step_number":4,"instruction":"Use immediately with tacos, eggs, or rice; keeps refrigerated 4 days.","time_minutes":1}]'::jsonb),

('d0000001-0000-0000-0000-00000000000a','Refried Beans','Mexican','Easy',5,20,4,
 '[{"step_number":1,"instruction":"Heat lard or oil in a wide pan. Add finely chopped onion, sauté till soft.","time_minutes":5},
   {"step_number":2,"instruction":"Add garlic, cumin, salt and a pinch of chilli; cook 30 sec until fragrant.","time_minutes":2},
   {"step_number":3,"instruction":"Add 2 cups cooked pinto beans with some of their cooking liquid; mash with a potato masher.","time_minutes":8},
   {"step_number":4,"instruction":"Cook stirring 5 min until creamy and thick. Adjust salt; serve with cheese on top.","time_minutes":5}]'::jsonb),

('d0000001-0000-0000-0000-00000000000b','Mexican Rice','Mexican','Easy',5,25,4,
 '[{"step_number":1,"instruction":"Rinse 1 cup long-grain rice until water runs clear; drain.","time_minutes":5},
   {"step_number":2,"instruction":"In oil, toast the rice 3 min until golden. Add chopped onion, garlic, cumin.","time_minutes":5},
   {"step_number":3,"instruction":"Pour in 1 cup tomato puree + 1.5 cups chicken/veg stock, salt; bring to a boil.","time_minutes":3},
   {"step_number":4,"instruction":"Cover and simmer on lowest 18 min. Off heat 5 min, then fluff with a fork. Stir in chopped cilantro.","time_minutes":18}]'::jsonb),

('d0000001-0000-0000-0000-00000000000c','Elote','Mexican','Easy',5,15,4,
 '[{"step_number":1,"instruction":"Husk 4 ears of corn. Grill (or roast) until lightly charred all over, ~10 min.","time_minutes":12},
   {"step_number":2,"instruction":"Mix together mayo, sour cream, finely chopped garlic.","time_minutes":3},
   {"step_number":3,"instruction":"Brush hot corn generously with the cream mixture.","time_minutes":2},
   {"step_number":4,"instruction":"Sprinkle with crumbled cotija, Tajín or chilli powder, and a squeeze of lime. Serve.","time_minutes":2}]'::jsonb),

('d0000001-0000-0000-0000-00000000000d','Tamales','Mexican','Hard',60,120,12,
 '[{"step_number":1,"instruction":"Soak dried corn husks in hot water 30 min. Make masa dough: beat lard until fluffy, gradually beat in masa harina, broth, salt, baking powder to a light spreadable consistency.","time_minutes":30},
   {"step_number":2,"instruction":"Make filling: simmer pork or chicken in red chilli sauce until tender and saucy.","time_minutes":40},
   {"step_number":3,"instruction":"Spread masa on each soaked husk, add a tablespoon of filling, fold sides over, fold up the tapered bottom.","time_minutes":30},
   {"step_number":4,"instruction":"Stand upright in a steamer, cover, steam 90 minutes. Test one — masa should pull away cleanly from the husk.","time_minutes":90}]'::jsonb),

('d0000001-0000-0000-0000-00000000000e','Carne Asada','Mexican','Medium',60,15,4,
 '[{"step_number":1,"instruction":"Whisk marinade: lime juice, orange juice, garlic, cumin, oregano, salt, pepper, olive oil, soy sauce. Pour over flank/skirt steak. Marinate 1 hour minimum.","time_minutes":60},
   {"step_number":2,"instruction":"Heat grill or cast-iron skillet very hot. Pat steak dry.","time_minutes":3},
   {"step_number":3,"instruction":"Grill 3–4 min per side for medium-rare. Rest 10 min on a board.","time_minutes":12},
   {"step_number":4,"instruction":"Slice against the grain thinly. Serve with warm tortillas, salsa, guacamole, lime, grilled onions.","time_minutes":5}]'::jsonb),

('d0000001-0000-0000-0000-00000000000f','Chilaquiles','Mexican','Easy',10,15,3,
 '[{"step_number":1,"instruction":"Cut day-old corn tortillas into triangles; fry until crisp. Drain.","time_minutes":10},
   {"step_number":2,"instruction":"Warm green or red salsa in a wide pan with a splash of stock.","time_minutes":5},
   {"step_number":3,"instruction":"Toss the crisp tortillas in the sauce just until coated but not soggy.","time_minutes":2},
   {"step_number":4,"instruction":"Top with fried eggs (sunny-side up), crumbled cheese, crema, onion, cilantro. Serve immediately.","time_minutes":3}]'::jsonb),

('d0000001-0000-0000-0000-000000000010','Huevos Rancheros','Mexican','Easy',10,15,2,
 '[{"step_number":1,"instruction":"Simmer ranchero sauce: blistered tomato, onion, garlic, jalapeño, salt — blend coarse.","time_minutes":10},
   {"step_number":2,"instruction":"Briefly fry corn tortillas in a little oil to make them pliable.","time_minutes":5},
   {"step_number":3,"instruction":"Fry eggs sunny-side up in the same pan.","time_minutes":4},
   {"step_number":4,"instruction":"Plate two tortillas, top each with an egg, ladle warm salsa around, top with cheese, avocado, cilantro. Serve with refried beans.","time_minutes":3}]'::jsonb),

('d0000001-0000-0000-0000-000000000011','Churros','Mexican','Medium',10,20,4,
 '[{"step_number":1,"instruction":"Boil water, butter, sugar, salt. Off heat, add flour all at once and stir vigorously into a smooth dough.","time_minutes":6},
   {"step_number":2,"instruction":"Beat in an egg until glossy. Transfer to a piping bag with a star tip.","time_minutes":4},
   {"step_number":3,"instruction":"Heat oil to 180°C. Pipe 4-inch logs directly into oil, cut with scissors. Fry till golden, turning once.","time_minutes":12},
   {"step_number":4,"instruction":"Roll hot churros in cinnamon sugar. Serve with melted dark chocolate for dipping.","time_minutes":3}]'::jsonb),

('d0000001-0000-0000-0000-000000000012','Tres Leches Cake','Mexican','Medium',30,30,10,
 '[{"step_number":1,"instruction":"Beat 5 egg yolks with sugar until pale. Whisk in milk and vanilla. Fold in flour with baking powder.","time_minutes":10},
   {"step_number":2,"instruction":"Whip 5 egg whites to soft peaks; fold into batter. Pour into a greased 9x13 pan.","time_minutes":7},
   {"step_number":3,"instruction":"Bake at 180°C for 25 min until just set. Cool, then poke all over with a fork.","time_minutes":30},
   {"step_number":4,"instruction":"Pour the tres leches mixture (evaporated milk + condensed milk + cream) over warm cake. Chill 4 hours. Top with whipped cream and cinnamon. Serve cold.","time_minutes":15}]'::jsonb),

-- ═══ CHINESE ═════════════════════════════════════════════════════════════
('d0000002-0000-0000-0000-000000000001','Chow Mein','Chinese','Easy',10,12,4,
 '[{"step_number":1,"instruction":"Boil egg noodles per package, drain and rinse. Toss with a teaspoon of oil.","time_minutes":7},
   {"step_number":2,"instruction":"Heat wok very hot. Stir-fry sliced onion, julienned carrot, cabbage, bean sprouts, spring onion 2 min.","time_minutes":4},
   {"step_number":3,"instruction":"Add noodles and sauce: soy sauce, oyster sauce, sesame oil, white pepper, a splash of stock. Toss on high.","time_minutes":3},
   {"step_number":4,"instruction":"Stir in protein of choice (cooked chicken/shrimp/tofu), heat through. Garnish with spring onion. Serve.","time_minutes":3}]'::jsonb),

('d0000002-0000-0000-0000-000000000002','Lo Mein','Chinese','Easy',10,10,4,
 '[{"step_number":1,"instruction":"Cook lo mein noodles, drain, toss with sesame oil to prevent sticking.","time_minutes":7},
   {"step_number":2,"instruction":"Stir-fry minced garlic and ginger in oil; add julienned veg (carrot, cabbage, mushrooms, bell pepper) for 2 min.","time_minutes":4},
   {"step_number":3,"instruction":"Pour sauce: light soy, dark soy, oyster sauce, brown sugar, sesame oil.","time_minutes":2},
   {"step_number":4,"instruction":"Add noodles and toss until coated and steaming. Garnish with spring onion. Serve.","time_minutes":3}]'::jsonb),

('d0000002-0000-0000-0000-000000000003','General Tso''s Chicken','Chinese','Medium',15,20,4,
 '[{"step_number":1,"instruction":"Cube chicken thigh; toss with soy, Shaoxing wine, egg, cornstarch. Rest 10 min.","time_minutes":10},
   {"step_number":2,"instruction":"Deep-fry chicken at 180°C until crisp and golden; drain.","time_minutes":10},
   {"step_number":3,"instruction":"In a wok, stir-fry dried red chillies, garlic, ginger; add sauce (soy, vinegar, hoisin, sugar, stock, cornstarch slurry); bring to glossy boil.","time_minutes":4},
   {"step_number":4,"instruction":"Toss fried chicken in the sauce until coated. Sprinkle sesame and spring onion. Serve over rice.","time_minutes":3}]'::jsonb),

('d0000002-0000-0000-0000-000000000004','Orange Chicken','Chinese','Medium',15,20,4,
 '[{"step_number":1,"instruction":"Marinate cubed chicken in soy and rice wine; toss in seasoned cornstarch.","time_minutes":10},
   {"step_number":2,"instruction":"Deep-fry until crisp golden; drain.","time_minutes":10},
   {"step_number":3,"instruction":"Simmer fresh orange juice + zest, soy sauce, rice vinegar, sugar, ginger, garlic, dried chilli, cornstarch slurry into a glossy sauce.","time_minutes":6},
   {"step_number":4,"instruction":"Toss chicken in the sauce, garnish with sesame and orange zest. Serve over rice.","time_minutes":3}]'::jsonb),

('d0000002-0000-0000-0000-000000000005','Sesame Chicken','Chinese','Medium',15,20,4,
 '[{"step_number":1,"instruction":"Marinate cubed chicken in soy, egg, cornstarch.","time_minutes":10},
   {"step_number":2,"instruction":"Deep-fry until crisp; drain.","time_minutes":10},
   {"step_number":3,"instruction":"Simmer soy, hoisin, rice vinegar, sugar, sesame oil, garlic, ginger, cornstarch slurry to thick.","time_minutes":5},
   {"step_number":4,"instruction":"Toss chicken in sauce, finish with toasted sesame and spring onion. Serve over rice.","time_minutes":3}]'::jsonb),

('d0000002-0000-0000-0000-000000000006','Sweet and Sour Pork','Chinese','Medium',15,25,4,
 '[{"step_number":1,"instruction":"Cube pork loin; marinate in soy, rice wine, white pepper. Coat in cornstarch.","time_minutes":12},
   {"step_number":2,"instruction":"Deep-fry until golden and crisp; drain.","time_minutes":10},
   {"step_number":3,"instruction":"Stir-fry chunks of bell pepper, onion, pineapple. Pour in sauce: ketchup, rice vinegar, sugar, soy, water, cornstarch slurry.","time_minutes":5},
   {"step_number":4,"instruction":"Bring to a thick glossy boil. Add fried pork and toss to coat. Serve with rice.","time_minutes":3}]'::jsonb),

('d0000002-0000-0000-0000-000000000007','Egg Drop Soup','Chinese','Easy',5,10,4,
 '[{"step_number":1,"instruction":"Bring 4 cups chicken stock to a simmer with ginger, salt, white pepper, a splash of soy.","time_minutes":5},
   {"step_number":2,"instruction":"Stir in a cornstarch slurry to thicken slightly.","time_minutes":2},
   {"step_number":3,"instruction":"Beat 2 eggs. With the soup at a gentle simmer, slowly stream the eggs in while stirring slowly to create silky ribbons.","time_minutes":2},
   {"step_number":4,"instruction":"Finish with sesame oil and chopped spring onion. Serve hot.","time_minutes":1}]'::jsonb),

('d0000002-0000-0000-0000-000000000008','Wonton Soup','Chinese','Medium',30,15,4,
 '[{"step_number":1,"instruction":"Mix ground pork, shrimp, ginger, spring onion, soy, sesame oil, white pepper, cornstarch to a sticky filling.","time_minutes":10},
   {"step_number":2,"instruction":"Place a teaspoon on each wonton wrapper; seal into purses (wet edges first).","time_minutes":20},
   {"step_number":3,"instruction":"Bring chicken stock to simmer; flavour with soy, white pepper, ginger.","time_minutes":5},
   {"step_number":4,"instruction":"Cook wontons in the stock 4–5 min until they float. Serve with bok choy, spring onion, sesame oil.","time_minutes":5}]'::jsonb),

('d0000002-0000-0000-0000-000000000009','Spring Rolls','Chinese','Medium',20,15,4,
 '[{"step_number":1,"instruction":"Stir-fry julienned cabbage, carrot, bean sprouts, mushrooms with soy, sesame oil, white pepper. Cool.","time_minutes":12},
   {"step_number":2,"instruction":"Roll filling tightly in spring-roll wrappers; seal with flour-water paste.","time_minutes":12},
   {"step_number":3,"instruction":"Deep-fry at 180°C until golden and crisp on all sides.","time_minutes":8},
   {"step_number":4,"instruction":"Drain. Serve hot with sweet-chilli or soy-vinegar dipping sauce.","time_minutes":2}]'::jsonb),

('d0000002-0000-0000-0000-00000000000a','Pot Stickers','Chinese','Medium',30,15,4,
 '[{"step_number":1,"instruction":"Make filling: ground pork, finely shredded cabbage (salted and squeezed), spring onion, ginger, soy, sesame oil, cornstarch.","time_minutes":15},
   {"step_number":2,"instruction":"Place a teaspoon on each round wrapper; pleat into a half-moon dumpling.","time_minutes":20},
   {"step_number":3,"instruction":"Heat oil in a non-stick pan. Place dumplings flat-side down, fry 2 min until bottoms are golden.","time_minutes":3},
   {"step_number":4,"instruction":"Add 1/3 cup water, cover, steam 6 min until water evaporates and bottoms re-crisp. Serve with soy-vinegar dip.","time_minutes":8}]'::jsonb),

('d0000002-0000-0000-0000-00000000000b','Char Siu','Chinese','Medium',60,40,4,
 '[{"step_number":1,"instruction":"Marinate pork shoulder strips in hoisin, soy, oyster sauce, honey, Shaoxing wine, garlic, five-spice, red food colour (optional) for at least 4 hours.","time_minutes":240},
   {"step_number":2,"instruction":"Roast at 200°C on a rack over a water pan for 25 min.","time_minutes":25},
   {"step_number":3,"instruction":"Brush with reserved marinade + honey; roast another 10–15 min until charred edges form.","time_minutes":15},
   {"step_number":4,"instruction":"Rest 10 min, slice thin against the grain. Serve with rice or in bao buns.","time_minutes":10}]'::jsonb),

('d0000002-0000-0000-0000-00000000000c','Singapore Noodles','Chinese','Easy',15,15,4,
 '[{"step_number":1,"instruction":"Soak rice vermicelli in hot water 5 min until pliable; drain.","time_minutes":7},
   {"step_number":2,"instruction":"In a wok, stir-fry beaten egg into thin curds; remove. Sauté garlic, ginger, onion, shrimp, char siu.","time_minutes":5},
   {"step_number":3,"instruction":"Add bell peppers, bean sprouts, vermicelli. Sprinkle curry powder, turmeric, soy, salt, sugar; toss on high.","time_minutes":4},
   {"step_number":4,"instruction":"Fold egg back in. Garnish with spring onion. Serve hot.","time_minutes":3}]'::jsonb),

('d0000002-0000-0000-0000-00000000000d','Yangzhou Fried Rice','Chinese','Easy',10,12,4,
 '[{"step_number":1,"instruction":"Use day-old jasmine rice. Beat eggs with a pinch of salt.","time_minutes":3},
   {"step_number":2,"instruction":"In hot oil, scramble eggs to small curds; remove. Stir-fry diced char siu, shrimp, peas, carrot, spring onion.","time_minutes":5},
   {"step_number":3,"instruction":"Add cold rice; toss vigorously, breaking clumps, until each grain is coated and hot.","time_minutes":5},
   {"step_number":4,"instruction":"Season with light soy, white pepper, salt. Fold egg back in. Garnish with spring onion greens.","time_minutes":2}]'::jsonb),

('d0000002-0000-0000-0000-00000000000e','Salt and Pepper Shrimp','Chinese','Medium',10,10,4,
 '[{"step_number":1,"instruction":"Clean shrimp, leave shells on; pat dry. Toss with cornstarch, salt, white pepper.","time_minutes":7},
   {"step_number":2,"instruction":"Deep-fry at 180°C 2 min until shells are crisp; drain.","time_minutes":4},
   {"step_number":3,"instruction":"In hot oil, stir-fry chopped garlic, ginger, red chilli, spring onion 30 sec.","time_minutes":2},
   {"step_number":4,"instruction":"Toss in fried shrimp, sprinkle Sichuan peppercorn powder, salt, white pepper. Serve immediately.","time_minutes":3}]'::jsonb),

('d0000002-0000-0000-0000-00000000000f','Mongolian Beef','Chinese','Medium',15,15,4,
 '[{"step_number":1,"instruction":"Slice flank steak thin against the grain. Toss with cornstarch and rest 10 min.","time_minutes":12},
   {"step_number":2,"instruction":"Mix sauce: soy sauce, brown sugar, water, ginger, garlic.","time_minutes":3},
   {"step_number":3,"instruction":"Stir-fry beef in batches in very hot oil until just browned; remove. Sauté garlic, ginger, spring onion whites.","time_minutes":6},
   {"step_number":4,"instruction":"Pour in the sauce, bring to a syrupy boil, return beef and spring onion greens; toss to coat. Serve over rice.","time_minutes":4}]'::jsonb),

('d0000002-0000-0000-0000-000000000010','Twice Cooked Pork','Chinese','Medium',15,25,4,
 '[{"step_number":1,"instruction":"Simmer a slab of pork belly with ginger, scallion, Shaoxing in water 25 min until just cooked. Cool, slice thin.","time_minutes":30},
   {"step_number":2,"instruction":"In a hot wok, stir-fry the sliced pork until edges curl and fat renders.","time_minutes":6},
   {"step_number":3,"instruction":"Add doubanjiang (chilli bean paste), fermented black beans, sweet bean sauce, sugar, soy; sauté 1 min.","time_minutes":2},
   {"step_number":4,"instruction":"Toss in leeks/cabbage and green chillies; cook on high 2 min until just wilted. Serve with rice.","time_minutes":4}]'::jsonb),

('d0000002-0000-0000-0000-000000000011','Vegetable Stir Fry','Chinese','Easy',10,8,4,
 '[{"step_number":1,"instruction":"Chop mixed vegetables (broccoli, bell pepper, snow peas, carrot, mushrooms, baby corn) into uniform pieces.","time_minutes":10},
   {"step_number":2,"instruction":"Heat wok very hot; add oil. Stir-fry the harder veg first (broccoli, carrot) for 2 min.","time_minutes":3},
   {"step_number":3,"instruction":"Add the rest; toss on high 2 min. Pour sauce (soy, oyster sauce, sesame oil, garlic, ginger, cornstarch slurry).","time_minutes":3},
   {"step_number":4,"instruction":"Toss until glossy and just tender. Serve over jasmine rice.","time_minutes":2}]'::jsonb),

('d0000002-0000-0000-0000-000000000012','Steamed Fish with Ginger','Chinese','Easy',10,15,4,
 '[{"step_number":1,"instruction":"Score a whole fish (sea bass / pomfret) lightly. Rub with salt and shaoxing wine. Stuff with julienned ginger and spring onion whites.","time_minutes":8},
   {"step_number":2,"instruction":"Place fish on a plate. Steam in a covered steamer over high heat 10 min for ~600g fish.","time_minutes":10},
   {"step_number":3,"instruction":"Pour off accumulated water. Top with more julienned ginger, spring onion greens.","time_minutes":2},
   {"step_number":4,"instruction":"Drizzle hot oil over the aromatics (it should sizzle). Pour soy-sauce mixture (light soy + sugar + a little water) around. Serve immediately.","time_minutes":3}]'::jsonb),

-- ═══ ITALIAN ═════════════════════════════════════════════════════════════
('d0000003-0000-0000-0000-000000000001','Spaghetti Carbonara','Italian','Medium',5,15,4,
 '[{"step_number":1,"instruction":"Render diced guanciale (or pancetta) slowly in a pan until crisp and golden. Keep the fat.","time_minutes":8},
   {"step_number":2,"instruction":"Whisk 4 yolks + 1 egg with grated pecorino, lots of black pepper.","time_minutes":3},
   {"step_number":3,"instruction":"Cook spaghetti al dente; reserve pasta water. Transfer hot pasta to the guanciale pan off the heat.","time_minutes":10},
   {"step_number":4,"instruction":"Pour egg mix over, tossing rapidly; loosen with splashes of pasta water until creamy (do not scramble). Serve immediately with more pecorino + pepper.","time_minutes":2}]'::jsonb),

('d0000003-0000-0000-0000-000000000002','Spaghetti Aglio e Olio','Italian','Easy',5,12,4,
 '[{"step_number":1,"instruction":"Cook spaghetti to al dente in well-salted water; reserve a cup of pasta water.","time_minutes":10},
   {"step_number":2,"instruction":"In a wide pan, gently sauté sliced garlic in olive oil over low heat until pale golden — never browned.","time_minutes":5},
   {"step_number":3,"instruction":"Add chilli flakes off heat. Toss in drained pasta with a few tablespoons pasta water.","time_minutes":2},
   {"step_number":4,"instruction":"Toss vigorously to emulsify. Finish with chopped parsley. Optional: grated pecorino. Serve immediately.","time_minutes":2}]'::jsonb),

('d0000003-0000-0000-0000-000000000003','Penne Arrabbiata','Italian','Easy',5,20,4,
 '[{"step_number":1,"instruction":"Cook penne al dente in salted water.","time_minutes":10},
   {"step_number":2,"instruction":"In olive oil, gently sauté sliced garlic and 1 tsp chilli flakes (more or less to taste) until garlic just turns pale gold.","time_minutes":4},
   {"step_number":3,"instruction":"Add canned crushed tomato with salt; simmer 12 min until thick. Stir in fresh basil and parsley.","time_minutes":12},
   {"step_number":4,"instruction":"Toss the drained pasta in the sauce. Serve with a little reserved pasta water if needed and a grating of pecorino.","time_minutes":3}]'::jsonb),

('d0000003-0000-0000-0000-000000000004','Fettuccine Alfredo','Italian','Easy',5,12,4,
 '[{"step_number":1,"instruction":"Cook fettuccine to just-shy-of-al-dente in well-salted water; reserve pasta water.","time_minutes":10},
   {"step_number":2,"instruction":"In a wide pan, melt 4 tbsp butter on low; let it just bubble.","time_minutes":3},
   {"step_number":3,"instruction":"Add 1 cup pasta water, swirl. Tip in the pasta. Off heat, add freshly grated Parmigiano in handfuls, tossing each addition into the silky emulsion.","time_minutes":3},
   {"step_number":4,"instruction":"Finish with black pepper. (Authentic Alfredo uses no cream — just butter, cheese, and pasta water.) Serve immediately.","time_minutes":1}]'::jsonb),

('d0000003-0000-0000-0000-000000000005','Lasagna','Italian','Hard',30,75,8,
 '[{"step_number":1,"instruction":"Make ragu: brown ground beef + pancetta; add carrot, celery, onion, garlic, tomato passata, red wine, milk; simmer 90 min until rich.","time_minutes":90},
   {"step_number":2,"instruction":"Make béchamel: melt butter, whisk in flour 1 min, gradually add warm milk; cook to creamy, season with salt, nutmeg.","time_minutes":12},
   {"step_number":3,"instruction":"Layer in baking dish: ragu, fresh lasagna sheets, béchamel, parmesan — repeat 4 times, ending with béchamel and a generous parmesan top.","time_minutes":15},
   {"step_number":4,"instruction":"Bake at 180°C for 45 min until golden and bubbling. Rest 15 min before cutting.","time_minutes":60}]'::jsonb),

('d0000003-0000-0000-0000-000000000006','Ravioli','Italian','Hard',60,8,4,
 '[{"step_number":1,"instruction":"Knead a smooth pasta dough (00 flour + eggs + a pinch salt + drop olive oil); rest 30 min.","time_minutes":40},
   {"step_number":2,"instruction":"Mix ricotta with spinach (sautéed and squeezed), egg yolk, parmesan, nutmeg, salt — your filling.","time_minutes":12},
   {"step_number":3,"instruction":"Roll dough thin. Pipe filling in rows, wet around, top with second sheet, press out air, cut into squares.","time_minutes":20},
   {"step_number":4,"instruction":"Boil ravioli in salted water 3–4 min until they float and shells are tender. Serve with melted butter, sage, parmesan.","time_minutes":6}]'::jsonb),

('d0000003-0000-0000-0000-000000000007','Gnocchi','Italian','Medium',30,15,4,
 '[{"step_number":1,"instruction":"Bake (do not boil) 4 large potatoes whole until tender. Peel while hot, pass through a ricer.","time_minutes":60},
   {"step_number":2,"instruction":"Mix the riced potato with egg and flour just until a soft dough forms — overworking ruins gnocchi.","time_minutes":8},
   {"step_number":3,"instruction":"Roll into long ropes, cut 1-inch pieces, optional fork ridges.","time_minutes":10},
   {"step_number":4,"instruction":"Boil in salted water 1–2 min — they float when done. Toss with browned butter + sage or tomato sauce.","time_minutes":5}]'::jsonb),

('d0000003-0000-0000-0000-000000000008','Risotto Milanese','Italian','Medium',5,30,4,
 '[{"step_number":1,"instruction":"Soak saffron threads in 1/4 cup warm white wine. Keep stock simmering in a separate pot.","time_minutes":5},
   {"step_number":2,"instruction":"In butter, sauté finely chopped onion until translucent. Add carnaroli or arborio rice; toast 2 min.","time_minutes":5},
   {"step_number":3,"instruction":"Add white wine; let absorb. Begin adding hot stock a ladle at a time, stirring; never let it dry out.","time_minutes":20},
   {"step_number":4,"instruction":"At 16–18 min the rice is al dente. Off heat, mantecare with cold butter and parmesan. Stir saffron wine; rest 1 min and serve.","time_minutes":3}]'::jsonb),

('d0000003-0000-0000-0000-000000000009','Pizza Marinara','Italian','Easy',120,12,2,
 '[{"step_number":1,"instruction":"Mix flour, water, salt, a pinch of yeast; knead briefly. Let rise covered 12–24 hours (slow rise = better pizza).","time_minutes":15},
   {"step_number":2,"instruction":"Shape a ball into a thin disc by hand, keeping a fluffy border.","time_minutes":7},
   {"step_number":3,"instruction":"Top with crushed San Marzano tomato, salt, oregano, sliced garlic, a drizzle of olive oil. No cheese!","time_minutes":3},
   {"step_number":4,"instruction":"Bake at the highest oven temperature (300°C+) on a stone for 6–8 min until crust is charred. Finish with fresh basil.","time_minutes":8}]'::jsonb),

('d0000003-0000-0000-0000-00000000000a','Pizza Quattro Formaggi','Italian','Medium',120,12,2,
 '[{"step_number":1,"instruction":"Use the same slow-rise pizza dough. Shape into a thin disc.","time_minutes":8},
   {"step_number":2,"instruction":"No tomato. Brush with olive oil. Top with torn mozzarella, gorgonzola, taleggio, and a sprinkle of grated parmesan.","time_minutes":4},
   {"step_number":3,"instruction":"Optional drizzle of honey for a sweet-savoury edge.","time_minutes":1},
   {"step_number":4,"instruction":"Bake at 300°C on a stone for 6–8 min until cheeses are molten and crust charred. Finish with black pepper.","time_minutes":8}]'::jsonb),

('d0000003-0000-0000-0000-00000000000b','Pizza Pepperoni','Italian','Easy',120,12,2,
 '[{"step_number":1,"instruction":"Use slow-rise pizza dough. Shape into a thin disc keeping a fluffy border.","time_minutes":8},
   {"step_number":2,"instruction":"Spread a thin layer of crushed tomato seasoned with salt.","time_minutes":2},
   {"step_number":3,"instruction":"Scatter torn fior di latte mozzarella and slices of pepperoni.","time_minutes":2},
   {"step_number":4,"instruction":"Bake at 300°C on a stone for 6–8 min until pepperoni cups crisp and crust chars. Finish with oregano.","time_minutes":8}]'::jsonb),

('d0000003-0000-0000-0000-00000000000c','Bruschetta','Italian','Easy',5,8,4,
 '[{"step_number":1,"instruction":"Slice rustic sourdough or ciabatta thick.","time_minutes":3},
   {"step_number":2,"instruction":"Grill or toast both sides until golden with grill marks.","time_minutes":4},
   {"step_number":3,"instruction":"Rub one side with a halved garlic clove. Drizzle olive oil generously.","time_minutes":2},
   {"step_number":4,"instruction":"Top with diced ripe tomato + basil + salt mixture (or just a tomato slice and a sprinkle of sea salt). Serve immediately.","time_minutes":2}]'::jsonb),

('d0000003-0000-0000-0000-00000000000d','Minestrone Soup','Italian','Easy',15,45,6,
 '[{"step_number":1,"instruction":"Soffrito: sauté finely chopped onion, carrot, celery in olive oil until soft.","time_minutes":8},
   {"step_number":2,"instruction":"Add diced tomato, tomato paste, herbs, then vegetable stock, potato, cannellini beans, parmesan rind. Simmer 25 min.","time_minutes":25},
   {"step_number":3,"instruction":"Add chopped zucchini, green beans, and small pasta (ditalini); simmer 10 min until pasta and veg are tender.","time_minutes":10},
   {"step_number":4,"instruction":"Stir in chopped kale or spinach. Adjust salt. Serve with grated parmesan and a drizzle of olive oil.","time_minutes":5}]'::jsonb),

('d0000003-0000-0000-0000-00000000000e','Osso Buco','Italian','Hard',20,180,4,
 '[{"step_number":1,"instruction":"Pat veal shanks dry; tie around the bone. Dust with flour. Brown deeply in olive oil + butter. Set aside.","time_minutes":15},
   {"step_number":2,"instruction":"In the same pan, sauté finely diced onion, carrot, celery 10 min. Add garlic, then dry white wine; reduce by half.","time_minutes":15},
   {"step_number":3,"instruction":"Add tomato, stock, bay, sage, rosemary, salt. Return shanks. Cover and braise at 160°C for 2.5 hours until fork-tender.","time_minutes":150},
   {"step_number":4,"instruction":"Top with gremolata (lemon zest + parsley + garlic). Serve with risotto Milanese.","time_minutes":5}]'::jsonb),

('d0000003-0000-0000-0000-00000000000f','Chicken Parmesan','Italian','Medium',15,30,4,
 '[{"step_number":1,"instruction":"Pound chicken breasts to even thickness. Dredge in flour, then egg, then panko + grated parmesan.","time_minutes":12},
   {"step_number":2,"instruction":"Pan-fry in olive oil 2 min per side until golden; transfer to a baking dish.","time_minutes":8},
   {"step_number":3,"instruction":"Top each with marinara sauce + torn mozzarella + grated parmesan.","time_minutes":3},
   {"step_number":4,"instruction":"Bake at 200°C for 12 min until cheese is bubbling and golden. Serve over spaghetti.","time_minutes":15}]'::jsonb),

('d0000003-0000-0000-0000-000000000010','Eggplant Parmesan','Italian','Medium',30,40,6,
 '[{"step_number":1,"instruction":"Slice eggplant 1cm thick. Salt and rest 20 min to draw out moisture; pat dry.","time_minutes":25},
   {"step_number":2,"instruction":"Dredge in flour, egg, panko + parmesan; fry until golden on both sides. Drain.","time_minutes":15},
   {"step_number":3,"instruction":"Layer in baking dish: marinara, eggplant, mozzarella + parmesan, basil — repeat 3 times.","time_minutes":8},
   {"step_number":4,"instruction":"Bake at 200°C for 25 min until cheese is golden and bubbly. Rest 10 min before serving.","time_minutes":25}]'::jsonb),

('d0000003-0000-0000-0000-000000000011','Panna Cotta','Italian','Easy',15,5,6,
 '[{"step_number":1,"instruction":"Bloom gelatine sheets in cold water.","time_minutes":5},
   {"step_number":2,"instruction":"Warm cream + milk + sugar + vanilla bean seeds until just steaming (do not boil).","time_minutes":5},
   {"step_number":3,"instruction":"Off heat, squeeze and dissolve gelatine in the warm cream until clear.","time_minutes":2},
   {"step_number":4,"instruction":"Pour through a fine strainer into small ramekins. Chill at least 4 hours. Unmold and serve with berry compote.","time_minutes":240}]'::jsonb),

('d0000003-0000-0000-0000-000000000012','Cannoli','Italian','Hard',60,20,8,
 '[{"step_number":1,"instruction":"Knead a flour + sugar + butter + Marsala dough; rest 30 min.","time_minutes":35},
   {"step_number":2,"instruction":"Roll thin, cut ovals, wrap around metal cannoli tubes; deep-fry until bubbled and golden. Cool, slide off tubes.","time_minutes":20},
   {"step_number":3,"instruction":"Whip drained ricotta with powdered sugar and a touch of cinnamon; fold in mini chocolate chips.","time_minutes":8},
   {"step_number":4,"instruction":"Pipe filling into shells just before serving (so they stay crisp). Dust with powdered sugar, dip ends in pistachios.","time_minutes":5}]'::jsonb),

('d0000003-0000-0000-0000-000000000013','Focaccia','Italian','Medium',180,25,8,
 '[{"step_number":1,"instruction":"Mix flour, water, yeast, salt, olive oil; knead briefly. Cover and let rise 90 min until doubled.","time_minutes":90},
   {"step_number":2,"instruction":"Stretch dough into an oiled pan; dimple with fingertips. Drizzle olive oil into the dimples. Let rest 30 min.","time_minutes":35},
   {"step_number":3,"instruction":"Top with rosemary sprigs, flaky salt, optional cherry tomatoes or olives.","time_minutes":5},
   {"step_number":4,"instruction":"Bake at 230°C for 22 min until deeply golden. Brush hot focaccia with more olive oil. Cool slightly before slicing.","time_minutes":25}]'::jsonb),

-- ═══ THAI ════════════════════════════════════════════════════════════════
('d0000004-0000-0000-0000-000000000001','Massaman Curry','Thai','Medium',15,60,4,
 '[{"step_number":1,"instruction":"In a heavy pot, fry massaman curry paste in coconut cream until oil separates and the paste is fragrant (3–4 min).","time_minutes":5},
   {"step_number":2,"instruction":"Add chicken or beef chunks; sear and coat in paste. Pour in coconut milk + stock + cinnamon + cardamom + bay.","time_minutes":7},
   {"step_number":3,"instruction":"Add potato chunks, onion, roasted peanuts. Simmer covered 40 min until meat is tender.","time_minutes":45},
   {"step_number":4,"instruction":"Season with palm sugar, fish sauce, tamarind. Serve over jasmine rice with extra peanuts.","time_minutes":3}]'::jsonb),

('d0000004-0000-0000-0000-000000000002','Panang Curry','Thai','Medium',10,25,4,
 '[{"step_number":1,"instruction":"In a wok, fry panang curry paste in 1/2 cup coconut cream until oil splits.","time_minutes":4},
   {"step_number":2,"instruction":"Add sliced beef or chicken; cook until browned and coated in the paste.","time_minutes":6},
   {"step_number":3,"instruction":"Pour in coconut milk, kaffir lime leaves, palm sugar, fish sauce; simmer 12 min.","time_minutes":12},
   {"step_number":4,"instruction":"Stir in sliced red bell pepper, Thai basil; cook 2 min. Serve over jasmine rice. Drizzle with extra cream.","time_minutes":3}]'::jsonb),

('d0000004-0000-0000-0000-000000000003','Red Curry','Thai','Medium',10,25,4,
 '[{"step_number":1,"instruction":"In a wok, fry red curry paste in coconut cream until aromatic and oil separates.","time_minutes":4},
   {"step_number":2,"instruction":"Add chicken / beef / tofu and stir-fry to coat.","time_minutes":6},
   {"step_number":3,"instruction":"Pour in coconut milk, fish sauce, palm sugar, kaffir lime leaves; simmer 10 min.","time_minutes":10},
   {"step_number":4,"instruction":"Add bamboo shoots, eggplant, bell pepper. Cook 5 min. Finish with Thai basil. Serve with rice.","time_minutes":5}]'::jsonb),

('d0000004-0000-0000-0000-000000000004','Pad Kra Pao','Thai','Easy',5,10,2,
 '[{"step_number":1,"instruction":"Pound garlic and bird''s-eye chillies into a coarse paste.","time_minutes":3},
   {"step_number":2,"instruction":"Heat wok smoking hot; add oil and the garlic-chilli; sauté 20 sec. Add minced chicken/pork/beef; stir-fry on high until browned.","time_minutes":5},
   {"step_number":3,"instruction":"Season with oyster sauce, soy, fish sauce, sugar; toss 1 min. Off heat, stir in a big handful of Thai holy basil.","time_minutes":2},
   {"step_number":4,"instruction":"Serve over jasmine rice topped with a crispy-edged fried egg (kai dao).","time_minutes":5}]'::jsonb),

('d0000004-0000-0000-0000-000000000005','Thai Basil Beef','Thai','Easy',5,8,4,
 '[{"step_number":1,"instruction":"Slice flank steak thin against the grain.","time_minutes":4},
   {"step_number":2,"instruction":"Heat wok very hot; sear beef in batches.","time_minutes":3},
   {"step_number":3,"instruction":"Add minced garlic, sliced chilli, sliced bell pepper, onion; toss 1 min.","time_minutes":2},
   {"step_number":4,"instruction":"Stir in oyster sauce, soy, fish sauce, sugar, a splash of water. Off heat, fold in Thai basil. Serve over rice.","time_minutes":2}]'::jsonb),

('d0000004-0000-0000-0000-000000000006','Thai Fried Rice','Thai','Easy',10,12,4,
 '[{"step_number":1,"instruction":"Have day-old jasmine rice ready, cold and broken up.","time_minutes":3},
   {"step_number":2,"instruction":"In a wok on high, scramble eggs to small curds; remove. Stir-fry garlic, chopped shallot, prawn or chicken.","time_minutes":4},
   {"step_number":3,"instruction":"Add cold rice and toss vigorously, breaking clumps. Add tomato, spring onion. Season with fish sauce, soy, sugar, white pepper.","time_minutes":5},
   {"step_number":4,"instruction":"Fold egg back in. Serve with lime, sliced cucumber, and a fish-sauce-and-chilli condiment.","time_minutes":3}]'::jsonb),

('d0000004-0000-0000-0000-000000000007','Som Tam','Thai','Easy',15,0,4,
 '[{"step_number":1,"instruction":"Pound garlic, bird''s-eye chillies, peanuts coarsely in a mortar.","time_minutes":3},
   {"step_number":2,"instruction":"Add palm sugar, fish sauce, lime juice, tamarind; pound to dissolve.","time_minutes":3},
   {"step_number":3,"instruction":"Add halved cherry tomatoes, sliced long beans; pound gently to bruise.","time_minutes":3},
   {"step_number":4,"instruction":"Add shredded green papaya (and dried shrimp if you have); toss with a spoon and pestle. Taste — balance sour/salty/sweet/spicy. Serve immediately.","time_minutes":6}]'::jsonb),

('d0000004-0000-0000-0000-000000000008','Thai Glass Noodle Salad','Thai','Easy',15,10,4,
 '[{"step_number":1,"instruction":"Soak glass noodles 5 min in hot water; drain when just tender.","time_minutes":7},
   {"step_number":2,"instruction":"Poach minced pork (or shrimp) in simmering water 2 min until just cooked; drain.","time_minutes":4},
   {"step_number":3,"instruction":"Whisk dressing: lime juice + fish sauce + sugar + minced chilli + garlic.","time_minutes":3},
   {"step_number":4,"instruction":"Toss noodles, pork/shrimp, sliced shallot, tomato, celery, cilantro, mint, crushed peanut with dressing. Serve at room temp.","time_minutes":5}]'::jsonb),

('d0000004-0000-0000-0000-000000000009','Chicken Satay','Thai','Medium',60,15,4,
 '[{"step_number":1,"instruction":"Marinate chicken strips in coconut milk, turmeric, lemongrass, coriander root, garlic, palm sugar, fish sauce. Rest 30 min.","time_minutes":40},
   {"step_number":2,"instruction":"Thread on soaked bamboo skewers.","time_minutes":8},
   {"step_number":3,"instruction":"Grill over charcoal or hot pan 3 min per side, basting with coconut cream.","time_minutes":7},
   {"step_number":4,"instruction":"Serve with peanut sauce (peanut butter + red curry paste + coconut milk + tamarind + palm sugar + fish sauce, simmered) and cucumber relish.","time_minutes":5}]'::jsonb),

('d0000004-0000-0000-0000-00000000000a','Thai Drunken Noodles','Thai','Easy',10,12,4,
 '[{"step_number":1,"instruction":"Soak wide flat rice noodles in hot water 10 min until pliable; drain.","time_minutes":10},
   {"step_number":2,"instruction":"Pound garlic + Thai chillies. In a screaming-hot wok, stir-fry with oil 20 sec, then add chicken/beef/prawn.","time_minutes":4},
   {"step_number":3,"instruction":"Toss in noodles with dark soy, regular soy, oyster sauce, sugar, fish sauce; stir-fry briskly so noodles char and pick up wok hei.","time_minutes":4},
   {"step_number":4,"instruction":"Fold in lots of holy basil, sliced bell pepper, baby corn, green onion. Serve immediately.","time_minutes":3}]'::jsonb),

('d0000004-0000-0000-0000-00000000000b','Larb','Thai','Easy',10,10,4,
 '[{"step_number":1,"instruction":"Dry-toast sticky rice in a pan until golden; pound to a coarse powder (khao kua).","time_minutes":7},
   {"step_number":2,"instruction":"Cook minced chicken/pork in a tiny bit of water on medium-high until just cooked; do not brown. Cool slightly.","time_minutes":5},
   {"step_number":3,"instruction":"Dress with fish sauce, lime juice, sliced shallot, spring onion, dried chilli flakes, palm sugar to balance.","time_minutes":4},
   {"step_number":4,"instruction":"Toss in the toasted rice powder + lots of fresh mint and cilantro. Serve with sticky rice and crisp lettuce/cabbage for wrapping.","time_minutes":3}]'::jsonb),

('d0000004-0000-0000-0000-00000000000c','Thai Mango Salad','Thai','Easy',15,0,4,
 '[{"step_number":1,"instruction":"Julienne unripe green mango with a peeler or mandoline.","time_minutes":7},
   {"step_number":2,"instruction":"Whisk dressing: fish sauce + lime juice + palm sugar + sliced bird''s-eye chillies.","time_minutes":3},
   {"step_number":3,"instruction":"Toss mango with sliced shallot, halved cherry tomatoes, julienned carrot, fresh mint, cilantro.","time_minutes":3},
   {"step_number":4,"instruction":"Top with crushed roasted peanuts and crispy shallots. Serve chilled.","time_minutes":2}]'::jsonb)

ON CONFLICT (id) DO NOTHING;

-- ─── Nutrition for all new world cuisine recipes ─────────────────────────
INSERT INTO recipe_nutrition (recipe_id, calories, protein_g, carbs_g, fat_g, fiber_g, sodium_mg) VALUES
-- Mexican
('d0000001-0000-0000-0000-000000000001', 320, 25, 22, 14, 3, 580),  -- Chicken Tacos
('d0000001-0000-0000-0000-000000000002', 280, 22, 22, 12, 4, 520),  -- Fish Tacos
('d0000001-0000-0000-0000-000000000003', 420, 28, 18, 28, 2, 680),  -- Carnitas Tacos
('d0000001-0000-0000-0000-000000000004', 380, 22, 28, 20, 4, 720),  -- Enchiladas Rojas
('d0000001-0000-0000-0000-000000000005', 420, 18, 22, 30, 5, 720),  -- Chiles Rellenos
('d0000001-0000-0000-0000-000000000006', 520, 35, 32, 28, 6, 820),  -- Mole Poblano
('d0000001-0000-0000-0000-000000000007', 480, 38, 35, 22, 6, 980),  -- Pozole Rojo
('d0000001-0000-0000-0000-000000000008', 320, 22, 28, 12, 4, 720),  -- Tortilla Soup
('d0000001-0000-0000-0000-000000000009',  40,  1,  8,  1, 2, 280),  -- Salsa Verde
('d0000001-0000-0000-0000-00000000000a', 220,  9, 30,  7, 9, 480),  -- Refried Beans
('d0000001-0000-0000-0000-00000000000b', 280,  5, 50,  6, 2, 580),  -- Mexican Rice
('d0000001-0000-0000-0000-00000000000c', 220,  6, 28, 10, 3, 380),  -- Elote
('d0000001-0000-0000-0000-00000000000d', 320, 14, 38, 14, 4, 580),  -- Tamales
('d0000001-0000-0000-0000-00000000000e', 380, 38,  6, 22, 1, 580),  -- Carne Asada
('d0000001-0000-0000-0000-00000000000f', 380, 14, 38, 20, 5, 620),  -- Chilaquiles
('d0000001-0000-0000-0000-000000000010', 380, 18, 30, 22, 5, 620),  -- Huevos Rancheros
('d0000001-0000-0000-0000-000000000011', 320,  4, 42, 16, 1, 180),  -- Churros
('d0000001-0000-0000-0000-000000000012', 380,  8, 52, 16, 0, 220),  -- Tres Leches Cake

-- Chinese
('d0000002-0000-0000-0000-000000000001', 380, 18, 50, 12, 4, 820),  -- Chow Mein
('d0000002-0000-0000-0000-000000000002', 420, 18, 55, 14, 4, 920),  -- Lo Mein
('d0000002-0000-0000-0000-000000000003', 480, 30, 38, 22, 2, 920),  -- General Tso's Chicken
('d0000002-0000-0000-0000-000000000004', 480, 30, 50, 18, 2, 820),  -- Orange Chicken
('d0000002-0000-0000-0000-000000000005', 480, 30, 45, 20, 2, 880),  -- Sesame Chicken
('d0000002-0000-0000-0000-000000000006', 480, 28, 45, 22, 2, 780),  -- Sweet and Sour Pork
('d0000002-0000-0000-0000-000000000007', 120,  8,  6,  6, 1, 720),  -- Egg Drop Soup
('d0000002-0000-0000-0000-000000000008', 280, 18, 32,  9, 2, 920),  -- Wonton Soup
('d0000002-0000-0000-0000-000000000009', 280,  6, 32, 14, 4, 580),  -- Spring Rolls
('d0000002-0000-0000-0000-00000000000a', 320, 16, 30, 16, 2, 720),  -- Pot Stickers
('d0000002-0000-0000-0000-00000000000b', 380, 28, 18, 22, 1, 980),  -- Char Siu
('d0000002-0000-0000-0000-00000000000c', 420, 22, 50, 14, 3, 920),  -- Singapore Noodles
('d0000002-0000-0000-0000-00000000000d', 380, 16, 52, 12, 2, 820),  -- Yangzhou Fried Rice
('d0000002-0000-0000-0000-00000000000e', 320, 24,  8, 22, 1, 920),  -- Salt and Pepper Shrimp
('d0000002-0000-0000-0000-00000000000f', 420, 32, 32, 18, 1, 820),  -- Mongolian Beef
('d0000002-0000-0000-0000-000000000010', 480, 24, 14, 38, 2, 980),  -- Twice Cooked Pork
('d0000002-0000-0000-0000-000000000011', 180,  6, 22,  8, 5, 580),  -- Vegetable Stir Fry
('d0000002-0000-0000-0000-000000000012', 280, 38,  4, 12, 0, 780),  -- Steamed Fish with Ginger

-- Italian
('d0000003-0000-0000-0000-000000000001', 580, 28, 68, 22, 3, 820),  -- Spaghetti Carbonara
('d0000003-0000-0000-0000-000000000002', 480, 12, 65, 18, 3, 380),  -- Spaghetti Aglio e Olio
('d0000003-0000-0000-0000-000000000003', 520, 14, 72, 16, 5, 580),  -- Penne Arrabbiata
('d0000003-0000-0000-0000-000000000004', 620, 22, 70, 28, 3, 820),  -- Fettuccine Alfredo
('d0000003-0000-0000-0000-000000000005', 580, 32, 38, 30, 4, 820),  -- Lasagna
('d0000003-0000-0000-0000-000000000006', 520, 26, 52, 22, 4, 680),  -- Ravioli
('d0000003-0000-0000-0000-000000000007', 380,  8, 60, 11, 3, 580),  -- Gnocchi
('d0000003-0000-0000-0000-000000000008', 480, 14, 60, 18, 2, 780),  -- Risotto Milanese
('d0000003-0000-0000-0000-000000000009', 420, 14, 60, 14, 3, 720),  -- Pizza Marinara
('d0000003-0000-0000-0000-00000000000a', 620, 28, 55, 32, 3, 1080), -- Pizza Quattro Formaggi
('d0000003-0000-0000-0000-00000000000b', 580, 24, 58, 26, 3, 980),  -- Pizza Pepperoni
('d0000003-0000-0000-0000-00000000000c', 180,  4, 24,  7, 2, 380),  -- Bruschetta
('d0000003-0000-0000-0000-00000000000d', 280, 12, 38,  9, 8, 680),  -- Minestrone Soup
('d0000003-0000-0000-0000-00000000000e', 620, 48, 14, 38, 2, 820),  -- Osso Buco
('d0000003-0000-0000-0000-00000000000f', 580, 42, 32, 30, 3, 920),  -- Chicken Parmesan
('d0000003-0000-0000-0000-000000000010', 480, 22, 38, 28, 6, 820),  -- Eggplant Parmesan
('d0000003-0000-0000-0000-000000000011', 280,  4, 22, 20, 0, 60),   -- Panna Cotta
('d0000003-0000-0000-0000-000000000012', 320,  8, 38, 16, 1, 180),  -- Cannoli
('d0000003-0000-0000-0000-000000000013', 220,  5, 30,  9, 1, 480),  -- Focaccia

-- Thai
('d0000004-0000-0000-0000-000000000001', 580, 32, 38, 32, 4, 820),  -- Massaman Curry
('d0000004-0000-0000-0000-000000000002', 480, 28, 18, 32, 3, 820),  -- Panang Curry
('d0000004-0000-0000-0000-000000000003', 420, 28, 18, 28, 4, 820),  -- Red Curry
('d0000004-0000-0000-0000-000000000004', 480, 30, 35, 22, 2, 920),  -- Pad Kra Pao
('d0000004-0000-0000-0000-000000000005', 380, 32, 14, 22, 2, 820),  -- Thai Basil Beef
('d0000004-0000-0000-0000-000000000006', 420, 18, 55, 14, 2, 920),  -- Thai Fried Rice
('d0000004-0000-0000-0000-000000000007', 180,  6, 22, 10, 4, 680),  -- Som Tam
('d0000004-0000-0000-0000-000000000008', 280, 22, 28, 10, 2, 920),  -- Thai Glass Noodle Salad
('d0000004-0000-0000-0000-000000000009', 380, 28, 18, 22, 2, 720),  -- Chicken Satay
('d0000004-0000-0000-0000-00000000000a', 480, 28, 55, 16, 3, 1080), -- Drunken Noodles
('d0000004-0000-0000-0000-00000000000b', 320, 28, 14, 14, 3, 720),  -- Larb
('d0000004-0000-0000-0000-00000000000c', 180,  4, 24,  9, 4, 680)   -- Thai Mango Salad

ON CONFLICT (recipe_id) DO NOTHING;

COMMIT;
