// "Minimal Mono" — dark variant. Near-black surfaces, a single light accent,
// hairline borders. Color appears ONLY in the nutrition macros; cuisine tiles
// and difficulty badges are neutral; semantic feedback kept for state.
export const darkColors = {
  // Brand — light mono accent on dark
  primary: '#F5F5F7',
  primaryLight: '#3A3A40',
  primaryDark: '#FFFFFF',
  primaryMuted: '#26262B',
  secondary: '#E4E4E7',
  secondaryLight: '#26262B',
  accent: '#F5F5F7',

  background: '#0B0B0F',
  surface: '#16161A',
  surfaceMuted: '#1E1E24',
  surfaceRaised: '#24242B',
  surfaceInverse: '#F5F5F7',
  surfaceElevated: '#24242B',

  border: '#2A2A31',
  borderStrong: '#3A3A42',
  borderMuted: '#1E1E24',
  divider: '#2A2A31',

  text: '#F5F5F7',
  textSecondary: '#9A9AA0',
  textLight: '#6B6B72',
  textInverse: '#111114',
  onPrimary: '#0B0B0F', // dark text on light accent
  onSecondary: '#0B0B0F',

  overlay: 'rgba(0, 0, 0, 0.55)',
  overlayStrong: 'rgba(0, 0, 0, 0.75)',

  success: '#3FBF74',
  successMuted: '#13251B',
  warning: '#E5A23D',
  warningMuted: '#2A2113',
  error: '#F26157',
  errorMuted: '#2A1513',
  info: '#5B9BFF',
  infoMuted: '#11203A',

  // Macro colors (the ONE pop of color)
  calories: '#FF5848',
  protein: '#FFA040',
  carbs: '#FFD24F',
  fat: '#B36FD9',
  fiber: '#3FBF74',

  // Difficulty — mono ramp (dim = easy → bright = hard)
  easy: '#1E1E24',
  easyText: '#9A9AA0',
  medium: '#26262B',
  mediumText: '#C4C4C9',
  hard: '#30303A',
  hardText: '#F5F5F7',

  // Cuisine card backgrounds — neutral
  indian: '#1E1E24',
  chinese: '#1E1E24',
  indoChinese: '#1E1E24',
  italian: '#1E1E24',
  mexican: '#1E1E24',
  thai: '#1E1E24',
  japanese: '#1E1E24',
  mediterranean: '#1E1E24',
  american: '#1E1E24',
  french: '#1E1E24',

  textMuted: '#9A9AA0',
  danger: '#F26157',
  primaryDanger: '#F26157',
} as const;
