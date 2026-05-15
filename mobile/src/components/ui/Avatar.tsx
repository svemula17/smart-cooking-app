import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../../theme/useThemeColors';

interface AvatarProps {
  name?: string;
  uri?: string;
  size?: number;
  tone?: 'primary' | 'secondary' | 'neutral';
}

export function Avatar({ name, uri, size = 40, tone = 'primary' }: AvatarProps) {
  const c = useThemeColors();
  const initials =
    name
      ?.split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? '?';

  const bg =
    tone === 'primary' ? c.primaryMuted : tone === 'secondary' ? c.secondaryLight : c.surfaceMuted;
  const fg = tone === 'primary' ? c.primary : c.text;

  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }

  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
      ]}
    >
      <Text style={{ color: fg, fontWeight: '700', fontSize: size * 0.4 }}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
});
