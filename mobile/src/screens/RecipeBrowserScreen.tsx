import React, { useCallback, useRef, useState } from 'react';
import { ThemedStatusBar } from "../components/ThemedStatusBar";
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

import { RootStackParamList, Recipe, MealType, Diet } from '../types';
import { RootState } from '../store';
import { recipeService } from '../services/recipeService';
import { RecipeCard } from '../components/RecipeCard';
import { DietDot } from '../components/DietDot';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import {
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Header,
  RecipeCardSkeleton,
  TextField,
} from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeBrowser'>;

type FilterKey = 'Fastest' | 'Low Effort' | 'High Protein';

const FILTERS: { label: FilterKey; emoji: string }[] = [
  { label: 'Fastest', emoji: '⚡' },
  { label: 'Low Effort', emoji: '🛋️' },
  { label: 'High Protein', emoji: '💪' },
];

const MEALS: MealType[] = ['breakfast', 'lunch', 'dinner'];
const DIETS: { key: Diet; label: string }[] = [
  { key: 'veg', label: 'Veg' },
  { key: 'nonveg', label: 'Non-veg' },
  { key: 'egg', label: 'Egg' },
];
const REGIONS = [
  'North Indian', 'South Indian', 'Punjabi', 'Hyderabadi', 'Bengali',
  'Gujarati', 'Kashmiri', 'Maharashtrian', 'Rajasthani', 'Goan',
];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const RecipeBrowserScreen: React.FC<Props> = ({ route, navigation }) => {
  const { cuisine, intent, mealType } = route.params;
  const c = useThemeColors();

  // Meal-type / diet / region filters (some passed from Home; all switchable here).
  const [meal, setMeal] = useState<MealType | undefined>(mealType);
  const [diet, setDiet] = useState<Diet | undefined>(route.params.diet);
  const [region, setRegion] = useState<string | undefined>(route.params.region);
  const isIndian = cuisine === 'Indian';

  // Map incoming intent → one of our three remaining filters (or none = "all")
  const initialFilter: FilterKey | null =
    intent === 'fast'
      ? 'Fastest'
      : intent === 'low-effort'
      ? 'Low Effort'
      : intent === 'high-protein'
      ? 'High Protein'
      : null;

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(initialFilter);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pantryItems = useSelector((s: RootState) => s.pantry.items);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedQuery(text), 200);
  }, []);

  const isDefaultView = cuisine !== 'all' && !debouncedQuery && activeFilter === null;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['recipes', cuisine, debouncedQuery, activeFilter, meal, diet, region],
    queryFn: async () => {
      if (isDefaultView)
        return recipeService.getByCuisine(cuisine, { limit: 100, meal_type: meal, diet, region });
      return recipeService.search({
        q: debouncedQuery || undefined,
        cuisine_type: cuisine !== 'all' ? cuisine : undefined,
        meal_type: meal,
        diet,
        region,
        difficulty: activeFilter === 'Low Effort' ? 'Easy' : undefined,
        min_protein: activeFilter === 'High Protein' ? 25 : undefined,
        max_cook_time: activeFilter === 'Fastest' ? 25 : undefined,
        limit: 100,
      });
    },
  });
  const allRecipes: Recipe[] = data?.recipes ?? [];

  const recipePriority = (recipe: Recipe) => {
    const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;
    const difficultyBonus =
      recipe.difficulty === 'Easy' ? 12 : recipe.difficulty === 'Medium' ? 6 : 0;
    const proteinBonus = activeFilter === 'High Protein' ? 8 : 0;
    const speedBonus =
      activeFilter === 'Fastest' ? 12 : activeFilter === 'Low Effort' ? 10 : 0;
    return difficultyBonus + proteinBonus + speedBonus - totalTime;
  };
  const recipes = [...allRecipes].sort((a, b) => recipePriority(b) - recipePriority(a));

  const headerTitle =
    cuisine === 'all'
      ? meal
        ? cap(meal)
        : 'Dinner options'
      : meal
      ? `${cuisine} ${meal}`
      : `${cuisine} tonight`;

  // Pantry-driven suggestion strip — show items expiring soon as quick "cook
  // with these" prompts. Tapping fires a search.
  const pantrySuggestions = pantryItems
    .filter((item) => {
      if (!item.expiry_date) return false;
      const ms = new Date(item.expiry_date).getTime() - Date.now();
      const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 5;
    })
    .slice(0, 6);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <ThemedStatusBar />
      <Header title={headerTitle} border />

      <FlatList
        data={isLoading ? [] : recipes}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            compact
            onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        // Perf for ~270 recipes
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews
        updateCellsBatchingPeriod={100}
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

            {/* Diet switcher (Veg / Non-veg / Egg) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {DIETS.map((d) => (
                <Chip
                  key={d.key}
                  label={d.label}
                  leading={<DietDot diet={d.key} />}
                  selected={diet === d.key}
                  onPress={() => setDiet((curr) => (curr === d.key ? undefined : d.key))}
                />
              ))}
            </ScrollView>

            {/* Meal-type switcher */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {MEALS.map((m) => (
                <Chip
                  key={m}
                  label={cap(m)}
                  selected={meal === m}
                  // Tapping the active meal clears it (back to all meals)
                  onPress={() => setMeal((curr) => (curr === m ? undefined : m))}
                />
              ))}
            </ScrollView>

            {/* Region switcher — Indian cuisine only */}
            {isIndian ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {REGIONS.map((rg) => (
                  <Chip
                    key={rg}
                    label={rg}
                    selected={region === rg}
                    onPress={() => setRegion((curr) => (curr === rg ? undefined : rg))}
                  />
                ))}
              </ScrollView>
            ) : null}

            {/* Pantry suggestions — chips of items expiring soon */}
            {pantrySuggestions.length > 0 ? (
              <Card
                surface="surfaceMuted"
                radius="xl"
                padding="md"
                elevation="flat"
                style={styles.pantryCard}
              >
                <Text style={[typography.overline, { color: c.textSecondary }]}>
                  Cook with what you have
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pantryChipRow}
                >
                  {pantrySuggestions.map((item) => (
                    <Chip
                      key={item.id}
                      label={item.name}
                      onPress={() => handleSearch(item.name)}
                    />
                  ))}
                </ScrollView>
              </Card>
            ) : null}

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
                  // Tapping the active chip clears the filter (acts as "reset")
                  onPress={() =>
                    setActiveFilter((curr) => (curr === label ? null : label))
                  }
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
              ctaLabel="Clear filters"
              onCta={() => {
                setActiveFilter(null);
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

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { paddingHorizontal: spacing.sm, paddingBottom: spacing['2xl'], flexGrow: 1 },
  gridRow: { gap: spacing.sm, paddingHorizontal: spacing.xs },
  searchWrap: { marginTop: spacing.md, marginBottom: spacing.sm, paddingHorizontal: spacing.xs },
  pantryCard: { marginBottom: spacing.sm },
  pantryChipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingRight: spacing.lg,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingRight: spacing.lg,
  },
});

export default RecipeBrowserScreen;
