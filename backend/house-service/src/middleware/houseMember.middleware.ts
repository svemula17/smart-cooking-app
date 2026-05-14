import type { NextFunction, Request, Response } from 'express';
import { pool } from '../config/database';
import { Errors } from './error.middleware';

/** Confirms the authenticated user is a member of the house in :houseId and sets req.houseId. */
export async function requireHouseMember(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const { houseId } = req.params;
  const userId = req.auth!.userId;

  try {
    const { rows } = await pool.query(
      'SELECT role FROM house_members WHERE house_id = $1 AND user_id = $2',
      [houseId, userId],
    );
    if (rows.length === 0) {
      return next(Errors.forbidden('You are not a member of this house'));
    }
    req.houseId = houseId;
    next();
  } catch (err) {
    next(err);
  }
}

/** Confirms the authenticated user is an admin of the house in :houseId. */
export async function requireHouseAdmin(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const { houseId } = req.params;
  const userId = req.auth!.userId;

  try {
    const { rows } = await pool.query(
      "SELECT role FROM house_members WHERE house_id = $1 AND user_id = $2 AND role = 'admin'",
      [houseId, userId],
    );
    if (rows.length === 0) {
      return next(Errors.forbidden('Only house admins can perform this action'));
    }
    req.houseId = houseId;
    next();
  } catch (err) {
    next(err);
  }
}
