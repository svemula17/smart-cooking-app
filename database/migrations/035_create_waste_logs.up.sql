CREATE TABLE IF NOT EXISTS waste_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id       UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  item_name      TEXT NOT NULL,
  quantity       NUMERIC(10,2),
  unit           TEXT,
  estimated_cost NUMERIC(10,2),
  expired_on     DATE NOT NULL,
  logged_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS waste_logs_house_idx ON waste_logs (house_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS waste_logs_month_idx ON waste_logs (house_id, date_trunc('month', logged_at));
