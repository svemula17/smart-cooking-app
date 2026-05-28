// White-first, bold-accent palette. Single vibrant brand color, near-black
// text, vivid data-viz hues for nutrition. Existing semantic keys are
// preserved so callers don't need to change.

export const colors = {
  // Brand
  primary: '#FF3D2E', // Bold red-coral
  primaryLight: '#FFE5E1',
  primaryDark: '#D62C1F',
  primaryMuted: '#FFF1EF',
  secondary: '#00B050', // Fresh green
  secondaryLight: '#E6F5EB',
  accent: '#0F0F0F', // Near-black emphasis

  // Semantic surfaces (clean whites + neutral grays)
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F5F5F5',
  surfaceRaised: '#FFFFFF',
  surfaceInverse: '#0F0F0F',
  surfaceElevated: '#FFFFFF',

  // Borders
  border: '#EAEAEA',
  borderStrong: '#D4D4D4',
  borderMuted: '#F0F0F0',
  divider: '#EAEAEA',

  // Text / on-surface
  text: '#0F0F0F',
  textSecondary: '#666666',
  textLight: '#999999',
  textInverse: '#FFFFFF',
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',

  // Overlay (modals, sheets, scrim)
  overlay: 'rgba(15, 15, 15, 0.45)',
  overlayStrong: 'rgba(15, 15, 15, 0.65)',

  // Feedback
  success: '#00B050',
  successMuted: '#E6F5EB',
  warning: '#FF8A00',
  warningMuted: '#FFF1E0',
  error: '#E5141A',
  errorMuted: '#FBE5E6',
  info: '#0066FF',
  infoMuted: '#E5EFFE',

  // Macro colors (vibrant data viz)
  calories: '#FF3D2E',
  protein: '#FF8A00',
  carbs: '#FFC107',
  fat: '#9C27B0',
  fiber: '#00B050',

  // Difficulty badges
  easy: '#E6F5EB',
  easyText: '#00873E',
  medium: '#FFF1E0',
  mediumText: '#B96A00',
  hard: '#FBE5E6',
  hardText: '#A8121A',

  // Cuisine card backgrounds (modernized pastels on white)
  indian: '#FFE9B8',
  chinese: '#FFD5DC',
  indoChinese: '#D9E9FF',
  italian: '#D1EBD6',
  mexican: '#FFEABE',
  thai: '#FBCBDB',
  japanese: '#E2E5F5',
  mediterranean: '#D4F2F4',
  american: '#FFD9CE',
  french: '#FBD4E0',

  // Backward-compat aliases
  textMuted: '#666666',
  danger: '#E5141A',
  primaryDanger: '#E5141A',
} as const;

export type ColorKey = keyof typeof colors;
