import jwt from 'jsonwebtoken';
import request from 'supertest';
import { createApp } from '../src/app';
import { closePool, pool } from '../src/config/database';

const app = createApp();
const BIRYANI = 'a0000001-0000-0000-0000-000000000001';
const BUTTER = 'a0000001-0000-0000-0000-000000000002';

const signToken = (userId: string, email: string) =>
  jwt.sign({ userId, email, type: 'access' }, process.env.JWT_SECRET!, { expiresIn: '15m' });
const uniqueEmail = (p: string) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.dev`;

let ownerId: string, joinerId: string, spareId: string;
let ownerTok: string, joinerTok: string, spareTok: string;
let houseId: string, inviteCode: string;
const userIds: string[] = [];
const houseIds: string[] = [];

async function mkUser(prefix: string): Promise<string> {
  const r = await pool.query<{ id: string }>(
    `INSERT INTO users (email, password_hash, name) VALUES ($1, 'placeholder', $2) RETURNING id`,
    [uniqueEmail(`hl-${prefix}`), `HL ${prefix}`],
  );
  userIds.push(r.rows[0].id);
  return r.rows[0].id;
}
const auth = (m: 'get' | 'post' | 'put' | 'patch' | 'delete', path: string, tok = ownerTok) =>
  request(app)[m](path).set('Authorization', `Bearer ${tok}`);

beforeAll(async () => {
  ownerId = await mkUser('owner');
  joinerId = await mkUser('joiner');
  spareId = await mkUser('spare');
  ownerTok = signToken(ownerId, 'hl-owner@test.dev');
  joinerTok = signToken(joinerId, 'hl-joiner@test.dev');
  spareTok = signToken(spareId, 'hl-spare@test.dev');

  const created = await auth('post', '/houses').send({ name: 'Lifecycle House' });
  houseId = created.body.data.house.id;
  inviteCode = created.body.data.house.invite_code;
  houseIds.push(houseId);
  await auth('post', '/houses/join', joinerTok).send({ invite_code: inviteCode });
});

afterAll(async () => {
  if (houseIds.length) await pool.query('DELETE FROM houses WHERE id = ANY($1)', [houseIds]).catch(() => {});
  if (userIds.length) await pool.query('DELETE FROM users WHERE id = ANY($1)', [userIds]).catch(() => {});
  await closePool();
});

describe('invite refresh', () => {
  it('rotates the invite code (admin)', async () => {
    const res = await auth('post', `/houses/${houseId}/invite/refresh`);
    expect(res.status).toBe(200);
    expect(res.body.data.house.invite_code).not.toBe(inviteCode);
  });
});

describe('cook-schedule proposals → vote → close', () => {
  let scheduleId: string;
  let proposalId: string;

  it('seeds a schedule and grabs the owner\'s entry', async () => {
    await auth('post', `/houses/${houseId}/schedule/generate`).send({ days: 7 });
    const list = await auth('get', `/houses/${houseId}/schedule`);
    expect(list.status).toBe(200);
    // propose requires the caller to be the assigned cook → pick OUR entry.
    const mine = list.body.data.schedule.find((e: { user_id: string }) => e.user_id === ownerId);
    scheduleId = (mine ?? list.body.data.schedule[0]).id;
    expect(scheduleId).toBeTruthy();
  });

  it('proposes 2 recipes (201)', async () => {
    const res = await auth('post', `/houses/${houseId}/schedule/${scheduleId}/propose`)
      .send({ recipe_ids: [BIRYANI, BUTTER], voting_hours: 12 });
    expect(res.status).toBe(201);
    proposalId = res.body.data.proposal?.id ?? res.body.data.id;
    expect(proposalId).toBeTruthy();
  });

  it('fetches the proposal (200)', async () => {
    const res = await auth('get', `/houses/${houseId}/proposals/${proposalId}`);
    expect(res.status).toBe(200);
  });

  it('votes (200/201)', async () => {
    const res = await auth('post', `/houses/${houseId}/proposals/${proposalId}/vote`)
      .send({ recipe_id: BIRYANI });
    expect([200, 201]).toContain(res.status);
  });

  it('closes the proposal (200)', async () => {
    const res = await auth('post', `/houses/${houseId}/proposals/${proposalId}/close`);
    expect([200, 201]).toContain(res.status);
  });
});

describe('meal ratings (status-gated)', () => {
  let doneId: string;
  let pendingId: string;

  it('marks a schedule entry done', async () => {
    const list = await auth('get', `/houses/${houseId}/schedule`);
    const entries = list.body.data.schedule;
    doneId = entries[0].id;
    pendingId = entries[1]?.id ?? entries[0].id;
    const upd = await auth('patch', `/houses/${houseId}/schedule/${doneId}`).send({ status: 'done' });
    expect(upd.status).toBe(200);
  });

  it('rates a done meal (201)', async () => {
    const res = await auth('post', `/houses/${houseId}/schedule/${doneId}/ratings`).send({ rating: 5 });
    expect(res.status).toBe(201);
  });

  it('refuses to rate a not-done meal (409)', async () => {
    if (pendingId === doneId) return; // only one entry; skip
    await auth('patch', `/houses/${houseId}/schedule/${pendingId}`).send({ status: 'pending' });
    const res = await auth('post', `/houses/${houseId}/schedule/${pendingId}/ratings`).send({ rating: 4 });
    expect(res.status).toBe(409);
  });
});

describe('chores: type → generate → update → assign', () => {
  let typeId: string;
  let choreId: string;

  it('creates a chore type', async () => {
    const res = await auth('post', `/houses/${houseId}/chore-types`).send({ name: 'Trash', frequency: 'weekly' });
    expect([200, 201]).toContain(res.status);
    typeId = res.body.data.chore_type?.id ?? res.body.data.id;
    expect(typeId).toBeTruthy();
  });

  it('generates a chore schedule (201)', async () => {
    const res = await auth('post', `/houses/${houseId}/chores/${typeId}/generate`).send({ days: 14 });
    expect(res.status).toBe(201);
    choreId = res.body.data.schedule?.[0]?.id;
    expect(choreId).toBeTruthy();
  });

  it('marks a chore done (200)', async () => {
    const res = await auth('patch', `/houses/${houseId}/chores/${choreId}`).send({ status: 'done' });
    expect(res.status).toBe(200);
  });

  it('manually assigns a chore (201)', async () => {
    const res = await auth('post', `/houses/${houseId}/chores`).send({
      chore_type_id: typeId,
      user_id: ownerId,
      scheduled_date: '2026-09-01',
    });
    expect([200, 201]).toContain(res.status);
  });
});

describe('member management', () => {
  it('removes a member (admin)', async () => {
    // invite code was rotated earlier — re-fetch it, have the spare join, then remove.
    const me = await auth('get', '/houses/me');
    const code = me.body.data.house.invite_code;
    await auth('post', '/houses/join', spareTok).send({ invite_code: code });
    const res = await auth('delete', `/houses/${houseId}/members/${spareId}`);
    expect([200, 204]).toContain(res.status);
  });
});

describe('shopping rotation + swap requests', () => {
  it('generates a shopper rotation (admin) and reads current', async () => {
    const gen = await auth('post', `/houses/${houseId}/shopping-rotation/generate`).send({ weeks: 4 });
    expect([200, 201]).toContain(gen.status);
    const cur = await auth('get', `/houses/${houseId}/shopping-rotation`);
    expect(cur.status).toBe(200);
  });

  it('creates a cook-swap request between two members (201)', async () => {
    const list = await auth('get', `/houses/${houseId}/schedule`);
    const entries: { id: string; user_id: string }[] = list.body.data.schedule;
    const mine = entries.find((e) => e.user_id === ownerId);
    const theirs = entries.find((e) => e.user_id === joinerId);
    if (!mine || !theirs) return; // both members must be scheduled; skip otherwise
    const res = await auth('post', `/houses/${houseId}/swap-requests`).send({
      my_schedule_id: mine.id,
      target_user_id: joinerId,
      target_schedule_id: theirs.id,
    });
    expect([200, 201]).toContain(res.status);
    const reqs = await auth('get', `/houses/${houseId}/swap-requests`);
    expect(reqs.status).toBe(200);
  });

  it('rejects swapping with yourself (400)', async () => {
    const list = await auth('get', `/houses/${houseId}/schedule`);
    const entries: { id: string; user_id: string }[] = list.body.data.schedule;
    const mine = entries.find((e) => e.user_id === ownerId) ?? entries[0];
    const res = await auth('post', `/houses/${houseId}/swap-requests`).send({
      my_schedule_id: mine.id,
      target_user_id: ownerId,
      target_schedule_id: mine.id,
    });
    expect(res.status).toBe(400);
  });
});
