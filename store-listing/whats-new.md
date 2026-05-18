# Release Notes

## v1.0.0 — first release ("What's New" text for the listing)

Apple field is 500 chars max. Play is 500 chars.

### Recommended copy (322 chars)

```
Welcome to SmartCooking! Our first release packs:

• 273 recipes across 8 cuisines, hand-curated with real photos
• AI sous-chef that knows what's in your pantry
• Meal planner with live macro tracking
• Smart pantry + auto-generated shopping lists
• Household coordination (cook rotation, chores, expense splits)
• Private by design — no ads, no tracking
```

---

## Pattern for future releases

Keep release notes user-facing. Two sentences max per bullet. Lead with the most-visible change. Don't write engineering jargon ("refactored RecipeDetailScreen") — translate it to user value ("recipe pages now load 40% faster on older Androids").

### Template

```
v{semver} — {one-line theme}

• {Biggest user-facing change in 1 sentence}
• {Second biggest, 1 sentence}
• {Bug fix or polish, 1 sentence}
{optional fourth bullet for power users}
```

### Examples

```
v1.0.1 — recipe images load instantly

• Recipes now use cached images — second time you scroll, photos
  appear instantly with no download wait.
• Fixed a bug where logging 1.5 servings showed 1.0× macros.
• You can now log "Snack" as a meal type, not just breakfast/lunch/dinner.
```

```
v1.1.0 — Diwali special

• 12 new Diwali dessert recipes: gulab jamun, jalebi, kaju katli,
  shrikhand, and more.
• AI Chef can now scale recipes up — ask "scale chicken biryani for 12 people".
• Faster app launch on older devices.
```

### Don't ship these in notes

- ❌ "Internal refactoring"
- ❌ "Bumped dependencies"
- ❌ "Security improvements" (vague — describe what)
- ❌ Anything Apple's reviewers can interpret as a content/policy change worth a full re-review

---

## When to bump major (1.x → 2.x)

Reserve 2.0 for a moment of repositioning the app — a redesign, a new tab, dropping a major feature, or a paywall introduction. Users notice the major bump and check release notes more carefully. Don't waste it on a routine release.
