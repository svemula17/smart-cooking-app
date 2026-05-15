import { StyleSheet, TextStyle } from 'react-native';
import { colors } from './colors';

// Type scale — warm-modern food-app native.
// Every variant defines lineHeight + letterSpacing so layouts stay consistent.
export const typography = StyleSheet.create({
  display: {
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 42,
    letterSpacing: -0.8,
    color: colors.text,
  },
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -0.5,
    color: colors.text,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: -0.3,
    color: colors.text,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: -0.1,
    color: colors.text,
  },
  h4: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    color: colors.text,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: colors.text,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 17,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 15,
    color: colors.textLight,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 17,
    letterSpacing: 0.1,
    color: colors.textSecondary,
  },
  button: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  overline: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as TextStyle['textTransform'],
    color: colors.textSecondary,
  },
});

export type TypographyVariant = keyof typeof typography;
