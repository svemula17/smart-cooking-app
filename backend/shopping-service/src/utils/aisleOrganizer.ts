/**
 * Keyword-based aisle mapping.
 * Maps ingredient names to grocery store aisle categories.
 */

const AISLE_MAP: Array<{ keywords: string[]; aisle: string }> = [
  {
    keywords: ['chicken', 'beef', 'pork', 'lamb', 'turkey', 'sausage', 'bacon', 'ham', 'mutton', 'veal'],
    aisle: 'Meat & Poultry',
  },
  {
    keywords: ['salmon', 'tuna', 'shrimp', 'prawn', 'cod', 'tilapia', 'crab', 'lobster', 'fish', 'seafood'],
    aisle: 'Seafood',
  },
  {
    keywords: ['milk', 'butter', 'cheese', 'cream', 'yogurt', 'curd', 'paneer', 'ghee', 'egg', 'eggs'],
    aisle: 'Dairy & Eggs',
  },
  {
    keywords: ['apple', 'banana', 'orange', 'lemon', 'lime', 'mango', 'grape', 'berry', 'tomato', 'avocado', 'pear', 'peach', 'pineapple', 'melon', 'strawberry', 'blueberry'],
    aisle: 'Produce - Fruit',
  },
  {
    keywords: ['spinach', 'kale', 'lettuce', 'broccoli', 'carrot', 'onion', 'garlic', 'potato', 'pepper', 'celery', 'cucumber', 'zucchini', 'eggplant', 'cauliflower', 'cabbage', 'mushroom', 'beans', 'peas', 'corn', 'leek', 'scallion', 'spring onion', 'ginger', 'capsicum'],
    aisle: 'Produce - Vegetables',
  },
  {
    keywords: ['rice', 'pasta', 'noodle', 'bread', 'flour', 'wheat', 'oat', 'barley', 'quinoa', 'couscous', 'tortilla', 'wrap', 'pita', 'bagel'],
    aisle: 'Grains & Bread',
  },
  {
    keywords: ['lentil', 'chickpea', 'black bean', 'kidney bean', 'pinto bean', 'dal', 'legume', 'tofu', 'tempeh', 'soy'],
    aisle: 'Legumes & Plant Protein',
  },
  {
    keywords: ['olive oil', 'coconut oil', 'sesame oil', 'vegetable oil', 'canola oil', 'oil', 'vinegar', 'soy sauce', 'fish sauce', 'oyster sauce', 'worcestershire', 'ketchup', 'mayo', 'mustard', 'hot sauce'],
    aisle: 'Oils, Sauces & Condiments',
  },
  {
    keywords: ['salt', 'pepper', 'cumin', 'coriander', 'turmeric', 'paprika', 'chili', 'cinnamon', 'cardamom', 'clove', 'nutmeg', 'oregano', 'basil', 'thyme', 'rosemary', 'bay leaf', 'garam masala', 'curry powder', 'spice', 'herb', 'seasoning'],
    aisle: 'Spices & Herbs',
  },
  {
    keywords: ['sugar', 'honey', 'maple syrup', 'agave', 'molasses', 'jam', 'jelly', 'chocolate', 'cocoa', 'vanilla'],
    aisle: 'Baking & Sweeteners',
  },
  {
    keywords: ['almond', 'walnut', 'cashew', 'peanut', 'pecan', 'pistachio', 'sunflower seed', 'pumpkin seed', 'nut', 'seed'],
    aisle: 'Nuts & Seeds',
  },
  {
    keywords: ['frozen', 'ice cream'],
    aisle: 'Frozen Foods',
  },
  {
    keywords: ['can', 'canned', 'diced tomato', 'tomato paste', 'coconut milk', 'stock', 'broth', 'soup'],
    aisle: 'Canned & Packaged Goods',
  },
  {
    keywords: ['water', 'juice', 'tea', 'coffee', 'soda', 'drink', 'beverage'],
    aisle: 'Beverages',
  },
];

/**
 * Returns the aisle for a given ingredient name, or null if unknown.
 * Matching is case-insensitive and keyword-based (first match wins).
 */
export function getAisle(ingredientName: string): string | null {
  const lower = ingredientName.toLowerCase();
  for (const entry of AISLE_MAP) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.aisle;
    }
  }
  return null;
}

/**
 * Sort shopping items by aisle for an organized shopping experience.
 * Items with no aisle mapping go to the end.
 */
export function sortByAisle<T extends { aisle: string | null; ingredient_name: string }>(
  items: T[],
): T[] {
  const aisleOrder = AISLE_MAP.map((e) => e.aisle);

  return [...items].sort((a, b) => {
    const aIdx = a.aisle ? aisleOrder.indexOf(a.aisle) : Infinity;
    const bIdx = b.aisle ? aisleOrder.indexOf(b.aisle) : Infinity;
    if (aIdx !== bIdx) return aIdx - bIdx;
    return a.ingredient_name.localeCompare(b.ingredient_name);
  });
}
