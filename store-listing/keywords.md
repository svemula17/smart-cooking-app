# Keywords

## Apple App Store — the 100-char "Keywords" field

Apple's keywords field is **comma-separated**, single words preferred, **NO SPACES**, max **100 characters including commas**. The app's title + subtitle are already indexed, so DON'T repeat those words here.

Already in title/subtitle: `smart`, `cooking`, `cook`, `smarter`, `eat`, `better`

### Recommended (98 chars, 18 terms)

```
recipe,recipes,meal,planner,macro,protein,calorie,nutrition,pantry,grocery,ai,chef,indian,thai,vegan
```

Word-by-word reasoning:
- `recipe`, `recipes` — singular + plural for both query types
- `meal`, `planner` — bigram users naturally type as one phrase
- `macro`, `protein`, `calorie`, `nutrition` — main intent of trackers
- `pantry`, `grocery` — adjacent search intents
- `ai`, `chef` — your AI feature differentiator
- `indian`, `thai`, `vegan` — cuisine intent (Indian is the largest catalog; vegan is a high-volume health-app keyword)

### Iterate this monthly

Apple lets you change keywords every release without re-review. Watch which terms drive installs in App Store Connect → Analytics → Acquisition → Sources, swap out the low-performing 2-3 each release.

---

## Google Play — there is no keywords field

Google Play indexes the **full description text** for search. To rank for terms, mention them naturally in your description. Already done in `descriptions.md`:

| Term | Mentions in description |
|------|------|
| recipes | 4 |
| meal planner | 1 (+ "plan meals" once) |
| macro tracker | 1 (+ "macros" twice) |
| AI chef / sous-chef | 2 |
| pantry | 2 |
| shopping list | 2 |
| household | 2 |
| cuisine / Indian / Mexican / Chinese / Italian / Thai / Mediterranean / Japanese / Indo-Chinese | each at least once |

Don't keyword-stuff. Google penalizes "term density > 3-5%" listings. The current description is at ~2% density on each core term — safe.

---

## Localization hint

If you ever localize to es-MX or hi-IN, generate keywords per locale — `recipe` ≠ `receta` in indexing terms. Apple supports up to 100 chars per locale.
