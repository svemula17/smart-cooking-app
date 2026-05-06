import type { NextFunction, Request, Response } from 'express';
import { pool } from '../config/database';
import { Errors } from '../middleware/error.middleware';
import { RecipeModel } from '../models/recipe.model';
import { IngredientModel } from '../models/ingredient.model';
import type { ApiSuccess } from '../types';

// ─── Model helpers ─────────────────────────────────────────────────────────────

async function findPlanById(id: string) {
  const { rows } = await pool.query(
    `SELECT mp.*, row_to_json(r.*) AS recipe
     FROM meal_plans mp
     JOIN recipes r ON r.id = mp.recipe_id
     WHERE mp.id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

async function hydratePlan(row: any) {
  const [nutrition, prepRow] = await Promise.all([
    pool.query('SELECT * FROM recipe_nutrition WHERE recipe_id = $1', [row.recipe.id]).then((r) => r.rows[0] ?? null),
    pool.query('SELECT prep_instructions FROM recipes WHERE id = $1', [row.recipe.id]).then((r) => r.rows[0] ?? null),
  ]);

  return {
    id: row.id,
    user_id: row.user_id,
    recipe_id: row.recipe_id,
    scheduled_date: row.scheduled_date instanceof Date
      ? row.scheduled_date.toISOString().split('T')[0]
      : String(row.scheduled_date),
    meal_type: row.meal_type,
    cooking_time: row.cooking_time ?? '18:00',
    completed: row.completed,
    created_at: row.created_at,
    recipe: {
      ...row.recipe,
      nutrition: nutrition ?? null,
      prep_instructions: prepRow?.prep_instructions ?? null,
    },
  };
}

// ─── POST /meal-plans/schedule ─────────────────────────────────────────────────

export async function scheduleMeal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user_id, recipe_id, scheduled_date, meal_type, cooking_time } = req.body as {
      user_id: string;
      recipe_id: string;
      scheduled_date: string;
      meal_type: 'breakfast' | 'lunch' | 'dinner';
      cooking_time?: string;
    };

    if (!user_id || !recipe_id || !scheduled_date || !meal_type) {
      return next(Errors.validationError('user_id, recipe_id, scheduled_date and meal_type are required'));
    }
    if (!['breakfast', 'lunch', 'dinner'].includes(meal_type)) {
      return next(Errors.validationError('meal_type must be breakfast, lunch or dinner'));
    }

    // Upsert — replace existing slot for same user/date/meal_type
    const { rows } = await pool.query(
      `INSERT INTO meal_plans (user_id, recipe_id, scheduled_date, meal_type, cooking_time)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, scheduled_date, meal_type)
       DO UPDATE SET recipe_id = EXCLUDED.recipe_id, cooking_time = EXCLUDED.cooking_time
       RETURNING *`,
      [user_id, recipe_id, scheduled_date, meal_type, cooking_time ?? '18:00'],
    );

    const row = rows[0];
    const recipeRow = await pool.query('SELECT * FROM recipes WHERE id = $1', [recipe_id]);
    if (!recipeRow.rows[0]) return next(Errors.notFound('Recipe not found'));

    const planRow = { ...row, recipe: recipeRow.rows[0] };
    const plan = await hydratePlan(planRow);

    const body: ApiSuccess<{ meal_plan: typeof plan }> = { success: true, data: { meal_plan: plan } };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

// ─── GET /meal-plans/:userId ───────────────────────────────────────────────────

export async function getMealPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params as { userId: string };
    const { start_date, days = '7' } = req.query as { start_date?: string; days?: string };

    const startDate = start_date ?? new Date().toISOString().split('T')[0];
    const numDays   = Math.min(parseInt(days, 10) || 7, 30);
    const endDate   = new Date(startDate);
    endDate.setDate(endDate.getDate() + numDays - 1);
    const endStr = endDate.toISOString().split('T')[0];

    const { rows } = await pool.query(
      `SELECT mp.*, row_to_json(r.*) AS recipe
       FROM meal_plans mp
       JOIN recipes r ON r.id = mp.recipe_id
       WHERE mp.user_id = $1 AND mp.scheduled_date BETWEEN $2 AND $3
       ORDER BY mp.scheduled_date, mp.meal_type`,
      [userId, startDate, endStr],
    );

    const plans = await Promise.all(rows.map(hydratePlan));

    // Build daily_totals
    const daily_totals: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {};
    for (const plan of plans) {
      const d = plan.scheduled_date;
      if (!daily_totals[d]) daily_totals[d] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      if (plan.recipe.nutrition) {
        daily_totals[d]!.calories += plan.recipe.nutrition.calories ?? 0;
        daily_totals[d]!.protein  += plan.recipe.nutrition.protein_g ?? 0;
        daily_totals[d]!.carbs    += plan.recipe.nutrition.carbs_g ?? 0;
        daily_totals[d]!.fat      += plan.recipe.nutrition.fat_g ?? 0;
      }
    }

    const body: ApiSuccess<{ meal_plans: typeof plans; daily_totals: typeof daily_totals }> = {
      success: true,
      data: { meal_plans: plans, daily_totals },
    };
    res.json(body);
  } catch (err) {
    next(err);
  }
}

// ─── PUT /meal-plans/:id ───────────────────────────────────────────────────────

export async function updateMealPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { completed, cooking_time } = req.body as { completed?: boolean; cooking_time?: string };

    const existing = await findPlanById(id);
    if (!existing) return next(Errors.notFound('Meal plan not found'));
    if (existing.user_id !== (req as any).user?.userId) return next(Errors.forbidden());

    const { rows } = await pool.query(
      `UPDATE meal_plans
       SET completed = COALESCE($1, completed), cooking_time = COALESCE($2, cooking_time)
       WHERE id = $3 RETURNING *`,
      [completed ?? null, cooking_time ?? null, id],
    );
    const recipeRow = await pool.query('SELECT * FROM recipes WHERE id = $1', [rows[0].recipe_id]);
    const plan = await hydratePlan({ ...rows[0], recipe: recipeRow.rows[0] });
    res.json({ success: true, data: { meal_plan: plan } } satisfies ApiSuccess<{ meal_plan: typeof plan }>);
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /meal-plans/:id ────────────────────────────────────────────────────

export async function deleteMealPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const existing = await findPlanById(id);
    if (!existing) return next(Errors.notFound('Meal plan not found'));
    if (existing.user_id !== (req as any).user?.userId) return next(Errors.forbidden());

    await pool.query('DELETE FROM meal_plans WHERE id = $1', [id]);
    res.json({ success: true, data: { message: 'Meal plan deleted' } } satisfies ApiSuccess<{ message: string }>);
  } catch (err) {
    next(err);
  }
}
