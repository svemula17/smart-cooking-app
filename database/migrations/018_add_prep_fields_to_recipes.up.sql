ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS marination_time_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS soaking_time_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS prep_instructions JSONB;
