import type { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { pool } from '../config/database';
import { Errors } from '../middleware/error.middleware';

const upsertSchema = Joi.object({
  is_attending: Joi.boolean().required(),
  date: Joi.string().isoDate().default(() => new Date().toISOString().slice(0, 10)),
});

export async function upsertAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = upsertSchema.validate(req.body);
  if (error) return next(Errors.validationError(error.details));

  const { houseId } = req.params;
  const userId = req.auth!.userId;

  try {
    const { rows } = await pool.query(
      `INSERT INTO house_attendance (house_id, user_id, attendance_date, is_attending)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (house_id, user_id, attendance_date)
       DO UPDATE SET is_attending = EXCLUDED.is_attending, responded_at = NOW()
       RETURNING *`,
      [houseId, userId, value.date, value.is_attending],
    );
    res.json({ success: true, data: { attendance: rows[0] } });
  } catch (err) {
    next(err);
  }
}

export async function getAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId } = req.params;
  const date = (req.query.date as string) ?? new Date().toISOString().slice(0, 10);

  try {
    // Get all members with their attendance response (null = not responded)
    const { rows } = await pool.query(
      `SELECT hm.user_id, u.name, u.email,
              ha.is_attending, ha.responded_at
       FROM house_members hm
       JOIN users u ON u.id = hm.user_id
       LEFT JOIN house_attendance ha
         ON ha.user_id = hm.user_id
        AND ha.house_id = hm.house_id
        AND ha.attendance_date = $2
       WHERE hm.house_id = $1
       ORDER BY u.name`,
      [houseId, date],
    );

    const attending = rows.filter((r: any) => r.is_attending === true).length;
    const declined  = rows.filter((r: any) => r.is_attending === false).length;
    const pending   = rows.filter((r: any) => r.is_attending === null).length;

    res.json({
      success: true,
      data: {
        date,
        members: rows,
        summary: { attending, declined, pending, total: rows.length },
      },
    });
  } catch (err) {
    next(err);
  }
}
