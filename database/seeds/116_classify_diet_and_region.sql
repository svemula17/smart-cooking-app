-- 116_classify_diet_and_region.sql
-- Backfill `diet` (from recipe_ingredients) and `region` (Indian dish-name
-- keywords). Idempotent; hand-editable later.

-- ─── DIET (all cuisines, derived from ingredients) ───────────────────────────
-- 1) Non-veg if any ingredient is meat/fish/seafood. `\ymeat\y`/`\yham\y` are
--    word-bounded so "graham" / "meatless" don't false-match.
UPDATE recipes SET diet = 'nonveg'
 WHERE deleted_at IS NULL
   AND EXISTS (
     SELECT 1 FROM recipe_ingredients ri
      WHERE ri.recipe_id = recipes.id
        AND ri.ingredient_name ~* '(chicken|mutton|lamb|goat|beef|pork|bacon|\yham\y|fish|prawn|shrimp|crab|squid|octopus|oyster|keema|qeema|sausage|anchovy|seafood|\ymeat\y)'
   );

-- 2) Egg (ovo-veg) — real egg only; exclude "eggplant" and "reggiano".
UPDATE recipes SET diet = 'egg'
 WHERE deleted_at IS NULL AND diet IS NULL
   AND EXISTS (
     SELECT 1 FROM recipe_ingredients ri
      WHERE ri.recipe_id = recipes.id
        AND ri.ingredient_name ~* '\yeggs?\y'
        AND ri.ingredient_name !~* 'eggplant|reggiano'
   );

-- 3) Everything else is vegetarian.
UPDATE recipes SET diet = 'veg'
 WHERE deleted_at IS NULL AND diet IS NULL;

-- ─── REGION (Indian only) ────────────────────────────────────────────────────
UPDATE recipes SET region = 'South Indian'
 WHERE cuisine_type = 'Indian' AND deleted_at IS NULL
   AND name ILIKE ANY (ARRAY['%dosa%','%idli%','%vada%','%sambar%','%uttapam%','%pongal%',
     '%rasam%','%appam%','%upma%','%medu%','%avial%','%puttu%','%bisi bele%','%pesarattu%',
     '%rava idli%','%coconut chutney%','%kootu%','%poriyal%']);

UPDATE recipes SET region = 'Punjabi'
 WHERE cuisine_type = 'Indian' AND deleted_at IS NULL AND region IS NULL
   AND name ILIKE ANY (ARRAY['%butter chicken%','%dal makhani%','%sarson%','%makki%',
     '%chole%','%bhature%','%amritsari%','%tandoori%','%rajma%','%lassi%','%chana masala%',
     '%paneer tikka%','%aloo paratha%']);

UPDATE recipes SET region = 'Hyderabadi'
 WHERE cuisine_type = 'Indian' AND deleted_at IS NULL AND region IS NULL
   AND name ILIKE ANY (ARRAY['%biryani%','%haleem%','%mirchi ka salan%','%double ka meetha%']);

UPDATE recipes SET region = 'Kashmiri'
 WHERE cuisine_type = 'Indian' AND deleted_at IS NULL AND region IS NULL
   AND name ILIKE ANY (ARRAY['%rogan josh%','%dum aloo%','%yakhni%','%gushtaba%']);

UPDATE recipes SET region = 'Gujarati'
 WHERE cuisine_type = 'Indian' AND deleted_at IS NULL AND region IS NULL
   AND name ILIKE ANY (ARRAY['%dhokla%','%thepla%','%khandvi%','%undhiyu%','%fafda%',
     '%handvo%','%khaman%']);

UPDATE recipes SET region = 'Bengali'
 WHERE cuisine_type = 'Indian' AND deleted_at IS NULL AND region IS NULL
   AND name ILIKE ANY (ARRAY['%macher%','%rasgulla%','%shorshe%','%luchi%','%sandesh%',
     '%posto%','%chingri%','%mishti%']);

UPDATE recipes SET region = 'Maharashtrian'
 WHERE cuisine_type = 'Indian' AND deleted_at IS NULL AND region IS NULL
   AND name ILIKE ANY (ARRAY['%pav bhaji%','%vada pav%','%misal%','%poha%','%thalipeeth%',
     '%puran poli%','%sabudana%']);

UPDATE recipes SET region = 'Rajasthani'
 WHERE cuisine_type = 'Indian' AND deleted_at IS NULL AND region IS NULL
   AND name ILIKE ANY (ARRAY['%laal maas%','%gatte%','%ker sangri%','%dal baati%','%ghevar%']);

UPDATE recipes SET region = 'Goan'
 WHERE cuisine_type = 'Indian' AND deleted_at IS NULL AND region IS NULL
   AND name ILIKE ANY (ARRAY['%vindaloo%','%xacuti%','%sorpotel%','%cafreal%']);

-- Everything else Indian → North Indian (the largest bucket).
UPDATE recipes SET region = 'North Indian'
 WHERE cuisine_type = 'Indian' AND deleted_at IS NULL AND region IS NULL;
