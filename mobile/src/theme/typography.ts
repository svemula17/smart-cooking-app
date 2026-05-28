import { StyleSheet, TextStyle } from 'react-native';
import { colors } from './colors';

// Clean modern type scale — heavy display weights, tight tracking, neutral body.
export const typography = StyleSheet.create({
  display: {
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 44,
    letterSpacing: -1,
    color: colors.text,
  },
  h1: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
    letterSpacing: -0.7,
    color: colors.text,
  },
  h2: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    letterSpacing: -0.4,
    color: colors.text,
  },
  h3: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    letterSpacing: -0.2,
    color: colors.text,
  },
  h4: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: -0.1,
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
    fontWeight: '500',
    lineHeight: 15,
    color: colors.textLight,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
    color: colors.textSecondary,
  },
  button: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  overline: {
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    letterSpacing: 1.4,
    textTransform: 'uppercase' as TextStyle['textTransform'],
    color: colors.textSecondary,
  },
});

export type TypographyVariant = keyof typeof typography;
