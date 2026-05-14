import type { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { pool, withTransaction } from '../config/database';
import { Errors } from '../middleware/error.middleware';
import { generateRotation } from '../utils/rotation';

// ── Chore Type Management ─────────────────────────────────────────────────────

const choreTypeSchema = Joi.object({
  name:      Joi.string().trim().min(2).max(50).required(),
  emoji:     Joi.string().max(10).default('🧹'),
  frequency: Joi.string().valid('daily', 'weekly').default('daily'),
});

export async function listChoreTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM house_chore_types WHERE house_id = $1 ORDER BY created_at ASC',
      [houseId],
    );
    res.json({ success: true, data: { chore_types: rows } });
  } catch (err) { next(err); }
}

export async function createChoreType(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = choreTypeSchema.validate(req.body);
  if (error) return next(Errors.validationError(error.details));
  const { houseId } = req.params;

  try {
    const { rows } = await pool.query(
      'INSERT INTO house_chore_types (house_id, name, emoji, frequency) VALUES ($1, $2, $3, $4) RETURNING *',
      [houseId, value.name, value.emoji, value.frequency],
    );
    res.status(201).json({ success: true, data: { chore_type: rows[0] } });
  } catch (err: any) {
    if (err.code === '23505') return next(Errors.conflict(`A chore named "${req.body.name}" already exists`));
    next(err);
  }
}

export async function deleteChoreType(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId, typeId } = req.params;
  try {
    const existing = await pool.query(
      'SELECT name FROM house_chore_types WHERE id = $1 AND house_id = $2',
      [typeId, houseId],
    );
    if (existing.rows.length === 0) return next(Errors.notFound('Chore type not found'));

    // Protect built-in chores
    const builtIn = ['Dishwashing', 'House Cleaning'];
    if (builtIn.includes(existing.rows[0].name)) {
      return next(Errors.forbidden('Cannot delete built-in chore types'));
    }

    await pool.query('DELETE FROM house_chore_types WHERE id = $1', [typeId]);
    res.json({ success: true, data: { message: 'Chore type deleted' } });
  } catch (err) { next(err); }
}

// ── Schedule Generation ───────────────────────────────────────────────────────

const generateSchema = Joi.object({
  days: Joi.number().integer().min(1).max(28).default(14),
});

