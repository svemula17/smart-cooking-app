import type { PoolClient } from 'pg';
import { pool } from '../config/database';
import type { Ingredient } from '../types';

const COLUMNS = `id, recipe_id, ingredient_name, quantity::float8 AS quantity, unit, notes`;

export const IngredientModel = {
  async findByRecipeId(recipeId: string): Promise<Ingredient[]> {
    const { rows } = await pool.query<Ingredient>(
      `SELECT ${COLUMNS}
         FROM recipe_ingredients
        WHERE recipe_id = $1
        ORDER BY ingredient_name ASC`,
      [recipeId],
    );
    return rows;
  },

  async insertMany(
    recipeId: string,
    items: Array<{ ingredient_name: string; quantity: number; unit: string; notes?: string | null }>,
    client: PoolClient | typeof pool = pool,
  ): Promise<void> {
    if (items.length === 0) return;
    const values: string[] = [];
    const params: unknown[] = [];
    items.forEach((it, i) => {
      const base = i * 5;
      params.push(recipeId, it.ingredient_name, it.quantity, it.unit, it.notes ?? null);
      values.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`);
    });
    await client.query(
      `INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, notes)
       VALUES ${values.join(', ')}`,
      params,
    );
  },

  async deleteByRecipeId(recipeId: string, client: PoolClient | typeof pool = pool): Promise<void> {
    await client.query(`DELETE FROM recipe_ingredients WHERE recipe_id = $1`, [recipeId]);
  },
};
