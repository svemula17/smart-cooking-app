import type { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { pool, withTransaction } from '../config/database';
import { Errors } from '../middleware/error.middleware';
import { calculateNetBalances, simplifyDebts } from '../utils/balanceCalculator';

const createSchema = Joi.object({
  amount: Joi.number().positive().max(99999).required(),
  description: Joi.string().trim().min(1).max(255).required(),
  category: Joi.string().valid('groceries', 'utilities', 'household', 'other').default('groceries'),
  paid_by: Joi.string().uuid().required(),
  split_user_ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
  custom_splits: Joi.object().pattern(Joi.string().uuid(), Joi.number().positive()),
  shopping_list_id: Joi.string().uuid().allow(null),
});

const settleSchema = Joi.object({ with_user_id: Joi.string().uuid().required() });

export async function createExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = createSchema.validate(req.body);
  if (error) return next(Errors.validationError(error.details));

  const { houseId } = req.params;

  try {
    const result = await withTransaction(async (client) => {
      const { rows: expRows } = await client.query(
        `INSERT INTO expenses (house_id, paid_by, amount, description, category, shopping_list_id)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [houseId, value.paid_by, value.amount, value.description, value.category, value.shopping_list_id ?? null],
      );
      const expense = expRows[0];

      // Calculate per-person split amounts
      const splitIds: string[] = value.split_user_ids;
      const splits: { user_id: string; amount: number }[] = [];

      if (value.custom_splits) {
        for (const uid of splitIds) {
          const amt = value.custom_splits[uid];
          if (!amt) return Promise.reject(Errors.validationError(`Missing custom_split amount for user ${uid}`));
          splits.push({ user_id: uid, amount: amt });
        }
      } else {
        const perPerson = Math.round((value.amount / splitIds.length) * 100) / 100;
        let remaining = value.amount;
        for (let i = 0; i < splitIds.length; i++) {
          const amt = i === splitIds.length - 1
            ? Math.round(remaining * 100) / 100
            : perPerson;
          splits.push({ user_id: splitIds[i], amount: amt });
          remaining -= perPerson;
        }
      }

      for (const s of splits) {
        await client.query(
          'INSERT INTO expense_splits (expense_id, user_id, amount) VALUES ($1, $2, $3)',
          [expense.id, s.user_id, s.amount],
        );
      }

      return { expense, splits };
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function listExpenses(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId } = req.params;
  const page = Math.max(1, parseInt(req.query.page as string ?? '1', 10));
  const limit = Math.min(50, parseInt(req.query.limit as string ?? '20', 10));
  const offset = (page - 1) * limit;

  try {
    const { rows } = await pool.query(
      `SELECT e.*, u.name AS paid_by_name,
              json_agg(json_build_object(
                'user_id', es.user_id, 'amount', es.amount,
                'is_settled', es.is_settled, 'user_name', mu.name
              ) ORDER BY mu.name) AS splits
       FROM expenses e
       JOIN users u ON u.id = e.paid_by
       JOIN expense_splits es ON es.expense_id = e.id
       JOIN users mu ON mu.id = es.user_id
       WHERE e.house_id = $1
       GROUP BY e.id, u.name
       ORDER BY e.created_at DESC
       LIMIT $2 OFFSET $3`,
      [houseId, limit, offset],
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM expenses WHERE house_id = $1',
      [houseId],
    );

    res.json({
      success: true,
      data: {
        expenses: rows,
        pagination: { page, limit, total: parseInt(countResult.rows[0].count, 10) },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getBalances(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId } = req.params;

  try {
    const membersResult = await pool.query(
      `SELECT hm.user_id, u.name
       FROM house_members hm JOIN users u ON u.id = hm.user_id
       WHERE hm.house_id = $1`,
      [houseId],
    );

    const expensesResult = await pool.query(
      'SELECT id, paid_by, amount FROM expenses WHERE house_id = $1',
      [houseId],
    );

    const splitsResult = await pool.query(
      `SELECT es.* FROM expense_splits es
       JOIN expenses e ON e.id = es.expense_id
       WHERE e.house_id = $1`,
      [houseId],
    );

    const memberIds = membersResult.rows.map((m: { user_id: string }) => m.user_id);
    const netBalances = calculateNetBalances(expensesResult.rows, splitsResult.rows, memberIds);
    const simplifiedDebts = simplifyDebts(netBalances);

    const balances = membersResult.rows.map((m: { user_id: string; name: string }) => ({
      user_id: m.user_id,
      name: m.name,
      net: Math.round((netBalances.get(m.user_id) ?? 0) * 100) / 100,
    }));

    res.json({ success: true, data: { balances, settlements: simplifiedDebts } });
  } catch (err) {
    next(err);
  }
}

export async function settleUp(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = settleSchema.validate(req.body);
  if (error) return next(Errors.validationError(error.details));

  const { houseId } = req.params;
  const userId = req.auth!.userId;
  const withUserId: string = value.with_user_id;

  try {
    // Mark all unsettled splits between these two users as settled
    await withTransaction(async (client) => {
      // User owes with_user (user_id = userId, expense paid_by = withUserId)
      await client.query(
        `UPDATE expense_splits es
         SET is_settled = true, settled_at = NOW()
         FROM expenses e
         WHERE es.expense_id = e.id
           AND e.house_id = $1
           AND e.paid_by = $2
           AND es.user_id = $3
           AND es.is_settled = false`,
        [houseId, withUserId, userId],
      );
      // with_user owes user (user_id = withUserId, expense paid_by = userId)
      await client.query(
        `UPDATE expense_splits es
         SET is_settled = true, settled_at = NOW()
         FROM expenses e
         WHERE es.expense_id = e.id
           AND e.house_id = $1
           AND e.paid_by = $2
           AND es.user_id = $3
           AND es.is_settled = false`,
        [houseId, userId, withUserId],
      );
    });

    res.json({ success: true, data: { message: 'Settled up successfully' } });
  } catch (err) {
    next(err);
  }
}

export async function deleteExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId, expenseId } = req.params;
  const userId = req.auth!.userId;

  try {
    const expResult = await pool.query(
      'SELECT paid_by FROM expenses WHERE id = $1 AND house_id = $2',
      [expenseId, houseId],
    );
    if (expResult.rows.length === 0) return next(Errors.notFound('Expense not found'));

    const memberResult = await pool.query(
      'SELECT role FROM house_members WHERE house_id = $1 AND user_id = $2',
      [houseId, userId],
    );
    const role = memberResult.rows[0]?.role;

    if (expResult.rows[0].paid_by !== userId && role !== 'admin') {
      return next(Errors.forbidden('Only the payer or an admin can delete this expense'));
    }

    await pool.query('DELETE FROM expenses WHERE id = $1', [expenseId]);
    res.json({ success: true, data: { message: 'Expense deleted' } });
  } catch (err) {
    next(err);
  }
}
