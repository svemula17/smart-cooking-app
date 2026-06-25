import React from 'react';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '../../theme/useThemeColors';

// Minimal Mono chrome icons. Feather is a single-weight, monochrome line set
// (bundled with Expo) — it carries the minimal aesthetic far better than
// multi-color emoji. Food/content identity still uses emoji elsewhere.
export type IconName =
  | 'search'
  | 'x'
  | 'plus'
  | 'minus'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'edit-2'
  | 'trash-2'
  | 'settings'
  | 'rotate-ccw'
  | 'pause'
  | 'play'
  | 'arrow-up'
  | 'arrow-up-right'
  | 'clock'
  | 'calendar'
  | 'lock'
  | 'file-text'
  | 'camera'
  | 'plus-circle'
  | 'check'
  | 'home'
  | 'users'
  | 'archive'
  | 'bar-chart-2'
  | 'user'
  | 'shopping-cart'
  | 'bell'
  | 'send'
  | 'volume-2'
  | 'volume-x'
  | 'smartphone';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 20, color }: IconProps) {
  const c = useThemeColors();
  return <Feather name={name} size={size} color={color ?? c.text} />;
}
