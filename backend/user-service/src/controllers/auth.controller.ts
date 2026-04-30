import type { NextFunction, Request, Response } from 'express';
import { withTransaction } from '../config/database';
import { UserModel } from '../models/user.model';
import { RefreshTokenDenylist } from '../models/userPreferences.model';
import { Errors } from '../middleware/error.middleware';
import {
  generateAccessToken,
  generateTokenPair,
  getTokenExpiry,
  verifyRefreshToken,
} from '../utils/jwt.util';
import { comparePassword, hashPassword } from '../utils/password.util';
import type { ApiSuccess } from '../types';

/**
 * Build the `{ user, tokens }` payload returned by /register and /login.
 */
function buildAuthResponse(user: { id: string; email: string; name: string | null; created_at: Date; updated_at: Date }) {
  const tokens = generateTokenPair({ userId: user.id, email: user.email });
  const { accessJti: _ai, refreshJti: _ri, ...publicTokens } = tokens;
  void _ai;
  void _ri;
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
    tokens: publicTokens,
  };
}

/**
 * @route   POST /auth/register
 * @access  public
 * @body    { email: string, password: string, name?: string }
 * @returns 201 { success, data: { user, tokens } }
 * @throws  409 EMAIL_EXISTS, 400 VALIDATION_ERROR
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, name } = req.body as { email: string; password: string; name?: string };

    const passwordHash = await hashPassword(password);

    // Use a transaction so a row appears in `users` only if the entire write
    // succeeds — keeps things tidy even though we currently only write one
    // table here.
    const user = await withTransaction((client) =>
      UserModel.create({ email, passwordHash, name: name ?? null }, client),
    );

    const body: ApiSuccess<ReturnType<typeof buildAuthResponse>> = {
      success: true,
      data: buildAuthResponse(user),
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * @route   POST /auth/login
 * @access  public
 * @body    { email: string, password: string }
 * @returns 200 { success, data: { user, tokens } }
 * @throws  401 INVALID_CREDENTIALS
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const user = await UserModel.findByEmail(email);
    if (!user) throw Errors.invalidCredentials();

    const ok = await comparePassword(password, user.password_hash);
    if (!ok) throw Errors.invalidCredentials();

    const body: ApiSuccess<ReturnType<typeof buildAuthResponse>> = {
      success: true,
      data: buildAuthResponse(user),
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * @route   POST /auth/refresh
 * @access  public (requires a valid refresh token)
 * @body    { refreshToken: string }
 * @returns 200 { success, data: { accessToken } }
 * @throws  403 INVALID_TOKEN
 */
export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken: string };

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw Errors.invalidToken('Refresh token is invalid or expired');
    }

    const revoked = await RefreshTokenDenylist.isRevoked(payload.jti);
    if (revoked) throw Errors.invalidToken('Refresh token has been revoked');

    const access = generateAccessToken({ userId: payload.userId, email: payload.email });

    const body: ApiSuccess<{ accessToken: string }> = {
      success: true,
      data: { accessToken: access.token },
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * @route   POST /auth/logout
 * @access  public (requires a refresh token in the body)
 * @body    { refreshToken: string }
 * @returns 200 { success, data: { message } }
 *
 * Idempotent — submitting an already-revoked or expired token still 200s.
 * That keeps the client logout flow simple.
 */
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken: string };

    try {
      const payload = verifyRefreshToken(refreshToken);
      const expiresAt = getTokenExpiry(refreshToken) ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await RefreshTokenDenylist.revoke(payload.jti, payload.userId, expiresAt);
    } catch {
      // Token is already invalid/expired — treat as already-logged-out.
    }

    const body: ApiSuccess<{ message: string }> = {
      success: true,
      data: { message: 'Logged out' },
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
