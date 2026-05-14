import type { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { pool } from '../config/database';
import { Errors } from '../middleware/error.middleware';

const ratingSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
});

export async function submitRating(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = ratingSchema.validate(req.body);
  if (error) return next(Errors.validationError(error.details));

  const { houseId, scheduleId } = req.params;
  const userId = req.auth!.userId;

  try {
    // Verify schedule belongs to house
    const schedRow = await pool.query(
      'SELECT id, status, recipe_id FROM cook_schedule WHERE id = $1 AND house_id = $2',
      [scheduleId, houseId],
    );
    if (schedRow.rows.length === 0) return next(Errors.notFound('Schedule entry not found'));
    if (schedRow.rows[0].status !== 'done') {
      return next(Errors.conflict('Can only rate a meal that has been marked done'));
    }

    const { rows } = await pool.query(
      `INSERT INTO meal_ratings (cook_schedule_id, house_id, rated_by, rating)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (cook_schedule_id, rated_by)
       DO UPDATE SET rating = EXCLUDED.rating
       RETURNING *`,
      [scheduleId, houseId, userId, value.rating],
    );

    res.status(201).json({ success: true, data: { rating: rows[0] } });
  } catch (err) {
    next(err);
  }
}

export async function getRatings(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { scheduleId } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT mr.*, u.name AS rated_by_name
       FROM meal_ratings mr
       JOIN users u ON u.id = mr.rated_by
       WHERE mr.cook_schedule_id = $1
       ORDER BY mr.created_at DESC`,
      [scheduleId],
    );

    const avg = rows.length
      ? rows.reduce((sum: number, r: any) => sum + r.rating, 0) / rows.length
      : null;

    res.json({
      success: true,
      data: {
        ratings: rows,
        average: avg ? Math.round(avg * 10) / 10 : null,
        count: rows.length,
      },
    });
  } catch (err) {
    next(err);
  }
}
