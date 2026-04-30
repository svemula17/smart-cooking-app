import type { PoolClient } from 'pg';
import { pool } from '../config/database';
import type { PublicUser, User } from '../types';

const FULL_COLUMNS = 'id, email, password_hash, name, created_at, updated_at';
const PUBLIC_COLUMNS = 'id, email, name, created_at, updated_at';

/**
 * Data-access layer for the `users` table. All queries are parameterized.
 * Optionally accepts a `PoolClient` so callers can run inside a transaction.
 */
export const UserModel = {
  /**
   * Insert a new user. Throws pg error 23505 on email conflict — the error
   * middleware translates that into a 409 EMAIL_EXISTS response.
   */
  async create(
    input: { email: string; passwordHash: string; name: string | null },
    client: PoolClient | typeof pool = pool,
  ): Promise<User> {
    const { rows } = await client.query<User>(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING ${FULL_COLUMNS}`,
      [input.email, input.passwordHash, input.name],
    );
    return rows[0];
  },

  async findById(id: string): Promise<User | null> {
    const { rows } = await pool.query<User>(
      `SELECT ${FULL_COLUMNS} FROM users WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await pool.query<User>(
      `SELECT ${FULL_COLUMNS} FROM users WHERE email = $1`,
      [email],
    );
    return rows[0] ?? null;
  },

  /**
   * Patch a user's profile. Only `name` and/or `email` may be updated; both
   * are optional. Returns the post-update row, or null if the user was deleted
   * concurrently.
   */
  async update(
    id: string,
    patch: { name?: string; email?: string },
  ): Promise<PublicUser | null> {
    const { rows } = await pool.query<PublicUser>(
      `UPDATE users
          SET name  = COALESCE($2, name),
              email = COALESCE($3, email)
        WHERE id = $1
        RETURNING ${PUBLIC_COLUMNS}`,
      [id, patch.name ?? null, patch.email ?? null],
    );
    return rows[0] ?? null;
  },

  toPublicUser(user: User): PublicUser {
    const { password_hash, ...rest } = user;
    void password_hash;
    return rest;
  },
};
