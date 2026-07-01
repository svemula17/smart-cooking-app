import React from 'react';
import { View } from 'react-native';
import type { Diet } from '../types';

// The classic Indian veg/non-veg indicator: a bordered square with a filled
// dot inside. Green = veg, red = non-veg, amber = egg (ovo-veg).
const COLORS: Record<Diet, string> = {
  veg: '#0A8F3C',
  egg: '#E08600',
  nonveg: '#C0392B',
};

export function DietDot({ diet, size = 12 }: { diet?: Diet | null; size?: number }) {
  if (!diet) return null;
  const color = COLORS[diet];
  const inner = Math.round(size * 0.44);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 3,
        borderWidth: 1.5,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      accessibilityLabel={diet === 'veg' ? 'Vegetarian' : diet === 'egg' ? 'Contains egg' : 'Non-vegetarian'}
    >
      <View style={{ width: inner, height: inner, borderRadius: inner / 2, backgroundColor: color }} />
    </View>
  );
}
