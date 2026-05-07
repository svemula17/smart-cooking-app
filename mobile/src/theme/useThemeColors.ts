import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { colors } from './colors';
import { darkColors } from './darkColors';

export function useThemeColors() {
  const isDark = useSelector((s: RootState) => s.settings.isDark);
  return isDark ? darkColors : colors;
}
