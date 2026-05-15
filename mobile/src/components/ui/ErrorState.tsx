import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../../theme/useThemeColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  body?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  body = 'We couldn’t load this. Check your connection and try again.',
  onRetry,
  retryLabel = 'Try again',
}: ErrorStateProps) {
  const c = useThemeColors();
  return (
    <View style={styles.wrap}>
      <View style={[styles.icon, { backgroundColor: c.errorMuted }]}>
        <Text style={{ fontSize: 32 }}>⚠️</Text>
      </View>
      <Text style={[typography.h3, { textAlign: 'center', color: c.text }]}>{title}</Text>
      <Text style={[typography.body, { textAlign: 'center', color: c.textSecondary }]}>
        {body}
      </Text>
      {onRetry ? (
        <View style={{ marginTop: spacing.lg }}>
          <Button label={retryLabel} onPress={onRetry} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['4xl'],
    gap: spacing.md,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
});
