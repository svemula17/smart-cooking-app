import type { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { pool } from '../config/database';
import { Errors } from '../middleware/error.middleware';

const createSchema = Joi.object({
  recipe_id: Joi.string().uuid().required(),
  total_portions: Joi.number().integer().min(1).max(50).required(),
  available_until: Joi.string().isoDate().required(),
});

export async function createPrepMeal(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = createSchema.validate(req.body);
  if (error) return next(Errors.validationError(error.details));

  const { houseId } = req.params;
  const userId = req.auth!.userId;

  try {
    const { rows } = await pool.query(
      `INSERT INTO prep_meals (house_id, cooked_by, recipe_id, total_portions, remaining_portions, available_until)
       VALUES ($1, $2, $3, $4, $4, $5) RETURNING *`,
      [houseId, userId, value.recipe_id, value.total_portions, value.available_until],
    );
    res.status(201).json({ success: true, data: { prep_meal: rows[0] } });
  } catch (err) {
    next(err);
  }
}

export async function listPrepMeals(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId } = req.params;
  const today = new Date().toISOString().slice(0, 10);

  try {
    const { rows } = await pool.query(
      `SELECT pm.*, r.name AS recipe_name, r.cuisine_type, u.name AS cooked_by_name
       FROM prep_meals pm
       JOIN recipes r ON r.id = pm.recipe_id
       JOIN users u ON u.id = pm.cooked_by
       WHERE pm.house_id = $1
         AND pm.remaining_portions > 0
         AND pm.available_until >= $2
       ORDER BY pm.cooked_at DESC`,
      [houseId, today],
    );
    res.json({ success: true, data: { prep_meals: rows } });
  } catch (err) {
    next(err);
  }
}

export async function consumePortion(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId, prepId } = req.params;
  const portions = parseInt(req.body.portions ?? '1', 10);

  try {
    const existing = await pool.query(
      'SELECT * FROM prep_meals WHERE id = $1 AND house_id = $2',
      [prepId, houseId],
    );
    if (existing.rows.length === 0) return next(Errors.notFound('Prep meal not found'));

    const meal = existing.rows[0];
    if (meal.remaining_portions < portions) {
      return next(Errors.conflict(`Only ${meal.remaining_portions} portion(s) left`));
    }

    const { rows } = await pool.query(
      'UPDATE prep_meals SET remaining_portions = remaining_portions - $1 WHERE id = $2 RETURNING *',
      [portions, prepId],
    );
    res.json({ success: true, data: { prep_meal: rows[0] } });
  } catch (err) {
    next(err);
  }
}
