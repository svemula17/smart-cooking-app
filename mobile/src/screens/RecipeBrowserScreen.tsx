import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootStackParamList, Recipe } from '../types';
import { RootState } from '../store';
import { RecipeCard } from '../components/RecipeCard';
import { FilterChip } from '../components/FilterChip';
import { recipeService } from '../services/recipeService';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeBrowser'>;

const FILTERS = [
  { label: 'Rescue', emoji: '🚨' },
  { label: 'Fastest', emoji: '⚡' },
  { label: 'Low Effort', emoji: '🛋️' },
  { label: 'High Protein', emoji: '💪' },
  { label: 'Reset', emoji: '✨' },
];

const SkeletonCard: React.FC = () => {
  const anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.skeletonCard, { opacity: anim }]}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonBody}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonSub} />
        <View style={styles.skeletonTag} />
      </View>
    </Animated.View>
  );
};

const RecipeBrowserScreen: React.FC<Props> = ({ route, navigation }) => {
  const { cuisine, intent } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const initialFilter =
    intent === 'fast' ? 'Fastest'
      : intent === 'low-effort' ? 'Low Effort'
        : intent === 'high-protein' ? 'High Protein'
          : intent === 'rescue' || intent === 'use-soon' ? 'Rescue'
            : 'Reset';
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cookFromPantry = useSelector((s: RootState) => s.pantry.cookFromPantryMode);
  const pantryItems = useSelector((s: RootState) => s.pantry.items);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedQuery(text), 400);
  }, []);

  const isDefaultView = cuisine !== 'all' && !debouncedQuery && activeFilter === 'Reset';

  const { data: recipesData, isLoading } = useQuery({
    queryKey: ['recipes', cuisine, debouncedQuery, activeFilter],
    queryFn: async () => {
      if (isDefaultView) {
        return recipeService.getByCuisine(cuisine, { limit: 30 });
      }
      return recipeService.search({
        q: debouncedQuery || undefined,
        cuisine_type: cuisine !== 'all' ? cuisine : undefined,
        difficulty: activeFilter === 'Low Effort' ? 'Easy' : undefined,
        min_protein: activeFilter === 'High Protein' ? 25 : undefined,
        max_cook_time: activeFilter === 'Fastest' || activeFilter === 'Rescue' ? 25 : undefined,
      });
    },
  });
  const allRecipes: Recipe[] = recipesData?.recipes ?? [];

  const recipePriority = (recipe: Recipe) => {
    const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;
    const difficultyBonus = recipe.difficulty === 'Easy' ? 12 : recipe.difficulty === 'Medium' ? 6 : 0;
    const proteinBonus = activeFilter === 'High Protein' ? 8 : 0;
    const pantrySignal = cookFromPantry ? 10 : 0;
    const rescueBonus = activeFilter === 'Rescue' ? 18 : activeFilter === 'Fastest' ? 12 : activeFilter === 'Low Effort' ? 10 : 0;
    return difficultyBonus + proteinBonus + pantrySignal + rescueBonus - totalTime;
  };
  const recipes = [...allRecipes].sort((a, b) => recipePriority(b) - recipePriority(a));

  const headerTitle = cuisine === 'all' ? 'Dinner Options' : `${cuisine} Tonight`;
  const pantryUrgency = pantryItems.filter((item) => {
    if (!item.expiry_date) return false;
    const ms = new Date(item.expiry_date).getTime() - Date.now();
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 3;
  }).length;
  const intentSummary =
    activeFilter === 'Rescue'
      ? 'Prioritizing easy wins, shorter cook times, and lower friction.'
      : activeFilter === 'Fastest'
        ? 'Showing the quickest ways to get dinner done.'
        : activeFilter === 'Low Effort'
          ? 'Less chopping, less mental load, less cleanup energy.'
          : activeFilter === 'High Protein'
            ? 'Biasing toward stronger protein options.'
            : cuisine === 'all'
              ? 'Start from a mode, not from endless scrolling.'
              : `A craving lane for ${cuisine.toLowerCase()} nights.`;

  const renderItem = ({ item }: { item: Recipe }) => (
    <RecipeCard
      recipe={item}
      onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
    />
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>🔍</Text>
        <Text style={styles.emptyTitle}>No recipes found</Text>
        <Text style={styles.emptySubtitle}>Try a different search or filter</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {headerTitle}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by mood, ingredient, or dish..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      <View style={styles.missionCard}>
        <View style={styles.missionHeader}>
          <Text style={styles.missionEyebrow}>Tonight Mission</Text>
          {cookFromPantry && <Text style={styles.missionBadge}>PANTRY ON</Text>}
        </View>
        <Text style={styles.missionTitle}>
          {activeFilter === 'Rescue' ? 'Get something good on the table fast.' : headerTitle}
        </Text>
        <Text style={styles.missionSubtitle}>{intentSummary}</Text>
        <View style={styles.missionStats}>
          <View style={styles.missionStat}>
            <Text style={styles.missionStatValue}>{pantryItems.length}</Text>
            <Text style={styles.missionStatLabel}>Pantry items</Text>
          </View>
          <View style={styles.missionStat}>
            <Text style={styles.missionStatValue}>{pantryUrgency}</Text>
            <Text style={styles.missionStatLabel}>Use soon</Text>
          </View>
          <View style={styles.missionStat}>
            <Text style={styles.missionStatValue}>{recipes.length}</Text>
            <Text style={styles.missionStatLabel}>Candidates</Text>
          </View>
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map(({ label, emoji }) => (
          <FilterChip
            key={label}
            label={label}
            emoji={emoji}
            selected={activeFilter === label}
            onPress={() => setActiveFilter(label)}
          />
        ))}
      </ScrollView>

      {/* Recipe List */}
      {isLoading ? (
        <ScrollView contentContainerStyle={styles.skeletonList}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </ScrollView>
      ) : (
        <FlatList
          data={recipes ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pantryBanner: {
    backgroundColor: '#F0FFF4', borderRadius: 0, paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#C6F6D5',
  },
  pantryBannerText: { fontSize: 13, fontWeight: '600', color: '#276749' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 22,
    color: colors.text,
    fontWeight: '600',
    lineHeight: 26,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: 8,
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  missionCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#FBF6ED',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7D7C4',
  },
  missionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  missionEyebrow: { fontSize: 11, fontWeight: '800', color: '#8A6846', letterSpacing: 0.8, textTransform: 'uppercase' },
  missionBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2E7D32',
    backgroundColor: '#E7F6EA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  missionTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 6 },
  missionSubtitle: { fontSize: 13, lineHeight: 19, color: colors.textSecondary },
  missionStats: { flexDirection: 'row', marginTop: 14, gap: 10 },
  missionStat: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12 },
  missionStatValue: { fontSize: 20, fontWeight: '900', color: colors.accent, marginBottom: 2 },
  missionStatLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  filterScroll: {
    marginBottom: 8,
    flexGrow: 0,
    flexShrink: 0,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
    flexDirection: 'row',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
    flexGrow: 1,
  },
  skeletonList: {
    padding: 16,
    gap: 12,
  },
  skeletonCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    height: 110,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  skeletonImage: {
    width: 110,
    height: '100%',
    backgroundColor: colors.border,
  },
  skeletonBody: {
    flex: 1,
    padding: 14,
    gap: 10,
    justifyContent: 'center',
  },
  skeletonTitle: {
    height: 14,
    backgroundColor: colors.border,
    borderRadius: 7,
    width: '80%',
  },
  skeletonSub: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    width: '55%',
  },
  skeletonTag: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 5,
    width: '35%',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 54,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default RecipeBrowserScreen;
