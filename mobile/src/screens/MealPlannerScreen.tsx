import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { mealPlanService } from '../services/mealPlanService';
import { shoppingService } from '../services/shoppingService';
import { scheduleMealReminders } from '../services/reminderService';
import { recipeService } from '../services/recipeService';
import { getRecipeImage } from '../utils/recipeImages';
import type { MealPlan, MealType, Recipe } from '../types';
import type { RootState } from '../store';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { radii } from '../theme/radii';
import { typography } from '../theme/typography';
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  Sheet,
  Skeleton,
  useToast,
} from '../components/ui';

function getWeekDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split('T')[0]!);
  }
  return dates;
}

function formatDayHeader(dateStr: string, index: number): { line1: string; line2: string } {
  const date = new Date(dateStr + 'T12:00:00');
  const day = date.toLocaleDateString('en-US', { weekday: 'long' });
  const mon = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return { line1: index === 0 ? 'Today' : day, line2: mon };
}

const MEAL_CONFIG: Record<MealType, { label: string; emoji: string }> = {
  breakfast: { label: 'Breakfast', emoji: '🌅' },
  lunch: { label: 'Lunch', emoji: '☀️' },
  dinner: { label: 'Dinner', emoji: '🌙' },
};

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];

function MacroBar({
  label,
  value,
  goal,
  color,
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
}) {
  const c = useThemeColors();
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  return (
    <View style={macroStyles.row}>
      <Text style={[typography.caption, { color: c.textSecondary, width: 48 }]}>{label}</Text>
      <View style={[macroStyles.track, { backgroundColor: c.surfaceMuted }]}>
        <View style={[macroStyles.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text
        style={{
          fontSize: 11,
          color: c.text,
          fontWeight: '700',
          width: 32,
          textAlign: 'right',
        }}
      >
        {Math.round(value)}
      </Text>
    </View>
  );
}

const macroStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  track: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});

