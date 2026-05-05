import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const typography = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  h4: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 17,
  },
  caption: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.textLight,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  button: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
