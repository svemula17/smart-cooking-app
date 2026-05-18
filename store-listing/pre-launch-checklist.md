# Pre-Launch Checklist

Run this top-to-bottom before clicking **Submit for Review** on either store. Each item is either ✅ Done, ❌ Not Done, or ⚠️ Action Needed.

---

## Code + infrastructure

| Item | Status | Where |
|---|---|---|
| Backend on Railway, all 6 services HTTP 200 | ✅ | `~/.smart-cooking-credentials.md` § 3 |
| Database on Supabase, 273 recipes seeded | ✅ | Supabase dashboard |
| TLS on every public endpoint | ✅ | Auto by Railway |
| Mobile env vars point to production (`mobile/.env`) | ✅ | `mobile/.env` |
| CI passing (tsc + jest) | ✅ | GitHub Actions tab |
| TypeScript 0 errors across mobile + 4 Node backends | ✅ | CI green |
| Recipe-service security fix (meal-plan IDOR) **deployed** | ⚠️ | Railway Redeploy still needed |
| Production EAS build profile uses correct URLs | ✅ | `mobile/eas.json` |
| `app.json` `version` bumped (e.g., `1.0.0`) | ✅ | `mobile/app.json` |
| `app.json` `ios.bundleIdentifier` + `android.package` set | ✅ | `com.svemula17.smartcooking` |
| App icon at 1024×1024 (Apple) + 512×512 (Google) | ⚠️ Verify | `mobile/assets/icon.png` |
| Splash screen exists | ✅ | `mobile/assets/splash-icon.png` |

---

## Legal + privacy

| Item | Status |
|---|---|
| Privacy Policy hosted | ✅ `svemula17.github.io/smart-cooking-app/privacy` |
| Terms of Service hosted | ✅ `svemula17.github.io/smart-cooking-app/terms` |
| Privacy Policy reviewed by a lawyer (recommended) | ❌ |
| Terms reviewed by a lawyer | ❌ |
| In-app account deletion works end-to-end | ✅ Profile → Delete |
| Privacy Policy & Terms linked from app (Login + Profile) | ✅ |
| Apple App Privacy nutrition label filled (see `app-privacy.md`) | ⚠️ Fill at submission |
| Google Play Data Safety form filled (see `data-safety.md`) | ⚠️ Fill at submission |

---

## Mobile app polish

| Item | Status |
|---|---|
| All screens have loading states | ✅ Skeletons in 10 screens |
| All screens have empty states | ✅ 13 screens use `<EmptyState/>` |
| Error boundary at app root | ✅ `mobile/src/components/ErrorBoundary.tsx` |
| Offline banner | ✅ `mobile/src/components/OfflineBanner.tsx` |
| Network retries on transient failures | ✅ `api.ts` interceptor |
| JWT stored in Secure Store, not AsyncStorage | ✅ `utils/storage.ts` |
| Image caching (expo-image) | ✅ |
| FlatList tuned for long lists | ✅ |
| No `console.log` debug noise | ✅ Audited |
| Tested on real iPhone | ⚠️ Through Expo Go only |
| Tested on real Android | ❌ Awaiting APK build |

---

## Account + auth flows

| Item | Status |
|---|---|
| Sign up | ✅ |
| Login | ✅ |
| Logout | ✅ |
| Delete account | ✅ |
| Forgot password | ❌ Deferred — see `DEFERRED.md` |
| Email verification | ❌ Deferred |
| Apple Sign In (Apple-required if you offer ANY 3rd-party auth) | N/A (only email+password currently) |
| Rate limiting on auth endpoints | ✅ 20 attempts / 15 min |
| Password requirements communicated to user | ⚠️ "8+ chars" enforced but not displayed prominently |

---

## Store listing assets (Apple)

