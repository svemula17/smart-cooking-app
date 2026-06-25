// ActiveTimersBar — a sticky bar shown when the cook has 1+ running
// timers. Persists across step navigation so the cook can boil rice on
// step 2 while seeing the curry instructions on step 5.
//
// Empty state: renders nothing.
// One timer: full-width card with mm:ss + pause/reset/dismiss.
// Many timers: horizontal scroll of small chips.

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { ActiveTimer } from '../hooks/useCookingTimers';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Icon, IconButton } from './ui';

interface Props {
  timers: ActiveTimer[];
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onRemove: (id: string) => void;
}

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export function ActiveTimersBar({ timers, onToggle, onReset, onRemove }: Props) {
  const c = useThemeColors();
  if (timers.length === 0) return null;

  const fired = timers.find((t) => t.remaining === 0);
  const palette = (t: ActiveTimer) =>
    t.remaining === 0
      ? { bg: c.successMuted, fg: c.success, border: c.success }
      : t.running
      ? { bg: c.primaryMuted, fg: c.primary, border: c.primary }
      : { bg: c.surfaceMuted, fg: c.textSecondary, border: c.border };

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: c.surface,
          borderTopColor: c.border,
          borderBottomColor: c.border,
        },
        fired ? { backgroundColor: c.successMuted } : null,
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[typography.overline, { color: c.textSecondary }]}>
          {timers.length === 1 ? 'Timer' : `${timers.length} timers`}
          {fired ? ' · DING!' : ''}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {timers.map((t) => {
          const p = palette(t);
          return (
            <View
              key={t.id}
              style={[
                styles.chip,
                { backgroundColor: p.bg, borderColor: p.border },
              ]}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[typography.caption, { color: p.fg, fontWeight: '700' }]} numberOfLines={1}>
                  {t.label}
                </Text>
                <Text
                  style={{
                    color: p.fg,
                    fontSize: 20,
                    fontWeight: '800',
                    fontVariant: ['tabular-nums'],
                    letterSpacing: 1,
                  }}
                >
                  {fmt(t.remaining)}
                </Text>
              </View>
              <View style={styles.chipBtns}>
                {t.remaining > 0 ? (
                  <IconButton
                    icon={<Icon name={t.running ? 'pause' : 'play'} size={16} />}
                    size={32}
                    accessibilityLabel={t.running ? 'Pause' : 'Resume'}
                    onPress={() => onToggle(t.id)}
                  />
                ) : null}
                <IconButton
                  icon={<Icon name="rotate-ccw" size={16} />}
                  size={32}
                  accessibilityLabel="Reset"
                  onPress={() => onReset(t.id)}
                />
                <IconButton
                  icon={<Icon name="x" size={16} />}
                  size={32}
                  accessibilityLabel="Dismiss"
                  onPress={() => onRemove(t.id)}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  headerRow: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.sm,
    minWidth: 220,
    gap: spacing.sm,
  },
  chipBtns: { flexDirection: 'row', gap: 2 },
});
