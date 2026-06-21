// MakeNowScreen — answers "what can I cook RIGHT NOW with the
// ingredients I already have?". Matching logic lives in the shared
// useCookFromPantry() hook (also used by the Pantry "Cook Now" tab).

import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../types';
import { useCookFromPantry } from '../hooks/useCookFromPantry';

import { useThemeColors } from '../theme/useThemeColors';
import { ThemedStatusBar } from '../components/ThemedStatusBar';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Badge, Card, EmptyState, Header, RecipeCardSkeleton } from '../components/ui';
import { RecipeCard } from '../components/RecipeCard';

type Props = NativeStackScreenProps<RootStackParamList, 'MakeNow'>;

function MakeNowScreen({ navigation }: Props): React.JSX.Element {
  const c = useThemeColors();
  const { scored, isLoading: isWorking, pantryCount } = useCookFromPantry();

  if (pantryCount === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
        <ThemedStatusBar />
        <Header title="What can I make?" border onBack={() => navigation.goBack()} />
        <EmptyState
          icon="🥫"
          title="Pantry is empty"
          body="Add some ingredients to your pantry, then we can suggest dishes you can cook right now."
          ctaLabel="Open pantry"
          onCta={() => navigation.navigate('Pantry' as never)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <ThemedStatusBar />
      <Header title="What can I make?" border onBack={() => navigation.goBack()} />
      <FlatList
        data={isWorking ? [] : scored}
        keyExtractor={(s) => s.recipe.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['2xl'] }}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={[typography.bodySmall, { color: c.textSecondary }]}>
              Matched against {pantryCount} pantry items.
              {isWorking ? ' Scanning…' : scored.length > 0 ? ` Best ${Math.min(scored.length, 20)} below.` : ''}
            </Text>
          </View>
        }
        ListEmptyComponent={
          isWorking ? (
            <View>
              <RecipeCardSkeleton />
              <RecipeCardSkeleton />
              <RecipeCardSkeleton />
            </View>
          ) : (
            <EmptyState
              icon="🤷"
              title="No close matches"
              body="None of your pantry items match common recipes by name. Try adding more ingredients."
            />
          )
        }
        renderItem={({ item }) => (
          <View style={{ marginBottom: spacing.md }}>
            <View style={{ position: 'relative' }}>
              <RecipeCard
                recipe={item.recipe}
                compact={false}
                onPress={() =>
                  navigation.navigate('RecipeDetail', { recipeId: item.recipe.id })
                }
              />
              <View style={[styles.matchBadge, { backgroundColor: badgeColor(item.matchPct, c) }]}>
                <Text style={styles.matchText}>
                  {Math.round(item.matchPct * 100)}% match
                </Text>
              </View>
            </View>
            <Card surface="surfaceMuted" radius="md" padding="md" elevation="flat" style={{ marginTop: -spacing.md }}>
              <Text style={[typography.caption, { color: c.textSecondary, marginBottom: 2 }]}>
                You have ({item.matched.length})
              </Text>
              <Text style={[typography.bodySmall, { color: c.success }]} numberOfLines={2}>
                {item.matched.slice(0, 6).join(', ')}
                {item.matched.length > 6 ? ` +${item.matched.length - 6} more` : ''}
              </Text>
              {item.missing.length > 0 ? (
                <>
                  <Text style={[typography.caption, { color: c.textSecondary, marginTop: spacing.sm, marginBottom: 2 }]}>
                    Missing ({item.missing.length})
                  </Text>
                  <Text style={[typography.bodySmall, { color: c.warning }]} numberOfLines={2}>
                    {item.missing.slice(0, 6).join(', ')}
                    {item.missing.length > 6 ? ` +${item.missing.length - 6} more` : ''}
                  </Text>
                </>
              ) : (
                <Badge label="Full pantry match!" tone="success" />
              )}
            </Card>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function badgeColor(pct: number, c: ReturnType<typeof useThemeColors>): string {
  if (pct >= 0.85) return c.success;
  if (pct >= 0.5) return c.primary;
  return c.warning;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  matchBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: 999,
  },
  matchText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.4,
  },
});

export default MakeNowScreen;
