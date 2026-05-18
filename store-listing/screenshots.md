# Screenshots

## Required sizes

### Apple App Store

Apple lets you upload one set per device size, but you only have to provide the **largest** for each device family — they auto-scale down. So in practice:

| Device family | Pixels | Aspect | Number to upload |
|---|---|---|---|
| iPhone 6.7" (15/16 Pro Max) | 1290 × 2796 | 19.5:9 | 2–10 (recommended: 5) |
| iPhone 6.5" (XS Max etc.) | 1242 × 2688 | 19.5:9 | Optional |
| iPad 13" (Pro M4) | 2064 × 2752 | 4:5 | Only if you support iPad — leave blank if not |

**Save effort:** if you don't have an iPad, just upload iPhone 6.7" and tick "supportsTablet": false in app.json (we currently have it `true` — change before submission unless you actually test on iPad).

### Google Play Store

| Asset | Size | Required |
|---|---|---|
| Phone screenshots | min 320 px shorter side, 16:9 to 9:16 aspect | 2–8 |
| 7" tablet | 1024 × 600 min | Optional |
| 10" tablet | 1280 × 800 min | Optional |
| **Feature graphic** | **1024 × 500** | **YES, mandatory** |
| App icon | 512 × 512 PNG | Already at `mobile/assets/icon.png` — verify size |

The **feature graphic** is the banner at the top of your Play Store page. Often overlooked. Don't ship without it.

---

## 5 screenshots — recommended order + captions

Show the highest-value screens first. Reviewers and users both scan top-to-bottom.

### Screenshot 1: Home (the hero)
**Screen:** Home tab with the 8 cuisine grid in view (Indian + Mexican + Chinese + Italian + Thai + Japanese + Mediterranean + Indo-Chinese).
**Caption (App Store):** `8 cuisines. 273 recipes. Real food photos.`
**Caption (Play):** `Browse 273 recipes across 8 cuisines.`
**Setup:** Login as the test user that has all the cuisine cards visible. Scroll down to show "Cook by cuisine" section.

### Screenshot 2: Recipe browser
**Screen:** Recipe browser, 2-column grid showing 6+ recipe cards with images and time pills.
**Caption:** `Quick filters. Real photos. Time + difficulty at a glance.`
**Setup:** Tap any cuisine card; screenshot once the first 6 recipes are loaded.

### Screenshot 3: Recipe detail
**Screen:** A pretty recipe (e.g., Chicken Biryani) showing the full-bleed hero image, nutrition card, and step-by-step instructions.
**Caption:** `Step-by-step instructions. Per-serving macros. Live ingredient scaling.`
**Setup:** Open a recipe with a vibrant photo. Scroll so both nutrition and at least one instruction step are visible.

### Screenshot 4: Log meal sheet
**Screen:** Recipe Detail with the "Log this meal" sheet open, serving stepper at 1.5×, macros showing scaled numbers.
**Caption:** `Log what you ate. Macros update live as you adjust portions.`
**Setup:** Tap "🍽 Log this meal" → tap "+" once. Capture the moment numbers update.

### Screenshot 5: AI Chef
**Screen:** AI Chat tab with a question typed (e.g., "What can I make with paneer and spinach?") and the AI response visible.
**Caption:** `Ask your AI chef anything — substitutions, scaling, "what should I cook?"`
**Setup:** Type the question, send it, wait for the response, screenshot the full conversation.

### (Optional Screenshot 6: Household)
**Screen:** House tab with cook schedule, members, and expense balances visible.
**Caption:** `Roommates? Family? Coordinate cooks, chores, and grocery bills.`

---

## How to capture screenshots (no Mac Xcode needed)

### iOS — use iOS Simulator (requires Xcode, which we don't have due to disk space)

**Workaround until you have Xcode:** capture screenshots from your real iPhone, then **upscale** to 1290×2796:

```bash
# On Mac:
brew install imagemagick   # or use Preview.app + Tools → Adjust Size
# Then in Terminal:
magick screenshot-iphone.png -resize 1290x2796 -unsharp 1.5x1.5 out.png
```

Apple's reviewers do allow real-device screenshots as long as they meet the resolution. The upscale won't be a strict "Retina" capture but is allowed.

### Android — `eas build --platform android --profile preview`

Once you have an APK installed on an Android device or emulator, take screenshots with the volume-down + power button. Crop to 1080 × 1920 (or larger). The Play Console accepts anything ≥ 320px shorter-side; 1080-wide phone screenshots are the standard.

---

## Feature graphic (Google Play, 1024 × 500)

Specs:
- **Pure visual** — no app icon, no screenshots, no overlapping app name (Play renders the app name beneath the graphic, so duplicating it is redundant)
- **No text essential to comprehension** — Google's reviewers reject feature graphics where the text is the whole story
- **JPG or 24-bit PNG**, max 1MB

### Recommended composition

A photographic still life of food — e.g., a vibrant plate of biryani photographed from above, on a dark wooden surface, with a soft warm light. No phone mockup. No "DOWNLOAD NOW" call to action.

Royalty-free sources:
- Unsplash (https://unsplash.com/s/photos/biryani)
- Pexels (https://www.pexels.com/search/biryani/)

Pick a photo that's at least 2048px wide so you can crop the 1024 × 500 banner without quality loss.

---

## Recording a screen capture video (optional but high-conversion)

Both stores support 15–30 second preview videos:
- **Apple:** "App Preview" — 15-30s, no audio narration but music is allowed
- **Google Play:** YouTube link, ideally 30s, autoplay-friendly

Storyboard for 30 seconds:
1. (0:00–0:03) Splash + login
2. (0:03–0:08) Home cuisine grid → tap Indian
3. (0:08–0:13) Recipe browser scroll → tap a recipe
4. (0:13–0:18) Recipe detail scroll, show hero + macros
5. (0:18–0:23) "Log this meal" sheet, slide servings
6. (0:23–0:28) AI Chef tab, ask a question, see response
7. (0:28–0:30) End card: app icon + tagline

Capture using your phone's native screen recording, then trim in iMovie / CapCut.
