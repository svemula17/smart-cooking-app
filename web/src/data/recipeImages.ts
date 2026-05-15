// Curated free Unsplash photos for recipes. Used when the DB doesn't have
// an image_url. Mapped by lower-cased recipe-name keyword first, then by cuisine.

const NAME_KEYWORDS: Record<string, string> = {
  biryani:     'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop',
  butter:      'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop',
  paneer:      'https://images.unsplash.com/photo-1626500155159-d24a949bcdb1?w=600&auto=format&fit=crop',
  dal:         'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop',
  tandoori:    'https://images.unsplash.com/photo-1604908554007-5c7bbc4b6b16?w=600&auto=format&fit=crop',
  chicken:     'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&auto=format&fit=crop',
  pasta:       'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop',
  pizza:       'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop',
  burger:      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop',
  taco:        'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&auto=format&fit=crop',
  burrito:     'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&auto=format&fit=crop',
  ramen:       'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop',
  sushi:       'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop',
  pho:         'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop',
  curry:       'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop',
  salad:       'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop',
  soup:        'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop',
  steak:       'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=600&auto=format&fit=crop',
  salmon:      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop',
  fish:        'https://images.unsplash.com/photo-1535007813616-79dc02ba4021?w=600&auto=format&fit=crop',
  rice:        'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600&auto=format&fit=crop',
  noodle:      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop',
  pancake:     'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600&auto=format&fit=crop',
  egg:         'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop',
  yogurt:      'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop',
  bread:       'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop',
  cake:        'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&auto=format&fit=crop',
  dessert:     'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop',
  smoothie:    'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600&auto=format&fit=crop',
  bowl:        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop',
  sandwich:    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop',
  wrap:        'https://images.unsplash.com/photo-1542444459-db63c4287e0d?w=600&auto=format&fit=crop',
};

const CUISINE_FALLBACKS: Record<string, string> = {
  Indian:        'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop',
  Chinese:       'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop',
  Italian:       'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop',
  Mexican:       'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&auto=format&fit=crop',
  Thai:          'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&auto=format&fit=crop',
  Japanese:      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop',
  Mediterranean: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop',
  American:      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop',
  French:        'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&auto=format&fit=crop',
};

const GENERIC_FOOD = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop';

export function getRecipeImage(recipe: { name: string; cuisine_type: string; image_url?: string | null }): string {
  if (recipe.image_url) return recipe.image_url;

  const lowerName = recipe.name.toLowerCase();
  for (const keyword of Object.keys(NAME_KEYWORDS)) {
    if (lowerName.includes(keyword)) return NAME_KEYWORDS[keyword];
  }

  return CUISINE_FALLBACKS[recipe.cuisine_type] ?? GENERIC_FOOD;
}
