export const colors = {
  // Brand
  primary: '#F96167',       // Coral red
  primaryLight: '#FFEAEB',
  primaryDark: '#D94550',
  secondary: '#F9E795',     // Gold
  accent: '#2F3C7E',        // Navy

  // Base
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceElevated: '#FFFFFF',
  text: '#2C2C2C',
  textSecondary: '#666666',
  textLight: '#AAAAAA',
  border: '#E0E0E0',
  divider: '#F0F0F0',

  // Feedback
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Macro colors
  calories: '#F96167',
  protein: '#4A90D9',
  carbs: '#F9A825',
  fat: '#7B61FF',
  fiber: '#4CAF50',

  // Difficulty badges
  easy: '#E8F5E9',
  easyText: '#2E7D32',
  medium: '#FFF8E1',
  mediumText: '#F57F17',
  hard: '#FFEBEE',
  hardText: '#C62828',

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
  textMuted: '#666666',
  danger: '#F44336',
  primaryDanger: '#F44336',
} as const;

export type ColorKey = keyof typeof colors;
