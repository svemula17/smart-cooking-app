import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useThemeColors } from '../theme/useThemeColors';
import { typography } from '../theme/typography';

export interface GoalRingProps {
  label: string;
  current: number;
  goal: number;
  color: string;
  /** Faint track color (Home passes `${color}26`). */
  trackColor: string;
  size?: number;
}

/**
 * A macro progress ring for the Home daily-goals card — thin, full ring with a
 * tinted track and the percent in the center. Colors come from the palette
 * chosen in Lab → Nutrition rings; the shape is fixed.
 */
export function GoalRing({ label, current, goal, color, trackColor, size = 56 }: GoalRingProps) {
  const c = useThemeColors();
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = goal > 0 ? Math.min(current / goal, 1) : 0;
  const dash = circumference * pct;
  const cx = size / 2;

  return (
    <View
      style={{ alignItems: 'center', flex: 1 }}
      accessibilityLabel={`${label}: ${Math.round(pct * 100)} percent of goal`}
    >
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cx} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
          <Circle
            cx={cx}
            cy={cx}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            rotation="-90"
            origin={`${cx},${cx}`}
          />
        </Svg>
        <View style={StyleSheet.absoluteFill as any}>
          <View style={ringCenter}>
            <Text style={{ fontSize: 11, fontWeight: '800', color }}>{Math.round(pct * 100)}%</Text>
          </View>
        </View>
      </View>
      <Text
        style={[
          typography.caption,
          { color: c.textSecondary, marginTop: 2, fontWeight: '600', fontSize: 10 },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const ringCenter = {
  flex: 1,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

export default GoalRing;
