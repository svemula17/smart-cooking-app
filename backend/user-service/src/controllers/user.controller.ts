import type { NextFunction, Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { UserPreferencesModel } from '../models/userPreferences.model';
import { Errors } from '../middleware/error.middleware';
import type { ApiSuccess, PublicUser, UserPreferences } from '../types';

/**
 * @route   GET /users/me
 * @access  protected
 * @returns 200 { success, data: { user, preferences } }
 */
export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const user = await UserModel.findById(userId);
    if (!user) throw Errors.notFound('User not found');

    const preferences = await UserPreferencesModel.findByUserId(userId);

    const body: ApiSuccess<{ user: PublicUser; preferences: UserPreferences | null }> = {
      success: true,
      data: { user: UserModel.toPublicUser(user), preferences },
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * @route   PUT /users/me
 * @access  protected
 * @body    { name?: string, email?: string }  — at least one required
 * @returns 200 { success, data: { user } }
 * @throws  409 EMAIL_EXISTS if the new email is taken
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const { name, email } = req.body as { name?: string; email?: string };

    const user = await UserModel.update(userId, { name, email });
    if (!user) throw Errors.notFound('User not found');

    const body: ApiSuccess<{ user: PublicUser }> = {
      success: true,
      data: { user },
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * @route   PUT /users/me/goals
 * @access  protected
 * @body    { daily_calories, daily_protein, daily_carbs, daily_fat }
 * @returns 200 { success, data: { preferences } }
 */
export async function updateGoals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const { daily_calories, daily_protein, daily_carbs, daily_fat } = req.body as Record<string, number>;

    const preferences = await UserPreferencesModel.upsertGoals({
      userId,
      dailyCalories: daily_calories,
      dailyProtein: daily_protein,
      dailyCarbs: daily_carbs,
      dailyFat: daily_fat,
    });

    const body: ApiSuccess<{ preferences: UserPreferences }> = {
      success: true,
      data: { preferences },
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * @route   PUT /users/me/restrictions
 * @access  protected
 * @body    { dietary_restrictions: string[], favorite_cuisines?: string[] }
 * @returns 200 { success, data: { preferences } }
 */
export async function updateRestrictions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const { dietary_restrictions, favorite_cuisines } = req.body as {
      dietary_restrictions: string[];
      favorite_cuisines?: string[];
    };

    const preferences = await UserPreferencesModel.upsertRestrictions({
      userId,
      dietaryRestrictions: dietary_restrictions,
      favoriteCuisines: favorite_cuisines,
    });

    const body: ApiSuccess<{ preferences: UserPreferences }> = {
      success: true,
      data: { preferences },
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
