CREATE TABLE IF NOT EXISTS expenses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id         UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  paid_by          UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount           NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  description      TEXT NOT NULL,
  category         TEXT NOT NULL DEFAULT 'groceries',
  shopping_list_id UUID REFERENCES shopping_lists(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expense_splits (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount     NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  is_settled BOOLEAN NOT NULL DEFAULT false,
  settled_at TIMESTAMPTZ,
  UNIQUE (expense_id, user_id)
);

CREATE INDEX IF NOT EXISTS expenses_house_id_idx          ON expenses (house_id);
CREATE INDEX IF NOT EXISTS expenses_paid_by_idx           ON expenses (paid_by);
CREATE INDEX IF NOT EXISTS expenses_created_at_idx        ON expenses (created_at DESC);
CREATE INDEX IF NOT EXISTS expense_splits_expense_id_idx  ON expense_splits (expense_id);
CREATE INDEX IF NOT EXISTS expense_splits_user_id_idx     ON expense_splits (user_id);
CREATE INDEX IF NOT EXISTS expense_splits_settled_idx     ON expense_splits (user_id, is_settled) WHERE is_settled = false;
