// "Minimal Mono" palette. White surfaces, a single near-black accent, hairline
// borders, and NO decorative color anywhere — the only hues are the nutrition
// macro data-viz (calories/protein/carbs/fat/fiber). Cuisine tiles and
// difficulty badges are neutral grays; semantic feedback (success/warning/
// error/info) is kept because it signals state. Existing semantic keys are
// preserved so callers don't need to change.

export const colors = {
  // Brand — mono near-black accent
  primary: '#111114',
  primaryLight: '#E8E8EA',
  primaryDark: '#000000',
  primaryMuted: '#F0F0F1',
  secondary: '#2A2A2E', // neutral secondary (was green)
  secondaryLight: '#F0F0F1',
  accent: '#111114', // near-black emphasis

  // Semantic surfaces (clean whites + neutral grays)
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F6F6F7',
  surfaceRaised: '#FFFFFF',
  surfaceInverse: '#111114',
  surfaceElevated: '#FFFFFF',

  // Borders (hairline neutrals)
  border: '#ECECEE',
  borderStrong: '#D8D8DB',
  borderMuted: '#F2F2F3',
  divider: '#ECECEE',

  // Text / on-surface
  text: '#111114',
  textSecondary: '#6B6B70',
  textLight: '#6E6E73',
  textInverse: '#FFFFFF',
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',

  // Overlay (modals, sheets, scrim)
  overlay: 'rgba(17, 17, 20, 0.45)',
  overlayStrong: 'rgba(17, 17, 20, 0.65)',

  // Feedback (kept — communicates state, used sparingly)
  success: '#1F9D57',
  successMuted: '#E9F5EE',
  warning: '#E08600',
  warningMuted: '#FBF0E0',
  error: '#D92D20',
  errorMuted: '#FBE7E5',
  info: '#2563EB',
  infoMuted: '#E8EEFE',

  // Macro colors (the ONE pop of color — full, saturated data viz)
  calories: '#FF3D2E',
  protein: '#F97316',
  carbs: '#E0A100',
  fat: '#9333EA',
  fiber: '#16A34A',

  // Difficulty badges — mono ramp (light = easy → dark = hard)
  easy: '#F4F4F5',
  easyText: '#6B6B70',
  medium: '#ECECEE',
  mediumText: '#404046',
  hard: '#E2E2E5',
  hardText: '#111114',

  // Cuisine card backgrounds — neutral (identity comes from emoji/photo)
  indian: '#F4F4F5',
  chinese: '#F4F4F5',
  indoChinese: '#F4F4F5',
  italian: '#F4F4F5',
  mexican: '#F4F4F5',
  thai: '#F4F4F5',
  japanese: '#F4F4F5',
  mediterranean: '#F4F4F5',
  american: '#F4F4F5',
  french: '#F4F4F5',

  // Backward-compat aliases
  textMuted: '#6B6B70',
  danger: '#D92D20',
  primaryDanger: '#D92D20',
} as const;

export type ColorKey = keyof typeof colors;
