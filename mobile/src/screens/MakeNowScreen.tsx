// MakeNowScreen — answers "what can I cook RIGHT NOW with the
// ingredients I already have?".
//
// Pure client-side: takes the user's pantry items + every recipe's
// ingredient list and computes a match%. No backend call, no LLM,
// instant results. We fetch recipes (with their ingredients) and the
// pantry, do the matching in-memory, sort by match desc.
//
// Each card shows what's in the pantry vs what's missing so the cook
// can decide "is buying 2 things worth it for this dish?".

import React, { useMemo } from 'react';
import { FlatList, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import type { RootStackParamList, Recipe } from '../types';
import type { RootState } from '../store';
import { recipeService } from '../services/recipeService';
import type { Ingredient } from '../types';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Badge, Card, EmptyState, Header, RecipeCardSkeleton } from '../components/ui';
import { RecipeCard } from '../components/RecipeCard';

type Props = NativeStackScreenProps<RootStackParamList, 'MakeNow'>;

interface RecipeWithIngredients extends Recipe {
  ingredients?: Ingredient[];
}

interface Scored {
  recipe: RecipeWithIngredients;
  matched: string[];
  missing: string[];
  matchPct: number;
}

// Loose-match: pantry "tomato" matches recipe "tomato, diced" / "tomatoes".
// We do bidirectional `includes` on lowercased names.
function fuzzyMatch(pantry: string[], ingredient: string): boolean {
  const ing = ingredient.toLowerCase().trim();
  return pantry.some((p) => p.includes(ing) || ing.includes(p));
}

function score(recipes: RecipeWithIngredients[], pantryNames: string[]): Scored[] {
  const lcPantry = pantryNames.map((n) => n.toLowerCase().trim());
  return recipes
    .map((r): Scored => {
      const ings = r.ingredients ?? [];
      const matched: string[] = [];
      const missing: string[] = [];
      for (const ing of ings) {
        (fuzzyMatch(lcPantry, ing.ingredient_name) ? matched : missing).push(ing.ingredient_name);
      }
      const total = ings.length || 1;
      const matchPct = matched.length / total;
      return { recipe: r, matched, missing, matchPct };
    })
    // Hide things with zero match (clutter) and recipes with no ingredients (data noise)
    .filter((s) => s.matched.length > 0 && (s.recipe.ingredients?.length ?? 0) > 0)
    .sort((a, b) => b.matchPct - a.matchPct || a.missing.length - b.missing.length);
}

function MakeNowScreen({ navigation }: Props): React.JSX.Element {
  const c = useThemeColors();
  const pantryItems = useSelector((s: RootState) => s.pantry.items);

  // Fetch a wide page of recipes with their ingredients. Cached by react-query.
  const { data, isLoading } = useQuery({
    queryKey: ['make-now-recipes'],
    queryFn: async () => {
      // recipeService.search returns 100 max; we paginate to grab all of them
      const r1 = await recipeService.search({ limit: 100 });
      const r2 = await recipeService.search({ limit: 100, page: 2 }).catch(() => ({ recipes: [], total: 0 }));
      return [...r1.recipes, ...r2.recipes];
    },
    // Recipe list rarely changes; cache for an hour
    staleTime: 60 * 60 * 1000,
  });

  // For matching we need ingredients on each recipe. Most list endpoints
  // don't include ingredients, so we batch-fetch details for the top-N
  // candidates whose name contains any pantry ingredient as a coarse pre-filter.
  const candidatePool: Recipe[] = data ?? [];
  const { data: enriched, isLoading: enriching } = useQuery({
    queryKey: ['make-now-enriched', candidatePool.length, pantryItems.length],
    enabled: candidatePool.length > 0 && pantryItems.length > 0,
    queryFn: async () => {
      // Coarse pre-filter — fetch details only for recipes whose NAME
      // contains a pantry word. That avoids 250 network calls.
      const pantryTokens = pantryItems
        .map((p) => p.name.toLowerCase().split(/\s+/))
        .flat()
        .filter((t) => t.length >= 3);
      const candidates = candidatePool.filter((r) =>
        pantryTokens.some((t) => r.name.toLowerCase().includes(t)),
      );
      // Cap at 40 to stay fast
      const top = candidates.slice(0, 40);
      const detailed = await Promise.all(
        top.map((r) => recipeService.getById(r.id).catch(() => null)),
      );
      return detailed.filter(Boolean) as RecipeWithIngredients[];
    },
    staleTime: 60 * 60 * 1000,
  });

  const scored = useMemo(() => {
    if (!enriched) return [];
    return score(enriched, pantryItems.map((p) => p.name));
  }, [enriched, pantryItems]);

  const isWorking = isLoading || enriching;

  if (pantryItems.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
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
      <StatusBar barStyle="dark-content" />
      <Header title="What can I make?" border onBack={() => navigation.goBack()} />
      <FlatList
        data={isWorking ? [] : scored}
        keyExtractor={(s) => s.recipe.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['2xl'] }}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={[typography.bodySmall, { color: c.textSecondary }]}>
              Matched against {pantryItems.length} pantry items.
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
