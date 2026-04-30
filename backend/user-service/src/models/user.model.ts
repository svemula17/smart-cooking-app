import { db } from '../config/database';

export interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  userId: string;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  dietaryRestrictions: string[];
  favoriteCuisines: string[];
}

const USER_COLUMNS = `
  id, email, name,
  password_hash AS "passwordHash",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

const PREF_COLUMNS = `
  user_id AS "userId",
  daily_calories AS "dailyCalories",
  daily_protein AS "dailyProtein",
  daily_carbs AS "dailyCarbs",
  daily_fat AS "dailyFat",
  dietary_restrictions AS "dietaryRestrictions",
  favorite_cuisines AS "favoriteCuisines"
`;

export const UserModel = {
  /** Insert a user. Throws on email collision (unique violation, code 23505). */
  async create(input: { email: string; name: string | null; passwordHash: string }): Promise<UserRecord> {
    const { rows } = await db.query<UserRecord>(
      `INSERT INTO users (email, name, password_hash)
       VALUES ($1, $2, $3)
       RETURNING ${USER_COLUMNS}`,
      [input.email, input.name, input.passwordHash],
    );
    return rows[0];
  },

  async findById(id: string): Promise<UserRecord | null> {
    const { rows } = await db.query<UserRecord>(
      `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  },

  async findByEmail(email: string): Promise<UserRecord | null> {
    const { rows } = await db.query<UserRecord>(
      `SELECT ${USER_COLUMNS} FROM users WHERE email = $1`,
      [email],
    );
    return rows[0] ?? null;
  },

  async updateName(id: string, name: string): Promise<UserRecord | null> {
    const { rows } = await db.query<UserRecord>(
      `UPDATE users SET name = $2 WHERE id = $1 RETURNING ${USER_COLUMNS}`,
      [id, name],
    );
    return rows[0] ?? null;
  },

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await db.query(
      `UPDATE users SET password_hash = $2 WHERE id = $1`,
      [id, passwordHash],
    );
  },

  /** Upsert preferences row; goals fall back to defaults when first created. */
  async upsertGoals(input: {
    userId: string;
    dailyCalories: number;
    dailyProtein: number;
    dailyCarbs: number;
    dailyFat: number;
  }): Promise<UserPreferences> {
    const { rows } = await db.query<UserPreferences>(
      `INSERT INTO user_preferences (user_id, daily_calories, daily_protein, daily_carbs, daily_fat)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         daily_calories = EXCLUDED.daily_calories,
         daily_protein = EXCLUDED.daily_protein,
         daily_carbs = EXCLUDED.daily_carbs,
         daily_fat = EXCLUDED.daily_fat,
         updated_at = NOW()
       RETURNING ${PREF_COLUMNS}`,
      [input.userId, input.dailyCalories, input.dailyProtein, input.dailyCarbs, input.dailyFat],
    );
    return rows[0];
  },

  async upsertRestrictions(input: {
    userId: string;
    dietaryRestrictions: string[];
    favoriteCuisines?: string[];
  }): Promise<UserPreferences> {
    const { rows } = await db.query<UserPreferences>(
      `INSERT INTO user_preferences (user_id, dietary_restrictions, favorite_cuisines)
       VALUES ($1, $2::jsonb, COALESCE($3::jsonb, '[]'::jsonb))
       ON CONFLICT (user_id) DO UPDATE SET
         dietary_restrictions = EXCLUDED.dietary_restrictions,
         favorite_cuisines = COALESCE(EXCLUDED.favorite_cuisines, user_preferences.favorite_cuisines),
         updated_at = NOW()
       RETURNING ${PREF_COLUMNS}`,
      [
        input.userId,
        JSON.stringify(input.dietaryRestrictions),
        input.favoriteCuisines ? JSON.stringify(input.favoriteCuisines) : null,
      ],
    );
    return rows[0];
  },

  async getPreferences(userId: string): Promise<UserPreferences | null> {
    const { rows } = await db.query<UserPreferences>(
      `SELECT ${PREF_COLUMNS} FROM user_preferences WHERE user_id = $1`,
      [userId],
    );
    return rows[0] ?? null;
  },
};

export function toPublicUser(u: UserRecord) {
  return { id: u.id, email: u.email, name: u.name, createdAt: u.createdAt, updatedAt: u.updatedAt };
}
