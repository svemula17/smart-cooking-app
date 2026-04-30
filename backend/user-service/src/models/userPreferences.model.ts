import { pool } from '../config/database';
import type { UserPreferences } from '../types';

const COLUMNS = `
  user_id, daily_calories, daily_protein, daily_carbs, daily_fat,
  dietary_restrictions, favorite_cuisines
`;

/**
 * Data-access layer for `user_preferences`. One row per user — UPSERTs are
 * used to keep the API simple from the client's perspective (always succeeds
 * regardless of whether a row already exists).
 */
export const UserPreferencesModel = {
  async findByUserId(userId: string): Promise<UserPreferences | null> {
    const { rows } = await pool.query<UserPreferences>(
      `SELECT ${COLUMNS} FROM user_preferences WHERE user_id = $1`,
      [userId],
    );
    return rows[0] ?? null;
  },

  /** Upsert macro goals. Leaves dietary_restrictions and favorite_cuisines unchanged. */
  async upsertGoals(input: {
    userId: string;
    dailyCalories: number;
    dailyProtein: number;
    dailyCarbs: number;
    dailyFat: number;
  }): Promise<UserPreferences> {
    const { rows } = await pool.query<UserPreferences>(
      `INSERT INTO user_preferences
         (user_id, daily_calories, daily_protein, daily_carbs, daily_fat)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         daily_calories = EXCLUDED.daily_calories,
         daily_protein  = EXCLUDED.daily_protein,
         daily_carbs    = EXCLUDED.daily_carbs,
         daily_fat      = EXCLUDED.daily_fat,
         updated_at     = NOW()
       RETURNING ${COLUMNS}`,
      [input.userId, input.dailyCalories, input.dailyProtein, input.dailyCarbs, input.dailyFat],
    );
    return rows[0];
  },

  /**
   * Upsert dietary restrictions and (optionally) favorite cuisines.
   * If `favoriteCuisines` is omitted, the existing value is preserved.
   */
  async upsertRestrictions(input: {
    userId: string;
    dietaryRestrictions: string[];
    favoriteCuisines?: string[];
  }): Promise<UserPreferences> {
    const { rows } = await pool.query<UserPreferences>(
      `INSERT INTO user_preferences
         (user_id, dietary_restrictions, favorite_cuisines)
       VALUES ($1, $2::jsonb, COALESCE($3::jsonb, '[]'::jsonb))
       ON CONFLICT (user_id) DO UPDATE SET
         dietary_restrictions = EXCLUDED.dietary_restrictions,
         favorite_cuisines    = COALESCE($3::jsonb, user_preferences.favorite_cuisines),
         updated_at           = NOW()
       RETURNING ${COLUMNS}`,
      [
        input.userId,
        JSON.stringify(input.dietaryRestrictions),
        input.favoriteCuisines !== undefined ? JSON.stringify(input.favoriteCuisines) : null,
      ],
    );
    return rows[0];
  },
};

/**
 * Data-access for the `refresh_token_denylist` table. Tracks revoked refresh
 * token JTIs so /auth/logout can invalidate a token before its natural expiry.
 */
export const RefreshTokenDenylist = {
  async revoke(jti: string, userId: string, expiresAt: Date): Promise<void> {
    await pool.query(
      `INSERT INTO refresh_token_denylist (jti, user_id, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (jti) DO NOTHING`,
      [jti, userId, expiresAt],
    );
  },

  async isRevoked(jti: string): Promise<boolean> {
    const { rows } = await pool.query<{ exists: boolean }>(
      `SELECT EXISTS(SELECT 1 FROM refresh_token_denylist WHERE jti = $1) AS exists`,
      [jti],
    );
    return rows[0]?.exists ?? false;
  },

  /** Periodic-cleanup helper — caller schedules this however they like. */
  async purgeExpired(): Promise<number> {
    const { rowCount } = await pool.query(
      `DELETE FROM refresh_token_denylist WHERE expires_at < NOW()`,
    );
    return rowCount ?? 0;
  },
};
