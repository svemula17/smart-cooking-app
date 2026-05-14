ALTER TABLE meal_plans
  ADD COLUMN IF NOT EXISTS house_id UUID REFERENCES houses(id) ON DELETE CASCADE;

ALTER TABLE shopping_lists
  ADD COLUMN IF NOT EXISTS house_id UUID REFERENCES houses(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS meal_plans_house_id_idx      ON meal_plans (house_id) WHERE house_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS shopping_lists_house_id_idx  ON shopping_lists (house_id) WHERE house_id IS NOT NULL;
