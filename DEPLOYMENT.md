# Production Deployment Guide

Step-by-step path to get smart-cooking-app from "works on my Wi-Fi" to "shippable production app."

**Stack chosen:**
- 🗄️ **Database**: Supabase (managed Postgres)
- 🚂 **Backend**: Railway (6 microservices)
- 📱 **Mobile builds**: Expo Application Services (EAS)

---

## Part A — Supabase (database)

### A1. Create Supabase project
1. Go to https://supabase.com → **Sign up** with GitHub
2. Click **New project** → name it `smart-cooking-prod`
3. Pick a **strong DB password** (save it in a password manager)
4. Choose region closest to your users
5. Wait ~2 min for provisioning

### A2. Get the connection string
1. Project Settings → **Database** → **Connection string** → **URI** tab
2. Copy the **Transaction pooler** URL (port `6543`) — better for serverless backends
3. Save it as `DATABASE_URL` — looks like:
   ```
   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

### A3. Apply the schema
1. In Supabase → **SQL Editor** → **New query**
2. Open `database/supabase/01_schema.sql` → copy all → paste → **Run**
3. Repeat with `database/supabase/02_recipes_seed.sql` (this loads 72 recipes)
4. Verify: run `SELECT COUNT(*) FROM recipes;` — should return `72`

---

## Part B — Railway (backend services)

### B1. Push your repo to GitHub
If it's not already on GitHub:
```bash
cd /Users/saikumarvemula/Documents/GitHub/smart-cooking-app
gh repo create smart-cooking-app --private --source=. --push
```

### B2. Create Railway project
1. Go to https://railway.app → **Sign in with GitHub**
2. **New Project** → **Deploy from GitHub repo** → pick `smart-cooking-app`
3. Railway detects the monorepo — you'll create **6 services** (one per backend folder)

### B3. Add the 6 backend services
For each of these, click **+ New Service** → **GitHub Repo** → set:

| Service | Root Directory | Dockerfile Path |
|---------|----------------|-----------------|
| user-service | `backend/user-service` | `Dockerfile` |
| recipe-service | `backend/recipe-service` | `Dockerfile` |
| nutrition-service | `backend/nutrition-service` | `Dockerfile` |
| ai-service | `backend/ai-service` | `Dockerfile` |
| shopping-service | `backend/shopping-service` | `Dockerfile` |
| house-service | `backend/house-service` | `Dockerfile` |

### B4. Add Redis
- Click **+ New Service** → **Database** → **Redis**
- Note its internal URL (e.g., `redis://default:pass@redis.railway.internal:6379`)

### B5. Set environment variables on EACH service
Click each service → **Variables** → add:

```env
NODE_ENV=production
DATABASE_URL=<paste Supabase connection string from A2>
JWT_SECRET=<run: openssl rand -base64 48 — same value on ALL services>
REDIS_URL=<paste Railway Redis internal URL>
CORS_ORIGIN=*
LOG_LEVEL=info
PORT=4001  # 4002 for recipe, 4003 nutrition, 4004 ai, 4005 shopping, 4006 house
```

Python services (nutrition, ai) also need:
```env
JWT_ALGORITHM=HS256
```

ai-service additionally needs:
```env
ANTHROPIC_API_KEY=<your key from console.anthropic.com>
```

### B6. Generate public domains
For each service: **Settings** → **Networking** → **Generate Domain**.
Railway gives URLs like `user-service-production-xxxx.up.railway.app`.

**Save all 6 URLs** — you'll need them in Part C.

### B7. Verify each service
```bash
curl https://user-service-production-xxxx.up.railway.app/health
# Should return: {"success":true,"data":{"status":"ok",...}}
```

---

## Part C — Mobile app (Expo + EAS)

### C1. Create an Expo account
1. Go to https://expo.dev → **Sign up**
2. Pick a username — write it down (e.g., `sai_vemula`)

### C2. Install EAS CLI and login
```bash
npm install -g eas-cli
cd /Users/saikumarvemula/Documents/GitHub/smart-cooking-app/mobile
eas login
```

