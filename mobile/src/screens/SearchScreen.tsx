import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { recipeService } from '../services/recipeService';
import { CuisineCard } from '../components/CuisineCard';
import { RecipeCard } from '../components/RecipeCard';
import { FilterChip } from '../components/FilterChip';
import { colors } from '../theme/colors';
import type { RootStackParamList, Recipe } from '../types';

type SearchNav = NativeStackNavigationProp<RootStackParamList>;

// ─── Constants ────────────────────────────────────────────────────────────────

const CUISINES = [
  { cuisine: 'Indian',      emoji: '🍛', color: colors.indian },
  { cuisine: 'Chinese',     emoji: '🥢', color: colors.chinese },
  { cuisine: 'Indo-Chinese',emoji: '🍜', color: colors.indoChinese },
  { cuisine: 'Italian',     emoji: '🍝', color: colors.italian },
  { cuisine: 'Mexican',     emoji: '🌮', color: colors.mexican },
  { cuisine: 'Thai',        emoji: '🌶️', color: colors.thai },
  { cuisine: 'Japanese',    emoji: '🍱', color: colors.japanese },
  { cuisine: 'Mediterranean',emoji: '🫒',color: colors.mediterranean },
];

const QUICK_FILTERS = [
  { label: 'High Protein', emoji: '💪', params: { min_protein: 30 } },
  { label: 'Quick (<30m)', emoji: '⏱',  params: { max_cook_time: 25 } },
  { label: 'Easy',         emoji: '😊', params: { difficulty: 'Easy' } },
  { label: 'Low Calorie',  emoji: '🥗', params: {} },
];

// ─── SearchScreen ─────────────────────────────────────────────────────────────

export function SearchScreen(): React.JSX.Element {
  const navigation = useNavigation<SearchNav>();
  const [query, setQuery] = useState('');
  const [committed, setCommitted] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);
  const searchBarFocused = query.length > 0 || committed.length > 0;

  // Debounced search commit
  const handleChange = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setCommitted(text.trim()), 380);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setCommitted('');
    setActiveFilter('');
    Keyboard.dismiss();
  }, []);

  // Quick-filter taps set a fake query
  const handleFilterPress = useCallback((label: string) => {
    setActiveFilter((prev) => (prev === label ? '' : label));
    setCommitted('');
    setQuery('');
  }, []);

  // Build query params
  const searchParams = (() => {
    const f = QUICK_FILTERS.find((x) => x.label === activeFilter);
    return {
      q: committed || undefined,
      ...(f?.params ?? {}),
    };
  })();

  const shouldSearch = committed.length > 0 || !!activeFilter;

  const { data, isLoading } = useQuery({
    queryKey: ['search', committed, activeFilter],
    queryFn: () => recipeService.search({ ...searchParams, limit: 30 }),
    enabled: shouldSearch,
    staleTime: 60_000,
  });

  const results: Recipe[] = data?.recipes ?? [];

  // ── Render helpers ──────────────────────────────────────────────────────────

  function renderResult({ item }: { item: Recipe }) {
    return (
      <RecipeCard
        recipe={item}
        onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
      />
    );
  }

  // ── Results view ────────────────────────────────────────────────────────────

  if (shouldSearch) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.header}>
          <View style={styles.searchRow}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={handleChange}
              style={styles.searchInput}
              placeholder="Search recipes, cuisines…"
              placeholderTextColor={colors.textLight}
              returnKeyType="search"
              autoFocus={false}
              clearButtonMode="never"
            />
            <TouchableOpacity onPress={clearSearch} style={styles.clearBtn}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Filter chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersRow}
          >
            {QUICK_FILTERS.map((f) => (
              <FilterChip
                key={f.label}
                label={f.label}
                emoji={f.emoji}
                selected={activeFilter === f.label}
                onPress={() => handleFilterPress(f.label)}
              />
            ))}
          </ScrollView>
        </View>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Finding recipes…</Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No recipes found</Text>
            <Text style={styles.emptySub}>
              Try a different keyword or filter
            </Text>
            <TouchableOpacity style={styles.clearSearchBtn} onPress={clearSearch}>
              <Text style={styles.clearSearchText}>Clear Search</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(r) => r.id}
            renderItem={renderResult}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <Text style={styles.resultCount}>
                {results.length} recipe{results.length !== 1 ? 's' : ''} found
              </Text>
            }
          />
        )}
      </SafeAreaView>
    );
  }

  // ── Discovery view (no search) ──────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.discoveryContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.screenTitle}>Discover</Text>
          <Text style={styles.screenSubtitle}>Find your next favourite dish</Text>
        </View>

        {/* Search bar */}
        <TouchableOpacity
          style={styles.searchBarStatic}
          onPress={() => inputRef.current?.focus()}
          activeOpacity={0.8}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={handleChange}
            style={styles.searchInput}
            placeholder="Search recipes, cuisines, ingredients…"
            placeholderTextColor={colors.textLight}
            returnKeyType="search"
          />
        </TouchableOpacity>

        {/* Quick filters */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Quick Filters</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersRow}
          >
            {QUICK_FILTERS.map((f) => (
              <FilterChip
                key={f.label}
                label={f.label}
                emoji={f.emoji}
                selected={activeFilter === f.label}
                onPress={() => handleFilterPress(f.label)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Cuisines grid */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Browse by Cuisine</Text>
          <View style={styles.cuisineGrid}>
            {CUISINES.map((c) => (
              <CuisineCard
                key={c.cuisine}
                cuisine={c.cuisine}
                emoji={c.emoji}
                color={c.color}
                onPress={() =>
                  navigation.navigate('RecipeBrowser', { cuisine: c.cuisine })
                }
              />
            ))}
          </View>
        </View>

        {/* Browse all */}
        <TouchableOpacity
          style={styles.browseAllBtn}
          onPress={() => navigation.navigate('RecipeBrowser', { cuisine: 'all' })}
        >
          <Text style={styles.browseAllText}>Browse All Recipes →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export default SearchScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // Header with search bar
  header: { paddingTop: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: colors.divider },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 10, backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border },
  searchBarStatic: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border, height: 48 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.text },
  clearBtn: { padding: 6 },
  clearText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  filtersRow: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },

  // Discovery view
  discoveryContent: { paddingBottom: 40 },
  titleBlock: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  screenTitle: { fontSize: 30, fontWeight: '800', color: colors.text },
  screenSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  sectionBlock: { marginBottom: 8 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: colors.text, paddingHorizontal: 20, marginBottom: 14 },
  cuisineGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 12 },
  browseAllBtn: { marginHorizontal: 20, marginTop: 12, backgroundColor: colors.primaryLight, borderRadius: 14, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: colors.primary + '40' },
  browseAllText: { fontSize: 15, fontWeight: '700', color: colors.primary },

  // Results view
  resultsList: { paddingHorizontal: 16, paddingBottom: 32 },
  resultCount: { fontSize: 13, color: colors.textSecondary, marginBottom: 12, marginTop: 8 },

  // States
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: colors.textSecondary, fontSize: 14 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 8 },
  emptyEmoji: { fontSize: 54, marginBottom: 8 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  clearSearchBtn: { marginTop: 12, backgroundColor: colors.primaryLight, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 12 },
  clearSearchText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
});
