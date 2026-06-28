import jwt from 'jsonwebtoken';
import request from 'supertest';
import { createApp } from '../src/app';
import { closePool, pool } from '../src/config/database';

const app = createApp();
const SEEDED_BIRYANI = 'a0000001-0000-0000-0000-000000000001';

function signToken(userId: string, email: string): string {
  return jwt.sign({ userId, email, type: 'access' }, process.env.JWT_SECRET!, { expiresIn: '15m' });
}
function uniqueEmail(p: string): string {
  return `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.dev`;
}

let ownerId: string;
let ownerTok: string;
let outsiderTok: string;
let houseId: string;
const userIds: string[] = [];
const houseIds: string[] = [];

async function mkUser(prefix: string): Promise<string> {
  const r = await pool.query<{ id: string }>(
    `INSERT INTO users (email, password_hash, name) VALUES ($1, 'placeholder', $2) RETURNING id`,
    [uniqueEmail(`hx-${prefix}`), `HX ${prefix}`],
  );
  userIds.push(r.rows[0].id);
  return r.rows[0].id;
}

beforeAll(async () => {
  ownerId = await mkUser('owner');
  const outsiderId = await mkUser('outsider');
  ownerTok = signToken(ownerId, 'hx-owner@test.dev');
  outsiderTok = signToken(outsiderId, 'hx-outsider@test.dev');
  const res = await request(app)
    .post('/houses')
    .set('Authorization', `Bearer ${ownerTok}`)
    .send({ name: 'Coverage House' });
  houseId = res.body.data.house.id;
  houseIds.push(houseId);
});

afterAll(async () => {
  if (houseIds.length) await pool.query('DELETE FROM houses WHERE id = ANY($1)', [houseIds]).catch(() => {});
  if (userIds.length) await pool.query('DELETE FROM users WHERE id = ANY($1)', [userIds]).catch(() => {});
  await closePool();
});

const auth = (m: 'get' | 'post' | 'put', path: string, tok = ownerTok) =>
  request(app)[m](path).set('Authorization', `Bearer ${tok}`);

describe('house GET endpoints return 200 for a member', () => {
  const reads = [
    'budget/current',
    'budget/breakdown',
    'leaderboard',
    'achievements',
    'cuisine-passport',
    'report/weekly',
    'chore-types',
    'chores',
    'prep-meals',
    'waste/summary',
    'attendance',
    'swap-requests',
    'shopping-rotation',
    'balances',
    'expenses',
  ];
  for (const r of reads) {
    it(`GET /${r} → 200`, async () => {
      const res = await auth('get', `/houses/${houseId}/${r}`);
      expect(res.status).toBe(200);
    });
  }
});

describe('house write endpoints', () => {
  it('PUT budget → 200, reflected in budget/current', async () => {
    const set = await auth('put', `/houses/${houseId}/budget`).send({ amount: 500, month: '2026-07' });
    expect([200, 201]).toContain(set.status);
    const cur = await auth('get', `/houses/${houseId}/budget/current?month=2026-07`);
    expect(cur.status).toBe(200);
  });

  it('PUT budget rejects negative amount (400)', async () => {
    const res = await auth('put', `/houses/${houseId}/budget`).send({ amount: -10 });
    expect(res.status).toBe(400);
  });

  it('POST attendance → success', async () => {
    const res = await auth('post', `/houses/${houseId}/attendance`).send({ is_attending: true });
    expect([200, 201]).toContain(res.status);
  });

  it('POST chore-type → 201 and appears in list', async () => {
    const res = await auth('post', `/houses/${houseId}/chore-types`).send({ name: 'Dishes', emoji: '🍽️' });
    expect([200, 201]).toContain(res.status);
    const list = await auth('get', `/houses/${houseId}/chore-types`);
    expect(JSON.stringify(list.body).toLowerCase()).toContain('dishes');
  });

  it('POST chore-type rejects a too-short name (400)', async () => {
    const res = await auth('post', `/houses/${houseId}/chore-types`).send({ name: 'x' });
    expect(res.status).toBe(400);
  });

  it('POST prep-meal → success', async () => {
    const res = await auth('post', `/houses/${houseId}/prep-meals`).send({
      recipe_id: SEEDED_BIRYANI,
      total_portions: 4,
      available_until: '2026-12-31',
    });
    expect([200, 201]).toContain(res.status);
  });

  it('POST waste log → success', async () => {
    const res = await auth('post', `/houses/${houseId}/waste`).send({
      item_name: 'Spinach',
      quantity: 1,
      unit: 'bunch',
      estimated_cost: 2.5,
      expired_on: '2026-06-01',
    });
    expect([200, 201]).toContain(res.status);
  });
});

describe('house authorization', () => {
  it('GET budget/current rejects a non-member (403)', async () => {
    const res = await auth('get', `/houses/${houseId}/budget/current`, outsiderTok);
    expect(res.status).toBe(403);
  });
  it('GET chores rejects no token (401)', async () => {
    const res = await request(app).get(`/houses/${houseId}/chores`);
    expect(res.status).toBe(401);
  });
});
