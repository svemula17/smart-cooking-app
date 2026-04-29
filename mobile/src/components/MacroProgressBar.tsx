import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface Props { label: string; consumed: number; goal: number; color: string; }

export function MacroProgressBar({ label, consumed, goal, color }: Props): JSX.Element {
  const pct = Math.min(100, Math.round((consumed / Math.max(goal, 1)) * 100));
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{consumed} / {goal}g</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { color: colors.text, fontWeight: '600' },
  value: { color: colors.textMuted, fontSize: 12 },
  track: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});
