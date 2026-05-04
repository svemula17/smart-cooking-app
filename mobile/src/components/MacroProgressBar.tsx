import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export interface MacroProgressBarProps {
  current: number;
  goal: number;
  label: string;
  color: string;
  unit?: string;
  compact?: boolean;
}

export const MacroProgressBar: React.FC<MacroProgressBarProps> = ({
  current,
  goal,
  label,
  color,
  unit = '',
  compact = false,
}) => {
  const percentage = Math.min(100, Math.round((current / Math.max(goal, 1)) * 100));
  const isOver = current > goal;

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, compact && styles.labelSmall]}>{label}</Text>
        <Text style={[styles.values, compact && styles.valuesSmall, isOver && styles.over]}>
          {current}
          {unit && <Text style={styles.unit}>{unit}</Text>}
          <Text style={styles.separator}> / </Text>
          {goal}{unit}
        </Text>
      </View>
      <View style={[styles.track, compact && styles.trackCompact]}>
        <View
          style={[
            styles.fill,
            { width: `${percentage}%`, backgroundColor: isOver ? colors.error : color },
          ]}
        />
      </View>
      {!compact && (
        <Text style={[styles.percent, isOver && styles.over]}>{percentage}%</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  compact: { marginBottom: 8 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  labelSmall: { fontSize: 11 },
  values: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  valuesSmall: { fontSize: 10 },
  unit: { fontSize: 10, color: colors.textLight },
  separator: { color: colors.textLight },
  over: { color: colors.error },
  track: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  trackCompact: { height: 5 },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  percent: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 2,
    textAlign: 'right',
  },
});
