CREATE TABLE IF NOT EXISTS grocery_budgets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id   UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  month      TEXT NOT NULL,
  amount     NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (house_id, month)
);

CREATE INDEX IF NOT EXISTS grocery_budgets_house_idx ON grocery_budgets (house_id);
