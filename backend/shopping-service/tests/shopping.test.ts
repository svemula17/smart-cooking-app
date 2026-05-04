import jwt from 'jsonwebtoken';
import request from 'supertest';
import { createApp } from '../src/app';
import { closePool, pool } from '../src/config/database';
import { closeRedis } from '../src/config/redis';

const app = createApp();

// Use seeded recipe UUIDs from 002_recipes.sql
const SEEDED_BIRYANI = 'a0000001-0000-0000-0000-000000000001';
const SEEDED_BUTTER_CHICKEN = 'a0000001-0000-0000-0000-000000000002';

let testUserId: string;
let userToken: string;
let createdListId: string;

function signToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email, type: 'access' },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' },
  );
}

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.dev`;
}

beforeAll(async () => {
  const res = await pool.query<{ id: string }>(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, 'placeholder', 'Shopping Test User')
     RETURNING id`,
    [uniqueEmail('ssvc-user')],
  );
  testUserId = res.rows[0].id;
  userToken = signToken(testUserId, 'ssvc-user@test.dev');
});

afterAll(async () => {
  // Clean up shopping lists (items cascade)
  await pool.query(
    `DELETE FROM shopping_lists WHERE user_id = $1`,
    [testUserId],
  );
  await pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);
  await closePool();
  await closeRedis();
});

// ============================================================
// GET /health
// ============================================================

describe('GET /health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.service).toBe('shopping-service');
  });
});

// ============================================================
// POST /shopping/lists/generate
// ============================================================

describe('POST /shopping/lists/generate', () => {
  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app)
      .post('/shopping/lists/generate')
      .send({ name: 'Test List', recipe_ids: [SEEDED_BIRYANI] });
    expect(res.status).toBe(401);
  });

  it('rejects empty recipe_ids with 400', async () => {
    const res = await request(app)
      .post('/shopping/lists/generate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Test List', recipe_ids: [] });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects missing name with 400', async () => {
    const res = await request(app)
      .post('/shopping/lists/generate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ recipe_ids: [SEEDED_BIRYANI] });
    expect(res.status).toBe(400);
  });

  it('creates a shopping list with aggregated, aisle-sorted items', async () => {
    const res = await request(app)
      .post('/shopping/lists/generate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Weekly Cook',
        recipe_ids: [SEEDED_BIRYANI, SEEDED_BUTTER_CHICKEN],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const list = res.body.data;
    createdListId = list.id;

    expect(list.name).toBe('Weekly Cook');
    expect(list.status).toBe('active');
    expect(Array.isArray(list.recipe_ids)).toBe(true);
    expect(list.recipe_ids).toContain(SEEDED_BIRYANI);
    expect(Array.isArray(list.items)).toBe(true);
    expect(list.items.length).toBeGreaterThan(0);

    // Verify items have expected shape
    const item = list.items[0];
    expect(typeof item.ingredient_name).toBe('string');
    expect(typeof item.quantity).toBe('number');
    expect(typeof item.unit).toBe('string');
    expect(item.is_checked).toBe(false);
  });

  it('aggregates duplicate ingredients across recipes', async () => {
    // Both biryani and butter chicken likely share common spices (e.g. salt, garam masala)
    const res = await request(app)
      .post('/shopping/lists/generate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Dedup Test',
        recipe_ids: [SEEDED_BIRYANI, SEEDED_BUTTER_CHICKEN],
      });
    expect(res.status).toBe(201);
    const items: Array<{ ingredient_name: string; quantity: number }> = res.body.data.items;

    // No duplicated ingredient names (after aggregation, each name should appear once per unit)
    const names = items.map((i) => i.ingredient_name.toLowerCase());
    const nameSet = new Set(names);
    expect(names.length).toBe(nameSet.size);
  });
});

// ============================================================
// GET /shopping/lists
// ============================================================

describe('GET /shopping/lists', () => {
  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/shopping/lists');
    expect(res.status).toBe(401);
  });

  it('returns lists with pagination metadata', async () => {
    const res = await request(app)
      .get('/shopping/lists')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ page: 1, limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.lists)).toBe(true);
    expect(res.body.data.pagination).toMatchObject({ page: 1, limit: 10 });
    expect(typeof res.body.data.pagination.total).toBe('number');
  });

  it('filters by status=active', async () => {
    const res = await request(app)
      .get('/shopping/lists')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ status: 'active' });

    expect(res.status).toBe(200);
    expect(
      res.body.data.lists.every((l: { status: string }) => l.status === 'active'),
    ).toBe(true);
  });

  it('rejects invalid status with 400', async () => {
    const res = await request(app)
      .get('/shopping/lists')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ status: 'pending' });
    expect(res.status).toBe(400);
  });
});

// ============================================================
// GET /shopping/lists/:id
// ============================================================

