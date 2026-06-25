// Design-direction tokens. Each DesignTheme is a self-contained look the
// mock flow renders sample screens in. These are intentionally separate from
// the app's real theme (src/theme/*) — this is a chooser, not the live system.

import { Platform, type TextStyle } from 'react-native';

const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

export interface DesignTheme {
  key: string;
  name: string;
  vibe: string;

  // Colors
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textDim: string;
  border: string;
  accent: string;
  accentSoft: string; // tinted accent background
  onAccent: string;

  // Type
  fontFamily?: string;     // body font (undefined = system)
  headingFamily?: string;  // heading font (serif for editorial)
  headingWeight: TextStyle['fontWeight'];
  uppercaseLabels: boolean;

  // Shape
  radius: number;        // card radius
  buttonRadius: number;
  cardShadow: 'none' | 'soft' | 'strong';
  borderWidth: number;   // 0 = no hairline borders

  // Density
  gap: number;
  pad: number;

  // Layout flags (real visual variety, not just colors)
  cardStyle: 'list' | 'tall' | 'wide';
  heroStyle: 'rings' | 'photo' | 'stat';
  chipStyle: 'pill' | 'square';
}

export const DESIGN_THEMES: DesignTheme[] = [
  {
    key: 'minimal',
    name: 'Minimal Mono',
    vibe: 'Clean, whitespace, one restrained accent',
    bg: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceAlt: '#F6F6F7',
    text: '#111114',
    textDim: '#8A8A8E',
    border: '#ECECEE',
    accent: '#111114',
    accentSoft: '#F0F0F1',
    onAccent: '#FFFFFF',
    headingWeight: '700',
    uppercaseLabels: true,
    radius: 10,
    buttonRadius: 10,
    cardShadow: 'none',
    borderWidth: 1,
    gap: 14,
    pad: 16,
    cardStyle: 'list',
    heroStyle: 'stat',
    chipStyle: 'square',
  },
  {
    key: 'editorial',
    name: 'Warm Editorial',
    vibe: 'Food-magazine — serif, cream, big photos',
    bg: '#FBF7F0',
    surface: '#FFFFFF',
    surfaceAlt: '#F3ECE0',
    text: '#2A2018',
    textDim: '#8C7B68',
    border: '#E7DCC9',
    accent: '#C2603F',
    accentSoft: '#F3E2D8',
    onAccent: '#FFFFFF',
    headingFamily: serif,
    headingWeight: '600',
    uppercaseLabels: false,
    radius: 6,
    buttonRadius: 4,
    cardShadow: 'soft',
    borderWidth: 0,
    gap: 18,
    pad: 20,
    cardStyle: 'wide',
    heroStyle: 'photo',
    chipStyle: 'square',
  },
  {
    key: 'vibrant',
    name: 'Bold Vibrant',
    vibe: 'Saturated, playful, pill shapes',
    bg: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceAlt: '#FFF0F6',
    text: '#1A1430',
    textDim: '#7A7390',
    border: '#FBE3EF',
    accent: '#FF3D77',
    accentSoft: '#FFE3EF',
    onAccent: '#FFFFFF',
    headingWeight: '800',
    uppercaseLabels: false,
    radius: 24,
    buttonRadius: 999,
    cardShadow: 'strong',
    borderWidth: 0,
    gap: 16,
    pad: 18,
    cardStyle: 'tall',
    heroStyle: 'rings',
    chipStyle: 'pill',
  },
  {
    key: 'dark',
    name: 'Dark Premium',
    vibe: 'Dark-first, gold accent, high-end',
    bg: '#0B0B0F',
    surface: '#16161C',
    surfaceAlt: '#1E1E26',
    text: '#F5F5F7',
    textDim: '#9A9AA6',
    border: '#2A2A33',
    accent: '#E8B65A',
    accentSoft: '#2A2418',
    onAccent: '#0B0B0F',
    headingWeight: '600',
    uppercaseLabels: true,
    radius: 16,
    buttonRadius: 14,
    cardShadow: 'none',
    borderWidth: 1,
    gap: 16,
    pad: 18,
    cardStyle: 'tall',
    heroStyle: 'rings',
    chipStyle: 'pill',
  },
  {
    key: 'pastel',
    name: 'Soft Pastel',
    vibe: 'Calm, rounded, soft shadows',
    bg: '#FAF9FC',
    surface: '#FFFFFF',
    surfaceAlt: '#F1EFFA',
    text: '#3A3550',
    textDim: '#908AA8',
    border: '#ECE8F7',
    accent: '#7C9CF5',
    accentSoft: '#E8EEFF',
    onAccent: '#FFFFFF',
    headingWeight: '700',
    uppercaseLabels: false,
    radius: 22,
    buttonRadius: 20,
    cardShadow: 'soft',
    borderWidth: 0,
    gap: 16,
    pad: 18,
    cardStyle: 'wide',
    heroStyle: 'rings',
    chipStyle: 'pill',
  },
];
