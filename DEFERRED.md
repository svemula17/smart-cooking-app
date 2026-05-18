# Deferred Work

A short, honest list of things we deliberately did NOT do — kept here so future-you remembers what's left. Anything not here either landed already or didn't come up in a session.

## 🔴 Blockers for public launch (Apple/Google review will flag these)

### Password reset flow
**Status:** Backend endpoint not implemented. Privacy Policy explicitly promises this (`"We will send password reset emails"`), so shipping without it is technically a misrepresentation.

**What's needed:**
- Email-sending integration (Resend / SendGrid / SES / Mailgun — all have free tiers)
- `POST /auth/forgot-password { email }` → enqueue email with a 24h time-limited token
- `POST /auth/reset-password { token, new_password }` → bcrypt + persist
- Mobile screens: "Forgot password?" link on LoginScreen, ResetPasswordScreen
- Templates: forgot-password email body

**Why it's deferred:** Requires picking + signing up for an email provider. User opted to defer the email infra.

---

### Email verification
**Status:** Anyone can sign up with any email. App Store reviewers consistently flag this as a spam vector.

**What's needed:**
- Same email provider as above
- New column `users.email_verified_at TIMESTAMPTZ`
- `POST /auth/send-verification` (auto-called after register)
- `GET /auth/verify-email?token=...` → mark verified
- Optional gate: block certain features (sharing, AI chat) until verified
- Mobile: persistent banner "Verify your email" with resend button

**Why it's deferred:** Bundled with password reset; needs the same email infra.

---

## 🟠 Operational gaps (won't block review, will bite operations)

### Mobile Sentry
**Status:** Backend Sentry on all 6 services is live. Mobile Sentry was wired briefly, then removed because `@sentry/react-native`'s Expo config plugin doesn't resolve under our npm workspaces hoisting.

**Two paths forward:**
1. Eject the `mobile/` directory from the workspace (give it its own `package-lock.json`). Most thorough.
2. Use the JS-only `@sentry/react` SDK — no native module, no plugin needed. Catches JS errors but not native crashes. Less coverage but zero infra pain.

**Why deferred:** Backend Sentry covers ~80% of error surface. Mobile is mostly stable. Worth doing before a wider beta but not blocking.

---

### CI/CD pipeline
**Status:** No automation. Every push deploys via Railway's auto-detect. No lint gate, no test gate.

**What's needed:** `.github/workflows/ci.yml` running on every PR:
- `tsc --noEmit` on `mobile/` and each backend service
- `eslint` (already configured)
- `npm test` (now passing on mobile, 6 test files on backend)
- Block merge if any step fails

**~1 hour of work.** Highly recommended before the first real beta.

---

### Staging environment
**Status:** Prod is the only environment. A breaking change deploys directly to users.

**What's needed:** Duplicate Railway project pointing at a separate Supabase database (`smartcooking-staging`). Mobile build profile `staging` in `eas.json`. Cost: ~$5/mo extra Railway + free Supabase tier.

**Defer trigger:** Add this before the first batch of external testers.

---

### Database backups verified
**Status:** Supabase auto-backups exist but we've never tested a restore. Untested backups are just untested promises.

**What's needed:** Once a month, spin up a fresh Supabase project from a backup, verify schema + a sample of recipes load. Document in a runbook.

---

## 🟡 UX/perf improvements (queued for the next polish pass)

### `expo-image` instead of `react-native`'s `<Image>`
**Why:** Built-in disk cache, blurhash placeholders, smoother scroll on the 100+-recipe browser, far less data usage.
**Effort:** ~5 lines of import changes per file, swap `Image` → `Image` from `expo-image`. ~30 min total.

### `@react-native-community/netinfo` offline banner
**Why:** Right now a user on subway sees a spinning loader forever. We should surface "You're offline" + queue-and-retry.
**Effort:** Install package, write a small `<OfflineBanner/>` hook + component. ~45 min.

### axios retry interceptor
**Why:** Single packet loss on cellular currently shows "failed" with no retry. Axios doesn't retry by default.
**Effort:** ~20 lines on the existing interceptor. Retry once with exponential backoff on 5xx + network errors.

### FlatList performance tuning
**Why:** Default `windowSize=21` is fine for short lists but might stutter with 273 recipes on older Androids.
**Effort:** Add `initialNumToRender={8}`, `windowSize={5}`, `removeClippedSubviews={true}` to the main FlatList. 5 min.

---

## 🔵 Refactors (no user-visible change, makes maintenance easier)

### Unify the two `MealType` enums
- `meal_plans.meal_type` uses lowercase: `breakfast | lunch | dinner`
- `nutrition_logs.meal_type` uses Capitalized + Snack: `Breakfast | Lunch | Dinner | Snack`

Already pinned by a unit test (`__tests__/mealType.test.ts`). To unify: migration to lowercase across both tables + a `snack` value added to the meal_plans CHECK constraint + code in both services updated.

### Unify `req.user` vs `req.auth`
- user-service + house-service set `req.auth = { userId, email, jti }`
- recipe-service + shopping-service set `req.user = { userId, email }`

Pick one (recommend `req.auth` since it's the more common Express convention) and migrate. ~30 min, will touch ~10 files.

### Split large screens
- `RecipeDetailScreen.tsx` — 829 lines → split into `<RecipeHero/>`, `<IngredientsTab/>`, `<InstructionsTab/>`, `<ReviewsTab/>`
- `HomeScreen.tsx` — 568 lines
- `ChoresScreen.tsx` — 587 lines

No behaviour change but each piece becomes individually testable.

---

## 📝 Tracking

When any of these gets done, delete its section from this file and add it to the relevant commit.
