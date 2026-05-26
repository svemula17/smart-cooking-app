-- 040_recipe_ingredients_unit_check.up.sql
-- Lock recipe_ingredients.unit to a canonical vocabulary. Without this the
-- column drifted across seed files: plural/singular pairs (units vs unit,
-- cups vs cup, cloves vs clove), size words used as units (medium, small,
-- large), and one-off values like 'recipe' all coexisted, which broke any
-- aggregation that bucketed by unit (shopping-list rollups, pantry matches).

ALTER TABLE recipe_ingredients
  ADD CONSTRAINT recipe_ingredients_unit_valid CHECK (
    unit IN (
      -- mass
      'g', 'kg',
      -- volume
      'ml', 'l', 'tsp', 'tbsp', 'cup', 'pinch',
      -- count
      'unit', 'clove', 'stalk', 'pod', 'sprig', 'slice',
      'piece', 'sheet', 'bunch', 'head', 'package', 'can'
    )
  );