### C3. Initialize the project
```bash
eas init
```
This creates a project on Expo's servers and writes the `projectId` into `app.json`.

### C4. Update app.json placeholders
After `eas init`, replace these in `mobile/app.json`:
- `"owner": "REPLACE_WITH_YOUR_EXPO_USERNAME"` → your Expo username
- The two `REPLACE_AFTER_RUNNING_EAS_INIT` strings should be replaced automatically by `eas init`; verify they look like real UUIDs

### C5. Set production API URLs as EAS secrets
Update `mobile/eas.json` `env` blocks with your Railway URLs, OR use EAS secrets (more secure):

```bash
# If using one base URL per service:
eas secret:create --scope project --name EXPO_PUBLIC_USER_API     --value https://user-service-production-xxxx.up.railway.app
eas secret:create --scope project --name EXPO_PUBLIC_RECIPE_API   --value https://recipe-service-production-xxxx.up.railway.app
eas secret:create --scope project --name EXPO_PUBLIC_NUTRITION_API --value https://nutrition-service-production-xxxx.up.railway.app
eas secret:create --scope project --name EXPO_PUBLIC_AI_API       --value https://ai-service-production-xxxx.up.railway.app
eas secret:create --scope project --name EXPO_PUBLIC_SHOPPING_API --value https://shopping-service-production-xxxx.up.railway.app
eas secret:create --scope project --name EXPO_PUBLIC_HOUSE_API    --value https://house-service-production-xxxx.up.railway.app
```

### C6. Build a production iOS / Android binary
```bash
# iOS (requires Apple Developer account, $99/yr — needed for App Store)
eas build --platform ios --profile production

# Android (free)
eas build --platform android --profile production
```

The build runs on Expo's servers (~15–25 min). You'll get a downloadable `.ipa` / `.aab`.

### C7. Test on real devices
- **iOS**: Use TestFlight (`eas submit --platform ios`) or install the `.ipa` via Apple Configurator
- **Android**: Install the `.apk` directly or submit `.aab` to Play Console internal testing

---

## Verification Checklist

After all 3 parts done, sanity-check:

- [ ] `curl https://user-service-...railway.app/health` returns OK
- [ ] Supabase dashboard shows tables + 72 recipes
- [ ] EAS dashboard at https://expo.dev shows your project
- [ ] Production build downloaded and installed on a phone
- [ ] App loads, login works, recipes appear
- [ ] No `localhost` or `10.0.0.34` references in network traffic (check Charles/Proxyman if curious)

---

## Costs (rough monthly estimate)

| Service | Free tier | When you'll outgrow it |
|---------|-----------|------------------------|
| Supabase | 500 MB DB, 50K MAU | ~1K active users |
| Railway | $5/mo trial credit | After credit; ~$15-25/mo at small scale |
| Expo EAS | 30 builds/mo free | Heavy iteration |
| Apple Dev | $99/yr | Required to publish |
| Google Play | $25 one-time | Required to publish |

**Lean MVP launch cost: ~$25-40/mo** (after Apple/Google one-times).

---

## Common gotchas

1. **CORS**: Already permissive (`*`), but if you add a web admin panel later, lock this down per-service.
2. **JWT_SECRET mismatch**: All 6 services MUST use the same JWT_SECRET. If user-service mints a token and recipe-service can't verify it, you'll get 401s everywhere.
3. **Supabase connection limits**: Free tier has a low direct-connection cap. Use the **Transaction pooler** URL (port 6543), not the direct connection (5432).
4. **Railway sleeping**: Free Railway services don't sleep (unlike Render free tier).
5. **Expo Go vs production build**: Once you're using EAS Build, you must use the **development client**, not vanilla Expo Go, for testing dev builds.

---

## Next phases (after Phase 1)

- **Phase 2**: Privacy Policy + Terms of Service + Sentry crash reporting + account deletion flow
- **Phase 3**: Mobile tests, app store assets, rate limiting, image CDN
- **Phase 4**: TestFlight beta → production submission
