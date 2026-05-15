export { colors } from './colors';
export type { ColorKey } from './colors';
export { darkColors } from './darkColors';
export { typography } from './typography';
export type { TypographyVariant } from './typography';
export { useThemeColors } from './useThemeColors';
export { spacing } from './spacing';
export type { SpacingKey } from './spacing';
export { radii } from './radii';
export type { RadiiKey } from './radii';
export { elevation } from './elevation';
export type { ElevationKey } from './elevation';
export { motion } from './motion';

export type ThemeColors = typeof import('./colors').colors;
