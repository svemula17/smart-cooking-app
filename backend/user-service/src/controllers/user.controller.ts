import type { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { UserModel, toPublicUser } from '../models/user.model';
import { HttpError } from '../middleware/error.middleware';

// ===== Validation schemas =====

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
});

export const goalsSchema = Joi.object({
  dailyCalories: Joi.number().integer().min(800).max(8000).required(),
  dailyProtein: Joi.number().integer().min(0).max(500).required(),
  dailyCarbs: Joi.number().integer().min(0).max(1000).required(),
  dailyFat: Joi.number().integer().min(0).max(400).required(),
});

export const restrictionsSchema = Joi.object({
  dietaryRestrictions: Joi.array().items(Joi.string().max(50)).max(20).required(),
  favoriteCuisines: Joi.array().items(Joi.string().max(50)).max(20).optional(),
});

// ===== Handlers =====

/**
 * @route   GET /users/me
 * @auth    bearer
 * @returns 200 { user, preferences }
 */
export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const user = await UserModel.findById(userId);
    if (!user) throw new HttpError(404, 'not_found', 'User not found');
    const preferences = await UserModel.getPreferences(userId);
    res.json({ user: toPublicUser(user), preferences });
  } catch (e) {
    next(e);
  }
}

/**
 * @route   PUT /users/me
 * @auth    bearer
 * @body    { name }
 * @returns 200 { user }
 */
export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const { name } = req.body;
    const user = await UserModel.updateName(userId, name);
    if (!user) throw new HttpError(404, 'not_found', 'User not found');
    res.json({ user: toPublicUser(user) });
  } catch (e) {
    next(e);
  }
}

/**
 * @route   PUT /users/me/goals
 * @auth    bearer
 * @body    { dailyCalories, dailyProtein, dailyCarbs, dailyFat }
 * @returns 200 { preferences }
 */
export async function setGoals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const preferences = await UserModel.upsertGoals({ userId, ...req.body });
    res.json({ preferences });
  } catch (e) {
    next(e);
  }
}

/**
 * @route   PUT /users/me/restrictions
 * @auth    bearer
 * @body    { dietaryRestrictions, favoriteCuisines? }
 * @returns 200 { preferences }
 */
export async function setRestrictions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const preferences = await UserModel.upsertRestrictions({ userId, ...req.body });
    res.json({ preferences });
  } catch (e) {
    next(e);
  }
}
