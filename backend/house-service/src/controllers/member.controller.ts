import type { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { pool, withTransaction } from '../config/database';
import { Errors } from '../middleware/error.middleware';
import { generateInviteCode } from '../utils/inviteCode';

const joinSchema = Joi.object({ invite_code: Joi.string().trim().uppercase().length(7).required() });

export async function joinHouse(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = joinSchema.validate(req.body);
  if (error) return next(Errors.validationError(error.details));

  const userId = req.auth!.userId;

  try {
    const existing = await pool.query(
      'SELECT house_id FROM house_members WHERE user_id = $1',
      [userId],
    );
    if (existing.rows.length > 0) {
      return next(Errors.conflict('You are already a member of a house. Leave it first.'));
    }

    const houseResult = await pool.query(
      'SELECT * FROM houses WHERE invite_code = $1',
      [value.invite_code],
    );
    if (houseResult.rows.length === 0) {
      return next(Errors.notFound('No house found with that invite code'));
    }

    const house = houseResult.rows[0];

    await pool.query(
      "INSERT INTO house_members (house_id, user_id, role) VALUES ($1, $2, 'member')",
      [house.id, userId],
    );

    const membersResult = await pool.query(
      `SELECT hm.user_id, hm.role, hm.joined_at, u.name, u.email
       FROM house_members hm
       JOIN users u ON u.id = hm.user_id
       WHERE hm.house_id = $1
       ORDER BY hm.joined_at ASC`,
      [house.id],
    );

    res.status(201).json({ success: true, data: { house, members: membersResult.rows } });
  } catch (err) {
    next(err);
  }
}

export async function listMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT hm.user_id, hm.role, hm.joined_at, u.name, u.email
       FROM house_members hm
       JOIN users u ON u.id = hm.user_id
       WHERE hm.house_id = $1
       ORDER BY hm.joined_at ASC`,
      [houseId],
    );
    res.json({ success: true, data: { members: rows } });
  } catch (err) {
    next(err);
  }
}

export async function removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId, userId: targetUserId } = req.params;
  const requesterId = req.auth!.userId;

  try {
    // Check requester role
    const requesterRow = await pool.query(
      'SELECT role FROM house_members WHERE house_id = $1 AND user_id = $2',
      [houseId, requesterId],
    );
    if (requesterRow.rows.length === 0) {
      return next(Errors.forbidden('You are not a member of this house'));
    }

    const requesterRole = requesterRow.rows[0].role;
    const isSelf = requesterId === targetUserId;

    // Admin can remove anyone; members can only remove themselves
    if (!isSelf && requesterRole !== 'admin') {
      return next(Errors.forbidden('Only admins can remove other members'));
    }

    // Prevent removing the last admin
    if (!isSelf) {
      const targetRow = await pool.query(
        'SELECT role FROM house_members WHERE house_id = $1 AND user_id = $2',
        [houseId, targetUserId],
      );
      if (targetRow.rows[0]?.role === 'admin') {
        const adminCount = await pool.query(
          "SELECT COUNT(*) FROM house_members WHERE house_id = $1 AND role = 'admin'",
          [houseId],
        );
        if (parseInt(adminCount.rows[0].count, 10) <= 1) {
          return next(Errors.conflict('Cannot remove the last admin. Promote another member first.'));
        }
      }
    }

    await pool.query(
      'DELETE FROM house_members WHERE house_id = $1 AND user_id = $2',
      [houseId, targetUserId],
    );

    res.json({ success: true, data: { message: 'Member removed' } });
  } catch (err) {
    next(err);
  }
}

export async function refreshInviteCode(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId } = req.params;

  try {
    let invite_code = generateInviteCode();
    for (let i = 0; i < 5; i++) {
      const clash = await pool.query(
        'SELECT id FROM houses WHERE invite_code = $1 AND id != $2',
        [invite_code, houseId],
      );
      if (clash.rows.length === 0) break;
      invite_code = generateInviteCode();
    }

    const { rows } = await pool.query(
      'UPDATE houses SET invite_code = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [invite_code, houseId],
    );
    if (rows.length === 0) return next(Errors.notFound('House not found'));

    res.json({ success: true, data: { house: rows[0] } });
  } catch (err) {
    next(err);
  }
}
