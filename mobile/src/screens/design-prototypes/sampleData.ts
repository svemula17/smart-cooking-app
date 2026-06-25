// Sample data for the design-direction mocks. Images reuse the verified
// Unsplash cuisine photos already used by components/CuisineCard.tsx so the
// photo-forward themes look real. Purely for previews — no backend.

export interface SampleRecipe {
  id: string;
  name: string;
  cuisine: string;
  emoji: string;
  minutes: number;
  rating: number;
  kcal: number;
  image: string;
}

export const SAMPLE_RECIPES: SampleRecipe[] = [
  {
    id: 's1', name: 'Butter Chicken', cuisine: 'Indian', emoji: '🍛',
    minutes: 45, rating: 4.8, kcal: 540,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80',
  },
  {
    id: 's2', name: 'Margherita Pizza', cuisine: 'Italian', emoji: '🍝',
    minutes: 30, rating: 4.6, kcal: 610,
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&q=80',
  },
  {
    id: 's3', name: 'Chicken Tacos', cuisine: 'Mexican', emoji: '🌮',
    minutes: 25, rating: 4.7, kcal: 430,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
  },
  {
    id: 's4', name: 'Pad Thai', cuisine: 'Thai', emoji: '🍜',
    minutes: 35, rating: 4.5, kcal: 520,
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80',
  },
  {
    id: 's5', name: 'Salmon Poke Bowl', cuisine: 'Japanese', emoji: '🍱',
    minutes: 20, rating: 4.9, kcal: 480,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80',
  },
  {
    id: 's6', name: 'Greek Salad', cuisine: 'Mediterranean', emoji: '🫒',
    minutes: 15, rating: 4.4, kcal: 320,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80',
  },
];

export const SAMPLE_CUISINES = ['Indian', 'Italian', 'Mexican', 'Thai', 'Japanese', 'Mediterranean'];

export const SAMPLE_INGREDIENTS = [
  '2 chicken breasts', '1 cup yogurt', '3 tbsp butter', '1 onion, diced',
  '4 cloves garlic', '1 can tomato purée', '2 tsp garam masala', 'Fresh cilantro',
];
