CREATE TABLE IF NOT EXISTS meal_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id       UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  scheduled_date  DATE NOT NULL,
  meal_type       VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  cooking_time    TIME DEFAULT '18:00',
  completed       BOOLEAN DEFAULT false,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, scheduled_date, meal_type)
);

CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON meal_plans(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id   ON meal_plans(user_id);
