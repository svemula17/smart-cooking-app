// Warm-modern, food-app native palette.
// Existing keys are preserved for backwards compatibility with screens not yet
// migrated. New semantic tokens (surface*, border*, on*, overlay) are the
// preferred way for new code to reach for color.

export const colors = {
  // Brand
  primary: '#F96167', // Coral red
  primaryLight: '#FFEAEB',
  primaryDark: '#D94550',
  primaryMuted: '#FFF3F3',
  secondary: '#F4C95D', // Warm gold (slightly tightened from #F9E795)
  secondaryLight: '#FFF6E0',
  accent: '#2F3C7E', // Navy

  // Semantic surfaces (warm neutrals)
  background: '#FFFBF7', // Warm off-white
  surface: '#FFFFFF',
  surfaceMuted: '#FBF6EF',
  surfaceRaised: '#FFFFFF',
  surfaceInverse: '#1A1410',
  surfaceElevated: '#FFFFFF', // back-compat alias

  // Borders
  border: '#EFE6DA',
  borderStrong: '#E0D4C2',
  borderMuted: '#F4ECDF',
  divider: '#F4ECDF',

  // Text / on-surface
  text: '#1F1A15',
  textSecondary: '#6B5F52',
  textLight: '#A89B8B',
  textInverse: '#FFFFFF',
  onPrimary: '#FFFFFF',
  onSecondary: '#1F1A15',

  // Overlay (modals, sheets, scrim)
  overlay: 'rgba(26, 20, 16, 0.45)',
  overlayStrong: 'rgba(26, 20, 16, 0.65)',

  // Feedback
  success: '#2E9E6A',
  successMuted: '#E6F5EE',
  warning: '#E8932A',
  warningMuted: '#FDF1E0',
  error: '#E5484D',
  errorMuted: '#FCE9EA',
  info: '#3B82F6',
  infoMuted: '#E6EFFE',

  // Macro colors
  calories: '#F96167',
  protein: '#4A90D9',
  carbs: '#F9A825',
  fat: '#7B61FF',
  fiber: '#4CAF50',

  // Difficulty badges
  easy: '#E6F5EE',
  easyText: '#1F7A4F',
  medium: '#FDF1E0',
  mediumText: '#A66514',
  hard: '#FCE9EA',
  hardText: '#A8262A',

  // Cuisine card backgrounds
  indian: '#FFE5B4',
  chinese: '#FFD1DC',
  indoChinese: '#E6F3FF',
  italian: '#C8E6C9',
  mexican: '#FFECB3',
  thai: '#F8BBD0',
  japanese: '#E8EAF6',
  mediterranean: '#E0F7FA',
  american: '#FBE9E7',
  french: '#FCE4EC',

  // Backward-compat aliases (used by pre-existing stub screens)
  textMuted: '#6B5F52',
  danger: '#E5484D',
  primaryDanger: '#E5484D',
} as const;

export type ColorKey = keyof typeof colors;
