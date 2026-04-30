import jwt from 'jsonwebtoken';
import request from 'supertest';
import { createApp } from '../src/app';
import { closePool, pool } from '../src/config/database';

const app = createApp();

const SEEDED_INDIAN_BIRYANI = 'a0000001-0000-0000-0000-000000000001';
const SEEDED_BUTTER_CHICKEN = 'a0000001-0000-0000-0000-000000000002';

let testUserId: string;
let testAdminId: string;
let userToken: string;
let adminToken: string;

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
  // Create a regular test user and an admin test user. These are scoped by
  // email pattern so afterAll can clean them up safely.
  const regular = await pool.query<{ id: string }>(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, 'placeholder', 'Test User')
     RETURNING id`,
    [uniqueEmail('rsvc-user')],
  );
  testUserId = regular.rows[0].id;

  const admin = await pool.query<{ id: string }>(
    `INSERT INTO users (email, password_hash, name, is_admin)
     VALUES ($1, 'placeholder', 'Test Admin', TRUE)
     RETURNING id`,
    [uniqueEmail('rsvc-admin')],
  );
  testAdminId = admin.rows[0].id;

  userToken = signToken(testUserId, 'rsvc-user@test.dev');
  adminToken = signToken(testAdminId, 'rsvc-admin@test.dev');
});

afterAll(async () => {
  await pool.query(`DELETE FROM recipe_reviews WHERE user_id IN ($1, $2)`, [testUserId, testAdminId]);
  await pool.query(
    `DELETE FROM recipes WHERE id IN (
       SELECT id FROM recipes WHERE name LIKE 'TEST_%'
     )`,
  );
  await pool.query(`DELETE FROM users WHERE id IN ($1, $2)`, [testUserId, testAdminId]);
  await closePool();
});

// ============================================================
// GET /recipes
// ============================================================

describe('GET /recipes', () => {
  it('lists recipes with pagination metadata', async () => {
    const res = await request(app).get('/recipes').query({ page: 1, limit: 5 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.recipes)).toBe(true);
    expect(res.body.data.recipes.length).toBeLessThanOrEqual(5);
    expect(res.body.data.pagination).toMatchObject({ page: 1, limit: 5 });
    expect(typeof res.body.data.pagination.total).toBe('number');
  });

  it('filters by cuisine_type', async () => {
    const res = await request(app).get('/recipes').query({ cuisine_type: 'Indian', limit: 50 });
    expect(res.status).toBe(200);
    expect(res.body.data.recipes.every((r: { cuisine_type: string }) => r.cuisine_type === 'Indian')).toBe(true);
  });

  it('filters by difficulty', async () => {
    const res = await request(app).get('/recipes').query({ difficulty: 'Easy', limit: 50 });
    expect(res.status).toBe(200);
    expect(res.body.data.recipes.every((r: { difficulty: string }) => r.difficulty === 'Easy')).toBe(true);
  });

  it('rejects invalid cuisine_type with 400', async () => {
    const res = await request(app).get('/recipes').query({ cuisine_type: 'Atlantean' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ============================================================
// GET /recipes/search
// ============================================================

describe('GET /recipes/search', () => {
  it('finds a recipe by name fragment', async () => {
    const res = await request(app).get('/recipes/search').query({ q: 'Biryani' });
    expect(res.status).toBe(200);
    const names: string[] = res.body.data.recipes.map((r: { name: string }) => r.name);
    expect(names.some((n) => /biryani/i.test(n))).toBe(true);
  });

  it('finds recipes by ingredient name', async () => {
    const res = await request(app).get('/recipes/search').query({ q: 'paneer' });
    expect(res.status).toBe(200);
    expect(res.body.data.recipes.length).toBeGreaterThan(0);
  });

  it('respects min_protein filter', async () => {
    const res = await request(app).get('/recipes/search').query({ min_protein: 30 });
    expect(res.status).toBe(200);
    // Should still return some, but not all
    expect(res.body.data.recipes.length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================
// GET /recipes/cuisine/:cuisineType
// ============================================================

describe('GET /recipes/cuisine/:cuisineType', () => {
  it('returns only recipes of the given cuisine', async () => {
    const res = await request(app).get('/recipes/cuisine/Italian').query({ limit: 50 });
    expect(res.status).toBe(200);
    expect(res.body.data.recipes.every((r: { cuisine_type: string }) => r.cuisine_type === 'Italian')).toBe(true);
  });

  it('rejects an unknown cuisine with 400', async () => {
    const res = await request(app).get('/recipes/cuisine/Lemurian');
    expect(res.status).toBe(400);
  });
});

// ============================================================
// GET /recipes/:id
// ============================================================

describe('GET /recipes/:id', () => {
  it('returns a recipe with ingredients, nutrition, and rating summary', async () => {
    const res = await request(app).get(`/recipes/${SEEDED_INDIAN_BIRYANI}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(SEEDED_INDIAN_BIRYANI);
    expect(Array.isArray(res.body.data.ingredients)).toBe(true);
    expect(res.body.data.ingredients.length).toBeGreaterThan(0);
    expect(res.body.data.nutrition).not.toBeNull();
    expect(typeof res.body.data.average_rating).toBe('number');
    expect(typeof res.body.data.total_ratings).toBe('number');
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app).get('/recipes/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('rejects a non-uuid id with 400', async () => {
    const res = await request(app).get('/recipes/not-a-uuid');
    expect(res.status).toBe(400);
  });
});

