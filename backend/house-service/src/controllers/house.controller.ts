import type { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { pool, withTransaction } from '../config/database';
import { Errors } from '../middleware/error.middleware';
import { generateInviteCode } from '../utils/inviteCode';

const createSchema = Joi.object({ name: Joi.string().trim().min(2).max(100).required() });
const updateSchema = Joi.object({ name: Joi.string().trim().min(2).max(100).required() });

export async function createHouse(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = createSchema.validate(req.body);
  if (error) return next(Errors.validationError(error.details));

  const userId = req.auth!.userId;

  try {
    // Check user is not already in a house
    const existing = await pool.query(
      'SELECT house_id FROM house_members WHERE user_id = $1',
      [userId],
    );
    if (existing.rows.length > 0) {
      return next(Errors.conflict('You are already a member of a house. Leave it first.'));
    }

    let invite_code = generateInviteCode();
    // Retry on collision (extremely unlikely but safe)
    for (let i = 0; i < 5; i++) {
      const clash = await pool.query('SELECT id FROM houses WHERE invite_code = $1', [invite_code]);
      if (clash.rows.length === 0) break;
      invite_code = generateInviteCode();
    }

    const house = await withTransaction(async (client) => {
      const { rows } = await client.query(
        'INSERT INTO houses (name, invite_code, created_by) VALUES ($1, $2, $3) RETURNING *',
        [value.name, invite_code, userId],
      );
      const houseId = rows[0].id;
      await client.query(
        "INSERT INTO house_members (house_id, user_id, role) VALUES ($1, $2, 'admin')",
        [houseId, userId],
      );
      // Seed default chore types for every new house
      await client.query(
        `INSERT INTO house_chore_types (house_id, name, emoji, frequency) VALUES
         ($1, 'Dishwashing',   '🍽️', 'daily'),
         ($1, 'House Cleaning','🧹', 'weekly')`,
        [houseId],
      );
      return rows[0];
    });

    res.status(201).json({ success: true, data: { house } });
  } catch (err) {
    next(err);
  }
}

export async function getMyHouse(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.auth!.userId;

  try {
    const { rows } = await pool.query(
      `SELECT h.*, hm.role AS my_role
       FROM houses h
       JOIN house_members hm ON hm.house_id = h.id
       WHERE hm.user_id = $1`,
      [userId],
    );

    if (rows.length === 0) {
      res.status(200).json({ success: true, data: { house: null } });
      return;
    }

    const house = rows[0];

    const membersResult = await pool.query(
      `SELECT hm.user_id, hm.role, hm.joined_at, u.name, u.email
       FROM house_members hm
       JOIN users u ON u.id = hm.user_id
       WHERE hm.house_id = $1
       ORDER BY hm.joined_at ASC`,
      [house.id],
    );

    res.json({ success: true, data: { house, members: membersResult.rows } });
  } catch (err) {
    next(err);
  }
}

export async function updateHouse(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = updateSchema.validate(req.body);
  if (error) return next(Errors.validationError(error.details));

  const { houseId } = req.params;

  try {
    const { rows } = await pool.query(
      'UPDATE houses SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [value.name, houseId],
    );
    if (rows.length === 0) return next(Errors.notFound('House not found'));

    res.json({ success: true, data: { house: rows[0] } });
  } catch (err) {
    next(err);
  }
}

export async function deleteHouse(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId } = req.params;

  try {
    await pool.query('DELETE FROM houses WHERE id = $1', [houseId]);
    res.json({ success: true, data: { message: 'House deleted' } });
  } catch (err) {
    next(err);
  }
}
