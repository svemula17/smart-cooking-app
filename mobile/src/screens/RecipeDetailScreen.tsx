import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootStackParamList, RecipeWithDetails, Review } from '../types';
import { NutritionGrid } from '../components/NutritionGrid';
import { recipeService } from '../services/recipeService';
import { shoppingService } from '../services/shoppingService';
import { colors } from '../theme/colors';
import type { RootState } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeDetail'>;

const { width } = Dimensions.get('window');
void width;

const CUISINE_EMOJI: Record<string, string> = {
  Indian: '🍛',
  Chinese: '🥢',
  'Indo-Chinese': '🍜',
  Italian: '🍝',
  Mexican: '🌮',
  Thai: '🍜',
  Japanese: '🍱',
  Mediterranean: '🫒',
  American: '🍔',
  French: '🥐',
};

const DIFFICULTY_STYLE: Record<string, { bg: string; text: string }> = {
  Easy: { bg: colors.easy, text: colors.easyText },
  Medium: { bg: colors.medium, text: colors.mediumText },
  Hard: { bg: colors.hard, text: colors.hardText },
};

const renderStars = (rating: number): string => {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
};

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
};

type TabKey = 'Ingredients' | 'Steps' | 'Reviews';

const RecipeDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { recipeId } = route.params;
  const [activeTab, setActiveTab] = useState<TabKey>('Ingredients');
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const user = useSelector((s: RootState) => s.auth.user);
  const qc = useQueryClient();

  const { data: recipe, isLoading, isError } = useQuery<RecipeWithDetails>({
    queryKey: ['recipe', recipeId],
    queryFn: () => recipeService.getById(recipeId),
  });

  const { data: reviews } = useQuery<Review[]>({
    queryKey: ['reviews', recipeId],
    queryFn: () => recipeService.getReviews(recipeId),
    enabled: !!recipe,
  });

  const addToListMutation = useMutation({
    mutationFn: () =>
      shoppingService.generate({
        user_id: user!.id,
        name: `${recipe!.name} — Shopping List`,
        recipe_ids: [recipeId],
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shopping-lists'] });
      Alert.alert('✅ Added to Shopping', `Shopping list for "${recipe?.name}" created!`, [{ text: 'OK' }]);
    },
    onError: () => Alert.alert('Error', 'Failed to create shopping list. Please try again.'),
  });

  const handleAddToList = () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to save shopping lists.');
      return;
    }
    Alert.alert(
      'Add to Shopping List?',
      `Create a shopping list with ingredients for "${recipe?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create List', onPress: () => addToListMutation.mutate() },
      ],
    );
  };

  const toggleIngredient = (id: string) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.skeletonHero} />
        <View style={styles.skeletonBody}>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, { width: '55%' }]} />
          <View style={[styles.skeletonLine, { width: '70%', marginTop: 20 }]} />
          <View style={[styles.skeletonLine, { width: '45%' }]} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !recipe) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorTitle}>Recipe not found</Text>
          <TouchableOpacity style={styles.errorBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.errorBtnText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const cuisineEmoji = CUISINE_EMOJI[recipe.cuisine_type] ?? '🍽️';
  const diffStyle = DIFFICULTY_STYLE[recipe.difficulty] ?? DIFFICULTY_STYLE.Easy;
  const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroGradient}>
            <Text style={styles.heroBgEmoji}>{cuisineEmoji}</Text>
          </View>

          {/* Back button overlaid */}
          <TouchableOpacity style={styles.heroBackBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.heroBackText}>←</Text>
          </TouchableOpacity>

          {/* Overlay info */}
          <View style={styles.heroOverlay}>
            <View style={styles.heroBadgeRow}>
              <View style={[styles.badge, { backgroundColor: diffStyle.bg }]}>
                <Text style={[styles.badgeText, { color: diffStyle.text }]}>{recipe.difficulty}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.85)' }]}>
                <Text style={[styles.badgeText, { color: colors.accent }]}>{recipe.cuisine_type}</Text>
              </View>
            </View>
            <Text style={styles.heroTitle} numberOfLines={2}>{recipe.name}</Text>
            <View style={styles.heroRatingRow}>
              <Text style={styles.heroStars}>{renderStars(recipe.average_rating)}</Text>
              <Text style={styles.heroRatingText}>
                {recipe.average_rating.toFixed(1)} ({recipe.total_ratings})
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { icon: '⏱', label: 'Prep', value: `${recipe.prep_time_minutes}m` },
            { icon: '🔥', label: 'Cook', value: `${recipe.cook_time_minutes}m` },
            { icon: '👥', label: 'Serves', value: `${recipe.servings}` },
          ].map(({ icon, label, value }) => (
            <View key={label} style={styles.statItem}>
              <Text style={styles.statIcon}>{icon}</Text>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Nutrition */}
        {recipe.nutrition && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nutrition per serving</Text>
            <NutritionGrid nutrition={recipe.nutrition} />
          </View>
        )}

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {(['Ingredients', 'Steps', 'Reviews'] as TabKey[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'Ingredients' && (
            <View style={styles.ingredientList}>
              {recipe.ingredients.map((ing) => {
                const checked = checkedIngredients.has(ing.id);
                return (
                  <TouchableOpacity
                    key={ing.id}
                    style={styles.ingredientRow}
                    onPress={() => toggleIngredient(ing.id)}
                  >
                    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                      {checked && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <View style={styles.ingredientInfo}>
                      <Text style={[styles.ingredientName, checked && styles.ingredientNameDone]}>
                        {ing.ingredient_name}
                      </Text>
                      {ing.notes ? (
                        <Text style={styles.ingredientNotes}>{ing.notes}</Text>
                      ) : null}
                    </View>
                    <Text style={styles.ingredientQty}>
                      {ing.quantity} {ing.unit}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {activeTab === 'Steps' && (
            <View style={styles.stepList}>
              {recipe.instructions.map((step) => (
                <View key={step.step_number} style={styles.stepRow}>
                  <View style={styles.stepNumberCircle}>
                    <Text style={styles.stepNumber}>{step.step_number}</Text>
                  </View>
                  <View style={styles.stepBody}>
                    <Text style={styles.stepInstruction}>{step.instruction}</Text>
                    {step.time_minutes ? (
                      <View style={styles.stepTimeBadge}>
                        <Text style={styles.stepTimeText}>⏱ {step.time_minutes} min</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'Reviews' && (
            <View style={styles.reviewList}>
              {reviews && reviews.length > 0 ? (
                reviews.map((rev) => (
                  <View key={rev.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewUser}>{rev.user_name}</Text>
                      <Text style={styles.reviewDate}>{formatDate(rev.created_at)}</Text>
                    </View>
                    <Text style={styles.reviewStars}>{renderStars(rev.rating)}</Text>
                    {rev.comment ? (
                      <Text style={styles.reviewComment}>{rev.comment}</Text>
                    ) : null}
                  </View>
                ))
              ) : (
                <View style={styles.noReviews}>
                  <Text style={styles.noReviewsEmoji}>💬</Text>
                  <Text style={styles.noReviewsText}>No reviews yet</Text>
                  <Text style={styles.noReviewsSub}>Be the first to review this recipe!</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Bottom padding for sticky bar */}
        <View style={{ height: 96 }} />
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.stickyBar}>
        <TouchableOpacity
          style={styles.cookBtn}
          onPress={() => navigation.navigate('CookingMode', { recipeId })}
        >
          <Text style={styles.cookBtnText}>Start Cooking 👨‍🍳</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.listBtn, addToListMutation.isPending && styles.listBtnLoading]}
          onPress={handleAddToList}
          disabled={addToListMutation.isPending}
        >
          {addToListMutation.isPending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.listBtnText}>🛒 Add to List</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  // Hero
  hero: {
    height: 240,
    position: 'relative',
    overflow: 'hidden',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBgEmoji: {
    fontSize: 120,
    opacity: 0.25,
  },
  heroBackBtn: {
    position: 'absolute',
    top: 14,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroBackText: {
    fontSize: 22,
    color: colors.text,
    fontWeight: '700',
    lineHeight: 26,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
    lineHeight: 28,
  },
  heroRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroStars: {
    fontSize: 14,
    color: '#F9A825',
    letterSpacing: 1,
  },
  heroRatingText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  // Section
  section: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  // Tabs
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 11,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabContent: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  // Ingredients
  ingredientList: {
    gap: 2,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  ingredientNameDone: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  ingredientNotes: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ingredientQty: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  // Steps
  stepList: {
    gap: 16,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 14,
  },
  stepNumberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepBody: {
    flex: 1,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  stepInstruction: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  stepTimeBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.secondary + 'AA',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  stepTimeText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  // Reviews
  reviewList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  reviewStars: {
    fontSize: 14,
    color: '#F9A825',
    letterSpacing: 1,
    marginBottom: 6,
  },
  reviewComment: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  noReviews: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noReviewsEmoji: {
    fontSize: 44,
    marginBottom: 12,
  },
  noReviewsText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  noReviewsSub: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  // Sticky Bar
  stickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  cookBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  cookBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listBtn: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  listBtnLoading: { opacity: 0.6 },
  listBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  // Skeleton
  skeletonHero: {
    height: 240,
    backgroundColor: colors.surface,
  },
  skeletonBody: {
    padding: 20,
    gap: 12,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: colors.border,
    borderRadius: 8,
    width: '90%',
  },
  // Error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorEmoji: {
    fontSize: 54,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
  },
  errorBtn: {
    backgroundColor: colors.primaryLight,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  errorBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default RecipeDetailScreen;
