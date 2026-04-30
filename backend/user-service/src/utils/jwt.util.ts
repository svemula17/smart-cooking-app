import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import type {
  AccessTokenPayload,
  JWTPayload,
  RefreshTokenPayload,
  TokenPair,
} from '../types';

/**
 * Issue a short-lived (15 min default) access token.
 */
export function generateAccessToken(payload: JWTPayload): { token: string; jti: string } {
  const jti = uuidv4();
  const token = jwt.sign(
    { ...payload, type: 'access', jti },
    env.jwtSecret,
    { expiresIn: env.jwtAccessTtl as SignOptions['expiresIn'] },
  );
  return { token, jti };
}

/**
 * Issue a long-lived (7 day default) refresh token. The returned `jti`
 * should be persisted alongside the user when active-session tracking is
 * required, or compared against a denylist when revocation is needed.
 */
export function generateRefreshToken(payload: JWTPayload): { token: string; jti: string } {
  const jti = uuidv4();
  const token = jwt.sign(
    { ...payload, type: 'refresh', jti },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshTtl as SignOptions['expiresIn'] },
  );
  return { token, jti };
}

/** Convenience: issue an access+refresh pair atomically. */
export function generateTokenPair(payload: JWTPayload): TokenPair & { accessJti: string; refreshJti: string } {
  const access = generateAccessToken(payload);
  const refresh = generateRefreshToken(payload);
  return {
    accessToken: access.token,
    refreshToken: refresh.token,
    accessJti: access.jti,
    refreshJti: refresh.jti,
  };
}

/**
 * Verify an access token. Throws on invalid/expired tokens.
 * Asserts the `type` claim matches `'access'` to prevent token misuse.
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret) as AccessTokenPayload;
  if (decoded.type !== 'access') {
    throw new Error('Token is not an access token');
  }
  return decoded;
}

/** Verify a refresh token. Throws on invalid/expired tokens or wrong type. */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, env.jwtRefreshSecret) as RefreshTokenPayload;
  if (decoded.type !== 'refresh') {
    throw new Error('Token is not a refresh token');
  }
  return decoded;
}

/**
 * Returns the JWT expiry as a Date, or null if the token has no exp claim.
 * Used by the logout flow to know how long to keep a denylist entry around.
 */
export function getTokenExpiry(token: string): Date | null {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  return decoded?.exp ? new Date(decoded.exp * 1000) : null;
}
