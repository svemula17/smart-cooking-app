# Smart Cooking App — Test Report

_Generated during a structured 5-phase test pass. Only results actually executed
are marked passing. Externals (Nutritionix/OpenAI/Instacart) mocked throughout._

Environment: local Postgres `smart_cooking_app`, Node 6-service backend + Python
(FastAPI) nutrition/ai, Expo mobile. **6 services** (the brief listed 5 — `house`
on port 4006 is the sixth).

---

## Phase 1 — Unit tests, coverage, gap list ✅ COMPLETE

### Existing suites — all green (after fixes below)
| Service | Framework | Result | Coverage (stmts) |
|---|---|---|---|
| user-service | Jest+supertest | **19/19 ✓** | 83% |
| recipe-service | Jest+supertest | **23/23 ✓** | 60% |
| shopping-service | Jest+supertest | **30/30 ✓** | 82% |
| ai-service | pytest | **17/17 ✓** | 83% |
| nutrition-service | pytest | **13/13 ✓** (was 5 failing) | ~62% |
| **house-service** | Jest+supertest (NEW) | **13/13 ✓** (was 0 tests) | 39% |

### New tests written (prioritized)
- **house-service** — stood up the entire harness (`jest.config.js`, `tests/setup.ts`,
  `tests/house.test.ts`, `test` script, jest/ts-jest/supertest devDeps). 13 tests:
  create house (201 / 400 short-name / 401 no-auth), `GET /houses/me`
  (200 / 401 / empty-state null), join (201 / 404 bad code), members (200 / 403
  non-member), schedule generate+list, expenses create+list+balances (201 / 400).
- **nutrition-service** — repaired stale `meal_type` fixtures (see bugs).

### Gap list (endpoints still untested — tracked TODO)
- **house-service**: ~37 of ~50 routes still uncovered — chores, chore-types,
  attendance, proposals/voting, ratings, swap-requests, prep-meals, waste, budget,
  shopping-rotation, achievements, leaderboard, cuisine-passport, weekly report.
- **recipe-service** (60%): `/recipes/macro-match`, `/recipes/deduct`,
  `POST /recipes/schedule`, soft-delete branch, the new `meal_type` filter.
- **nutrition-service** (62%): monthly-stats endpoint, `nutritionix_service` (22%).
- **ai-service** (83%): `receipt_parser` (27%).
- **user-service** (83%): token-refresh edge branches.

### 🐞 Bugs found & fixed in Phase 1
1. **[Medium] Stale tests** — `nutrition-service/tests/test_nutrition.py` posted
   capitalized `meal_type` (`"Lunch"`); API correctly requires lowercase (migration
   109). Fixed fixtures (lines 109/116/144/160/182/221).
2. **[High · env] DB migration drift** — local `smart_cooking_app` was missing
   migrations **018** (recipe prep fields), **019** (meal_plans), **022–039** (entire
   house schema), and the **109** lowercase `meal_type` CHECK on `nutrition_logs`
   (still capitalized). Applied them locally to unblock testing. ⚠️ **Verify these —
   especially 109 — are applied to PROD;** the 109 mismatch previously broke prod
   meal-logging, and `meal_types` (041) is still pending on prod (recipes currently
   500 in prod).
3. **[Note] Seed `109_unify_meal_type_to_lowercase.sql` is not partial-DB safe** — it
   references `meal_plans` in the same transaction, so on a DB without that table the
   whole thing rolls back (nutrition_logs fix included). Consider splitting per-table.

---

## Phase 2 — Integration ✅ COMPLETE

Stack: built + ran **user (3001), recipe (3002), shopping (3003)** (compiled `dist`) +
**nutrition (8001)** (uvicorn) against the migrated local `smart_cooking_app`, shared
`JWT_SECRET`, local Redis. Externals mocked/unused. **17/18 checks green; the 1 "fail"
was a too-strict test assertion, not a bug.**

| # | Flow | Result |
|---|---|---|
| 1 | register → login → JWT → protected recipe call (+401 w/o token) | ✅ |
| 2 | token refresh → retry succeeds | ✅ |
| 3 | browse by cuisine → detail → ingredients (5) + nutrition load | ✅ |
| 4 | schedule meal plan → persists; prep-reminder math (marinate fires 15:45 for 19:00 dinner, 180m+15m) | ✅ |
| 5 | nutrition log (auto_logged) → daily summary updates (640 kcal) | ✅ * |
| 6 | shopping list from 2 recipes → 18 items, **no dup names (aggregated)**, grouped by aisle | ✅ ** |
| 7 | monthly tracking → correct structure (averages, daily_data, adherence, streak) | ✅ |