export async function generateChoreSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = generateSchema.validate(req.body);
  if (error) return next(Errors.validationError(error.details));
  const { houseId, typeId } = req.params;

  try {
    const typeRow = await pool.query(
      'SELECT * FROM house_chore_types WHERE id = $1 AND house_id = $2',
      [typeId, houseId],
    );
    if (typeRow.rows.length === 0) return next(Errors.notFound('Chore type not found'));
    const choreType = typeRow.rows[0];

    // Get members with last assignment date for this chore type
    const membersResult = await pool.query(
      `SELECT hm.user_id,
              MAX(cs.scheduled_date) AS last_cooked
       FROM house_members hm
       LEFT JOIN chore_schedule cs
         ON cs.user_id = hm.user_id
        AND cs.house_id = hm.house_id
        AND cs.chore_type_id = $2
        AND cs.status = 'done'
       WHERE hm.house_id = $1
       GROUP BY hm.user_id`,
      [houseId, typeId],
    );

    if (membersResult.rows.length === 0) return next(Errors.notFound('No members in this house'));

    const today = new Date();
    const endDate = new Date();

    let assignments: { user_id: string; scheduled_date: string }[] = [];

    if (choreType.frequency === 'daily') {
      // Same as cook_schedule: assign every day
      endDate.setDate(today.getDate() + value.days - 1);
      const endDateStr = endDate.toISOString().slice(0, 10);

      const existingResult = await pool.query(
        `SELECT scheduled_date FROM chore_schedule
         WHERE house_id = $1 AND chore_type_id = $2
           AND scheduled_date BETWEEN $3 AND $4`,
        [houseId, typeId, today.toISOString().slice(0, 10), endDateStr],
      );
      const existingDates = new Set<string>(existingResult.rows.map((r: any) => r.scheduled_date));
      assignments = generateRotation(membersResult.rows, value.days, existingDates);

    } else {
      // Weekly: assign one Saturday per week for the next N weeks
      const weeks = Math.ceil(value.days / 7);
      for (let i = 0; i < weeks; i++) {
        const sat = new Date(today);
        // Find next Saturday (day 6)
        sat.setDate(today.getDate() + (6 - today.getDay() + 7 * i) % 7 + (i > 0 ? 7 * i : 0));
        // Simpler: just go to Saturday of week i from today
        const weekSat = new Date(today);
        weekSat.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7) + 7 * i);
        const satStr = weekSat.toISOString().slice(0, 10);

        const exists = await pool.query(
          'SELECT id FROM chore_schedule WHERE house_id = $1 AND chore_type_id = $2 AND scheduled_date = $3',
          [houseId, typeId, satStr],
        );
        if (exists.rows.length > 0) continue;

        const member = membersResult.rows[i % membersResult.rows.length];
        assignments.push({ user_id: member.user_id, scheduled_date: satStr });
      }
    }

    if (assignments.length === 0) {
      return res.json({ success: true, data: { schedule: [], message: 'All dates already have assignments' } });
    }

    const inserted = await withTransaction(async (client) => {
      const rows: any[] = [];
      for (const a of assignments) {
        const { rows: r } = await client.query(
          `INSERT INTO chore_schedule (house_id, chore_type_id, user_id, scheduled_date)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [houseId, typeId, a.user_id, a.scheduled_date],
        );
        rows.push(r[0]);
      }
      return rows;
    });

    res.status(201).json({ success: true, data: { schedule: inserted, chore_type: choreType } });
  } catch (err) { next(err); }
}

// ── Schedule Queries ──────────────────────────────────────────────────────────

export async function getChoreSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId } = req.params;
  const days    = Math.min(28, parseInt(req.query.days as string ?? '14', 10));
  const typeId  = req.query.type_id as string | undefined;
  const dateFilter = req.query.date as string | undefined; // single date for "today" view

  try {
    const today = new Date().toISOString().slice(0, 10);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days - 1);
    const endDateStr = endDate.toISOString().slice(0, 10);

    const startStr = dateFilter ?? today;
    const endStr   = dateFilter ?? endDateStr;

    const params: any[] = [houseId, startStr, endStr];
    let typeFilter = '';
    if (typeId) {
      params.push(typeId);
      typeFilter = `AND cs.chore_type_id = $${params.length}`;
    }

    const { rows } = await pool.query(
      `SELECT cs.*,
              u.name  AS assignee_name,
              ct.name AS chore_name,
              ct.emoji,
              ct.frequency
       FROM chore_schedule cs
       JOIN users u             ON u.id  = cs.user_id
       JOIN house_chore_types ct ON ct.id = cs.chore_type_id
       WHERE cs.house_id = $1
         AND cs.scheduled_date BETWEEN $2 AND $3
         ${typeFilter}
       ORDER BY cs.scheduled_date ASC, ct.name ASC`,
      params,
    );

    res.json({ success: true, data: { schedule: rows } });
  } catch (err) { next(err); }
}

// ── Update Entry ──────────────────────────────────────────────────────────────

const updateSchema = Joi.object({
  status: Joi.string().valid('pending', 'done', 'skipped'),
  notes:  Joi.string().max(500).allow(null, ''),
}).min(1);

export async function updateChoreEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = updateSchema.validate(req.body);
  if (error) return next(Errors.validationError(error.details));
  const { houseId, choreId } = req.params;
  const userId = req.auth!.userId;

  try {
    const entry = await pool.query(
      'SELECT * FROM chore_schedule WHERE id = $1 AND house_id = $2',
      [choreId, houseId],
    );
    if (entry.rows.length === 0) return next(Errors.notFound('Chore entry not found'));

    const row = entry.rows[0];
    const memberRow = await pool.query(
      'SELECT role FROM house_members WHERE house_id = $1 AND user_id = $2',
      [houseId, userId],
    );
    const role = memberRow.rows[0]?.role;

    // Only the assigned person or an admin can update
    if (row.user_id !== userId && role !== 'admin') {
      return next(Errors.forbidden('Only the assigned person or an admin can update this entry'));
    }

    const sets: string[] = [];
    const params: any[] = [];
    let idx = 1;
    if ('status' in value) { sets.push(`status = $${idx++}`); params.push(value.status); }
    if ('notes'  in value) { sets.push(`notes = $${idx++}`);  params.push(value.notes); }
    params.push(choreId);

    const { rows } = await pool.query(
      `UPDATE chore_schedule SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      params,
    );
    res.json({ success: true, data: { chore: rows[0] } });
  } catch (err) { next(err); }
}

// ── Swap ──────────────────────────────────────────────────────────────────────

const swapSchema = Joi.object({ swap_with_date: Joi.string().isoDate().required() });

export async function swapChore(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = swapSchema.validate(req.body);
  if (error) return next(Errors.validationError(error.details));
  const { houseId, choreId } = req.params;

  try {
    const entryA = await pool.query(
      'SELECT * FROM chore_schedule WHERE id = $1 AND house_id = $2',
      [choreId, houseId],
    );
    if (entryA.rows.length === 0) return next(Errors.notFound('Chore entry not found'));

    const a = entryA.rows[0];
    const entryB = await pool.query(
      'SELECT * FROM chore_schedule WHERE house_id = $1 AND chore_type_id = $2 AND scheduled_date = $3',
      [houseId, a.chore_type_id, value.swap_with_date],
    );
    if (entryB.rows.length === 0) return next(Errors.notFound('No chore entry on the target date'));

    const b = entryB.rows[0];
    await withTransaction(async (client) => {
      await client.query('UPDATE chore_schedule SET user_id = $1 WHERE id = $2', [b.user_id, a.id]);
      await client.query('UPDATE chore_schedule SET user_id = $1 WHERE id = $2', [a.user_id, b.id]);
    });

    const updated = await pool.query(
      `SELECT cs.*, u.name AS assignee_name, ct.name AS chore_name, ct.emoji
       FROM chore_schedule cs
       JOIN users u ON u.id = cs.user_id
       JOIN house_chore_types ct ON ct.id = cs.chore_type_id
       WHERE cs.id = ANY($1::uuid[])`,
      [[a.id, b.id]],
    );
    res.json({ success: true, data: { schedule: updated.rows } });
  } catch (err) { next(err); }
}