function MealSlot({
  plan,
  mealType,
  onAdd,
  onRemove,
}: {
  plan: MealPlan | undefined;
  mealType: MealType;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const c = useThemeColors();
  const { emoji, label } = MEAL_CONFIG[mealType];
  const hasPrep = plan?.recipe.prep_instructions
    ? Object.values(plan.recipe.prep_instructions).some((p) => p?.required)
    : false;

  return (
    <View style={{ marginBottom: spacing.sm }}>
      <View style={styles.slotHeader}>
        <Text style={{ fontSize: 16 }}>{emoji}</Text>
        <Text style={[typography.label, { color: c.textSecondary, fontWeight: '700', flex: 1 }]}>
          {label}
        </Text>
        {hasPrep ? <Badge label="PREP" tone="warning" /> : null}
      </View>

      {plan ? (
        <Card
          surface="surface"
          radius="lg"
          padding="none"
          elevation="flat"
          bordered
          onPress={() =>
            Alert.alert(plan.recipe.name, 'What would you like to do?', [
              { text: 'Remove', style: 'destructive', onPress: () => onRemove(plan.id) },
              { text: 'Cancel', style: 'cancel' },
            ])
          }
          accessibilityLabel={`${label}: ${plan.recipe.name}. Tap to manage.`}
        >
          <View style={styles.filledSlot}>
            {getRecipeImage(plan.recipe.name) ? (
              <Image
                source={getRecipeImage(plan.recipe.name)!}
                style={styles.recipeThumb}
              />
            ) : (
              <View style={[styles.recipeThumb, { backgroundColor: c.surfaceMuted, alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ fontSize: 24 }}>🍽️</Text>
              </View>
            )}
            <View style={styles.recipeInfo}>
              <Text style={[typography.h4, { color: c.text }]} numberOfLines={1}>
                {plan.recipe.name}
              </Text>
              {plan.recipe.nutrition ? (
                <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}>
                  {plan.recipe.nutrition.calories} cal · {plan.recipe.nutrition.protein_g}g protein
                </Text>
              ) : null}
            </View>
          </View>
        </Card>
      ) : (
        <Card
          surface="surface"
          radius="lg"
          padding="md"
          elevation="flat"
          onPress={onAdd}
          style={[styles.emptySlot, { borderColor: c.border }]}
          accessibilityLabel={`Add ${label}`}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Text style={{ fontSize: 20, color: c.primary, fontWeight: '300' }}>＋</Text>
            <Text style={{ fontSize: 13, color: c.primary, fontWeight: '700' }}>Add Recipe</Text>
          </View>
        </Card>
      )}
    </View>
  );
}

function DayCard({
  dateStr,
  index,
  plans,
  goals,
  onAdd,
  onRemove,
}: {
  dateStr: string;
  index: number;
  plans: MealPlan[];
  goals: { calories: number; protein: number; carbs: number; fat: number };
  onAdd: (date: string, mealType: MealType) => void;
  onRemove: (id: string) => void;
}) {
  const c = useThemeColors();
  const head = formatDayHeader(dateStr, index);
  const plansByType = Object.fromEntries(plans.map((p) => [p.meal_type, p])) as Record<
    MealType,
    MealPlan | undefined
  >;
  const totals = plans.reduce(
    (acc, p) => {
      if (p.recipe.nutrition) {
        acc.calories += p.recipe.nutrition.calories;
        acc.protein += p.recipe.nutrition.protein_g;
        acc.carbs += p.recipe.nutrition.carbs_g;
        acc.fat += p.recipe.nutrition.fat_g;
      }
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  const adherencePct = goals.calories > 0 ? (totals.calories / goals.calories) * 100 : 0;
  const goalMet = adherencePct >= 80;

  return (
    <Card
      surface="surface"
      radius="2xl"
      padding="lg"
      elevation="card"
      style={{ marginBottom: spacing.lg }}
    >
      <View style={styles.dayHeader}>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              typography.h3,
              { color: index === 0 ? c.primary : c.text },
            ]}
          >
            {head.line1}
          </Text>
          <Text style={[typography.caption, { color: c.textSecondary }]}>{head.line2}</Text>
        </View>
        {goalMet && plans.length > 0 ? <Badge label="GOAL" tone="success" /> : null}
      </View>

      {MEAL_TYPES.map((mt) => (
        <MealSlot
          key={mt}
          mealType={mt}
          plan={plansByType[mt]}
          onAdd={() => onAdd(dateStr, mt)}
          onRemove={onRemove}
        />
      ))}

      {plans.length > 0 ? (
        <View style={[styles.totalsSection, { borderTopColor: c.border }]}>
          <Text
            style={[typography.overline, { color: c.textSecondary, marginBottom: spacing.sm }]}
          >
            Daily totals
          </Text>
          <MacroBar label="Cal" value={totals.calories} goal={goals.calories} color={c.calories} />
          <MacroBar label="Protein" value={totals.protein} goal={goals.protein} color={c.protein} />
          <MacroBar label="Carbs" value={totals.carbs} goal={goals.carbs} color={c.carbs} />
          <MacroBar label="Fat" value={totals.fat} goal={goals.fat} color={c.fat} />
          <Text
            style={[
              typography.caption,
              { color: c.textSecondary, marginTop: spacing.xs, textAlign: 'right' },
            ]}
          >
            {Math.round(adherencePct)}% of goal
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

function suitableFor(mealType: MealType, prep: number, cook: number): boolean {
  const total = (prep ?? 0) + (cook ?? 0);
  if (mealType === 'breakfast') return total <= 30;
  if (mealType === 'lunch') return total <= 60;
  return true;
}

function RecipeSelectSheet({
  visible,
  date,
  mealType,
  onSelect,
  onClose,
}: {
  visible: boolean;
  date: string | undefined;
  mealType: MealType | undefined;
  onSelect: (recipeId: string) => void;
  onClose: () => void;
}) {
  const c = useThemeColors();
  const { data, isLoading } = useQuery({
    queryKey: ['recipes-all'],
    queryFn: () => recipeService.getRecipes({ limit: 100 }),
    enabled: visible,
  });
  const allRecipes: Recipe[] = data?.recipes ?? [];
  const recipes = mealType
    ? allRecipes.filter((r) => suitableFor(mealType, r.prep_time_minutes, r.cook_time_minutes))
    : allRecipes;

  const cfg = mealType ? MEAL_CONFIG[mealType] : null;

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={cfg ? `Choose for ${cfg.label}` : 'Choose recipe'}
      height={650}
    >
      <Text style={[typography.bodySmall, { color: c.textSecondary, marginBottom: spacing.md }]}>
        {date}{recipes.length > 0 ? ` · ${recipes.length} recipes` : ''}
      </Text>
      {isLoading ? (
        <View style={{ gap: spacing.sm }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={64} radius={radii.md} />
          ))}
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(r) => r.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing['3xl'] }}
          ItemSeparatorComponent={() => (
            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.border }} />
          )}
          renderItem={({ item }) => (
            <View style={styles.selectRow}>
              {getRecipeImage(item.name) ? (
                <Image source={getRecipeImage(item.name)!} style={styles.selectThumb} />
              ) : (
                <View style={[styles.selectThumb, { backgroundColor: c.surfaceMuted, alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ fontSize: 20 }}>🍽️</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={[typography.h4, { color: c.text }]}>{item.name}</Text>
                <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}>
                  {item.cuisine_type} · {item.prep_time_minutes + item.cook_time_minutes}m
                </Text>
              </View>
              <Button label="Add" size="sm" onPress={() => onSelect(item.id)} />
            </View>
          )}
        />
      )}
    </Sheet>
  );
}