\* Flow 5: verified at the nutrition-log→daily-summary level. "Complete cooking
session → auto-log" is **client-orchestrated** (app posts `auto_logged:true` after a
session), not a server-side cascade — represented faithfully here.
\** Flow 6: items are grouped via a deliberate store-walk order
(`utils/aisleOrganizer.sortByAisle`), not alphabetical. Minor inconsistency noted:
`shoppingItem.model` query does `ORDER BY aisle` (alphabetical) but the controller
re-sorts with `sortByAisle` — harmless, controller order wins.

## Phase 3 — Edge cases & failure modes ✅ COMPLETE (2 findings)

Probed the live stack. **11/12 functional checks pass**; 1 real bug + 1 design finding.

| Case | Result |
|---|---|
| Empty states (meal-plans / daily summary / shopping lists for new user) | ✅ 200 empty, no errors |
| Boundary: 0 servings → rejected (400) | ✅ |
| Boundary: absurd macro goals (`PUT /users/me/goals` 999999) → 400 | ✅ |
| Boundary: duplicate meal-plan slot (same user/date/meal_type) → upsert (201/201) | ✅ |
| Boundary: SQL-ish + 200-char + emoji name → no 500 | ✅ (handled) |
| FK: nutrition log w/ non-existent recipe → **404** | ✅ |
| FK: **meal-plan schedule w/ non-existent recipe → 500** | 🐞 **BUG** |
| Concurrency: double-check same shopping item → 200/200, no 500 | ✅ |
| Auth: deleted-user token → 404 | ✅ |
| Auth: expired / malformed / wrong-type token → **403** (expected 401) | ⚠️ design finding |

### 🐞 Findings
- **[Medium] Meal-plan FK → 500.** `recipe-service/src/controllers/mealPlan.controller.ts`
  runs the `INSERT INTO meal_plans` (FK → recipes) at ~line 72 **before** the
  recipe-existence check at ~line 81-82, so a bad `recipe_id` throws an unhandled FK
  violation (23503) → 500 instead of a clean 404. **Fix:** check recipe existence (or
  catch 23503) *before* the insert. (nutrition-service handles this correctly → 404.)
- **[High — verify in Phase 4] Invalid/expired tokens return 403, not 401.** All
  services map `Errors.invalidToken` → **AppError(403, 'INVALID_TOKEN')**
  (`*/src/middleware/error.middleware.ts`). Consistent, but if the mobile axios
  interceptor refreshes only on **401**, an expired access token (403) won't trigger
  silent refresh → the **"token is invalid or expired" dead-end** seen earlier. Phase 4
  checks the interceptor; if it keys on 401 only, change these to 401 **or** make the
  interceptor also refresh on 403/`INVALID_TOKEN`.

## Phase 4 — Mobile ✅ COMPLETE (1 critical finding)

| Check | Result |
|---|---|
| `tsc --noEmit` | ✅ clean |
| `expo export` (iOS bundle) | ✅ clean — 5.63 MB hbc, no Metro errors |
| `jest` (incl. `recipeCardImage` fallback test) | ✅ 23/23 |
| API base URLs | ✅ per-service `EXPO_PUBLIC_*` in `src/config/env.ts` (+ gateway + DEV_HOST fallback) |
| Empty/loading/error states | ✅ 16 screens use `EmptyState`/`ErrorState`, 20 handle loading/error |
| RecipeCard image fallback | ✅ remote URL → bundled asset → cuisine-emoji (no red-screen) |
| `ErrorBoundary` wraps app; api retry on 5xx/network + clearAuth | ✅ |

**Honest limit:** per-screen *runtime* render + tab/back click-through needs a
simulator/device — verified here via tsc + clean bundle + static review, **not**
runtime-exercised.

### 🐞 CRITICAL — token expiry can't self-recover (root cause of the reported dead-end)
`mobile/src/services/api.ts:95` refreshes **only on `error.response.status === 401`**,
but **all backend services return `403` (`INVALID_TOKEN`) for an expired/invalid access
token** (Phase 3). So when the 15-min access token expires, the API answers 403 → the
interceptor never refreshes → the request fails and the user is stuck on
**"token is invalid or expired"** (exactly what was hit earlier in the app).
**Fix (either):** (a) backend `Errors.invalidToken` → `AppError(401, …)` across services
(401 is correct for expired creds; keep 403 for real authorization denials), or
(b) `api.ts` also refresh when `status === 403 && code === 'INVALID_TOKEN'`. (a) is cleaner.

## Phase 5 — Security & config ✅ COMPLETE (all green)

| Check | Result |
|---|---|
| `.env` gitignored; no `.env` committed (only `.env.example`) | ✅ |
| No hardcoded API keys / JWT secrets / DB passwords in `src` | ✅ (none found) |
| JWT secret from env (`required('JWT_SECRET')`) | ✅ |
| Passwords bcrypt-hashed; `password_hash` stripped before returning user (`user.model.ts:67`) | ✅ |
| Parameterized queries everywhere (interpolations are column-constants / `$N` placeholders / whitelisted identifiers; `${req.body.name}` is in an error string, not SQL) | ✅ no injection |
| Rate limiting on `/auth/register|login|refresh` (`authRateLimiter`) + global | ✅ |
| `helmet()` + `cors()` on all Node services; `CORSMiddleware` on both Python services | ✅ |

