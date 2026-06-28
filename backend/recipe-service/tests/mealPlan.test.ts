import jwt from 'jsonwebtoken';
import request from 'supertest';
import { createApp } from '../src/app';
import { closePool, pool } from '../src/config/database';

const app = createApp();
const SEEDED_BIRYANI = 'a0000001-0000-0000-0000-000000000001';
const NONEXISTENT = '00000000-0000-0000-0000-000000000000';

function signToken(userId: string, email: string): string {
  return jwt.sign({ userId, email, type: 'access' }, process.env.JWT_SECRET!, { expiresIn: '15m' });
}

let userId: string;
let token: string;

beforeAll(async () => {
  const r = await pool.query<{ id: string }>(
    `INSERT INTO users (email, password_hash, name) VALUES ($1, 'placeholder', 'MealPlan Test') RETURNING id`,
    [`mp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.dev`],
  );
  userId = r.rows[0].id;
  token = signToken(userId, 'mp@test.dev');
});

afterAll(async () => {
  await pool.query('DELETE FROM meal_plans WHERE user_id = $1', [userId]).catch(() => {});
  await pool.query('DELETE FROM users WHERE id = $1', [userId]).catch(() => {});
  await closePool();
});

describe('POST /meal-plans/schedule', () => {
  it('rejects without a token (401)', async () => {
    const res = await request(app)
      .post('/meal-plans/schedule')
      .send({ recipe_id: SEEDED_BIRYANI, scheduled_date: '2026-09-01', meal_type: 'dinner' });
    expect(res.status).toBe(401);
  });

  it('schedules a meal for a valid recipe (201)', async () => {
    const res = await request(app)
      .post('/meal-plans/schedule')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipe_id: SEEDED_BIRYANI, scheduled_date: '2026-09-01', meal_type: 'dinner', cooking_time: '19:00' });
    expect(res.status).toBe(201);
    expect(res.body.data.meal_plan.recipe_id).toBe(SEEDED_BIRYANI);
  });

  // Regression: a non-existent recipe_id must 404, not 500 (FK violation).
  it('returns 404 (not 500) for a non-existent recipe_id', async () => {
    const res = await request(app)
      .post('/meal-plans/schedule')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipe_id: NONEXISTENT, scheduled_date: '2026-09-02', meal_type: 'lunch' });
    expect(res.status).toBe(404);
  });

  it('rejects an invalid meal_type (400)', async () => {
    const res = await request(app)
      .post('/meal-plans/schedule')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipe_id: SEEDED_BIRYANI, scheduled_date: '2026-09-03', meal_type: 'brunch' });
    expect(res.status).toBe(400);
  });
});
