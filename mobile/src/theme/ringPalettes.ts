// Color palettes for the Home daily-goal rings, chosen in Lab → Nutrition rings.
// The ring SHAPE stays the same (sleek) — only the 4 macro colors change.
// 'classic' is the current/default look.

export type RingPalette = 'classic' | 'ocean' | 'sunset' | 'forest' | 'berry' | 'mono';

export interface MacroColors {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

export interface RingPaletteDef {
  name: string;
  desc: string;
  colors: MacroColors;
}

export const RING_PALETTES: Record<RingPalette, RingPaletteDef> = {
  classic: {
    name: 'Classic',
    desc: 'The current colors.',
    colors: { calories: '#FF3D2E', protein: '#F97316', carbs: '#E0A100', fat: '#9333EA' },
  },
  ocean: {
    name: 'Ocean',
    desc: 'Cool blues & teal.',
    colors: { calories: '#06B6D4', protein: '#2563EB', carbs: '#0D9488', fat: '#6366F1' },
  },
  sunset: {
    name: 'Sunset',
    desc: 'Warm reds, orange & pink.',
    colors: { calories: '#EF4444', protein: '#F97316', carbs: '#F59E0B', fat: '#EC4899' },
  },
  forest: {
    name: 'Forest',
    desc: 'Earthy greens & gold.',
    colors: { calories: '#B91C1C', protein: '#15803D', carbs: '#A16207', fat: '#4D7C0F' },
  },
  berry: {
    name: 'Berry',
    desc: 'Jewel pinks & violet.',
    colors: { calories: '#DB2777', protein: '#7C3AED', carbs: '#C026D3', fat: '#4F46E5' },
  },
  mono: {
    name: 'Mono',
    desc: 'Minimal grayscale.',
    colors: { calories: '#111114', protein: '#3F3F46', carbs: '#71717A', fat: '#A1A1AA' },
  },
};

export const RING_PALETTE_ORDER: RingPalette[] = [
  'classic',
  'ocean',
  'sunset',
  'forest',
  'berry',
  'mono',
];
