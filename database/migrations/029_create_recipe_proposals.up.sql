CREATE TABLE IF NOT EXISTS cook_recipe_proposals (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cook_schedule_id   UUID NOT NULL REFERENCES cook_schedule(id) ON DELETE CASCADE,
  house_id           UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  recipe_ids         JSONB NOT NULL DEFAULT '[]',
  status             TEXT NOT NULL DEFAULT 'voting' CHECK (status IN ('voting','decided')),
  selected_recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  voting_ends_at     TIMESTAMPTZ NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cook_schedule_id)
);

CREATE TABLE IF NOT EXISTS cook_recipe_votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES cook_recipe_proposals(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id   UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (proposal_id, user_id)
);

CREATE INDEX IF NOT EXISTS proposals_house_id_idx      ON cook_recipe_proposals (house_id);
CREATE INDEX IF NOT EXISTS proposals_status_idx        ON cook_recipe_proposals (status) WHERE status = 'voting';
CREATE INDEX IF NOT EXISTS recipe_votes_proposal_idx   ON cook_recipe_votes (proposal_id);
