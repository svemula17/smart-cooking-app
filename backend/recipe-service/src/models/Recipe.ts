import { Pool } from 'pg';

const db = new Pool({ connectionString: process.env.DATABASE_URL });

export interface RecipeRow {
  id: string;
  title: string;
  cuisine: string;
  imageUrl: string | null;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: string;
}

export const RecipeModel = {
  async search(params: { q?: string; cuisine?: string }): Promise<RecipeRow[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    if (params.q) { values.push(`%${params.q}%`); conditions.push(`title ILIKE $${values.length}`); }
    if (params.cuisine) { values.push(params.cuisine); conditions.push(`cuisine = $${values.length}`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await db.query<RecipeRow>(
      `SELECT id, title, cuisine, image_url AS "imageUrl",
              prep_time_minutes AS "prepTimeMinutes",
              cook_time_minutes AS "cookTimeMinutes",
              servings, difficulty
         FROM recipes ${where}
         ORDER BY created_at DESC LIMIT 100`,
      values,
    );
    return rows;
  },

  async findById(id: string): Promise<RecipeRow | null> {
    const { rows } = await db.query<RecipeRow>(
      `SELECT id, title, cuisine, image_url AS "imageUrl",
              prep_time_minutes AS "prepTimeMinutes",
              cook_time_minutes AS "cookTimeMinutes",
              servings, difficulty FROM recipes WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  },

  async create(input: Partial<RecipeRow>): Promise<RecipeRow> {
    const { rows } = await db.query<RecipeRow>(
      `INSERT INTO recipes (title, cuisine, image_url, prep_time_minutes, cook_time_minutes, servings, difficulty)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, title, cuisine, image_url AS "imageUrl",
                 prep_time_minutes AS "prepTimeMinutes",
                 cook_time_minutes AS "cookTimeMinutes",
                 servings, difficulty`,
      [input.title, input.cuisine, input.imageUrl ?? null, input.prepTimeMinutes ?? 0,
       input.cookTimeMinutes ?? 0, input.servings ?? 1, input.difficulty ?? 'easy'],
    );
    return rows[0];
  },
};
