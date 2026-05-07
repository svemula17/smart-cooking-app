import type { NextFunction, Request, Response } from 'express';
import { pool } from '../config/database';
import { Errors } from '../middleware/error.middleware';
import type { ApiSuccess } from '../types';

export interface PantryItem {
  id: string;
  user_id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  location: string;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

export const pantryController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return next(Errors.unauthorized());
      const { rows } = await pool.query(
        `SELECT * FROM pantry_items WHERE user_id = $1 ORDER BY category, name`,
        [userId],
      );
      const body: ApiSuccess<PantryItem[]> = { success: true, data: rows };
      res.json(body);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return next(Errors.unauthorized());
      const { name, quantity = 1, unit = 'units', category = 'other', location = 'pantry', expiry_date } = req.body;
      if (!name) return next(Errors.validationError('name is required'));
      const { rows } = await pool.query(
        `INSERT INTO pantry_items (user_id, name, quantity, unit, category, location, expiry_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [userId, name, quantity, unit, category, location, expiry_date ?? null],
      );
      const body: ApiSuccess<PantryItem> = { success: true, data: rows[0] };
      res.status(201).json(body);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return next(Errors.unauthorized());
      const { id } = req.params;
      const { name, quantity, unit, category, location, expiry_date } = req.body;
      const { rows } = await pool.query(
        `UPDATE pantry_items
         SET name = COALESCE($3, name),
             quantity = COALESCE($4, quantity),
             unit = COALESCE($5, unit),
             category = COALESCE($6, category),
             location = COALESCE($7, location),
             expiry_date = COALESCE($8, expiry_date),
             updated_at = NOW()
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [id, userId, name, quantity, unit, category, location, expiry_date ?? null],
      );
      if (!rows[0]) return next(Errors.notFound('Pantry item'));
      const body: ApiSuccess<PantryItem> = { success: true, data: rows[0] };
      res.json(body);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return next(Errors.unauthorized());
      const { id } = req.params;
      const { rowCount } = await pool.query(
        `DELETE FROM pantry_items WHERE id = $1 AND user_id = $2`,
        [id, userId],
      );
      if (!rowCount) return next(Errors.notFound('Pantry item'));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async deduct(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return next(Errors.unauthorized());
      const { ingredients } = req.body as { ingredients: Array<{ name: string; quantity: number; unit: string }> };
      if (!Array.isArray(ingredients)) return next(Errors.validationError('ingredients array required'));

      const updated: PantryItem[] = [];
      for (const ing of ingredients) {
        const { rows } = await pool.query(
          `UPDATE pantry_items
           SET quantity = GREATEST(0, quantity - $3),
               updated_at = NOW()
           WHERE user_id = $1
             AND LOWER(name) = LOWER($2)
           RETURNING *`,
          [userId, ing.name, ing.quantity],
        );
        if (rows[0]) updated.push(rows[0]);
      }

      const body: ApiSuccess<PantryItem[]> = { success: true, data: updated };
      res.json(body);
    } catch (err) {
      next(err);
    }
  },
};
