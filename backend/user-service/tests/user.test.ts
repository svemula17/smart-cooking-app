import request from 'supertest';
import { createApp } from '../src/app';
import { closePool, pool } from '../src/config/database';

const app = createApp();

const VALID_PASSWORD = 'StrongP@ss1';

function uniqueEmail(prefix = 'user'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.dev`;
}

async function registerAndGetToken(email: string): Promise<string> {
  const res = await request(app)
    .post('/auth/register')
    .send({ email, password: VALID_PASSWORD, name: 'Tester' });
  return res.body.data.tokens.accessToken as string;
}

afterAll(async () => {
  await pool.query(`DELETE FROM users WHERE email LIKE 'user-%@test.dev'`);
  await closePool();
});

describe('GET /users/me', () => {
  it('returns the user and (initially null) preferences when authorized', async () => {
    const email = uniqueEmail();
    const token = await registerAndGetToken(email);

    const res = await request(app).get('/users/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.preferences).toBeNull();
  });

  it('returns 401 UNAUTHORIZED without a token', async () => {
    const res = await request(app).get('/users/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 403 INVALID_TOKEN with a malformed token', async () => {
    const res = await request(app).get('/users/me').set('Authorization', 'Bearer not.a.jwt');
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });
});

describe('PUT /users/me', () => {
  it('updates the user name', async () => {
    const email = uniqueEmail();
    const token = await registerAndGetToken(email);

    const res = await request(app)
      .put('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.name).toBe('Updated Name');
  });

  it('rejects empty body with 400 VALIDATION_ERROR', async () => {
    const email = uniqueEmail();
    const token = await registerAndGetToken(email);

    const res = await request(app)
      .put('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('PUT /users/me/goals', () => {
  it('upserts macro goals and returns the preferences row', async () => {
    const email = uniqueEmail();
    const token = await registerAndGetToken(email);

    const res = await request(app)
      .put('/users/me/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({ daily_calories: 2200, daily_protein: 150, daily_carbs: 250, daily_fat: 70 });

    expect(res.status).toBe(200);
    expect(res.body.data.preferences.daily_calories).toBe(2200);
    expect(res.body.data.preferences.daily_protein).toBe(150);
  });

  it('rejects out-of-range values', async () => {
    const email = uniqueEmail();
    const token = await registerAndGetToken(email);

    const res = await request(app)
      .put('/users/me/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({ daily_calories: 100, daily_protein: 150, daily_carbs: 250, daily_fat: 70 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('PUT /users/me/restrictions', () => {
  it('saves dietary restrictions and favorite cuisines', async () => {
    const email = uniqueEmail();
    const token = await registerAndGetToken(email);

    const res = await request(app)
      .put('/users/me/restrictions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        dietary_restrictions: ['vegetarian', 'gluten-free'],
        favorite_cuisines: ['Indian', 'Italian'],
      });

    expect(res.status).toBe(200);
    expect(res.body.data.preferences.dietary_restrictions).toEqual(['vegetarian', 'gluten-free']);
    expect(res.body.data.preferences.favorite_cuisines).toEqual(['Indian', 'Italian']);
  });
});
