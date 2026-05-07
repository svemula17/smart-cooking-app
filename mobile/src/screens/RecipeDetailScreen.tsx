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
  Modal,
  TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { RootStackParamList, RecipeWithDetails, Review } from '../types';
import { NutritionGrid } from '../components/NutritionGrid';
import { recipeService } from '../services/recipeService';
import { shoppingService } from '../services/shoppingService';
import { colors } from '../theme/colors';
import { toggleFavorite, addRecentlyViewed, type RootState } from '../store';

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
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedStars, setSelectedStars] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [servings, setServings] = useState<number | null>(null);
  const [activeTimer, setActiveTimer] = useState<{ label: string; total: number; remaining: number; running: boolean } | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user);
  const isFav = useSelector((s: RootState) => s.favorites.ids.includes(recipeId));
  const qc = useQueryClient();

  const { data: recipe, isLoading, isError } = useQuery<RecipeWithDetails>({
    queryKey: ['recipe', recipeId],
    queryFn: async () => {
      const r = await recipeService.getById(recipeId);
      dispatch(addRecentlyViewed(recipeId));
      return r;
    },
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

  // Step timer logic
  function startTimer(label: string, minutes: number) {
    if (timerRef.current) clearInterval(timerRef.current);
    const total = minutes * 60;
    setActiveTimer({ label, total, remaining: total, running: true });
    timerRef.current = setInterval(() => {
      setActiveTimer((prev) => {
        if (!prev) return null;
        if (prev.remaining <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          Alert.alert('⏱ Timer Done!', `${label} is complete!`);
          return null;
        }
        return { ...prev, remaining: prev.remaining - 1 };
      });
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setActiveTimer(null);
  }

  React.useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const rateMutation = useMutation({
    mutationFn: () => recipeService.rate(recipeId, selectedStars, reviewComment.trim() || undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipe', recipeId] });
      qc.invalidateQueries({ queryKey: ['reviews', recipeId] });
      setRatingModalVisible(false);
      setReviewComment('');
      Alert.alert('Thanks!', 'Your rating has been submitted.');
    },
    onError: () => Alert.alert('Error', 'Failed to submit rating. Try again.'),
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
  const currentServings = servings ?? recipe.servings;
  const servingScale = currentServings / (recipe.servings || 1);

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

          {/* Favorite button */}
          <TouchableOpacity style={styles.heroFavBtn} onPress={() => dispatch(toggleFavorite(recipeId))}>
            <Text style={styles.heroFavIcon}>{isFav ? '❤️' : '🤍'}</Text>
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
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⏱</Text>
            <Text style={styles.statValue}>{recipe.prep_time_minutes}m</Text>
            <Text style={styles.statLabel}>Prep</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>{recipe.cook_time_minutes}m</Text>
            <Text style={styles.statLabel}>Cook</Text>
          </View>
          {/* Serving adjuster */}
          <View style={styles.statItem}>
            <View style={styles.servingRow}>
              <TouchableOpacity
                style={styles.servingBtn}
                onPress={() => setServings(Math.max(1, currentServings - 1))}
              >
                <Text style={styles.servingBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.statValue}>{currentServings}</Text>
              <TouchableOpacity
                style={styles.servingBtn}
                onPress={() => setServings(Math.min(20, currentServings + 1))}
              >
                <Text style={styles.servingBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.statLabel}>Serves</Text>
          </View>
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
                      {ing.quantity != null
                        ? `${+(ing.quantity * servingScale).toFixed(1)} ${ing.unit}`
                        : ing.unit}
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
                      <TouchableOpacity
                        style={styles.stepTimeBadge}
                        onPress={() => startTimer(`Step ${step.step_number}`, step.time_minutes!)}
                      >
                        <Text style={styles.stepTimeText}>⏱ {step.time_minutes} min — tap to time</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'Reviews' && (
            <View style={styles.reviewList}>
              <TouchableOpacity style={styles.rateBtn} onPress={() => setRatingModalVisible(true)}>
                <Text style={styles.rateBtnText}>⭐ Rate this Recipe</Text>
              </TouchableOpacity>
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

      {/* Floating Step Timer */}
      {activeTimer && (
        <View style={styles.timerBanner}>
          <View style={styles.timerInfo}>
            <Text style={styles.timerLabel}>{activeTimer.label}</Text>
            <Text style={styles.timerValue}>
              {String(Math.floor(activeTimer.remaining / 60)).padStart(2, '0')}:
              {String(activeTimer.remaining % 60).padStart(2, '0')}
            </Text>
          </View>
          <TouchableOpacity style={styles.timerStopBtn} onPress={stopTimer}>
            <Text style={styles.timerStopText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Rating Modal */}
      <Modal visible={ratingModalVisible} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Rate this Recipe</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setSelectedStars(s)}>
                  <Text style={styles.starBtn}>{s <= selectedStars ? '★' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment (optional)"
              placeholderTextColor={colors.textLight}
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.submitBtn, rateMutation.isPending && { opacity: 0.6 }]}
              onPress={() => rateMutation.mutate()}
              disabled={rateMutation.isPending}
            >
              {rateMutation.isPending
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitBtnText}>Submit Rating</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setRatingModalVisible(false)}>
              <Text style={styles.cancelModalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  servingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  servingBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 20,
  },
  timerBanner: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  timerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timerLabel: { fontSize: 14, fontWeight: '600', color: '#fff' },
  timerValue: { fontSize: 22, fontWeight: '800', color: '#fff', fontVariant: ['tabular-nums'] },
  timerStopBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  timerStopText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  heroFavBtn: {
    position: 'absolute',
    top: 14,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroFavIcon: { fontSize: 20 },
  rateBtn: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  rateBtnText: { fontSize: 15, fontWeight: '700', color: colors.primary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 48 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 20, textAlign: 'center' },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  starBtn: { fontSize: 36, color: '#F9A825' },
  commentInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: colors.text, marginBottom: 16, minHeight: 80 },
  submitBtn: { backgroundColor: colors.primary, borderRadius: 24, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelModalBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelModalText: { color: colors.textSecondary, fontSize: 15 },
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
