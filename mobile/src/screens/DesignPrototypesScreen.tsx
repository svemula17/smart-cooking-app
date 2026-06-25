// DesignPrototypesScreen — Lab playground to A/B the app's visual direction.
// Lists 5 design themes; tap one → a full-screen swipeable 3-screen mock flow
// (Home → Browse → Recipe) in that style. Pick a winner; applying it app-wide
// is a separate step. Mirrors SplashPrototypesScreen.

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../types';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Card, Header } from '../components/ui';

import { DESIGN_THEMES, type DesignTheme } from './design-prototypes/themes';
import { MockFlow } from './design-prototypes/MockFlow';

type Props = NativeStackScreenProps<RootStackParamList, 'DesignPrototypes'>;

export default function DesignPrototypesScreen({ navigation }: Props) {
  const c = useThemeColors();
  const [preview, setPreview] = useState<DesignTheme | null>(null);

  if (preview) {
    return <MockFlow theme={preview} onClose={() => setPreview(null)} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <Header title="App design themes" border onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <Text style={[typography.body, { color: c.textSecondary, marginBottom: spacing.sm }]}>
          Tap a theme to preview a 3-screen flow (Home → Browse → Recipe) in that
          look. Swipe between screens. Pick the one you like — applying it across
          the whole app is a separate step.
        </Text>

        {DESIGN_THEMES.map((t) => (
          <Card
            key={t.key}
            surface="surface"
            radius="xl"
            padding="lg"
            elevation="card"
            bordered
            onPress={() => setPreview(t)}
            accessibilityLabel={`Preview ${t.name}`}
          >
            <View style={styles.cardHeader}>
              {/* live color swatch from the theme */}
              <View style={[styles.swatchWrap, { backgroundColor: t.bg, borderColor: c.border }]}>
                <View style={[styles.swatchDot, { backgroundColor: t.accent }]} />
                <View style={[styles.swatchDot, { backgroundColor: t.text }]} />
                <View style={[styles.swatchDot, { backgroundColor: t.surfaceAlt, borderWidth: 1, borderColor: t.border }]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.h3, { color: c.text }]}>{t.name}</Text>
                <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}>{t.vibe}</Text>
              </View>
            </View>
            <Text style={[typography.button, { color: c.primary, marginTop: spacing.md }]}>▶  Preview</Text>
          </Card>
        ))}

        <Card surface="surfaceMuted" radius="lg" padding="md" elevation="flat" style={{ marginTop: spacing.lg }}>
          <Text style={[typography.caption, { color: c.textSecondary }]}>
            These are previews only — the live app's look is unchanged. Once you pick a
            direction, applying it everywhere is a separate task.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  swatchWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  swatchDot: { width: 10, height: 10, borderRadius: 5 },
});
