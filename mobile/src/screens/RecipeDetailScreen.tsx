import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';

import { RootStackParamList, RecipeWithDetails, Review } from '../types';
import { NutritionGrid } from '../components/NutritionGrid';
import { recipeService } from '../services/recipeService';
import { shoppingService } from '../services/shoppingService';
import { toggleFavorite, type RootState } from '../store';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { radii } from '../theme/radii';
import { typography } from '../theme/typography';
import {
  Badge,
  Button,
  Card,
  Chip,
  ErrorState,
  IconButton,
  Sheet,
  Skeleton,
  useToast,
} from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeDetail'>;
type TabKey = 'Need' | 'Flow' | 'Proof';

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

const stars = (rating: number) =>
  '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

const RecipeDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { recipeId } = route.params;
  const c = useThemeColors();
  const toast = useToast();
  const dispatch = useDispatch();
  const qc = useQueryClient();

  const user = useSelector((s: RootState) => s.auth.user);
  const isFav = useSelector((s: RootState) => s.favorites.ids.includes(recipeId));
  const pantryItems = useSelector((s: RootState) => s.pantry.items);

  const [activeTab, setActiveTab] = useState<TabKey>('Need');
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [servings, setServings] = useState<number | null>(null);

  const [activeTimer, setActiveTimer] = useState<{
    label: string;
    total: number;
    remaining: number;
  } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: recipe, isLoading, isError, refetch } = useQuery<RecipeWithDetails>({
    queryKey: ['recipe', recipeId],
    queryFn: () => recipeService.getById(recipeId),
  });

  const { data: reviews } = useQuery<Review[]>({
    queryKey: ['reviews', recipeId],
    queryFn: () => recipeService.getReviews(recipeId),
    enabled: !!recipe,
  });

  const addToList = useMutation({
    mutationFn: () =>
      shoppingService.generate({
        user_id: user!.id,
        name: `${recipe!.name} — Shopping List`,
        recipe_ids: [recipeId],
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shopping-lists'] });
      toast.show('Added to shopping list', 'success');
    },
    onError: () => toast.show('Could not create list', 'error'),
  });

  const rate = useMutation({
    mutationFn: () =>
      recipeService.rate(recipeId, ratingStars, ratingComment.trim() || undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipe', recipeId] });
      qc.invalidateQueries({ queryKey: ['reviews', recipeId] });
      setRatingOpen(false);
      setRatingComment('');
      toast.show('Thanks — your rating is in', 'success');
    },
    onError: () => toast.show('Failed to submit rating', 'error'),
  });

  const startTimer = (label: string, minutes: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const total = minutes * 60;
    setActiveTimer({ label, total, remaining: total });
    timerRef.current = setInterval(() => {
      setActiveTimer((prev) => {
        if (!prev) return null;
        if (prev.remaining <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          toast.show(`${label} timer done`, 'info');
          return null;
        }
        return { ...prev, remaining: prev.remaining - 1 };
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setActiveTimer(null);
  };

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    []
  );

  const handleAddToList = () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to save shopping lists.');
      return;
    }
    Alert.alert(
      'Create shopping list?',
      `Generate a list with ingredients for "${recipe?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create', onPress: () => addToList.mutate() },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <Skeleton height={220} radius={radii.xl} />
          <Skeleton height={20} width="70%" />
          <Skeleton height={14} width="50%" />
          <Skeleton height={120} radius={radii.lg} />
          <Skeleton height={14} width="80%" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !recipe) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
        <ErrorState
          title="Recipe not found"
          body="We couldn’t load this recipe."
          onRetry={() => refetch()}
        />
        <View style={{ padding: spacing.lg }}>
          <Button label="Go back" variant="secondary" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const cuisineEmoji = CUISINE_EMOJI[recipe.cuisine_type] ?? '🍽️';
  const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;
  const currentServings = servings ?? recipe.servings;
  const servingScale = currentServings / (recipe.servings || 1);

  const pantryNames = pantryItems.map((i) => i.name.toLowerCase());
  const matched = recipe.ingredients.filter((ing) => {
    const n = ing.ingredient_name.toLowerCase();
    return pantryNames.some((name) => n.includes(name) || name.includes(n));
  });
  const pantryCoverage =
    recipe.ingredients.length > 0
      ? Math.round((matched.length / recipe.ingredients.length) * 100)
      : 0;
  const useSoonNames = pantryItems
    .filter((i) => i.expiry_date)
    .filter((i) => {
      const days = Math.ceil(
        (new Date(i.expiry_date!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return days >= 0 && days <= 3;
    })
    .map((i) => i.name.toLowerCase());
  const useSoonMatches = recipe.ingredients.filter((ing) =>
    useSoonNames.some(
      (n) =>
        ing.ingredient_name.toLowerCase().includes(n) ||
        n.includes(ing.ingredient_name.toLowerCase())
    )
  );
  const effort =
    totalTime <= 25 && recipe.difficulty === 'Easy'
      ? 'Fast and forgiving'
      : totalTime <= 40
      ? 'Reasonable weeknight lift'
      : 'Better when you want to cook';
  const fitTone =
    pantryCoverage >= 60
      ? 'High pantry fit'
      : pantryCoverage >= 35
      ? 'Partial pantry fit'
      : 'You’ll need a few unlock items';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: c.primaryMuted }]}>
          <Text style={styles.heroBg}>{cuisineEmoji}</Text>
          <View style={styles.heroOverlayBtns}>
            <IconButton
              icon="‹"
              size={40}
              variant="tinted"
              accessibilityLabel="Go back"
              onPress={() => navigation.goBack()}
            />
            <IconButton
              icon={isFav ? '❤️' : '🤍'}
              size={40}
              variant="tinted"
              accessibilityLabel={isFav ? 'Remove from favorites' : 'Add to favorites'}
              onPress={() => dispatch(toggleFavorite(recipeId))}
            />
          </View>
          <View
            style={[
              styles.heroBottom,
              { backgroundColor: 'rgba(255,255,255,0.94)' },
            ]}
          >
            <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm }}>
              <Badge
                label={recipe.difficulty}
                tone={
                  recipe.difficulty === 'Easy'
                    ? 'success'
                    : recipe.difficulty === 'Medium'
                    ? 'warning'
                    : 'error'
                }
              />
              <Badge label={recipe.cuisine_type} tone="info" />
            </View>
            <Text style={[typography.h2, { color: c.text }]} numberOfLines={2}>
              {recipe.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: 6 }}>
              <Text style={{ fontSize: 14, color: c.warning, letterSpacing: 1 }}>
                {stars(recipe.average_rating)}
              </Text>
              <Text style={[typography.bodySmall, { color: c.textSecondary }]}>
                {recipe.average_rating.toFixed(1)} ({recipe.total_ratings})
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <Card
          surface="surface"
          radius="xl"
          padding="lg"
          elevation="card"
          style={styles.block}
        >
          <View style={{ flexDirection: 'row' }}>
            <Stat icon="⏱" value={`${recipe.prep_time_minutes}m`} label="Prep" />
            <Stat icon="🔥" value={`${recipe.cook_time_minutes}m`} label="Cook" />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <IconButton
                  icon="−"
                  size={28}
                  variant="tinted"
                  accessibilityLabel="Decrease servings"
                  onPress={() => setServings(Math.max(1, currentServings - 1))}
                />
                <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>
                  {currentServings}
                </Text>
                <IconButton
                  icon="+"
                  size={28}
                  variant="tinted"
                  accessibilityLabel="Increase servings"
                  onPress={() => setServings(Math.min(20, currentServings + 1))}
                />
              </View>
              <Text style={[typography.caption, { color: c.textSecondary, fontWeight: '600' }]}>
                Serves
              </Text>
            </View>
          </View>
        </Card>

        {/* Fit card */}
        <Card
          surface="surfaceMuted"
          radius="2xl"
          padding="lg"
          elevation="flat"
          style={styles.block}
        >
          <View style={styles.fitHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.overline, { color: c.textSecondary }]}>Tonight Fit</Text>
              <Text style={[typography.h3, { color: c.text, marginTop: 2 }]}>
                Should this be tonight’s plan?
              </Text>
            </View>
            <Badge label={fitTone} tone={pantryCoverage >= 60 ? 'success' : 'neutral'} size="md" />
          </View>
          <Text
            style={[
              typography.bodySmall,
              { color: c.textSecondary, marginTop: spacing.sm },
            ]}
          >
            {effort}. {matched.length} of {recipe.ingredients.length} ingredients overlap with your
            pantry.
          </Text>
          <View style={styles.fitMetrics}>
            <FitMetric value={`${pantryCoverage}%`} label="Pantry match" />
            <FitMetric value={String(useSoonMatches.length)} label="Use-soon saves" />
            <FitMetric value={`${totalTime}m`} label="Dinner time" />
          </View>
        </Card>

        {/* Nutrition */}
        {recipe.nutrition ? (
          <View style={styles.block}>
            <Text style={[typography.h3, { color: c.text, marginBottom: spacing.md }]}>
              Nutrition per serving
            </Text>
            <NutritionGrid nutrition={recipe.nutrition} />
          </View>
        ) : null}

        {/* Tabs */}
        <View style={[styles.block, { flexDirection: 'row', gap: spacing.sm }]}>
          {(['Need', 'Flow', 'Proof'] as TabKey[]).map((tab) => (
            <Chip
              key={tab}
              label={tab}
              selected={activeTab === tab}
              onPress={() => setActiveTab(tab)}
            />
          ))}
        </View>

        <View style={[styles.block, { gap: spacing.md }]}>
          {activeTab === 'Need' ? (
            <>
              <Text style={[typography.bodySmall, { color: c.textSecondary }]}>
                Check what this dinner needs from you and what your pantry already covers.
              </Text>
              {recipe.ingredients.map((ing) => {
                const isChecked = checked.has(ing.id);
                const inPantry = matched.some((m) => m.id === ing.id);
                return (
                  <Card
                    key={ing.id}
                    onPress={() => {
                      setChecked((prev) => {
                        const next = new Set(prev);
                        if (next.has(ing.id)) next.delete(ing.id);
                        else next.add(ing.id);
                        return next;
                      });
                    }}
                    surface={inPantry ? 'surfaceMuted' : 'surface'}
                    radius="lg"
                    padding="md"
                    elevation="flat"
                    bordered
                    accessibilityLabel={`${ing.ingredient_name}, ${
                      isChecked ? 'checked' : 'unchecked'
                    }`}
                  >
                    <View style={styles.ingRow}>
                      <View
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: isChecked ? c.primary : 'transparent',
                            borderColor: isChecked ? c.primary : c.borderStrong,
                          },
                        ]}
                      >
                        {isChecked ? (
                          <Text style={{ color: c.onPrimary, fontWeight: '800' }}>✓</Text>
                        ) : null}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            typography.body,
                            {
                              color: c.text,
                              textDecorationLine: isChecked ? 'line-through' : 'none',
                              opacity: isChecked ? 0.55 : 1,
                              fontWeight: '600',
                            },
                          ]}
                        >
                          {ing.ingredient_name}
                        </Text>
                        {ing.notes ? (
                          <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}>
                            {ing.notes}
                          </Text>
                        ) : null}
                      </View>
                      {inPantry ? <Badge label="IN" tone="success" /> : null}
                      <Text style={[typography.bodySmall, { color: c.textSecondary, fontWeight: '600' }]}>
                        {ing.quantity != null
                          ? `${+(ing.quantity * servingScale).toFixed(1)} ${ing.unit}`
                          : ing.unit}
                      </Text>
                    </View>
                  </Card>
                );
              })}
            </>
          ) : null}

          {activeTab === 'Flow' ? (
            <>
              <Text style={[typography.bodySmall, { color: c.textSecondary }]}>
                Move step by step. Time anything that can drift.
              </Text>
              {recipe.instructions.map((step) => (
                <Card
                  key={step.step_number}
                  surface="surface"
                  radius="lg"
                  padding="lg"
                  elevation="flat"
                  bordered
                >
                  <View style={{ flexDirection: 'row', gap: spacing.md }}>
                    <View
                      style={[
                        styles.stepNum,
                        { backgroundColor: c.primary },
                      ]}
                    >
                      <Text style={{ color: c.onPrimary, fontWeight: '800' }}>
                        {step.step_number}
                      </Text>
                    </View>
                    <View style={{ flex: 1, gap: spacing.sm }}>
                      <Text style={[typography.body, { color: c.text, fontSize: 15 }]}>
                        {step.instruction}
                      </Text>
                      {step.time_minutes ? (
                        <Chip
                          label={`⏱ ${step.time_minutes} min — tap to time`}
                          onPress={() => startTimer(`Step ${step.step_number}`, step.time_minutes!)}
                        />
                      ) : null}
                    </View>
                  </View>
                </Card>
              ))}
            </>
          ) : null}

          {activeTab === 'Proof' ? (
            <>
              <Button
                label="⭐  Leave a rating"
                variant="secondary"
                onPress={() => setRatingOpen(true)}
                fullWidth
              />
              {reviews && reviews.length > 0 ? (
                reviews.map((rev) => (
                  <Card
                    key={rev.id}
                    surface="surface"
                    radius="lg"
                    padding="lg"
                    elevation="flat"
                    bordered
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: spacing.xs,
                      }}
                    >
                      <Text style={[typography.h4, { color: c.text }]}>{rev.user_name}</Text>
                      <Text style={[typography.caption, { color: c.textLight }]}>
                        {formatDate(rev.created_at)}
                      </Text>
                    </View>
                    <Text style={{ color: c.warning, letterSpacing: 1, marginBottom: spacing.xs }}>
                      {stars(rev.rating)}
                    </Text>
                    {rev.comment ? (
                      <Text style={[typography.body, { color: c.text }]}>{rev.comment}</Text>
                    ) : null}
                  </Card>
                ))
              ) : (
                <Card
                  surface="surfaceMuted"
                  radius="lg"
                  padding="2xl"
                  elevation="flat"
                  style={{ alignItems: 'center', gap: spacing.sm }}
                >
                  <Text style={{ fontSize: 32 }}>💬</Text>
                  <Text style={[typography.h4, { color: c.text }]}>No reviews yet</Text>
                  <Text style={[typography.bodySmall, { color: c.textSecondary }]}>
                    Be the first to review this recipe.
                  </Text>
                </Card>
              )}
            </>
          ) : null}
        </View>
      </ScrollView>

      {/* Floating timer */}
      {activeTimer ? (
        <View
          style={[
            styles.timer,
            {
              backgroundColor: c.surfaceInverse,
              shadowColor: '#000',
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.background, fontSize: 12, fontWeight: '700' }}>
              {activeTimer.label}
            </Text>
            <Text style={{ color: c.background, fontSize: 22, fontWeight: '800', marginTop: 2 }}>
              {String(Math.floor(activeTimer.remaining / 60)).padStart(2, '0')}:
              {String(activeTimer.remaining % 60).padStart(2, '0')}
            </Text>
          </View>
          <IconButton
            icon="✕"
            size={32}
            accessibilityLabel="Stop timer"
            onPress={stopTimer}
          />
        </View>
      ) : null}

      {/* Sticky bottom bar */}
      <View
        style={[
          styles.stickyBar,
          { backgroundColor: c.background, borderTopColor: c.border },
        ]}
      >
        <Button
          label="Run Dinner Flow 👨‍🍳"
          onPress={() => navigation.navigate('CookingMode', { recipeId })}
          fullWidth
          size="lg"
          style={{ flex: 1 }}
        />
        <Button
          label="🛒 Unlock"
          onPress={handleAddToList}
          loading={addToList.isPending}
          variant="secondary"
          size="lg"
        />
      </View>

      {/* Rating sheet */}
      <Sheet visible={ratingOpen} onClose={() => setRatingOpen(false)} title="Was this worth tonight?">
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.sm }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Text
              key={s}
              accessibilityRole="button"
              accessibilityLabel={`${s} stars`}
              onPress={() => setRatingStars(s)}
              style={{ fontSize: 36, color: s <= ratingStars ? c.warning : c.borderStrong }}
            >
              {s <= ratingStars ? '★' : '☆'}
            </Text>
          ))}
        </View>
        <TextInput
          value={ratingComment}
          onChangeText={setRatingComment}
          placeholder="Add a comment (optional)"
          placeholderTextColor={c.textLight}
          multiline
          textAlignVertical="top"
          style={[
            styles.commentInput,
            {
              borderColor: c.border,
              color: c.text,
              backgroundColor: c.surface,
            },
          ]}
        />
        <Button
          label="Save rating"
          onPress={() => rate.mutate()}
          loading={rate.isPending}
          fullWidth
          size="lg"
          style={{ marginTop: spacing.md }}
        />
        <Button
          label="Cancel"
          variant="ghost"
          onPress={() => setRatingOpen(false)}
          fullWidth
          style={{ marginTop: spacing.xs }}
        />
      </Sheet>
    </SafeAreaView>
  );
};

function Stat({ icon, value, label }: { icon: string; value: string; label: string }) {
  const c = useThemeColors();
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>{value}</Text>
      <Text style={{ fontSize: 12, color: c.textSecondary, fontWeight: '500' }}>{label}</Text>
    </View>
  );
}

function FitMetric({ value, label }: { value: string; label: string }) {
  const c = useThemeColors();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.surface,
        borderRadius: 14,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: '800', color: c.text }}>{value}</Text>
      <Text
        style={[typography.caption, { color: c.textSecondary, marginTop: 2, fontWeight: '600' }]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: { height: 240, position: 'relative', overflow: 'hidden' },
  heroBg: {
    position: 'absolute',
    fontSize: 140,
    opacity: 0.22,
    alignSelf: 'center',
    top: 30,
  },
  heroOverlayBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  heroBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
  },
  block: { marginHorizontal: spacing.lg, marginTop: spacing.lg },
  fitHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  fitMetrics: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  ingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    gap: spacing.md,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  commentInput: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    fontSize: 15,
  },
});

export default RecipeDetailScreen;
