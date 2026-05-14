import type { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { pool, withTransaction } from '../config/database';
import { Errors } from '../middleware/error.middleware';
import { generateRotation } from '../utils/rotation';

const generateSchema = Joi.object({ days: Joi.number().integer().min(1).max(28).default(14) });

const updateSchema = Joi.object({
  recipe_id: Joi.string().uuid().allow(null),
  status: Joi.string().valid('pending', 'cooking', 'done', 'skipped'),
  notes: Joi.string().max(500).allow(null, ''),
}).min(1);

const swapSchema = Joi.object({ swap_with_date: Joi.string().isoDate().required() });

export async function generateSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = generateSchema.validate(req.body);
  if (error) return next(Errors.validationError(error.details));

  const { houseId } = req.params;

  try {
    // Get members with their last cook date
    const membersResult = await pool.query(
      `SELECT hm.user_id,
              MAX(cs.scheduled_date) AS last_cooked
       FROM house_members hm
       LEFT JOIN cook_schedule cs ON cs.user_id = hm.user_id AND cs.house_id = hm.house_id AND cs.status = 'done'
       WHERE hm.house_id = $1
       GROUP BY hm.user_id`,
      [houseId],
    );

    if (membersResult.rows.length === 0) {
      return next(Errors.notFound('No members in this house'));
    }

    // Get dates already assigned in the upcoming window
    const today = new Date().toISOString().slice(0, 10);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + value.days - 1);
    const endDateStr = endDate.toISOString().slice(0, 10);

    const existingResult = await pool.query(
      'SELECT scheduled_date FROM cook_schedule WHERE house_id = $1 AND scheduled_date BETWEEN $2 AND $3',
      [houseId, today, endDateStr],
    );
    const existingDates = new Set<string>(existingResult.rows.map((r: { scheduled_date: string }) => r.scheduled_date));

    const assignments = generateRotation(membersResult.rows, value.days, existingDates);

    if (assignments.length === 0) {
      res.json({ success: true, data: { schedule: [], message: 'All days already have cooks assigned' } });
      return;
    }

    const inserted = await withTransaction(async (client) => {
      const rows = [];
      for (const a of assignments) {
        const { rows: r } = await client.query(
          'INSERT INTO cook_schedule (house_id, user_id, scheduled_date) VALUES ($1, $2, $3) RETURNING *',
          [houseId, a.user_id, a.scheduled_date],
        );
        rows.push(r[0]);
      }
      return rows;
    });

    res.status(201).json({ success: true, data: { schedule: inserted } });
  } catch (err) {
    next(err);
  }
}

export async function getSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId } = req.params;
  const days = Math.min(parseInt(req.query.days as string ?? '14', 10), 28);

  try {
    const today = new Date().toISOString().slice(0, 10);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days - 1);
    const endDateStr = endDate.toISOString().slice(0, 10);

    const { rows } = await pool.query(
      `SELECT cs.*,
              u.name AS cook_name,
              r.name AS recipe_name,
              r.cuisine_type AS recipe_cuisine,
              r.prep_time_minutes AS recipe_prep_time,
              r.cook_time_minutes AS recipe_cook_time
       FROM cook_schedule cs
       JOIN users u ON u.id = cs.user_id
       LEFT JOIN recipes r ON r.id = cs.recipe_id
       WHERE cs.house_id = $1 AND cs.scheduled_date BETWEEN $2 AND $3
       ORDER BY cs.scheduled_date ASC`,
      [houseId, today, endDateStr],
    );

    res.json({ success: true, data: { schedule: rows } });
  } catch (err) {
    next(err);
  }
}

export async function updateScheduleEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = updateSchema.validate(req.body);
  if (error) return next(Errors.validationError(error.details));

  const { houseId, scheduleId } = req.params;
  const userId = req.auth!.userId;

  try {
    // Only the assigned cook or admin can update
    const entryResult = await pool.query(
      'SELECT * FROM cook_schedule WHERE id = $1 AND house_id = $2',
      [scheduleId, houseId],
    );
    if (entryResult.rows.length === 0) return next(Errors.notFound('Schedule entry not found'));

    const entry = entryResult.rows[0];
    const memberResult = await pool.query(
      'SELECT role FROM house_members WHERE house_id = $1 AND user_id = $2',
      [houseId, userId],
    );
    const role = memberResult.rows[0]?.role;

    if (entry.user_id !== userId && role !== 'admin') {
      return next(Errors.forbidden('Only the assigned cook or an admin can update this entry'));
    }

    const sets: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if ('recipe_id' in value) { sets.push(`recipe_id = $${idx++}`); params.push(value.recipe_id); }
    if ('status' in value)    { sets.push(`status = $${idx++}`);    params.push(value.status); }
    if ('notes' in value)     { sets.push(`notes = $${idx++}`);     params.push(value.notes); }

    params.push(scheduleId);
    const { rows } = await pool.query(
      `UPDATE cook_schedule SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      params,
    );

    res.json({ success: true, data: { schedule: rows[0] } });
  } catch (err) {
    next(err);
  }
}

export async function swapCooks(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = swapSchema.validate(req.body);
  if (error) return next(Errors.validationError(error.details));

  const { houseId, scheduleId } = req.params;

  try {
    const entryA = await pool.query(
      'SELECT * FROM cook_schedule WHERE id = $1 AND house_id = $2',
      [scheduleId, houseId],
    );
    if (entryA.rows.length === 0) return next(Errors.notFound('Schedule entry not found'));

    const entryB = await pool.query(
      'SELECT * FROM cook_schedule WHERE house_id = $1 AND scheduled_date = $2',
      [houseId, value.swap_with_date],
    );
    if (entryB.rows.length === 0) return next(Errors.notFound('No schedule entry for the target date'));

    const a = entryA.rows[0];
    const b = entryB.rows[0];

    await withTransaction(async (client) => {
      await client.query('UPDATE cook_schedule SET user_id = $1 WHERE id = $2', [b.user_id, a.id]);
      await client.query('UPDATE cook_schedule SET user_id = $1 WHERE id = $2', [a.user_id, b.id]);
    });

    const updated = await pool.query(
      `SELECT cs.*, u.name AS cook_name FROM cook_schedule cs
       JOIN users u ON u.id = cs.user_id
       WHERE cs.id = ANY($1::uuid[])`,
      [[a.id, b.id]],
    );

    res.json({ success: true, data: { schedule: updated.rows } });
  } catch (err) {
    next(err);
  }
}
