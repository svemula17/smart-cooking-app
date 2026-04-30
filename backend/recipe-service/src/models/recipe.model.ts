import type { PoolClient } from 'pg';
import { pool } from '../config/database';
import type { Recipe, RecipeNutrition, RecipeStep } from '../types';

const RECIPE_COLUMNS = `
  id, name, cuisine_type, difficulty,
  prep_time_minutes, cook_time_minutes, servings,
  instructions, image_url, verified_by_dietitian,
  created_at, deleted_at
`;

const RECIPE_COLUMNS_ALIASED_R = `
  r.id, r.name, r.cuisine_type, r.difficulty,
  r.prep_time_minutes, r.cook_time_minutes, r.servings,
  r.instructions, r.image_url, r.verified_by_dietitian,
  r.created_at, r.deleted_at
`;

export interface ListFilters {
  cuisine_type?: string;
  difficulty?: string;
  max_cook_time?: number;
}

export interface SearchFilters extends ListFilters {
  q?: string;
  min_protein?: number;
}

export const RecipeModel = {
  /** List active (non-deleted) recipes with optional filters. Returns rows + total count. */
  async list(
    filters: ListFilters,
    pageLimit: { limit: number; offset: number },
  ): Promise<{ rows: Recipe[]; total: number }> {
    const conditions: string[] = ['deleted_at IS NULL'];
    const params: unknown[] = [];

    if (filters.cuisine_type) {
      params.push(filters.cuisine_type);
      conditions.push(`cuisine_type = $${params.length}`);
    }
    if (filters.difficulty) {
      params.push(filters.difficulty);
      conditions.push(`difficulty = $${params.length}`);
    }
    if (filters.max_cook_time != null) {
      params.push(filters.max_cook_time);
      conditions.push(`(prep_time_minutes + cook_time_minutes) <= $${params.length}`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM recipes ${where}`,
      params,
    );
    const total = Number(countResult.rows[0]?.count ?? 0);

    params.push(pageLimit.limit, pageLimit.offset);
    const limitIdx = params.length - 1;
    const offsetIdx = params.length;

    const dataResult = await pool.query<Recipe>(
      `SELECT ${RECIPE_COLUMNS}
         FROM recipes
         ${where}
        ORDER BY created_at DESC, id ASC
        LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params,
    );

    return { rows: dataResult.rows, total };
  },

  /** Full-text search over recipe name + ingredient names with optional filters. */
  async search(
    filters: SearchFilters,
    pageLimit: { limit: number; offset: number },
  ): Promise<{ rows: Recipe[]; total: number }> {
    const conditions: string[] = ['r.deleted_at IS NULL'];
    const params: unknown[] = [];

    if (filters.q) {
      params.push(`%${filters.q}%`);
      const idx = params.length;
      conditions.push(
        `(r.name ILIKE $${idx} OR EXISTS (
            SELECT 1 FROM recipe_ingredients ri
             WHERE ri.recipe_id = r.id AND ri.ingredient_name ILIKE $${idx}
          ))`,
      );
    }
    if (filters.cuisine_type) {
      params.push(filters.cuisine_type);
      conditions.push(`r.cuisine_type = $${params.length}`);
    }
    if (filters.difficulty) {
      params.push(filters.difficulty);
      conditions.push(`r.difficulty = $${params.length}`);
    }
    if (filters.max_cook_time != null) {
      params.push(filters.max_cook_time);
      conditions.push(`(r.prep_time_minutes + r.cook_time_minutes) <= $${params.length}`);
    }
    if (filters.min_protein != null) {
      params.push(filters.min_protein);
      conditions.push(
        `EXISTS (SELECT 1 FROM recipe_nutrition n
                  WHERE n.recipe_id = r.id AND n.protein_g >= $${params.length})`,
      );
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM recipes r ${where}`,
      params,
    );
    const total = Number(countResult.rows[0]?.count ?? 0);

    params.push(pageLimit.limit, pageLimit.offset);
    const limitIdx = params.length - 1;
    const offsetIdx = params.length;

    const dataResult = await pool.query<Recipe>(
      `SELECT ${RECIPE_COLUMNS_ALIASED_R}
         FROM recipes r
         ${where}
        ORDER BY r.created_at DESC, r.id ASC
        LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params,
    );

    return { rows: dataResult.rows, total };
  },

  async findById(id: string): Promise<Recipe | null> {
    const { rows } = await pool.query<Recipe>(
      `SELECT ${RECIPE_COLUMNS}
         FROM recipes
        WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    return rows[0] ?? null;
  },

  async create(
    input: {
      name: string;
      cuisine_type: string;
      difficulty: string;
      prep_time_minutes: number;
      cook_time_minutes: number;
      servings: number;
      instructions: RecipeStep[];
      image_url?: string | null;
    },
    client: PoolClient | typeof pool = pool,
  ): Promise<Recipe> {
    const { rows } = await client.query<Recipe>(
      `INSERT INTO recipes
         (name, cuisine_type, difficulty, prep_time_minutes, cook_time_minutes,
          servings, instructions, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
       RETURNING ${RECIPE_COLUMNS}`,
      [
        input.name,
        input.cuisine_type,
        input.difficulty,
        input.prep_time_minutes,
        input.cook_time_minutes,
        input.servings,
        JSON.stringify(input.instructions),
        input.image_url ?? null,
      ],
    );
    return rows[0];
  },

  /**
   * Patch any subset of recipe fields. Empty `patch` is a no-op (returns the
   * existing row).
   */
  async update(
    id: string,
    patch: Partial<{
      name: string;
      cuisine_type: string;
      difficulty: string;
      prep_time_minutes: number;
      cook_time_minutes: number;
      servings: number;
      instructions: RecipeStep[];
      image_url: string | null;
    }>,
  ): Promise<Recipe | null> {
    const sets: string[] = [];
    const params: unknown[] = [id];

    const push = (col: string, value: unknown, cast = '') => {
      params.push(value);
      sets.push(`${col} = $${params.length}${cast}`);
    };

    if (patch.name !== undefined) push('name', patch.name);
    if (patch.cuisine_type !== undefined) push('cuisine_type', patch.cuisine_type);
    if (patch.difficulty !== undefined) push('difficulty', patch.difficulty);
    if (patch.prep_time_minutes !== undefined) push('prep_time_minutes', patch.prep_time_minutes);
    if (patch.cook_time_minutes !== undefined) push('cook_time_minutes', patch.cook_time_minutes);
    if (patch.servings !== undefined) push('servings', patch.servings);
    if (patch.instructions !== undefined) push('instructions', JSON.stringify(patch.instructions), '::jsonb');
    if (patch.image_url !== undefined) push('image_url', patch.image_url);

    if (sets.length === 0) return this.findById(id);

    const { rows } = await pool.query<Recipe>(
      `UPDATE recipes
          SET ${sets.join(', ')}
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING ${RECIPE_COLUMNS}`,
      params,
    );
    return rows[0] ?? null;
  },

  /** Soft delete: stamp `deleted_at`. Idempotent — no-op if already deleted. */
  async softDelete(id: string): Promise<boolean> {
    const { rowCount } = await pool.query(
      `UPDATE recipes SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    return (rowCount ?? 0) > 0;
  },

  async findNutrition(id: string): Promise<RecipeNutrition | null> {
    const { rows } = await pool.query<RecipeNutrition>(
      `SELECT recipe_id, calories,
              protein_g::float8 AS protein_g,
              carbs_g::float8   AS carbs_g,
              fat_g::float8     AS fat_g,
              fiber_g::float8   AS fiber_g,
              sodium_mg::float8 AS sodium_mg,
              verified_date, verified_by
         FROM recipe_nutrition WHERE recipe_id = $1`,
      [id],
    );
    return rows[0] ?? null;
  },

  async upsertNutrition(
    input: {
      recipe_id: string;
      calories: number;
      protein_g: number;
      carbs_g: number;
      fat_g: number;
      fiber_g: number;
      sodium_mg: number;
    },
    client: PoolClient | typeof pool = pool,
  ): Promise<void> {
    await client.query(
      `INSERT INTO recipe_nutrition
         (recipe_id, calories, protein_g, carbs_g, fat_g, fiber_g, sodium_mg)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (recipe_id) DO UPDATE SET
         calories  = EXCLUDED.calories,
         protein_g = EXCLUDED.protein_g,
         carbs_g   = EXCLUDED.carbs_g,
         fat_g     = EXCLUDED.fat_g,
         fiber_g   = EXCLUDED.fiber_g,
         sodium_mg = EXCLUDED.sodium_mg`,
      [
        input.recipe_id,
        input.calories,
        input.protein_g,
        input.carbs_g,
        input.fat_g,
        input.fiber_g,
        input.sodium_mg,
      ],
    );
  },

  /**
   * Fetch all recipes plus per-serving macros for the macro-match algorithm.
   * Recipes without nutrition data are excluded.
   */
  async listForMacroMatch(): Promise<Array<Recipe & { calories: number; protein_g: number; carbs_g: number; fat_g: number }>> {
    const { rows } = await pool.query(
      `SELECT r.id, r.name, r.cuisine_type, r.difficulty,
              r.prep_time_minutes, r.cook_time_minutes, r.servings,
              r.instructions, r.image_url, r.verified_by_dietitian,
              r.created_at, r.deleted_at,
              n.calories,
              n.protein_g::float8 AS protein_g,
              n.carbs_g::float8 AS carbs_g,
              n.fat_g::float8 AS fat_g
         FROM recipes r
         JOIN recipe_nutrition n ON n.recipe_id = r.id
        WHERE r.deleted_at IS NULL`,
    );
    return rows;
  },
};
