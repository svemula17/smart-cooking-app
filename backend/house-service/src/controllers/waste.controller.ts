import type { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { pool } from '../config/database';
import { Errors } from '../middleware/error.middleware';

const logSchema = Joi.object({
  item_name: Joi.string().trim().min(1).max(100).required(),
  quantity: Joi.number().positive().allow(null),
  unit: Joi.string().max(50).allow(null, ''),
  estimated_cost: Joi.number().positive().allow(null),
  expired_on: Joi.string().isoDate().required(),
});

export async function logWaste(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = logSchema.validate(req.body);
  if (error) return next(Errors.validationError(error.details));

  const { houseId } = req.params;

  try {
    const { rows } = await pool.query(
      `INSERT INTO waste_logs (house_id, item_name, quantity, unit, estimated_cost, expired_on)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [houseId, value.item_name, value.quantity ?? null, value.unit ?? null, value.estimated_cost ?? null, value.expired_on],
    );
    res.status(201).json({ success: true, data: { waste_log: rows[0] } });
  } catch (err) {
    next(err);
  }
}

export async function getWasteSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId } = req.params;
  const month = (req.query.month as string) ?? new Date().toISOString().slice(0, 7); // YYYY-MM

  try {
    const startDate = `${month}-01`;
    const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0)
      .toISOString().slice(0, 10);

    const { rows: logs } = await pool.query(
      `SELECT * FROM waste_logs
       WHERE house_id = $1 AND logged_at BETWEEN $2 AND $3::date + INTERVAL '1 day'
       ORDER BY logged_at DESC`,
      [houseId, startDate, endDate],
    );

    const totalCost = logs.reduce((sum: number, r: any) => sum + parseFloat(r.estimated_cost ?? '0'), 0);

    // Frequency map — which items are wasted most
    const freq: Record<string, number> = {};
    for (const log of logs) {
      freq[log.item_name] = (freq[log.item_name] ?? 0) + 1;
    }
    const topWasted = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    res.json({
      success: true,
      data: {
        month,
        logs,
        total_estimated_cost: Math.round(totalCost * 100) / 100,
        top_wasted_items: topWasted,
      },
    });
  } catch (err) {
    next(err);
  }
}
