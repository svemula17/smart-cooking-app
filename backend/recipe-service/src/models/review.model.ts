import { pool } from '../config/database';
import type { RecipeRatingSummary, Review } from '../types';

export const ReviewModel = {
  /**
   * List reviews for a recipe with reviewer name (joined from users) and a
   * total count for pagination.
   */
  async listByRecipeId(
    recipeId: string,
    pageLimit: { limit: number; offset: number },
  ): Promise<{ rows: Review[]; total: number }> {
    const countResult = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM recipe_reviews WHERE recipe_id = $1`,
      [recipeId],
    );
    const total = Number(countResult.rows[0]?.count ?? 0);

    const { rows } = await pool.query<Review>(
      `SELECT rv.id, rv.recipe_id, rv.user_id, u.name AS user_name,
              rv.rating, rv.comment, rv.created_at
         FROM recipe_reviews rv
         JOIN users u ON u.id = rv.user_id
        WHERE rv.recipe_id = $1
        ORDER BY rv.created_at DESC
        LIMIT $2 OFFSET $3`,
      [recipeId, pageLimit.limit, pageLimit.offset],
    );

    return { rows, total };
  },

  /**
   * Insert a review. Throws pg 23505 (unique violation) if the user has
   * already rated this recipe — error middleware turns that into 409 CONFLICT;
   * the controller catches it specifically to return ALREADY_RATED.
   */
  async create(input: {
    recipe_id: string;
    user_id: string;
    rating: number;
    comment: string | null;
  }): Promise<Review> {
    const { rows } = await pool.query<Review>(
      `INSERT INTO recipe_reviews (recipe_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING id, recipe_id, user_id, NULL::text AS user_name,
                 rating, comment, created_at`,
      [input.recipe_id, input.user_id, input.rating, input.comment],
    );
    return rows[0];
  },

  /**
   * Read the maintained rating summary. Returns zeros if no reviews exist yet
   * (the row may not exist before the first review is inserted).
   */
  async getSummary(recipeId: string): Promise<RecipeRatingSummary> {
    const { rows } = await pool.query<{ recipe_id: string; average_rating: string; total_ratings: number }>(
      `SELECT recipe_id, average_rating::text AS average_rating, total_ratings
         FROM recipe_ratings WHERE recipe_id = $1`,
      [recipeId],
    );
    if (!rows[0]) {
      return { recipe_id: recipeId, average_rating: 0, total_ratings: 0 };
    }
    return {
      recipe_id: rows[0].recipe_id,
      average_rating: Number(rows[0].average_rating),
      total_ratings: rows[0].total_ratings,
    };
  },
};
