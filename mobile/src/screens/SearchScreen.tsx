import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { recipeService } from '../services/recipeService';
import { CuisineCard } from '../components/CuisineCard';
import { RecipeCard } from '../components/RecipeCard';
import type { RootStackParamList, Recipe } from '../types';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import {
  Button,
  Chip,
  EmptyState,
  RecipeCardSkeleton,
  TextField,
} from '../components/ui';

type SearchNav = NativeStackNavigationProp<RootStackParamList>;

const CUISINES = [
  { cuisine: 'Indian', emoji: '🍛', colorKey: 'indian' as const },
  { cuisine: 'Chinese', emoji: '🥢', colorKey: 'chinese' as const },
  { cuisine: 'Indo-Chinese', emoji: '🍜', colorKey: 'indoChinese' as const },
  { cuisine: 'Italian', emoji: '🍝', colorKey: 'italian' as const },
  { cuisine: 'Mexican', emoji: '🌮', colorKey: 'mexican' as const },
  { cuisine: 'Thai', emoji: '🌶️', colorKey: 'thai' as const },
  { cuisine: 'Japanese', emoji: '🍱', colorKey: 'japanese' as const },
  { cuisine: 'Mediterranean', emoji: '🫒', colorKey: 'mediterranean' as const },
];

const QUICK_FILTERS = [
  { label: '💪 High Protein', key: 'high', params: { min_protein: 30 } },
  { label: '⏱ Quick (<30m)', key: 'fast', params: { max_cook_time: 25 } },
  { label: '😊 Easy', key: 'easy', params: { difficulty: 'Easy' } },
  { label: '🥗 Low Calorie', key: 'low', params: {} },
];

export function SearchScreen(): React.JSX.Element {
  const navigation = useNavigation<SearchNav>();
  const c = useThemeColors();
  const [query, setQuery] = useState('');
  const [committed, setCommitted] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  const handleChange = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setCommitted(text.trim()), 250);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setCommitted('');
    setActiveFilter('');
    Keyboard.dismiss();
  }, []);

  const handleFilter = (key: string) => {
    setActiveFilter((prev) => (prev === key ? '' : key));
    setCommitted('');
    setQuery('');
  };

  const searchParams = (() => {
    const f = QUICK_FILTERS.find((x) => x.key === activeFilter);
    return { q: committed || undefined, ...(f?.params ?? {}) };
  })();

  const shouldSearch = committed.length > 0 || !!activeFilter;

  const { data, isLoading } = useQuery({
    queryKey: ['search', committed, activeFilter],
    queryFn: () => recipeService.search({ ...searchParams, limit: 30 }),
    enabled: shouldSearch,
    staleTime: 60_000,
  });

  const results: Recipe[] = data?.recipes ?? [];

  if (shouldSearch) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        <View style={[styles.searchHeader, { borderBottomColor: c.border }]}>
          <TextField
            ref={inputRef}
            value={query}
            onChangeText={handleChange}
            placeholder="Search recipes…"
            returnKeyType="search"
            leading={<Text style={{ fontSize: 16 }}>🔍</Text>}
            trailing={
              <Text
                accessibilityRole="button"
                onPress={clearSearch}
                style={{ color: c.textSecondary, fontSize: 16, padding: 4 }}
              >
                ✕
              </Text>
            }
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.sm, paddingTop: spacing.sm }}
          >
            {QUICK_FILTERS.map((f) => (
              <Chip
                key={f.key}
                label={f.label}
                selected={activeFilter === f.key}
                onPress={() => handleFilter(f.key)}
              />
            ))}
          </ScrollView>
        </View>

        {isLoading ? (
          <View style={{ padding: spacing.lg }}>
            <RecipeCardSkeleton />
            <RecipeCardSkeleton />
          </View>
        ) : results.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No recipes found"
            body="Try a different keyword or filter."
            ctaLabel="Clear search"
            onCta={clearSearch}
          />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(r) => r.id}
            renderItem={({ item }) => (
              <RecipeCard
                recipe={item}
                onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
              />
            )}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <Text style={[typography.bodySmall, { color: c.textSecondary, marginBottom: spacing.md }]}>
                {results.length} recipe{results.length !== 1 ? 's' : ''} found
              </Text>
            }
          />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing['3xl'] }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.lg }}>
          <Text style={[typography.h1, { color: c.text }]}>Discover</Text>
          <Text style={[typography.body, { color: c.textSecondary, marginTop: spacing.xs }]}>
            Find your next favourite dish
          </Text>
        </View>

        <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
          <TextField
            ref={inputRef}
            value={query}
            onChangeText={handleChange}
            placeholder="Search recipes, cuisines, ingredients…"
            returnKeyType="search"
            leading={<Text style={{ fontSize: 16 }}>🔍</Text>}
          />
        </View>

        <Text
          style={[
            typography.h4,
            { color: c.text, paddingHorizontal: spacing.xl, marginBottom: spacing.md },
          ]}
        >
          Quick filters
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.lg }}
        >
          {QUICK_FILTERS.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              selected={activeFilter === f.key}
              onPress={() => handleFilter(f.key)}
            />
          ))}
        </ScrollView>

        <Text
          style={[
            typography.h4,
            { color: c.text, paddingHorizontal: spacing.xl, marginBottom: spacing.md },
          ]}
        >
          Browse by cuisine
        </Text>
        <View style={styles.cuisineGrid}>
          {CUISINES.map((u) => (
            <CuisineCard
              key={u.cuisine}
              cuisine={u.cuisine}
              emoji={u.emoji}
              color={(c as any)[u.colorKey] ?? c.surfaceMuted}
              onPress={() => navigation.navigate('RecipeBrowser', { cuisine: u.cuisine })}
            />
          ))}
        </View>

        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.md }}>
          <Button
            label="Browse all recipes →"
            variant="secondary"
            fullWidth
            size="lg"
            onPress={() => navigation.navigate('RecipeBrowser', { cuisine: 'all' })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default SearchScreen;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  searchHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  resultsList: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing['3xl'] },
  cuisineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
});