// ============================================================
// POST /recipes (admin-only)
// ============================================================

describe('POST /recipes', () => {
  const validBody = {
    name: 'TEST_New Recipe',
    cuisine_type: 'Italian',
    difficulty: 'Easy',
    prep_time_minutes: 10,
    cook_time_minutes: 15,
    servings: 2,
    instructions: [{ step_number: 1, instruction: 'Cook it.' }],
    ingredients: [{ ingredient_name: 'salt', quantity: 1, unit: 'tsp' }],
    nutrition: { calories: 300, protein_g: 10, carbs_g: 40, fat_g: 8, fiber_g: 2, sodium_mg: 200 },
  };

  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app).post('/recipes').send(validBody);
    expect(res.status).toBe(401);
  });

  it('rejects non-admin requests with 403', async () => {
    const res = await request(app)
      .post('/recipes')
      .set('Authorization', `Bearer ${userToken}`)
      .send(validBody);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('creates a recipe with ingredients and nutrition for admins', async () => {
    const res = await request(app)
      .post('/recipes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('TEST_New Recipe');
    expect(res.body.data.ingredients.length).toBe(1);
    expect(res.body.data.nutrition?.calories).toBe(300);
  });
});

// ============================================================
// POST /recipes/:id/rate
// ============================================================

describe('POST /recipes/:id/rate', () => {
  it('rejects without auth', async () => {
    const res = await request(app)
      .post(`/recipes/${SEEDED_BUTTER_CHICKEN}/rate`)
      .send({ rating: 5 });
    expect(res.status).toBe(401);
  });

  it('rejects rating < 1 or > 5', async () => {
    const res = await request(app)
      .post(`/recipes/${SEEDED_BUTTER_CHICKEN}/rate`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 6 });
    expect(res.status).toBe(400);
  });

  it('records a rating and updates the average', async () => {
    const res = await request(app)
      .post(`/recipes/${SEEDED_BUTTER_CHICKEN}/rate`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 5, comment: 'Excellent' });
    expect(res.status).toBe(201);
    expect(res.body.data.average_rating).toBe(5);
    expect(res.body.data.total_ratings).toBe(1);
  });

  it('rejects a duplicate rating from the same user with 409 ALREADY_RATED', async () => {
    const res = await request(app)
      .post(`/recipes/${SEEDED_BUTTER_CHICKEN}/rate`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 4 });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('ALREADY_RATED');
  });
});

// ============================================================
// GET /recipes/:id/reviews
// ============================================================

describe('GET /recipes/:id/reviews', () => {
  it('returns the rating left in the previous test', async () => {
    const res = await request(app).get(`/recipes/${SEEDED_BUTTER_CHICKEN}/reviews`);
    expect(res.status).toBe(200);
    expect(res.body.data.reviews.length).toBeGreaterThanOrEqual(1);
    const review = res.body.data.reviews[0];
    expect(review.rating).toBe(5);
    expect(review.user_name).toBe('Test User');
  });
});

// ============================================================
// GET /recipes/macro-match
// ============================================================

describe('GET /recipes/macro-match', () => {
  it('rejects without auth', async () => {
    const res = await request(app).get('/recipes/macro-match').send({
      remaining_calories: 500,
      remaining_protein: 35,
      remaining_carbs: 60,
      remaining_fat: 18,
    });
    expect(res.status).toBe(401);
  });

  it('returns up to 10 ranked matches sorted by score ascending', async () => {
    const res = await request(app)
      .get('/recipes/macro-match')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        remaining_calories: 500,
        remaining_protein: 35,
        remaining_carbs: 60,
        remaining_fat: 18,
      });
    expect(res.status).toBe(200);
    const matches: Array<{ score: number }> = res.body.data.matches;
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.length).toBeLessThanOrEqual(10);
    for (let i = 1; i < matches.length; i++) {
      expect(matches[i].score).toBeGreaterThanOrEqual(matches[i - 1].score);
    }
  });
});

// ============================================================
// GET /health
// ============================================================

describe('GET /health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
  });
});
