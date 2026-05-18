# Google Play — Data Safety Form (pre-filled answers)

Google Play requires this form before publication. It maps user-facing "what does this app know about me?" labels onto the listing. Lying here is grounds for app removal — answers below match what your app actually does (verified against `docs/privacy.md` and the database schema).

Walk through it section by section in Play Console → App Content → Data safety.

---

## Section 1: Data collection and security

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** (HTTPS / TLS to Railway + Supabase) |
| Do you provide a way for users to request that their data be deleted? | **Yes** (in-app Delete Account button + email request supported) |
| Has your app been independently validated against a global security standard? | **No** |

---

## Section 2: Data types collected — declare each

For each type, you'll be asked:
- Is it **collected** (sent to your servers)? — almost always yes for us
- Is it **shared** with third parties? — almost always no
- Is it **required** or **optional**?
- What's it **used for**?
- Is it **linked to the user's identity**?
- Is it processed **ephemerally** (transient, never stored)?

### Personal info

| Data type | Collected | Shared | Required? | Purpose | Linked to user? |
|---|---|---|---|---|---|
| Name | Yes | No | Required | App functionality, Account management | Yes |
| Email address | Yes | No | Required | App functionality, Account management | Yes |
| User IDs | Yes | No | Required | App functionality, Analytics (Sentry) | Yes |
| Address | No | — | — | — | — |
| Phone number | No | — | — | — | — |
| Race/ethnicity, sexual orientation, political/religious beliefs | No | — | — | — | — |
| Other personal info | No | — | — | — | — |

### Financial info

| Data type | Collected | Shared | Required? | Purpose | Linked? |
|---|---|---|---|---|---|
| User payment info | No | — | — | — | — |
| Purchase history | No | — | — | — | — |
| Credit score | No | — | — | — | — |
| Other financial info | No | — | — | — | — |

*Household expense splits stay inside the user's own household — no third-party payment processing.*

### Health and Fitness

| Data type | Collected | Shared | Required? | Purpose | Linked? |
|---|---|---|---|---|---|
| Health info | **Yes** (calorie / macro / nutrition logs) | No | Optional | App functionality | Yes |
| Fitness info | No | — | — | — | — |

### Messages

| Data type | Collected | Shared | Required? | Purpose | Linked? |
|---|---|---|---|---|---|
| Emails | No (we don't read user emails) | — | — | — | — |
| SMS or MMS | No | — | — | — | — |
| Other in-app messages | **Yes** (AI Chef conversation history, recipe reviews if/when enabled) | No | Optional | App functionality | Yes |

### Photos and videos

| Data type | Collected | Shared | Required? | Purpose | Linked? |
|---|---|---|---|---|---|
| Photos | No | — | — | — | — |
| Videos | No | — | — | — | — |

### Audio files

All **No**.

### Files and docs

All **No**.

### Calendar / Contacts

All **No**.

### App activity

| Data type | Collected | Shared | Required? | Purpose | Linked? |
|---|---|---|---|---|---|
| App interactions | Yes (which recipes opened, meals logged, etc.) | No | Required | App functionality, Analytics | Yes |
| In-app search history | No | — | — | — | — |
| Installed apps | No | — | — | — | — |
| Other user-generated content | **Yes** (recipes saved, meal plans, pantry items, shopping lists, household memberships, expenses) | No | Required | App functionality | Yes |
| Other actions | No | — | — | — | — |

### Web browsing

All **No**.

### App info and performance

| Data type | Collected | Shared | Required? | Purpose | Linked? |
|---|---|---|---|---|---|
| Crash logs | **Yes** (Sentry) | Yes (Sentry, Inc. — processor) | Required | Analytics | **No** (anonymized) |
| Diagnostics | **Yes** (performance traces) | Yes (Sentry) | Required | Analytics | No |
| Other app performance data | No | — | — | — | — |

### Device or other IDs

| Data type | Collected | Shared | Required? | Purpose | Linked? |
|---|---|---|---|---|---|
| Device or other IDs | **Yes** (Expo push token if push notifications ever wired) | No | Optional | App functionality | Yes |

*Currently we don't send push notifications, but Expo issues the token on install. Marking as Optional + Yes is the conservative answer.*

---

## Section 3: Security practices

| Question | Answer |
|---|---|
| Is your data encrypted in transit between your app and the network? | **Yes** |
| Do you provide a way for users to request that their data be deleted? | **Yes — in-app at Profile → Delete Account, and by email** |

---

## Section 4: Final review

Google generates a preview of how the data safety section will appear in your store listing. Compare it to your **Privacy Policy** at `docs/privacy.md` — they must agree, or Google flags the discrepancy.

---

## When to re-fill this

- Adding email verification → add **Authentication info** type
- Adding social sign-in → add **OAuth tokens** if you store them
- Adding photo uploads (e.g., user-submitted recipe photos) → **Photos** changes from No to Yes
- Adding in-app purchases → **Purchase history** changes
- Removing crash reporting → drop the Sentry rows

You can update this form **without** a new app release. Submit the update; Google rolls it out to the listing within ~24 hours.
