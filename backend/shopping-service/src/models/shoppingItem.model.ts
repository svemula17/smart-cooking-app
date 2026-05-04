import { PoolClient } from 'pg';
import { pool } from '../config/database';
import type { ShoppingItem } from '../types';
import { AggregatedIngredient } from '../utils/quantityAggregator';

const ITEM_COLUMNS = `
  id,
  list_id,
  ingredient_name,
  quantity,
  unit,
  aisle,
  is_checked,
  notes,
  created_at,
  updated_at
`;

/** pg returns numeric(10,3) as a string — coerce to JS number */
function parseItem(row: ShoppingItem): ShoppingItem {
  return { ...row, quantity: parseFloat(row.quantity as unknown as string) };
}

export const ShoppingItemModel = {
  async findByListId(listId: string): Promise<ShoppingItem[]> {
    const res = await pool.query<ShoppingItem>(
      `SELECT ${ITEM_COLUMNS}
       FROM shopping_items
       WHERE list_id = $1
       ORDER BY aisle NULLS LAST, ingredient_name`,
      [listId],
    );
    return res.rows.map(parseItem);
  },

  /**
   * Bulk-insert items for a new list (within a transaction).
   */
  async insertMany(
    client: PoolClient,
    listId: string,
    items: Array<AggregatedIngredient & { aisle: string | null }>,
  ): Promise<ShoppingItem[]> {
    if (items.length === 0) return [];

    const placeholders = items
      .map((_, i) => {
        const base = i * 6;
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`;
      })
      .join(', ');

    const values = items.flatMap((item) => [
      listId,
      item.ingredient_name,
      item.quantity,
      item.unit,
      item.aisle,
      item.notes ?? null,
    ]);

    const res = await client.query<ShoppingItem>(
      `INSERT INTO shopping_items (list_id, ingredient_name, quantity, unit, aisle, notes)
       VALUES ${placeholders}
       RETURNING ${ITEM_COLUMNS}`,
      values,
    );
    return res.rows.map(parseItem);
  },

  async findById(id: string): Promise<ShoppingItem | null> {
    const res = await pool.query<ShoppingItem>(
      `SELECT ${ITEM_COLUMNS} FROM shopping_items WHERE id = $1`,
      [id],
    );
    return res.rows[0] ? parseItem(res.rows[0]) : null;
  },

  async setChecked(id: string, isChecked: boolean): Promise<ShoppingItem | null> {
    const res = await pool.query<ShoppingItem>(
      `UPDATE shopping_items
       SET is_checked = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING ${ITEM_COLUMNS}`,
      [isChecked, id],
    );
    return res.rows[0] ? parseItem(res.rows[0]) : null;
  },
};
