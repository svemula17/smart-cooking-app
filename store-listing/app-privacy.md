# Apple — App Privacy Nutrition Label (pre-filled answers)

Apple's equivalent of the Play Data Safety form. Lives in App Store Connect → Your App → App Privacy. Apple displays the result on your store listing as the "App Privacy" card.

The flow: you declare each data **type** you collect, then for each type you say:
1. **Why** you collect it (Apple has a fixed list of purposes)
2. Whether it's **linked to the user's identity**
3. Whether it's used for **tracking** (cross-app/cross-site)

---

## Data types to declare

### Contact Info

- **Email Address** — collected, linked to user, NOT used for tracking
  - Purposes: App Functionality, Account Management
- **Name** — collected, linked, no tracking
  - Purposes: App Functionality, Account Management

### Health & Fitness

- **Health** — collected, linked, no tracking
  - Description: "Calorie and macronutrient logs the user enters about meals they've eaten."
  - Purposes: App Functionality
- **Fitness** — NOT collected

### User Content

- **Other User Content** — collected, linked, no tracking
  - Description: "Recipes saved, meal plans, pantry inventory, shopping lists, AI Chef conversations, household memberships and shared expenses."
  - Purposes: App Functionality

### Identifiers

- **User ID** — collected, linked, no tracking
  - Purposes: App Functionality, Account Management
- **Device ID** — collected, linked, no tracking
  - Description: "Expo push notification token, generated on install. Currently not used to deliver notifications but stored for future activation."
  - Purposes: App Functionality

### Usage Data

- **Product Interaction** — collected, linked, no tracking
  - Description: "Which recipes the user opens, meals logged, time spent in features."
  - Purposes: App Functionality, Analytics

### Diagnostics

- **Crash Data** — collected, **NOT linked**, no tracking
  - Description: "Sentry stack traces. Anonymized at collection."
  - Purposes: Analytics, App Functionality
- **Performance Data** — collected, NOT linked, no tracking
  - Description: "Sentry performance traces (10% sample rate)."
  - Purposes: Analytics, App Functionality
- **Other Diagnostic Data** — NOT collected

### What we do NOT collect (set to "No" for each section)

- Financial Info (no payments)
- Location (we don't ask for it)
- Sensitive Info (race, religion, sexual orientation, etc.)
- Contacts (we don't read your phonebook)
- Photos or Videos (we don't read your camera roll)
- Audio Data
- Gameplay Content
- Search History
- Browsing History

---

## The "Tracking" question

Apple defines tracking as: linking data collected from this app to **other companies' apps, websites, or offline data** for advertising or analytics-with-third-parties purposes.

**Our answer: NO TRACKING.** We don't do any of this. The Sentry events we collect are diagnostic only and never sold/shared with brokers.

Because we don't track, **you don't need to implement App Tracking Transparency (ATT)** — the iOS 14.5+ permission prompt that asks "allow this app to track you across other companies' apps?". Set `NSUserTrackingUsageDescription` to nothing / omit it from `Info.plist`. EAS handles this if you don't add it to `app.json`.

---

## The "third-party processors" we declare

Apple expects us to mention each third party that processes user data on our behalf:

| Provider | What they process | Where it's declared in our Privacy Policy |
|---|---|---|
| Supabase Inc. | All Postgres data | Section 3.1 |
| Railway Corp. | Backend service hosting | Section 3.1 |
| Sentry Inc. | Crash + performance data (anonymized) | Section 3.1 |

These don't go in the App Privacy form directly — they're disclosed in your Privacy Policy text, which Apple links to.

---

## After saving

Apple **rebuilds your App Privacy card** within ~5 minutes. Before submitting, eyeball the preview: it should show roughly five buckets of "Data Used to Track You: None" and "Data Linked to You: Name, Email, Health Info, User Content, Identifiers, Usage Data" and "Data Not Linked to You: Diagnostics".

If anything looks wrong, fix it BEFORE submission. Apple's review team treats Privacy Label mismatches as a hard reject.

---

## When to re-fill

Apple's App Privacy supports updates **without** a new release. But once you've submitted v1.0, every subsequent version needs the labels reaffirmed during the submission wizard. Don't skip that screen.
