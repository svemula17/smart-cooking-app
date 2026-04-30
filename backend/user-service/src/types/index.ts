/**
 * Shared TypeScript interfaces for the user-service.
 *
 * These mirror the Postgres schema (snake_case) on the persistence side and
 * are returned as-is in API responses, per the public response contract.
 */

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserPreferences {
  user_id: string;
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fat: number;
  dietary_restrictions: string[];
  favorite_cuisines: string[];
}

export interface JWTPayload {
  userId: string;
  email: string;
}

export interface AccessTokenPayload extends JWTPayload {
  type: 'access';
  jti: string;
}

export interface RefreshTokenPayload extends JWTPayload {
  type: 'refresh';
  jti: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        email: string;
        jti: string;
      };
    }
  }
}
