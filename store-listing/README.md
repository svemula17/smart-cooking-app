# SmartCooking — Store Listing Package

Everything you need to submit to **Google Play Store** and **Apple App Store** lives in this folder. Copy-paste-ready.

## File map

| File | What's inside | Where it goes |
|------|---------------|---------------|
| `app-name.md` | App name + subtitle + promo text variants | Both stores, top of listing |
| `descriptions.md` | Short + full descriptions for both stores | Listing body |
| `keywords.md` | Apple keywords (100 char limit) + Play keyword strategy | Apple: Keywords field; Google: woven into description |
| `screenshots.md` | Required sizes + caption ideas + a screenshot-script you can record yourself | Listing media |
| `category-rating.md` | Category selections + content rating answers | Listing metadata |
| `whats-new.md` | Release notes template for the first release + the pattern for updates | Per-release |
| `support-urls.md` | Support, marketing, privacy, terms URLs to enter | Listing footer |
| `data-safety.md` | Pre-filled answers to Google Play's Data Safety form (10 min to fill) | Play Console mandatory form |
| `app-privacy.md` | Pre-filled answers to Apple's App Privacy nutrition label | App Store Connect mandatory form |
| `pre-launch-checklist.md` | Final pre-submission gate | Run before clicking Submit |

## Order to use these

1. Sign up for Apple Developer ($99/yr) and/or Google Play Console ($25 once)
2. Build a production binary: `eas build --platform ios --profile production` / `--platform android`
3. Open App Store Connect / Play Console, create a new app entry
4. Walk through `pre-launch-checklist.md` — it cross-references every other file here

## Status

✅ Drafted: 2026-05-18 — based on actual current product (273 recipes, 8 cuisines, AI Chef, household features, Apple-compliant in-app account deletion, hosted Privacy + Terms).

⚠️ Lawyer-review the descriptions before submission if you intend to monetize. Templates are reasonable starting points but every promise made here ("100% private," "no ads," etc.) becomes a legal commitment.