_Low note:_ Python (FastAPI) services have CORS but no helmet-equivalent
security-headers middleware (FastAPI ships none by default).

---

# Prioritized bug list

### 🔴 Critical
1. **Token expiry is unrecoverable in-app.** Backend returns **403 `INVALID_TOKEN`**
   for expired/invalid access tokens (`*/src/middleware/error.middleware.ts`,
   `invalidToken → AppError(403)`), but the mobile refresh interceptor fires **only on
   401** (`mobile/src/services/api.ts:95`). Result: after 15 min the session can't
   silently refresh → user stuck on "token is invalid or expired" (observed earlier).
   **Fix:** make `invalidToken` → 401 across services, *or* also refresh on
   `403 && code==='INVALID_TOKEN'` in `api.ts`.
2. **[Prod/deploy] Recipes 500 in production.** Migration **041 (`recipes.meal_types`)**
   isn't applied to prod, but the deployed recipe-service selects that column → every
   recipe query 500s (verified via prod `/recipes` this session). **Fix:** apply 041 to
   prod Supabase (SQL already provided).

### 🟠 High
3. **DB migration drift / verify prod.** Local `smart_cooking_app` was missing 018, 019,
   022–039, and the **109** lowercase `meal_type` CHECK (still capitalized) — applied
   locally during this pass. **Verify 109 + 041 are applied to prod**; a capitalized
   `nutrition_logs` CHECK silently breaks all meal-logging (it did before).

### 🟡 Medium
4. **Meal-plan schedule → 500 on bad `recipe_id`.**
   `recipe-service/src/controllers/mealPlan.controller.ts` (~L72–82) runs the
   FK-bearing `INSERT` *before* the recipe-existence check, so an invalid `recipe_id`
   throws an unhandled FK violation (23503) → 500 instead of 404. (nutrition-service
   does this correctly.) **Fix:** check recipe existence / catch 23503 before insert.
5. **Seed `database/seeds/109_unify_meal_type_to_lowercase.sql` not partial-DB safe** —
   references `meal_plans` in the same transaction, so on a DB lacking that table the
   whole migration (incl. the `nutrition_logs` fix) rolls back. **Fix:** split per table.

### 🟢 Low
6. Shopping items: `shoppingItem.model` query `ORDER BY aisle` (alphabetical) is
   overridden by controller `sortByAisle` (store-walk). Harmless; align for clarity.
7. Python services lack security-headers middleware (helmet-equivalent).
8. **Coverage gaps (tracked):** house-service 39% (~37 routes untested),
   recipe `/macro-match` + `/deduct`, `nutritionix_service` (22%), `receipt_parser`
   (27%), user-service refresh edge branches.

### ✅ Fixed during this pass
- Stale capitalized `meal_type` fixtures in `nutrition-service/tests/test_nutrition.py`.
- Stood up house-service test harness (0 → 13 tests).
- Repaired local DB schema drift (applied 018/019/022–039/109) so the stack runs.

---

# Ship-readiness verdict

**Not ship-ready yet — two blockers, both small fixes:**
1. 🔴 The **403-vs-401 token-refresh** bug — sessions silently break after 15 min for
   every user. This is the single most important fix and is one line on either side.
2. 🔴 **Prod recipe outage** — apply migration **041** (and verify **109**) to prod.

**Everything else is in good shape:** all unit suites pass (6 services), all 7
integration flows pass, edge/empty/boundary/FK/auth handling is sound (one Medium FK→500
to tidy), the mobile app type-checks and bundles cleanly, and the security posture is
solid (no secrets, bcrypt, parameterized SQL, rate-limit, helmet/CORS).
**After fixing the two 🔴 items, this is shippable.**

---

# Not runnable here (and why)
- **Per-screen mobile runtime render + tab/back navigation** — needs a simulator/device;
  covered via `tsc` + clean `expo export` bundle + static review only.
- **ai-service over HTTP in integration** — not booted for the 7 flows (covered by its
  17/17 pytest suite instead).
- **External APIs (Nutritionix/OpenAI/Instacart)** — mocked/unused by decision; live
  behavior not exercised (fallback paths reasoned about, not hit live).
- **Coverage**: Python via local venv + `pytest-cov` (not committed); Node via
  `jest --coverage`.

_New test files (`house-service/tests/*`, `jest.config.js`), the nutrition test fix, and
this `TEST_REPORT.md` are left **uncommitted** for you to review/commit._