describe('GET /shopping/lists/:id', () => {
  it('returns the list with aisle-sorted items', async () => {
    const res = await request(app)
      .get(`/shopping/lists/${createdListId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdListId);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it('returns 404 for unknown list id', async () => {
    const res = await request(app)
      .get('/shopping/lists/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('rejects non-uuid id with 400', async () => {
    const res = await request(app)
      .get('/shopping/lists/not-a-uuid')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(400);
  });
});

// ============================================================
// PATCH /shopping/lists/:id/items/:itemId/check
// ============================================================

describe('PATCH /shopping/lists/:id/items/:itemId/check', () => {
  let itemId: string;

  beforeAll(async () => {
    // Fetch the list to get a real item id
    const res = await request(app)
      .get(`/shopping/lists/${createdListId}`)
      .set('Authorization', `Bearer ${userToken}`);
    itemId = res.body.data.items[0].id;
  });

  it('rejects without auth', async () => {
    const res = await request(app)
      .patch(`/shopping/lists/${createdListId}/items/${itemId}/check`)
      .send({ is_checked: true });
    expect(res.status).toBe(401);
  });

  it('marks an item as checked', async () => {
    const res = await request(app)
      .patch(`/shopping/lists/${createdListId}/items/${itemId}/check`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ is_checked: true });

    expect(res.status).toBe(200);
    expect(res.body.data.is_checked).toBe(true);
    expect(res.body.data.id).toBe(itemId);
  });

  it('marks an item as unchecked', async () => {
    const res = await request(app)
      .patch(`/shopping/lists/${createdListId}/items/${itemId}/check`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ is_checked: false });

    expect(res.status).toBe(200);
    expect(res.body.data.is_checked).toBe(false);
  });

  it('rejects missing is_checked field with 400', async () => {
    const res = await request(app)
      .patch(`/shopping/lists/${createdListId}/items/${itemId}/check`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({});
    expect(res.status).toBe(400);
  });
});

// ============================================================
// GET /shopping/availability
// ============================================================

describe('GET /shopping/availability', () => {
  it('rejects without auth', async () => {
    const res = await request(app)
      .get('/shopping/availability')
      .query({ ingredients: 'chicken,rice' });
    expect(res.status).toBe(401);
  });

  it('returns availability structure (empty products when no API keys)', async () => {
    const res = await request(app)
      .get('/shopping/availability')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ ingredients: 'chicken,rice,onion', store: 'all' });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.availability)).toBe(true);
    expect(res.body.data.availability.length).toBe(3);

    const item = res.body.data.availability[0];
    expect(typeof item.ingredient).toBe('string');
    expect(Array.isArray(item.products)).toBe(true);
    // cheapest may be null when no API keys configured
    expect('cheapest' in item).toBe(true);
  });

  it('rejects missing ingredients param with 400', async () => {
    const res = await request(app)
      .get('/shopping/availability')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ store: 'all' });
    expect(res.status).toBe(400);
  });
});

// ============================================================
// GET /shopping/stores/nearby
// ============================================================

describe('GET /shopping/stores/nearby', () => {
  it('rejects without auth', async () => {
    const res = await request(app)
      .get('/shopping/stores/nearby')
      .query({ lat: 37.7749, lng: -122.4194 });
    expect(res.status).toBe(401);
  });

  it('returns stores array (empty when no API key)', async () => {
    const res = await request(app)
      .get('/shopping/stores/nearby')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ lat: 37.7749, lng: -122.4194, radius_km: 2 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.stores)).toBe(true);
  });

  it('rejects missing lat/lng with 400', async () => {
    const res = await request(app)
      .get('/shopping/stores/nearby')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ radius_km: 5 });
    expect(res.status).toBe(400);
  });

  it('rejects out-of-range lat with 400', async () => {
    const res = await request(app)
      .get('/shopping/stores/nearby')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ lat: 200, lng: -122 });
    expect(res.status).toBe(400);
  });
});

// ============================================================
// POST /shopping/lists/:id/complete
// ============================================================

describe('POST /shopping/lists/:id/complete', () => {
  it('rejects without auth', async () => {
    const res = await request(app).post(`/shopping/lists/${createdListId}/complete`);
    expect(res.status).toBe(401);
  });

  it('marks the list as completed', async () => {
    const res = await request(app)
      .post(`/shopping/lists/${createdListId}/complete`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('completed');
    expect(res.body.data.completed_at).not.toBeNull();
  });

  it('returns 404 if already completed (or does not belong to user)', async () => {
    const res = await request(app)
      .post(`/shopping/lists/${createdListId}/complete`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(404);
  });
});

// ============================================================
// DELETE /shopping/lists/:id
// ============================================================

describe('DELETE /shopping/lists/:id', () => {
  let deleteTargetId: string;

  beforeAll(async () => {
    // Create a throwaway list to delete
    const res = await request(app)
      .post('/shopping/lists/generate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'To Delete', recipe_ids: [SEEDED_BIRYANI] });
    deleteTargetId = res.body.data.id;
  });

  it('rejects without auth', async () => {
    const res = await request(app).delete(`/shopping/lists/${deleteTargetId}`);
    expect(res.status).toBe(401);
  });

  it('deletes the list and returns 204', async () => {
    const res = await request(app)
      .delete(`/shopping/lists/${deleteTargetId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 on a second delete attempt', async () => {
    const res = await request(app)
      .delete(`/shopping/lists/${deleteTargetId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(404);
  });
});
