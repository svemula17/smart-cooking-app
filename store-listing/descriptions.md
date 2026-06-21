# Store Descriptions

Two versions: a short blurb that's the first thing anyone reads, and a long-form description for the listing body. Both stores use the same content but render it differently.

---

## Short description

Used:
- **Google Play** — the 80-char blurb above the screenshots
- **Apple** — same text works as the `subtitle` if you want consistency

```
Plan meals, cook recipes, track macros — with an AI chef in your pocket.
```
(72 chars)

---

## Full description (Google Play: 4,000 chars; Apple: 4,000 chars)

Below is **2,847 chars** — leaves room to add seasonal pushes or feature additions later.

```
Cook smarter. Eat better. SmartCooking is your AI-powered kitchen
companion — a recipe browser, meal planner, household coordinator, and
macro tracker rolled into one calm, fast app.

250 RECIPES ACROSS 8 CUISINES
Browse a hand-curated catalog spanning Indian (102), Italian (25),
Mexican (25), Chinese (24), Mediterranean (20), Thai (19), Japanese (18),
and Indo-Chinese (17). Each recipe has step-by-step instructions, real
food photos, a full ingredient list, and per-serving nutrition you can
trust.

YOUR AI SOUS-CHEF
Stuck on what to cook tonight? Ask the in-app chef anything: substitutes
for ingredients you're out of, scaling a recipe up for guests, building
a balanced weeknight menu, or just "what should I make with paneer and
spinach?" — it remembers what's in your pantry.

EFFORTLESS MEAL PLANNING
Schedule breakfast, lunch, and dinner across the week. Daily macro
totals roll up automatically. Tap a recipe to log it; adjust servings
with a stepper that shows live calorie + protein + carb + fat
calculations as you slide.

HOUSEHOLD COORDINATION
Cooking with roommates or family? Create a household, invite members
with a 6-character code, and the app handles:
  - A fair rotating cook schedule
  - Shared chore tracking and scheduling
  - Expense splitting with auto-calculated balances, settle-up, and a
    monthly grocery budget
  - A household chat to coordinate
  - Rate the cook after dinner

SMART PANTRY + SHOPPING LISTS
Track what you have, what's expiring soon, and what you need to buy.
Snap a photo of a grocery receipt and the app extracts the items into
your pantry for you. See "Cook Now" dishes you can make from what's on
hand. Generate a tidy shopping list from any recipe — or a whole week of
meal plans — grouped by aisle, then check items off straight into your
pantry.

PRIVATE BY DESIGN
- We don't sell your data. Period.
- No ads.
- Passwords stored as bcrypt hashes (cost factor 12).
- All network traffic over HTTPS.
- In-app account deletion (Profile → Delete account). Your data is
  removed within 30 days — backups within 90.
- Read the full Privacy Policy at
  svemula17.github.io/smart-cooking-app/privacy

OPEN ABOUT WHAT WE DON'T DO
- We are NOT a medical device. Calorie + macro estimates are best-effort
  approximations. Don't use them for clinical decisions.
- We don't currently support meal-photo recognition, barcode scanning,
  or grocery-delivery integrations. (Yet.)

REQUIREMENTS
- iOS 14 or Android 8 (API 26) and up
- A working internet connection — the app is online-first; an offline
  banner tells you the moment your connection drops

WHAT'S NEXT
We're a tiny team shipping fast. If you want to see something added,
email us — we read every message.

Contact: saikumarvemula.us@gmail.com
Privacy: svemula17.github.io/smart-cooking-app/privacy
Terms:   svemula17.github.io/smart-cooking-app/terms
```

---

## Apple App Store specifics

Apple supports basic Markdown-ish formatting via line breaks. Convert the section headings to use shorter ALL-CAPS labels (already done above) — Apple does not render asterisks as bold like Google does.

**Don't** include emoji in the App Store description's body — Apple's review team historically penalizes "emoji-stuffed" listings as keyword-spam-adjacent. The Play Store is more permissive but our copy reads fine without them.

## Google Play specifics

Google Play does index your full description for in-store search — so the prose above is doing double duty as SEO. The cuisines, "macro tracker", "meal planner", "shopping list", "household", "AI" terms are intentionally repeated naturally.

## What NOT to claim

You promised these in the **Privacy Policy** but haven't built them yet — don't claim them in the description:

- ❌ "Forgot password" — not implemented (deferred per DEFERRED.md)
- ❌ "Email verification" — not implemented
- ❌ Push notification reminders (Expo's hook is wired but no real triggers yet)
- ❌ Apple Sign In / Google Sign In (only email+password right now)
