import type { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { UserModel, toPublicUser } from '../models/user.model';
import { hashPassword, validatePasswordStrength, verifyPassword } from '../utils/password.util';
import { issueTokenPair, signToken, verifyToken } from '../utils/jwt.util';
import { HttpError } from '../middleware/error.middleware';

// ===== Validation schemas =====

export const registerSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(8).max(128).required(),
  name: Joi.string().min(1).max(255).optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(1).max(128).required(),
});

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required(),
});

// ===== Handlers =====

/**
 * @route POST /auth/register
 * @body  { email, password, name? }
 * @returns 201 { user, accessToken, refreshToken }
 */
export async function register(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, name } = req.body;

    const weakReason = validatePasswordStrength(password);
    if (weakReason) throw new HttpError(400, 'weak_password', weakReason);

    const passwordHash = await hashPassword(password);
    const user = await UserModel.create({ email, name: name ?? null, passwordHash });

    const tokens = issueTokenPair(user.id);
    _res.status(201).json({ user: toPublicUser(user), ...tokens });
  } catch (e) {
    next(e);
  }
}

/**
 * @route POST /auth/login
 * @body  { email, password }
 * @returns 200 { user, accessToken, refreshToken }
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user) throw new HttpError(401, 'invalid_credentials', 'Invalid email or password');

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw new HttpError(401, 'invalid_credentials', 'Invalid email or password');

    const tokens = issueTokenPair(user.id);
    res.json({ user: toPublicUser(user), ...tokens });
  } catch (e) {
    next(e);
  }
}

/**
 * @route POST /auth/refresh
 * @body  { refreshToken }
 * @returns 200 { accessToken, refreshToken }
 */
export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    let userId: string;
    try {
      userId = verifyToken(refreshToken, 'refresh').sub;
    } catch {
      throw new HttpError(401, 'invalid_refresh_token', 'Refresh token is invalid or expired');
    }
    res.json(issueTokenPair(userId));
  } catch (e) {
    next(e);
  }
}

/**
 * @route POST /auth/forgot-password
 * @body  { email }
 * @returns 200 always (don't leak whether email exists). In dev, includes the
 *          reset token in the response for testing — production should email it.
 */
export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;
    const user = await UserModel.findByEmail(email);

    const response: { ok: true; resetToken?: string } = { ok: true };
    if (user) {
      const token = signToken(user.id, 'reset');
      // TODO(production): dispatch email containing reset link with this token.
      if (process.env.NODE_ENV !== 'production') response.resetToken = token;
    }
    res.json(response);
  } catch (e) {
    next(e);
  }
}

/**
 * @route POST /auth/reset-password
 * @body  { token, newPassword }
 * @returns 200 { ok: true }
 */
export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, newPassword } = req.body;

    const weakReason = validatePasswordStrength(newPassword);
    if (weakReason) throw new HttpError(400, 'weak_password', weakReason);

    let userId: string;
    try {
      userId = verifyToken(token, 'reset').sub;
    } catch {
      throw new HttpError(400, 'invalid_reset_token', 'Reset token is invalid or expired');
    }

    const passwordHash = await hashPassword(newPassword);
    await UserModel.updatePasswordHash(userId, passwordHash);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