export function MealPlannerScreen(): React.JSX.Element {
  const c = useThemeColors();
  const toast = useToast();
  const user = useSelector((s: RootState) => s.auth.user);
  const prefs = useSelector((s: RootState) => s.user.preferences);
  const house = useSelector((s: RootState) => s.house.house);
  const [houseMode, setHouseMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selecting, setSelecting] = useState<{ date: string; mealType: MealType } | null>(null);
  const qc = useQueryClient();

  const weekDates = getWeekDates();
  const startDate = weekDates[0]!;

  const goals = {
    calories: prefs?.calories_goal ?? 2000,
    protein: prefs?.protein_goal ?? 150,
    carbs: prefs?.carbs_goal ?? 250,
    fat: prefs?.fat_goal ?? 65,
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['meal-plans', user?.id, startDate],
    queryFn: () => mealPlanService.getWeekPlan(user!.id, startDate, 7),
    enabled: !!user?.id,
  });

  useFocusEffect(
    useCallback(() => {
      if (user?.id) refetch();
    }, [user?.id, refetch])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const scheduleMutation = useMutation({
    mutationFn: ({
      date,
      mealType,
      recipeId,
    }: {
      date: string;
      mealType: MealType;
      recipeId: string;
    }) =>
      mealPlanService.schedule({
        user_id: user!.id,
        recipe_id: recipeId,
        scheduled_date: date,
        meal_type: mealType,
      }),
    onSuccess: async ({ meal_plan }) => {
      qc.invalidateQueries({ queryKey: ['meal-plans'] });
      toast.show('Added to plan', 'success');
      await scheduleMealReminders(meal_plan).catch(() => {});
    },
    onError: () => toast.show('Could not add recipe', 'error'),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => mealPlanService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meal-plans'] });
      toast.show('Removed', 'info');
    },
    onError: () => toast.show('Could not remove', 'error'),
  });

  const generateList = useMutation({
    mutationFn: (recipeIds: string[]) =>
      shoppingService.generate({
        user_id: user!.id,
        name: `Week of ${startDate}`,
        recipe_ids: recipeIds,
      }),
    onSuccess: () => toast.show('Shopping list created', 'success'),
    onError: () => toast.show('Could not generate list', 'error'),
  });

  const plans: MealPlan[] = data?.meal_plans ?? [];
  const plansByDate = weekDates.reduce<Record<string, MealPlan[]>>((acc, d) => {
    acc[d] = plans.filter((p) => p.scheduled_date === d);
    return acc;
  }, {});

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.h1, { color: c.text }]}>
            {houseMode ? 'House plan' : 'Meal plan'}
          </Text>
          <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}>
            Next 7 days
          </Text>
        </View>
        {house ? (
          <Chip
            label={houseMode ? '🏠 House' : '👤 Personal'}
            selected={houseMode}
            onPress={() => setHouseMode((v) => !v)}
          />
        ) : null}
        {plans.length > 0 ? (
          <Button
            label="🛒"
            size="sm"
            loading={generateList.isPending}
            onPress={() => {
              const recipeIds = [...new Set(plans.map((p) => p.recipe_id))];
              generateList.mutate(recipeIds);
            }}
          />
        ) : null}
      </View>

      {!user ? (
        <EmptyState
          icon="🔒"
          title="Sign in to plan meals"
          body="Save and reuse meal plans across the week."
        />
      ) : isLoading ? (
        <View style={{ padding: spacing.lg, gap: spacing.lg }}>
          <Skeleton height={120} radius={radii.xl} />
          <Skeleton height={120} radius={radii.xl} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />
          }
        >
          {weekDates.map((d, i) => (
            <DayCard
              key={d}
              dateStr={d}
              index={i}
              plans={plansByDate[d] ?? []}
              goals={goals}
              onAdd={(date, mealType) => setSelecting({ date, mealType })}
              onRemove={(id) => removeMutation.mutate(id)}
            />
          ))}
        </ScrollView>
      )}

      <RecipeSelectSheet
        visible={!!selecting}
        date={selecting?.date}
        mealType={selecting?.mealType}
        onClose={() => setSelecting(null)}
        onSelect={(recipeId) => {
          if (!selecting) return;
          scheduleMutation.mutate({
            date: selecting.date,
            mealType: selecting.mealType,
            recipeId,
          });
          setSelecting(null);
        }}
      />
    </SafeAreaView>
  );
}

export default MealPlannerScreen;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'] },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  filledSlot: { flexDirection: 'row', alignItems: 'center' },
  recipeThumb: { width: 68, height: 68, borderTopLeftRadius: radii.lg, borderBottomLeftRadius: radii.lg },
  recipeInfo: { flex: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  emptySlot: { borderStyle: 'dashed', borderWidth: 1.5 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  totalsSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  selectThumb: { width: 56, height: 56, borderRadius: radii.md },
});
