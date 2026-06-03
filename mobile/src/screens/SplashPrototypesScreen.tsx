// SplashPrototypesScreen — playground for A/B testing the 4 splash
// animations. Pick a prototype → it takes over the full screen → tap
// anywhere or wait for it to finish → returns here. Once you've chosen
// a winner, we'll wire it as the real splash.

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../types';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Badge, Card, Header } from '../components/ui';

import { WorldOfFlavorsSplash } from './splash-prototypes/WorldOfFlavorsSplash';
import { SizzleSplash } from './splash-prototypes/SizzleSplash';
import { PlatesStackingSplash } from './splash-prototypes/PlatesStackingSplash';
import { RoundtableSplash } from './splash-prototypes/RoundtableSplash';

type Props = NativeStackScreenProps<RootStackParamList, 'SplashPrototypes'>;

type ConceptKey = 'world' | 'sizzle' | 'plates' | 'roundtable' | null;

interface Concept {
  key: Exclude<ConceptKey, null>;
  letter: string;
  title: string;
  pitch: string;
  vibe: string;
  duration: string;
}

const CONCEPTS: Concept[] = [
  {
    key: 'world',
    letter: 'A',
    title: 'World of Flavors',
    pitch: 'Globe spins → 6 cuisine emojis fan out + orbit → collapse into a plate',
    vibe: 'Multi-cuisine positioning',
    duration: '~1.7s',
  },
  {
    key: 'sizzle',
    letter: 'B',
    title: 'The Sizzle',
    pitch: 'Pan slides in → ingredients tumble from above → flame ignites → steam rises',
    vibe: 'Visceral cooking energy',
    duration: '~1.5s',
  },
  {
    key: 'plates',
    letter: 'C',
    title: 'Plates Stacking',
    pitch: '4 colored plates drop one-by-one → top plate flips to reveal logo',
    vibe: 'Playful + friendly',
    duration: '~1.3s',
  },
  {
    key: 'roundtable',
    letter: 'D',
    title: 'The Roundtable',
    pitch: '4 roommate dots fly to the table → plate appears in the middle with steam',
    vibe: 'Roommate sharing (your moat)',
    duration: '~1.6s',
  },
];

export default function SplashPrototypesScreen({ navigation }: Props) {
  const c = useThemeColors();
  const [playing, setPlaying] = useState<ConceptKey>(null);

  if (playing) {
    const stop = () => setPlaying(null);
    return (
      <Pressable style={{ flex: 1 }} onPress={stop}>
        {playing === 'world' && <WorldOfFlavorsSplash onDone={stop} />}
        {playing === 'sizzle' && <SizzleSplash onDone={stop} />}
        {playing === 'plates' && <PlatesStackingSplash onDone={stop} />}
        {playing === 'roundtable' && <RoundtableSplash onDone={stop} />}
        <View style={[styles.tapHint, { backgroundColor: c.background }]}>
          <Text style={[typography.caption, { color: c.textSecondary }]}>
            Tap anywhere to replay · auto-returns when done
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <Header title="Splash prototypes" border onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <Text style={[typography.body, { color: c.textSecondary, marginBottom: spacing.sm }]}>
          Tap a concept to play full-screen. Pick a winner; I'll wire it as the real splash.
        </Text>

        {CONCEPTS.map((concept) => (
          <Card
            key={concept.key}
            surface="surface"
            radius="xl"
            padding="lg"
            elevation="card"
            bordered
            onPress={() => setPlaying(concept.key)}
            accessibilityLabel={`Play ${concept.title}`}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.letterBadge, { backgroundColor: c.primaryMuted }]}>
                <Text style={[styles.letter, { color: c.primary }]}>{concept.letter}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.h3, { color: c.text }]}>{concept.title}</Text>
                <Badge label={concept.vibe} tone="primary" />
              </View>
              <Text style={[typography.caption, { color: c.textLight }]}>{concept.duration}</Text>
            </View>
            <Text style={[typography.bodySmall, { color: c.textSecondary, marginTop: spacing.sm }]}>
              {concept.pitch}
            </Text>
            <Text style={[typography.button, { color: c.primary, marginTop: spacing.md }]}>
              ▶  Play
            </Text>
          </Card>
        ))}

        <Card surface="surfaceMuted" radius="lg" padding="md" elevation="flat" style={{ marginTop: spacing.lg }}>
          <Text style={[typography.caption, { color: c.textSecondary }]}>
            Current production splash (Smart kitchen-pan with steam) is still the default in the app.
            Picking one above doesn't change the live splash yet — that's a separate step.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tapHint: { position: 'absolute', bottom: spacing.lg, alignSelf: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 999, opacity: 0.85 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  letterBadge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  letter: { fontSize: 18, fontWeight: '800' },
});
