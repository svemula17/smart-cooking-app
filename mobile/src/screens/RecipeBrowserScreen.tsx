import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { RootStackParamList, Recipe } from '../types';
import { RootState } from '../store';
import { recipeService } from '../services/recipeService';
import { RecipeCard } from '../components/RecipeCard';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import {
  Badge,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Header,
  RecipeCardSkeleton,
  TextField,
} from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeBrowser'>;

const FILTERS = [
  { label: 'Reset', emoji: '✨' },
  { label: 'Rescue', emoji: '🚨' },
  { label: 'Fastest', emoji: '⚡' },
  { label: 'Low Effort', emoji: '🛋️' },
  { label: 'High Protein', emoji: '💪' },
];

const RecipeBrowserScreen: React.FC<Props> = ({ route, navigation }) => {
  const { cuisine, intent } = route.params;
  const c = useThemeColors();

  const initialFilter =
    intent === 'fast'
      ? 'Fastest'
      : intent === 'low-effort'
      ? 'Low Effort'
      : intent === 'high-protein'
      ? 'High Protein'
      : intent === 'rescue' || intent === 'use-soon'
      ? 'Rescue'
      : 'Reset';

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cookFromPantry = useSelector((s: RootState) => s.pantry.cookFromPantryMode);
  const pantryItems = useSelector((s: RootState) => s.pantry.items);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedQuery(text), 200);
  }, []);

  const isDefaultView = cuisine !== 'all' && !debouncedQuery && activeFilter === 'Reset';

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['recipes', cuisine, debouncedQuery, activeFilter],
    queryFn: async () => {
      if (isDefaultView) return recipeService.getByCuisine(cuisine, { limit: 30 });
      return recipeService.search({
        q: debouncedQuery || undefined,
        cuisine_type: cuisine !== 'all' ? cuisine : undefined,
        difficulty: activeFilter === 'Low Effort' ? 'Easy' : undefined,
        min_protein: activeFilter === 'High Protein' ? 25 : undefined,
        max_cook_time:
          activeFilter === 'Fastest' || activeFilter === 'Rescue' ? 25 : undefined,
      });
    },
  });
  const allRecipes: Recipe[] = data?.recipes ?? [];

  const recipePriority = (recipe: Recipe) => {
    const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;
    const difficultyBonus =
      recipe.difficulty === 'Easy' ? 12 : recipe.difficulty === 'Medium' ? 6 : 0;
    const proteinBonus = activeFilter === 'High Protein' ? 8 : 0;
    const pantrySignal = cookFromPantry ? 10 : 0;
    const rescueBonus =
      activeFilter === 'Rescue'
        ? 18
        : activeFilter === 'Fastest'
        ? 12
        : activeFilter === 'Low Effort'
        ? 10
        : 0;
    return difficultyBonus + proteinBonus + pantrySignal + rescueBonus - totalTime;
  };
  const recipes = [...allRecipes].sort((a, b) => recipePriority(b) - recipePriority(a));

  const headerTitle = cuisine === 'all' ? 'Dinner options' : `${cuisine} tonight`;
  const pantryUrgency = pantryItems.filter((item) => {
    if (!item.expiry_date) return false;
    const ms = new Date(item.expiry_date).getTime() - Date.now();
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 3;
  }).length;

  const intentSummary =
    activeFilter === 'Rescue'
      ? 'Easy wins, shorter cook times, lower friction.'
      : activeFilter === 'Fastest'
      ? 'The quickest ways to get dinner done.'
      : activeFilter === 'Low Effort'
      ? 'Less chopping, less cleanup.'
      : activeFilter === 'High Protein'
      ? 'Stronger protein options first.'
      : cuisine === 'all'
      ? 'Pantry-aware browsing.'
      : `A craving lane for ${cuisine.toLowerCase()} nights.`;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Header title={headerTitle} border />

      <FlatList
        data={isLoading ? [] : recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.searchWrap}>
              <TextField
                placeholder="Search by mood, ingredient, or dish…"
                value={searchQuery}
                onChangeText={handleSearch}
                returnKeyType="search"
                clearButtonMode="while-editing"
                leading={<Text style={{ fontSize: 16 }}>🔍</Text>}
                accessibilityLabel="Search recipes"
              />
            </View>

            {/* Mission card */}
            <Card
              surface="surfaceMuted"
              radius="2xl"
              padding="lg"
              elevation="flat"
              style={styles.missionCard}
            >
              <View style={styles.missionHeader}>
                <Text style={[typography.overline, { color: c.textSecondary }]}>
                  Tonight Mission
                </Text>
                {cookFromPantry ? <Badge label="PANTRY ON" tone="success" /> : null}
              </View>
              <Text style={[typography.h3, { color: c.text, marginTop: spacing.xs }]}>
                {activeFilter === 'Rescue'
                  ? 'Get something good on the table fast.'
                  : headerTitle}
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: c.textSecondary, marginTop: spacing.xs },
                ]}
              >
                {intentSummary}
              </Text>

              <View style={styles.missionStats}>
                <MissionStat value={pantryItems.length} label="Pantry items" />
                <MissionStat value={pantryUrgency} label="Use soon" />
                <MissionStat value={recipes.length} label="Candidates" />
              </View>
            </Card>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {FILTERS.map(({ label, emoji }) => (
                <Chip
                  key={label}
                  label={`${emoji}  ${label}`}
                  selected={activeFilter === label}
                  onPress={() => setActiveFilter(label)}
                />
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={{ paddingHorizontal: spacing.lg }}>
              <RecipeCardSkeleton />
              <RecipeCardSkeleton />
              <RecipeCardSkeleton />
            </View>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : (
            <EmptyState
              icon="🔍"
              title="No recipes found"
              body="Try a different search or filter."
              ctaLabel="Reset filters"
              onCta={() => {
                setActiveFilter('Reset');
                setSearchQuery('');
                setDebouncedQuery('');
              }}
            />
          )
        }
      />
    </SafeAreaView>
  );
};

function MissionStat({ value, label }: { value: number; label: string }) {
  const c = useThemeColors();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.surface,
        borderRadius: 14,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: '800', color: c.text }}>{value}</Text>
      <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2, fontWeight: '600' }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing['2xl'], gap: spacing.md, flexGrow: 1 },
  searchWrap: { marginTop: spacing.md, marginBottom: spacing.md },
  missionCard: { marginBottom: spacing.md },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  missionStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingRight: spacing.lg,
  },
});

export default RecipeBrowserScreen;
