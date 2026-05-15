import React from 'react';
import { StyleSheet, Text, StyleProp, View, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../theme/useThemeColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { IconButton } from './IconButton';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
  left?: React.ReactNode;
  align?: 'left' | 'center';
  style?: StyleProp<ViewStyle>;
  border?: boolean;
}

export function Header({
  title,
  subtitle,
  showBack = true,
  onBack,
  right,
  left,
  align = 'left',
  style,
  border = false,
}: HeaderProps) {
  const c = useThemeColors();
  const nav = useNavigation();

  const handleBack = onBack ?? (() => (nav as any).goBack?.());

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: c.background,
          borderBottomColor: border ? c.border : 'transparent',
          borderBottomWidth: border ? StyleSheet.hairlineWidth : 0,
        },
        style,
      ]}
    >
      <View style={styles.side}>
        {left
          ? left
          : showBack
          ? <IconButton icon="‹" accessibilityLabel="Go back" onPress={handleBack} size={40} />
          : null}
      </View>
      <View style={[styles.center, align === 'center' && { alignItems: 'center' }]}>
        {title ? (
          <Text style={[typography.h3, { color: c.text }]} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={[typography.caption, { color: c.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={[styles.side, { alignItems: 'flex-end' }]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  side: { width: 56, justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center' },
});
