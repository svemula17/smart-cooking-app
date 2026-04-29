export const colors = {
  primary: '#FF6B35',
  primaryDark: '#E54E1B',
  secondary: '#2EC4B6',
  background: '#FFFFFF',
  surface: '#F7F7F7',
  text: '#1A1A1A',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  macroProtein: '#3B82F6',
  macroCarbs: '#F59E0B',
  macroFat: '#EF4444',
} as const;

export type ColorKey = keyof typeof colors;
