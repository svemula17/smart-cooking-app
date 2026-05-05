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
import { RootStackParamList, Recipe } from '../types';
import { RecipeCard } from '../components/RecipeCard';
import { FilterChip } from '../components/FilterChip';
import { recipeService } from '../services/recipeService';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeBrowser'>;

const FILTERS = [
  { label: 'All', emoji: '✨' },
  { label: 'High Protein', emoji: '💪' },
  { label: 'Under 30min', emoji: '⏱' },
  { label: 'Easy', emoji: '😊' },
  { label: 'Vegan', emoji: '🌱' },
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
  const { cuisine } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedQuery(text), 400);
  }, []);

  const isDefaultView = cuisine !== 'all' && !debouncedQuery && activeFilter === 'All';

  const { data: recipesData, isLoading } = useQuery({
    queryKey: ['recipes', cuisine, debouncedQuery, activeFilter],
    queryFn: async () => {
      if (isDefaultView) {
        return recipeService.getByCuisine(cuisine, { limit: 30 });
      }
      return recipeService.search({
        q: debouncedQuery || undefined,
        cuisine_type: cuisine !== 'all' ? cuisine : undefined,
        difficulty: activeFilter === 'Easy' ? 'Easy' : undefined,
      });
    },
  });
  const recipes: Recipe[] = recipesData?.recipes ?? [];

  const headerTitle = cuisine === 'all' ? 'All Recipes' : `${cuisine} Recipes`;

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
          placeholder="Search recipes..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
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
    maxHeight: 52,
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
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
