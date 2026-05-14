import type { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { pool, withTransaction } from '../config/database';
import { Errors } from '../middleware/error.middleware';

const proposeSchema = Joi.object({
  recipe_ids: Joi.array().items(Joi.string().uuid()).min(2).max(4).required(),
  voting_hours: Joi.number().integer().min(1).max(24).default(12),
});

const voteSchema = Joi.object({ recipe_id: Joi.string().uuid().required() });

export async function proposeRecipes(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = proposeSchema.validate(req.body);
  if (error) return next(Errors.validationError(error.details));

  const { houseId, scheduleId } = req.params;
  const userId = req.auth!.userId;

  try {
    // Only the assigned cook can propose
    const scheduleRow = await pool.query(
      'SELECT user_id FROM cook_schedule WHERE id = $1 AND house_id = $2',
      [scheduleId, houseId],
    );
    if (scheduleRow.rows.length === 0) return next(Errors.notFound('Schedule entry not found'));
    if (scheduleRow.rows[0].user_id !== userId) {
      return next(Errors.forbidden('Only the assigned cook can propose recipes'));
    }

    const votingEndsAt = new Date(Date.now() + value.voting_hours * 60 * 60 * 1000);

    const { rows } = await pool.query(
      `INSERT INTO cook_recipe_proposals (cook_schedule_id, house_id, recipe_ids, voting_ends_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (cook_schedule_id) DO UPDATE
         SET recipe_ids = EXCLUDED.recipe_ids, voting_ends_at = EXCLUDED.voting_ends_at,
             status = 'voting', selected_recipe_id = NULL
       RETURNING *`,
      [scheduleId, houseId, JSON.stringify(value.recipe_ids), votingEndsAt],
    );

    // Hydrate recipe names
    const recipeNames = await pool.query(
      'SELECT id, name, cuisine_type, prep_time_minutes, cook_time_minutes FROM recipes WHERE id = ANY($1::uuid[])',
      [value.recipe_ids],
    );

    res.status(201).json({
      success: true,
      data: { proposal: rows[0], recipes: recipeNames.rows },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProposal(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { proposalId } = req.params;

  try {
    const propRow = await pool.query('SELECT * FROM cook_recipe_proposals WHERE id = $1', [proposalId]);
    if (propRow.rows.length === 0) return next(Errors.notFound('Proposal not found'));

    const proposal = propRow.rows[0];

    const votesResult = await pool.query(
      `SELECT crv.recipe_id, COUNT(*) AS vote_count,
              json_agg(json_build_object('user_id', crv.user_id, 'name', u.name)) AS voters
       FROM cook_recipe_votes crv
       JOIN users u ON u.id = crv.user_id
       WHERE crv.proposal_id = $1
       GROUP BY crv.recipe_id`,
      [proposalId],
    );

    const recipeIds: string[] = proposal.recipe_ids;
    const recipesResult = await pool.query(
      'SELECT id, name, cuisine_type, prep_time_minutes, cook_time_minutes, image_url FROM recipes WHERE id = ANY($1::uuid[])',
      [recipeIds],
    );

    res.json({
      success: true,
      data: {
        proposal,
        recipes: recipesResult.rows,
        votes: votesResult.rows,
        voting_open: proposal.status === 'voting' && new Date(proposal.voting_ends_at) > new Date(),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function voteOnProposal(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { error, value } = voteSchema.validate(req.body);
  if (error) return next(Errors.validationError(error.details));

  const { proposalId } = req.params;
  const userId = req.auth!.userId;

  try {
    const propRow = await pool.query('SELECT * FROM cook_recipe_proposals WHERE id = $1', [proposalId]);
    if (propRow.rows.length === 0) return next(Errors.notFound('Proposal not found'));

    const proposal = propRow.rows[0];
    if (proposal.status !== 'voting') return next(Errors.conflict('Voting has closed'));
    if (new Date(proposal.voting_ends_at) <= new Date()) return next(Errors.conflict('Voting period has ended'));

    const recipeIds: string[] = proposal.recipe_ids;
    if (!recipeIds.includes(value.recipe_id)) {
      return next(Errors.validationError('Recipe is not in this proposal'));
    }

    await pool.query(
      `INSERT INTO cook_recipe_votes (proposal_id, user_id, recipe_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (proposal_id, user_id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id`,
      [proposalId, userId, value.recipe_id],
    );

    res.json({ success: true, data: { message: 'Vote recorded' } });
  } catch (err) {
    next(err);
  }
}

export async function closeProposal(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { proposalId } = req.params;

  try {
    // Find winning recipe by vote count
    const winner = await pool.query(
      `SELECT recipe_id, COUNT(*) AS votes
       FROM cook_recipe_votes WHERE proposal_id = $1
       GROUP BY recipe_id ORDER BY votes DESC LIMIT 1`,
      [proposalId],
    );

    const selectedRecipeId = winner.rows[0]?.recipe_id ?? null;

    const { rows } = await withTransaction(async (client) => {
      const updated = await client.query(
        `UPDATE cook_recipe_proposals
         SET status = 'decided', selected_recipe_id = $1
         WHERE id = $2 RETURNING *`,
        [selectedRecipeId, proposalId],
      );

      if (selectedRecipeId) {
        await client.query(
          'UPDATE cook_schedule SET recipe_id = $1 WHERE id = $2',
          [selectedRecipeId, updated.rows[0].cook_schedule_id],
        );
      }

      return updated.rows;
    });

    res.json({ success: true, data: { proposal: rows[0], winner_recipe_id: selectedRecipeId } });
  } catch (err) {
    next(err);
  }
}
