CREATE TABLE IF NOT EXISTS cook_swap_requests (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id                 UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  requester_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requester_schedule_id    UUID NOT NULL REFERENCES cook_schedule(id) ON DELETE CASCADE,
  target_id                UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_schedule_id       UUID NOT NULL REFERENCES cook_schedule(id) ON DELETE CASCADE,
  status                   TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS swap_requests_house_idx    ON cook_swap_requests (house_id);
CREATE INDEX IF NOT EXISTS swap_requests_target_idx   ON cook_swap_requests (target_id, status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS swap_requests_requester_idx ON cook_swap_requests (requester_id);
