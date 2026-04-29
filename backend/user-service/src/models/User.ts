import { db } from '../utils/db';

export interface UserRow {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

export const UserModel = {
  async create(input: { email: string; name: string; passwordHash: string }): Promise<UserRow> {
    const { rows } = await db.query<UserRow>(
      `INSERT INTO users (email, name, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, password_hash AS "passwordHash"`,
      [input.email, input.name, input.passwordHash],
    );
    return rows[0];
  },

  async findByEmail(email: string): Promise<UserRow | null> {
    const { rows } = await db.query<UserRow>(
      `SELECT id, email, name, password_hash AS "passwordHash" FROM users WHERE email = $1`,
      [email],
    );
    return rows[0] ?? null;
  },

  async findById(id: string): Promise<UserRow | null> {
    const { rows } = await db.query<UserRow>(
      `SELECT id, email, name, password_hash AS "passwordHash" FROM users WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  },

  async update(id: string, patch: Partial<Pick<UserRow, 'name'>>): Promise<UserRow | null> {
    const { rows } = await db.query<UserRow>(
      `UPDATE users SET name = COALESCE($2, name), updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, name, password_hash AS "passwordHash"`,
      [id, patch.name ?? null],
    );
    return rows[0] ?? null;
  },
};
