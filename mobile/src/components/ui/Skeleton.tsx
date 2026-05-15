import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, StyleProp, View, ViewStyle } from 'react-native';
import { useThemeColors } from '../../theme/useThemeColors';
import { radii } from '../../theme/radii';
import { spacing } from '../../theme/spacing';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width = '100%', height = 16, radius = 8, style }: SkeletonProps) {
  const c = useThemeColors();
  const pulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.6, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: radius,
          backgroundColor: c.surfaceMuted,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
}

export function RecipeCardSkeleton() {
  const c = useThemeColors();
  return (
    <View
      style={[
        styles.recipeCard,
        { backgroundColor: c.surface, borderColor: c.border },
      ]}
    >
      <Skeleton height={160} radius={radii.lg} />
      <View style={{ padding: spacing.lg, gap: spacing.sm }}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="50%" height={12} />
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
          <Skeleton width={60} height={20} radius={10} />
          <Skeleton width={60} height={20} radius={10} />
        </View>
      </View>
    </View>
  );
}

export function ListRowSkeleton() {
  return (
    <View style={styles.row}>
      <Skeleton width={48} height={48} radius={24} />
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Skeleton width="60%" height={14} />
        <Skeleton width="40%" height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  recipeCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
});
