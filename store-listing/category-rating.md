# Category + Content Rating

## App Store category

### Apple

- **Primary:** Food & Drink
- **Secondary** (optional, shows in browse listings): Health & Fitness

Don't pick "Lifestyle" — it's a graveyard category with the lowest conversion of any top-level.

### Google Play

- **Category:** Food & Drink
- **Tags** (up to 5): `Recipes`, `Meal Planner`, `Nutrition`, `Cooking`, `Healthy Eating`

---

## Content rating

### Apple — Age Rating questionnaire

You'll be asked binary yes/no questions during App Store Connect setup. Answer all of these **None / No**:

| Topic | Answer |
|---|---|
| Cartoon or Fantasy Violence | None |
| Realistic Violence | None |
| Sexual Content or Nudity | None |
| Profanity or Crude Humor | None |
| Mature/Suggestive Themes | None |
| Horror/Fear Themes | None |
| Medical/Treatment Information | **Infrequent/Mild** (recipes mention dietary terms but no medical claims; pick "None" if available) |
| Alcohol, Tobacco, or Drug Use | **Infrequent/Mild** (some recipes use wine/sake/Shaoxing) |
| Gambling | None |
| Unrestricted Web Access | **No** (we don't have a browser) |
| User-Generated Content | **No** (reviews not yet implemented) — re-answer YES once reviews ship |

**Expected age rating:** 4+

### Google Play — IARC questionnaire

10–15 minute interactive form in Play Console. Answers map roughly to:

| Question | Answer |
|---|---|
| Does the app contain violence? | No |
| Sexual content? | No |
| Profanity? | No |
| Controlled substances? | No (the alcohol mentions in recipes are not "use depicted") |
| User-generated content? | No (for now) |
| Shares user location? | No |
| Allows users to interact? | No (no chat between users; household is shared state, not real-time chat) |
| Allows purchase of digital goods? | No |
| Allows real-money gambling? | No |

**Expected ratings:**
- ESRB: Everyone
- PEGI: 3
- IARC global: 3+

---

## Target audience

### Google Play "Target audience and content"

This is a separate form from the IARC content rating. Google requires it for all apps published after Feb 2020:

- **Target audience selection:** `18 and older`
  - (You *could* target 13+, but you'd have to design parental-consent flows and review your data collection. Save the headache.)
- **Does your app unintentionally appeal to children?** No
- **Does your app contain ads?** No
- **Does your app collect, use, or share Advertising ID?** No

---

## Privacy declaration (Apple "Apple ID Privacy")

We collect the following per `~/Documents/GitHub/smart-cooking-app/docs/privacy.md`:

| Data type | Linked to user? | Used for tracking? |
|---|---|---|
| Email | Yes | No |
| Name | Yes | No |
| User Content (recipes saved, meal plans, pantry, etc.) | Yes | No |
| Crash data (if you re-enable Sentry on mobile) | No (anonymized) | No |
| Performance data (Sentry, if re-enabled) | No | No |

**"Used for tracking"** = cross-app tracking. We don't do this. Select "No" for every data type.

See `app-privacy.md` for the full Apple App Privacy nutrition label fill-out.
