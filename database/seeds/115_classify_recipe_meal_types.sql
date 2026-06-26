-- 115_classify_recipe_meal_types.sql
-- Initial meal-type tagging for the Home meal filter.
--
-- Dish names identify BREAKFAST reliably, but cannot separate LUNCH from
-- DINNER (most mains are both). So: default every recipe to {lunch,dinner},
-- then overwrite clearly-breakfast dishes to {breakfast}. Idempotent — safe to
-- re-run. Hand-curate individual rows later as needed.

-- 1) Default: every active recipe is a lunch/dinner main.
UPDATE recipes
   SET meal_types = ARRAY['lunch','dinner']
 WHERE deleted_at IS NULL;

-- 2) Clearly-breakfast dishes (Indian + Western), tagged breakfast-only.
UPDATE recipes
   SET meal_types = ARRAY['breakfast']
 WHERE deleted_at IS NULL
   AND name ILIKE ANY (ARRAY[
     -- South Asian breakfast
     '%dosa%','%idli%','%medu vada%','%vada%','%upma%','%poha%','%paratha%',
     '%uttapam%','%pongal%','%paniyaram%','%cheela%','%chilla%','%thepla%',
     '%bhurji%','%appam%','%puttu%','%sheera%','%poori%','%puri%','%aloo paratha%',
     -- eggs / brunch (avoid generic "egg" so egg curry/eggplant aren't caught)
     '%omelet%','%omelette%','%scrambled%','%benedict%','%shakshuka%','%frittata%',
     -- Western breakfast
     '%pancake%','%waffle%','%french toast%','%toast%','%oats%','%oatmeal%',
     '%granola%','%muesli%','%cereal%','%smoothie%','%porridge%','%congee%',
     '%jook%','%bagel%','%croissant%','%muffin%','%hash brown%'
   ]);
