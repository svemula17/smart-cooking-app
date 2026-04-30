import request from 'supertest';
import { createApp } from '../src/app';
import { closePool, pool } from '../src/config/database';

const app = createApp();

const VALID_PASSWORD = 'StrongP@ss1';

function uniqueEmail(prefix = 'auth'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.dev`;
}

afterAll(async () => {
  await pool.query(`DELETE FROM users WHERE email LIKE 'auth-%@test.dev'`);
  await closePool();
});

describe('POST /auth/register', () => {
  it('creates a user and returns tokens', async () => {
    const email = uniqueEmail();
    const res = await request(app)
      .post('/auth/register')
      .send({ email, password: VALID_PASSWORD, name: 'New User' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.user.name).toBe('New User');
    expect(res.body.data.user).not.toHaveProperty('password_hash');
    expect(res.body.data.tokens.accessToken).toEqual(expect.any(String));
    expect(res.body.data.tokens.refreshToken).toEqual(expect.any(String));
  });

  it('rejects duplicate emails with 409 EMAIL_EXISTS', async () => {
    const email = uniqueEmail();
    await request(app).post('/auth/register').send({ email, password: VALID_PASSWORD });
    const res = await request(app).post('/auth/register').send({ email, password: VALID_PASSWORD });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('EMAIL_EXISTS');
  });

  it('rejects weak passwords with 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: uniqueEmail(), password: 'weakpass' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects invalid email format', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'not-an-email', password: VALID_PASSWORD });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /auth/login', () => {
  it('returns tokens for valid credentials', async () => {
    const email = uniqueEmail();
    await request(app).post('/auth/register').send({ email, password: VALID_PASSWORD });

    const res = await request(app).post('/auth/login').send({ email, password: VALID_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toEqual(expect.any(String));
    expect(res.body.data.tokens.refreshToken).toEqual(expect.any(String));
  });

  it('returns 401 INVALID_CREDENTIALS for the wrong password', async () => {
    const email = uniqueEmail();
    await request(app).post('/auth/register').send({ email, password: VALID_PASSWORD });

    const res = await request(app).post('/auth/login').send({ email, password: 'WrongP@ss1' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns 401 INVALID_CREDENTIALS for an unknown user', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: uniqueEmail(), password: VALID_PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('POST /auth/refresh', () => {
  it('returns a new access token from a valid refresh token', async () => {
    const email = uniqueEmail();
    const reg = await request(app)
      .post('/auth/register')
      .send({ email, password: VALID_PASSWORD });
    const { refreshToken } = reg.body.data.tokens;

    const res = await request(app).post('/auth/refresh').send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toEqual(expect.any(String));
  });

  it('rejects an invalid refresh token with 403 INVALID_TOKEN', async () => {
    const res = await request(app).post('/auth/refresh').send({ refreshToken: 'not-a-jwt' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });
});

describe('POST /auth/logout', () => {
  it('revokes a refresh token so it cannot be used again', async () => {
    const email = uniqueEmail();
    const reg = await request(app)
      .post('/auth/register')
      .send({ email, password: VALID_PASSWORD });
    const { refreshToken } = reg.body.data.tokens;

    const out = await request(app).post('/auth/logout').send({ refreshToken });
    expect(out.status).toBe(200);

    const after = await request(app).post('/auth/refresh').send({ refreshToken });
    expect(after.status).toBe(403);
    expect(after.body.error.code).toBe('INVALID_TOKEN');
  });
});

describe('GET /health', () => {
  it('returns ok with a timestamp', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(typeof res.body.data.timestamp).toBe('string');
  });
});
