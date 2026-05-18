# Support, Marketing & Legal URLs

Both stores require URLs for these. Get them right once and you never touch this again.

| Field | URL | Status |
|---|---|---|
| Privacy Policy | https://svemula17.github.io/smart-cooking-app/privacy | ✅ Live |
| Terms of Service | https://svemula17.github.io/smart-cooking-app/terms | ✅ Live |
| Marketing URL (optional but recommended) | https://svemula17.github.io/smart-cooking-app/ | ✅ Live — currently the landing page is the index of legal docs |
| Support URL (required) | https://svemula17.github.io/smart-cooking-app/support | ❌ **Not built yet** — see below |
| Copyright owner | Sai Kumar Vemula | — |
| Support email | saikumarvemula.us@gmail.com | ✅ Active |

---

## The support URL is currently MISSING — needed before submission

Both Apple and Google **require** a support URL. You don't have one. Options:

### Option 1 (5 min): Add a `support.md` to the docs/ folder

Just a contact page. GitHub Pages will render it at `/support`. Drop this into `/Users/saikumarvemula/Documents/GitHub/smart-cooking-app/docs/support.md`:

```markdown
---
title: Support
---

# SmartCooking — Support

Need help with the app? Email us:

**saikumarvemula.us@gmail.com**

We try to respond within 24 hours.

## Common issues

- **Can't log in?** Make sure your email is spelled correctly. If you've
  forgotten your password, email us — automatic password reset is on its
  way.
- **Recipes not loading?** Check the offline banner at the top of the
  screen. If you're online but still see errors, force-close the app
  and reopen.
- **Want to delete your account?** Profile → Delete Account. All your
  data is removed within 30 days.

## Reporting a bug

Email us with:
1. What you were trying to do
2. What happened instead
3. Your phone model (Settings → About) and OS version
4. App version (Profile screen → very bottom)
```

Then in `docs/index.md`, add a link to `./support`.

Commit, push, GitHub Pages auto-rebuilds.

### Option 2 (longer): Buy `smartcooking.app` domain (~$12/year)

Then point GitHub Pages at it via `docs/CNAME`. URLs become:
- `https://smartcooking.app/privacy`
- `https://smartcooking.app/terms`
- `https://smartcooking.app/support`

Looks more professional in the app stores. Recommended once you decide to actually launch publicly.

---

## URLs to enter in App Store Connect

| Field | Value |
|---|---|
| Privacy Policy URL | `https://svemula17.github.io/smart-cooking-app/privacy` |
| Marketing URL | `https://svemula17.github.io/smart-cooking-app/` |
| Support URL | `https://svemula17.github.io/smart-cooking-app/support` (after you add it) |
| Copyright | `2026 Sai Kumar Vemula` |

## URLs to enter in Play Console

| Field | Value |
|---|---|
| Privacy Policy URL | `https://svemula17.github.io/smart-cooking-app/privacy` |
| Website (optional) | `https://svemula17.github.io/smart-cooking-app/` |
| Email | `saikumarvemula.us@gmail.com` |
| Phone (optional) | leave blank |
| Address (required only for paid apps) | leave blank if free |
