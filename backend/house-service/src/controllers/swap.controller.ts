import type { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { pool, withTransaction } from '../config/database';
import { Errors } from '../middleware/error.middleware';

const createSchema = Joi.object({
  my_schedule_id: Joi.string().uuid().required(),
  target_user_id: Joi.string().uuid().required(),
  target_schedule_id: Joi.string().uuid().required(),
});

export async function requestSwap(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = createSchema.validate(req.body);
  if (error) return next(Errors.validationError(error.details));

  const { houseId } = req.params;
  const requesterId = req.auth!.userId;

  try {
    if (requesterId === value.target_user_id) {
      return next(Errors.validationError('Cannot swap with yourself'));
    }

    const { rows } = await pool.query(
      `INSERT INTO cook_swap_requests
         (house_id, requester_id, requester_schedule_id, target_id, target_schedule_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [houseId, requesterId, value.my_schedule_id, value.target_user_id, value.target_schedule_id],
    );

    res.status(201).json({ success: true, data: { swap_request: rows[0] } });
  } catch (err) {
    next(err);
  }
}

export async function listSwapRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId } = req.params;
  const userId = req.auth!.userId;

  try {
    const { rows } = await pool.query(
      `SELECT csr.*,
              ru.name AS requester_name,
              tu.name AS target_name,
              rs.scheduled_date AS requester_date,
              ts.scheduled_date AS target_date
       FROM cook_swap_requests csr
       JOIN users ru ON ru.id = csr.requester_id
       JOIN users tu ON tu.id = csr.target_id
       JOIN cook_schedule rs ON rs.id = csr.requester_schedule_id
       JOIN cook_schedule ts ON ts.id = csr.target_schedule_id
       WHERE csr.house_id = $1
         AND csr.status = 'pending'
         AND (csr.requester_id = $2 OR csr.target_id = $2)
       ORDER BY csr.created_at DESC`,
      [houseId, userId],
    );
    res.json({ success: true, data: { swap_requests: rows } });
  } catch (err) {
    next(err);
  }
}

export async function respondToSwap(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId, swapId } = req.params;
  const userId = req.auth!.userId;
  const action = req.body.action as 'accept' | 'decline';

  if (!['accept', 'decline'].includes(action)) {
    return next(Errors.validationError('action must be accept or decline'));
  }

  try {
    const swapRow = await pool.query(
      'SELECT * FROM cook_swap_requests WHERE id = $1 AND house_id = $2',
      [swapId, houseId],
    );
    if (swapRow.rows.length === 0) return next(Errors.notFound('Swap request not found'));

    const swap = swapRow.rows[0];
    if (swap.target_id !== userId) return next(Errors.forbidden('Only the target can respond to a swap request'));
    if (swap.status !== 'pending') return next(Errors.conflict('Swap request already resolved'));

    if (action === 'decline') {
      await pool.query("UPDATE cook_swap_requests SET status = 'declined' WHERE id = $1", [swapId]);
      res.json({ success: true, data: { message: 'Swap declined' } });
      return;
    }

    // Accept: swap the user_ids on both schedule rows atomically
    await withTransaction(async (client) => {
      await client.query(
        'UPDATE cook_schedule SET user_id = $1 WHERE id = $2',
        [swap.target_id, swap.requester_schedule_id],
      );
      await client.query(
        'UPDATE cook_schedule SET user_id = $1 WHERE id = $2',
        [swap.requester_id, swap.target_schedule_id],
      );
      await client.query("UPDATE cook_swap_requests SET status = 'accepted' WHERE id = $1", [swapId]);
    });

    res.json({ success: true, data: { message: 'Swap accepted — schedules updated' } });
  } catch (err) {
    next(err);
  }
}
