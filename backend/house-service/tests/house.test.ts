import jwt from 'jsonwebtoken';
import request from 'supertest';
import { createApp } from '../src/app';
import { closePool, pool } from '../src/config/database';

const app = createApp();

function signToken(userId: string, email: string): string {
  return jwt.sign({ userId, email, type: 'access' }, process.env.JWT_SECRET!, { expiresIn: '15m' });
}
function uniqueEmail(p: string): string {
  return `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.dev`;
}

let ownerId: string;
let joinerId: string;
let outsiderId: string;
let ownerTok: string;
let joinerTok: string;
let outsiderTok: string;
let houseId: string;
let inviteCode: string;
const createdHouseIds: string[] = [];
const createdUserIds: string[] = [];

async function mkUser(prefix: string): Promise<string> {
  const r = await pool.query<{ id: string }>(
    `INSERT INTO users (email, password_hash, name) VALUES ($1, 'placeholder', $2) RETURNING id`,
    [uniqueEmail(`hsvc-${prefix}`), `Test ${prefix}`],
  );
  createdUserIds.push(r.rows[0].id);
  return r.rows[0].id;
}

beforeAll(async () => {
  ownerId = await mkUser('owner');
  joinerId = await mkUser('joiner');
  outsiderId = await mkUser('outsider');
  ownerTok = signToken(ownerId, 'owner@test.dev');
  joinerTok = signToken(joinerId, 'joiner@test.dev');
  outsiderTok = signToken(outsiderId, 'outsider@test.dev');
});

afterAll(async () => {
  // houses cascade to members/schedule/expenses; delete houses then the users.
  if (createdHouseIds.length) {
    await pool.query('DELETE FROM houses WHERE id = ANY($1)', [createdHouseIds]).catch(() => {});
  }
  if (createdUserIds.length) {
    await pool.query('DELETE FROM users WHERE id = ANY($1)', [createdUserIds]).catch(() => {});
  }
  await closePool();
});

describe('POST /houses (create)', () => {
  it('rejects without a token', async () => {
    const res = await request(app).post('/houses').send({ name: 'No Auth House' });
    expect(res.status).toBe(401);
  });

  it('rejects a too-short name (400)', async () => {
    const res = await request(app)
      .post('/houses')
      .set('Authorization', `Bearer ${ownerTok}`)
      .send({ name: 'A' });
    expect(res.status).toBe(400);
  });

  it('creates a house and returns an invite code (201)', async () => {
    const res = await request(app)
      .post('/houses')
      .set('Authorization', `Bearer ${ownerTok}`)
      .send({ name: 'Test House' });
    expect(res.status).toBe(201);
    houseId = res.body.data.house.id;
    inviteCode = res.body.data.house.invite_code;
    createdHouseIds.push(houseId);
    expect(houseId).toBeTruthy();
    expect(inviteCode).toBeTruthy();
  });
});

describe('GET /houses/me', () => {
  it('rejects without a token', async () => {
    expect((await request(app).get('/houses/me')).status).toBe(401);
  });

  it('returns the owner house with an admin membership', async () => {
    const res = await request(app).get('/houses/me').set('Authorization', `Bearer ${ownerTok}`);
    expect(res.status).toBe(200);
    expect(res.body.data.house.id).toBe(houseId);
    const me = res.body.data.members.find((m: { user_id: string }) => m.user_id === ownerId);
    expect(me.role).toBe('admin');
  });

  it('returns house:null (empty state, not 404) for a user with no house', async () => {
    const res = await request(app).get('/houses/me').set('Authorization', `Bearer ${joinerTok}`);
    expect(res.status).toBe(200);
    expect(res.body.data.house).toBeNull();
  });
});

describe('POST /houses/join', () => {
  it('returns 404 for an unknown invite code', async () => {
    const res = await request(app)
      .post('/houses/join')
      .set('Authorization', `Bearer ${joinerTok}`)
      .send({ invite_code: 'ZZZZZZ' });
    expect(res.status).toBe(404);
  });

  it('joins an existing house with a valid code (201)', async () => {
    const res = await request(app)
      .post('/houses/join')
      .set('Authorization', `Bearer ${joinerTok}`)
      .send({ invite_code: inviteCode });
    expect(res.status).toBe(201);
    expect(res.body.data.members.length).toBeGreaterThanOrEqual(2);
  });
});

describe('GET /houses/:houseId/members', () => {
  it('lists members for a member', async () => {
    const res = await request(app)
      .get(`/houses/${houseId}/members`)
      .set('Authorization', `Bearer ${ownerTok}`);
    expect(res.status).toBe(200);
    expect(res.body.data.members.length).toBeGreaterThanOrEqual(2);
  });

  it('returns 403 for a non-member', async () => {
    const res = await request(app)
      .get(`/houses/${houseId}/members`)
      .set('Authorization', `Bearer ${outsiderTok}`);
    expect(res.status).toBe(403);
  });
});

describe('cook schedule', () => {
  it('generates then lists a schedule', async () => {
    const gen = await request(app)
      .post(`/houses/${houseId}/schedule/generate`)
      .set('Authorization', `Bearer ${ownerTok}`)
      .send({ days: 7 });
    expect([200, 201]).toContain(gen.status);
    const list = await request(app)
      .get(`/houses/${houseId}/schedule`)
      .set('Authorization', `Bearer ${ownerTok}`);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.data.schedule)).toBe(true);
  });
});

describe('expenses', () => {
  it('rejects a negative amount (400)', async () => {
    const res = await request(app)
      .post(`/houses/${houseId}/expenses`)
      .set('Authorization', `Bearer ${ownerTok}`)
      .send({
        amount: -5,
        description: 'Bad',
        category: 'groceries',
        paid_by: ownerId,
        split_user_ids: [ownerId, joinerId],
      });
    expect(res.status).toBe(400);
  });

  it('creates an expense and computes balances', async () => {
    const create = await request(app)
      .post(`/houses/${houseId}/expenses`)
      .set('Authorization', `Bearer ${ownerTok}`)
      .send({
        amount: 100,
        description: 'Groceries',
        category: 'groceries',
        paid_by: ownerId,
        split_user_ids: [ownerId, joinerId],
      });
    expect(create.status).toBe(201);

    const list = await request(app)
      .get(`/houses/${houseId}/expenses`)
      .set('Authorization', `Bearer ${ownerTok}`);
    expect(list.status).toBe(200);

    const balances = await request(app)
      .get(`/houses/${houseId}/balances`)
      .set('Authorization', `Bearer ${ownerTok}`);
    expect(balances.status).toBe(200);
  });
});
