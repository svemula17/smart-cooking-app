import { PoolClient } from 'pg';
import { pool } from '../config/database';
import type { ListStatus, ShoppingList } from '../types';

const LIST_COLUMNS = `
  id,
  user_id,
  name,
  status,
  recipe_ids,
  created_at,
  updated_at,
  completed_at
`;

export const ShoppingListModel = {
  async findAllByUser(
    userId: string,
    opts: { status?: ListStatus; page: number; limit: number },
  ): Promise<{ lists: ShoppingList[]; total: number }> {
    const conditions: string[] = ['user_id = $1'];
    const values: unknown[] = [userId];
    let idx = 2;

    if (opts.status) {
      conditions.push(`status = $${idx++}`);
      values.push(opts.status);
    }

    const where = conditions.join(' AND ');
    const offset = (opts.page - 1) * opts.limit;

    const [dataRes, countRes] = await Promise.all([
      pool.query<ShoppingList>(
        `SELECT ${LIST_COLUMNS}
         FROM shopping_lists
         WHERE ${where}
         ORDER BY created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...values, opts.limit, offset],
      ),
      pool.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM shopping_lists WHERE ${where}`,
        values,
      ),
    ]);

    return {
      lists: dataRes.rows,
      total: parseInt(countRes.rows[0].count, 10),
    };
  },

  async findById(id: string, userId: string): Promise<ShoppingList | null> {
    const res = await pool.query<ShoppingList>(
      `SELECT ${LIST_COLUMNS} FROM shopping_lists WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );
    return res.rows[0] ?? null;
  },

  async create(
    client: PoolClient,
    data: { userId: string; name: string; recipeIds: string[] },
  ): Promise<ShoppingList> {
    const res = await client.query<ShoppingList>(
      `INSERT INTO shopping_lists (user_id, name, recipe_ids)
       VALUES ($1, $2, $3)
       RETURNING ${LIST_COLUMNS}`,
      [data.userId, data.name, JSON.stringify(data.recipeIds)],
    );
    return res.rows[0];
  },

  async complete(id: string, userId: string): Promise<ShoppingList | null> {
    const res = await pool.query<ShoppingList>(
      `UPDATE shopping_lists
       SET status = 'completed', completed_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND status = 'active'
       RETURNING ${LIST_COLUMNS}`,
      [id, userId],
    );
    return res.rows[0] ?? null;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const res = await pool.query(
      `DELETE FROM shopping_lists WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );
    return (res.rowCount ?? 0) > 0;
  },
};
