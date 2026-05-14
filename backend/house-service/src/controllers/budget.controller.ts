import type { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { pool } from '../config/database';
import { Errors } from '../middleware/error.middleware';

const budgetSchema = Joi.object({
  amount: Joi.number().positive().max(999999).required(),
  month: Joi.string().pattern(/^\d{4}-\d{2}$/).default(() => new Date().toISOString().slice(0, 7)),
});

export async function setBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = budgetSchema.validate(req.body);
  if (error) return next(Errors.validationError(error.details));
  const { houseId } = req.params;

  try {
    const { rows } = await pool.query(
      `INSERT INTO grocery_budgets (house_id, month, amount)
       VALUES ($1, $2, $3)
       ON CONFLICT (house_id, month) DO UPDATE SET amount = EXCLUDED.amount
       RETURNING *`,
      [houseId, value.month, value.amount],
    );
    res.json({ success: true, data: { budget: rows[0] } });
  } catch (err) { next(err); }
}

export async function getCurrentBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId } = req.params;
  const month = (req.query.month as string) ?? new Date().toISOString().slice(0, 7);

  try {
    const budgetRow = await pool.query(
      'SELECT * FROM grocery_budgets WHERE house_id = $1 AND month = $2',
      [houseId, month],
    );

    // Sum all expenses in this month
    const spendRow = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total_spent
       FROM expenses
       WHERE house_id = $1
         AND to_char(created_at, 'YYYY-MM') = $2`,
      [houseId, month],
    );

    const budget = budgetRow.rows[0] ?? null;
    const spent = parseFloat(spendRow.rows[0].total_spent);
    const limit = budget ? parseFloat(budget.amount) : null;

    res.json({
      success: true,
      data: {
        month,
        budget: limit,
        spent,
        remaining: limit !== null ? Math.max(0, limit - spent) : null,
        percent_used: limit ? Math.round((spent / limit) * 100) : null,
      },
    });
  } catch (err) { next(err); }
}

export async function getBudgetBreakdown(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId } = req.params;
  const month = (req.query.month as string) ?? new Date().toISOString().slice(0, 7);

  try {
    const { rows } = await pool.query(
      `SELECT category, SUM(amount) AS total
       FROM expenses
       WHERE house_id = $1 AND to_char(created_at, 'YYYY-MM') = $2
       GROUP BY category
       ORDER BY total DESC`,
      [houseId, month],
    );
    res.json({ success: true, data: { month, breakdown: rows } });
  } catch (err) { next(err); }
}

export async function generateShopperRotation(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId } = req.params;
  const weeks = Math.min(4, parseInt(req.body.weeks ?? '4', 10));

  try {
    const membersResult = await pool.query(
      `SELECT hm.user_id,
              MAX(sr.week_start) AS last_shopped
       FROM house_members hm
       LEFT JOIN shopping_shopper_rotation sr ON sr.user_id = hm.user_id AND sr.house_id = hm.house_id
       WHERE hm.house_id = $1
       GROUP BY hm.user_id
       ORDER BY last_shopped ASC NULLS FIRST`,
      [houseId],
    );

    const members = membersResult.rows;
    if (members.length === 0) return next(Errors.notFound('No members found'));

    const inserted: any[] = [];
    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() + i * 7 - weekStart.getDay()); // Start of week (Monday)
      const weekStartStr = weekStart.toISOString().slice(0, 10);

      const existing = await pool.query(
        'SELECT id FROM shopping_shopper_rotation WHERE house_id = $1 AND week_start = $2',
        [houseId, weekStartStr],
      );
      if (existing.rows.length > 0) continue;

      const member = members[i % members.length];
      const { rows } = await pool.query(
        'INSERT INTO shopping_shopper_rotation (house_id, user_id, week_start) VALUES ($1, $2, $3) RETURNING *',
        [houseId, member.user_id, weekStartStr],
      );
      inserted.push(rows[0]);
    }

    res.status(201).json({ success: true, data: { rotation: inserted } });
  } catch (err) { next(err); }
}

export async function getCurrentShopper(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId } = req.params;
  const today = new Date().toISOString().slice(0, 10);

  try {
    const { rows } = await pool.query(
      `SELECT sr.*, u.name AS shopper_name, u.email AS shopper_email
       FROM shopping_shopper_rotation sr
       JOIN users u ON u.id = sr.user_id
       WHERE sr.house_id = $1 AND sr.week_start <= $2
       ORDER BY sr.week_start DESC LIMIT 1`,
      [houseId, today],
    );
    res.json({ success: true, data: { current_shopper: rows[0] ?? null } });
  } catch (err) { next(err); }
}
