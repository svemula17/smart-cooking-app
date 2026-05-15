import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../../theme/useThemeColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  body?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ icon = '🍽️', title, body, ctaLabel, onCta }: EmptyStateProps) {
  const c = useThemeColors();
  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.icon,
          { backgroundColor: c.surfaceMuted },
        ]}
      >
        <Text style={{ fontSize: 36 }}>{icon}</Text>
      </View>
      <Text style={[typography.h3, { textAlign: 'center', color: c.text }]}>{title}</Text>
      {body ? (
        <Text style={[typography.body, { textAlign: 'center', color: c.textSecondary }]}>
          {body}
        </Text>
      ) : null}
      {ctaLabel && onCta ? (
        <View style={{ marginTop: spacing.lg }}>
          <Button label={ctaLabel} onPress={onCta} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['4xl'],
    gap: spacing.md,
  },
  icon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
});