| Item | Status | Spec |
|---|---|---|
| App name (30 chars) | ✅ "SmartCooking" | `app-name.md` |
| Subtitle (30 chars) | ✅ "Cook smarter, eat better" | `app-name.md` |
| Promotional text (170 chars) | ✅ | `app-name.md` |
| Description (up to 4000 chars) | ✅ | `descriptions.md` |
| Keywords (100 chars, comma-separated) | ✅ | `keywords.md` |
| Primary category | ✅ Food & Drink | `category-rating.md` |
| Age rating questionnaire answers | ✅ Drafted | `category-rating.md` |
| iPhone 6.7" screenshots (≥2) | ⚠️ Capture | `screenshots.md` |
| App Privacy answers | ✅ Drafted | `app-privacy.md` |
| Privacy Policy URL | ✅ | `support-urls.md` |
| Support URL | ⚠️ **Needs to be created** | `support-urls.md` Option 1 |
| Marketing URL (optional) | ✅ | `support-urls.md` |
| Copyright | ✅ "2026 Sai Kumar Vemula" | |

---

## Store listing assets (Google Play)

| Item | Status | Spec |
|---|---|---|
| Short description (80 chars) | ✅ | `descriptions.md` |
| Full description (4000 chars) | ✅ | `descriptions.md` |
| App icon 512×512 PNG | ⚠️ Verify | `mobile/assets/icon.png` |
| **Feature graphic 1024×500** | ⚠️ **Build this** | `screenshots.md` |
| Phone screenshots (≥2) | ⚠️ Capture | `screenshots.md` |
| Promo video (optional) | — | Skip for v1 |
| Content rating questionnaire | ✅ Drafted | `category-rating.md` |
| Target audience: 18+ | ✅ Drafted | `category-rating.md` |
| Privacy Policy URL | ✅ | `support-urls.md` |
| Data Safety form answers | ✅ Drafted | `data-safety.md` |
| Contact details (email) | ✅ | `support-urls.md` |
| Google Play Console developer registration paid ($25) | ⚠️ One-time fee |

---

## Final sanity tests before clicking Submit

Do these in this order on a real device with the production build:

1. **Cold launch** → app opens to Splash → either Onboarding or Login (correct based on stored state)
2. **Register a new account** → land on Home
3. **Browse recipes** → tap a card → Recipe Detail loads → scroll through ingredients + instructions + nutrition
4. **Log a meal** → adjust servings → submit → check that Stats reflects it
5. **Open AI Chat** → ask a question → get a response (if `OPENAI_API_KEY` is set on Railway, otherwise it'll stub)
6. **Create a household** → invite code generates → verify it persists across app restart
7. **Force quit + reopen** → still logged in (token persistence works)
8. **Toggle airplane mode** → offline banner appears at top → toggle back → "back online" toast → no errors
9. **Profile → Sign out** → returns to Login
10. **Profile → Delete account** → two-step confirmation works → account actually gone (try logging in as that user, expect "incorrect email or password")
11. **Re-register same email** → succeeds (proves deletion was real)

---

## What you'll get back from review

### Apple

- Typical review time: 24-48 hours for v1, 6-24 hours for updates.
- Common rejection reasons we may hit:
  - Missing "Account Deletion" — ✅ we have it
  - Missing Sign in with Apple — only if we add ANY 3rd-party sign-in
  - Privacy Policy mismatches with App Privacy labels — cross-check before submission
  - Description-bait (claiming features not in the app) — re-read `descriptions.md`
  - Crashes on launch — test on real device first
- If rejected: don't argue. Read the rejection email, fix exactly what they cited, re-submit. Each ping-pong adds 24h.

### Google Play

- Typical review time: 1-7 days for v1, 1-3 days for updates.
- Common issues:
  - Data Safety mismatch with Privacy Policy
  - Missing Feature Graphic
  - Target API level (Google now requires API 34+ for new submissions in 2024+; Expo SDK 54 targets this)
  - Permissions in `AndroidManifest.xml` that you don't justify

---

## Recommended launch order

1. **Week 1:** Submit to Google Play Internal Testing (closed track, 1-3 days approval, lets you self-test the production binary). Cost: $25 one-time.
2. **Week 2:** Move build to Closed Testing (friends + family) for ~1 week.
3. **Week 3:** Open Testing or direct Production rollout (start at 20% rollout, monitor crash rates in Sentry).
4. **Week 4+:** Apple submission once you've ironed out kinks on Android. Apple is stricter; better to enter with a road-tested build.
