# Database

PostgreSQL 16 schema for Smart Cooking. Migrations are plain SQL with paired `up`/`down` files; seeds are loaded after a fresh up.

## Layout

```
database/
├── migrations/
│   ├── 001_create_users.up.sql
│   ├── 001_create_users.down.sql
│   ├── 002_create_user_preferences.up.sql
│   ├── 002_create_user_preferences.down.sql
│   ├── 003_create_recipes.up.sql
│   ├── 003_create_recipes.down.sql
│   ├── 004_create_recipe_ingredients.up.sql
│   ├── 004_create_recipe_ingredients.down.sql
│   ├── 005_create_recipe_nutrition.up.sql
│   ├── 005_create_recipe_nutrition.down.sql
│   ├── 006_create_nutrition_logs.up.sql
│   ├── 006_create_nutrition_logs.down.sql
│   ├── 007_create_daily_nutrition.up.sql
│   ├── 007_create_daily_nutrition.down.sql
│   ├── 008_create_shopping_lists.up.sql
│   ├── 008_create_shopping_lists.down.sql
│   ├── 009_create_shopping_items.up.sql
│   ├── 009_create_shopping_items.down.sql
│   ├── 010_create_cooking_sessions.up.sql
│   └── 010_create_cooking_sessions.down.sql
└── seeds/
    ├── 001_test_user.sql
    ├── 002_recipes.sql
    ├── 003_recipe_ingredients.sql
    └── 004_recipe_nutrition.sql
```

## Apply all migrations

Inside Docker:

```bash
docker-compose exec -T postgres psql -U cooking -d smartcooking < database/migrations/001_create_users.up.sql
docker-compose exec -T postgres psql -U cooking -d smartcooking < database/migrations/002_create_user_preferences.up.sql
# ...etc
```

Or with a one-liner that runs all up migrations in order:

```bash
for f in database/migrations/*.up.sql; do
    docker-compose exec -T postgres psql -U cooking -d smartcooking < "$f"
done
```

## Load seed data

```bash
for f in database/seeds/*.sql; do
    docker-compose exec -T postgres psql -U cooking -d smartcooking < "$f"
done
```

## Roll back

Down migrations are paired with each up file. Run them in reverse:

```bash
for f in $(ls -r database/migrations/*.down.sql); do
    docker-compose exec -T postgres psql -U cooking -d smartcooking < "$f"
done
```

## Notes

- `users.email` uses `CITEXT` for case-insensitive uniqueness.
- All foreign keys use `ON DELETE CASCADE` except `nutrition_logs.recipe_id` (`SET NULL`) and `recipe_nutrition.verified_by` (`SET NULL`) — preserving log history when a recipe or dietitian is removed.
- `nutrition_logs.auto_logged` is the key UX feature: when a `cooking_sessions` row flips to `completed`, the application writes a matching `nutrition_logs` row with `auto_logged = TRUE`.
- `daily_nutrition` is a materialized rollup keyed by `(user_id, date)` — the application maintains it from `nutrition_logs` writes (or via a scheduled job).
