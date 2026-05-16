# Supabase Migration

Consolidated schema + recipe seed for setting up the production database in Supabase.

## Files

- **`01_schema.sql`** — All tables, indexes, constraints, extensions (citext, pg_trgm). Apply once.
- **`02_recipes_seed.sql`** — 72 recipes + ingredients + nutrition. Apply once after schema.

## How to apply (Supabase SQL editor)

1. Go to your Supabase project → **SQL Editor** → **New query**
2. Paste the entire contents of `01_schema.sql`, click **Run**
3. New query → paste `02_recipes_seed.sql`, click **Run**

If the SQL editor rejects the file due to size, split it: run extensions + tables first, then indexes + constraints.

## How to apply (psql CLI)

```bash
# Get connection string from Supabase: Project Settings → Database → Connection string (URI)
export SUPABASE_DB_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"

psql "$SUPABASE_DB_URL" -f 01_schema.sql
psql "$SUPABASE_DB_URL" -f 02_recipes_seed.sql
```

## Notes

- These dumps were generated from local Postgres 16.
- Supabase uses Postgres 15+ which is compatible with everything we use.
- `gen_random_uuid()` is provided by `pgcrypto` extension (included in Supabase by default).
- Users / test data are **NOT** included — create them via the app's signup flow.

## Regenerating

To refresh these dumps from the current local DB:

```bash
DB_USER=$(grep POSTGRES_USER ../../.env | cut -d= -f2)
DB_NAME=$(grep POSTGRES_DB ../../.env | cut -d= -f2)

docker exec cooking-postgres pg_dump -U "$DB_USER" -d "$DB_NAME" \
  --schema-only --no-owner --no-privileges --no-comments \
  | grep -v -E '^\\(restrict|unrestrict) ' \
  > 01_schema.sql

docker exec cooking-postgres pg_dump -U "$DB_USER" -d "$DB_NAME" \
  --data-only --no-owner --inserts --rows-per-insert=50 \
  --table=recipes --table=recipe_ingredients --table=recipe_nutrition \
  | grep -v -E '^\\(restrict|unrestrict) ' \
  > 02_recipes_seed.sql

# Note: --inserts is required for the Supabase web SQL editor.
# Without it, pg_dump emits COPY FROM stdin which only works via psql CLI.
```
