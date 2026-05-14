import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { mealPlanService } from '../services/mealPlanService';
import { shoppingService } from '../services/shoppingService';
import { scheduleMealReminders } from '../services/reminderService';
import { colors } from '../theme/colors';
import { getRecipeImage } from '../utils/recipeImages';
import type { MealPlan, MealType, RootStackParamList } from '../types';
import type { RootState } from '../store';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function formatDayHeader(dateStr: string, index: number): string {
  const date = new Date(dateStr + 'T12:00:00');
  const day  = date.toLocaleDateString('en-US', { weekday: 'long' });
  const mon  = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return index === 0 ? `📍 Today — ${day}, ${mon}` : `${day}, ${mon}`;
}

const MEAL_CONFIG: Record<MealType, { label: string; emoji: string }> = {
  breakfast: { label: 'Breakfast', emoji: '🌅' },
  lunch:     { label: 'Lunch',     emoji: '☀️' },
  dinner:    { label: 'Dinner',    emoji: '🌙' },
};

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];

// ─── MacroBar ─────────────────────────────────────────────────────────────────

function MacroBar({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  return (
    <View style={macroStyles.row}>
      <Text style={macroStyles.label}>{label}</Text>
      <View style={macroStyles.track}>
        <View style={[macroStyles.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={macroStyles.value}>{Math.round(value)}</Text>
    </View>
  );
}

const macroStyles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  label: { fontSize: 11, color: colors.textSecondary, width: 48 },
  track: { flex: 1, height: 5, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  fill:  { height: '100%', borderRadius: 3 },
  value: { fontSize: 11, color: colors.text, fontWeight: '600', width: 32, textAlign: 'right' },
});

// ─── MealSlot ─────────────────────────────────────────────────────────────────

function MealSlot({
  plan,
  mealType,
  date,
  onAdd,
  onRemove,
}: {
  plan: MealPlan | undefined;
  mealType: MealType;
  date: string;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const { emoji, label } = MEAL_CONFIG[mealType];
  const hasPrep = plan?.recipe.prep_instructions
    ? Object.values(plan.recipe.prep_instructions).some((p) => p?.required)
    : false;

  return (
    <View style={slotStyles.slot}>
      <View style={slotStyles.slotHeader}>
        <Text style={slotStyles.slotEmoji}>{emoji}</Text>
        <Text style={slotStyles.slotLabel}>{label}</Text>
        {hasPrep && <Text style={slotStyles.prepIcon}>⏰</Text>}
      </View>

      {plan ? (
        <TouchableOpacity
          style={slotStyles.filledSlot}
          onPress={() =>
            Alert.alert(plan.recipe.name, 'What would you like to do?', [
              { text: 'Remove', style: 'destructive', onPress: () => onRemove(plan.id) },
              { text: 'Cancel', style: 'cancel' },
            ])
          }
          activeOpacity={0.8}
        >
          {getRecipeImage(plan.recipe.name) ? (
            <Image source={getRecipeImage(plan.recipe.name)!} style={slotStyles.recipeThumb} />
          ) : (
            <View style={slotStyles.recipeThumbFallback}>
              <Text style={{ fontSize: 24 }}>🍽️</Text>
            </View>
          )}
          <View style={slotStyles.recipeInfo}>
            <Text style={slotStyles.recipeName} numberOfLines={1}>{plan.recipe.name}</Text>
            {plan.recipe.nutrition && (
              <Text style={slotStyles.recipeMacros}>
                {plan.recipe.nutrition.calories} cal · {plan.recipe.nutrition.protein_g}g protein
              </Text>
            )}
            {hasPrep && (
              <Text style={slotStyles.prepNote}>
                {plan.recipe.prep_instructions?.marination?.required
                  ? `📝 ${plan.recipe.prep_instructions.marination.instruction.slice(0, 40)}…`
                  : plan.recipe.prep_instructions?.soaking?.required
                  ? `💧 ${plan.recipe.prep_instructions.soaking.instruction.slice(0, 40)}…`
                  : ''}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={slotStyles.emptySlot} onPress={onAdd}>
          <Text style={slotStyles.addIcon}>＋</Text>
          <Text style={slotStyles.addText}>Add Recipe</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const slotStyles = StyleSheet.create({
  slot:        { marginBottom: 8 },
  slotHeader:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  slotEmoji:   { fontSize: 16 },
  slotLabel:   { fontSize: 13, fontWeight: '700', color: colors.textSecondary, flex: 1 },
  prepIcon:    { fontSize: 14 },
  emptySlot:   { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', borderRadius: 12, padding: 12 },
  addIcon:     { fontSize: 20, color: colors.primary, fontWeight: '300' },
  addText:     { fontSize: 13, color: colors.primary, fontWeight: '600' },
  filledSlot:  { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  recipeThumb: { width: 68, height: 68 },
  recipeThumbFallback: { width: 68, height: 68, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  recipeInfo:  { flex: 1, paddingHorizontal: 12, paddingVertical: 8 },
  recipeName:  { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 2 },
  recipeMacros:{ fontSize: 12, color: colors.textSecondary },
  prepNote:    { fontSize: 11, color: colors.warning, marginTop: 4 },
});

// ─── DayCard ──────────────────────────────────────────────────────────────────

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
  const plansByType = Object.fromEntries(plans.map((p) => [p.meal_type, p])) as Record<MealType, MealPlan | undefined>;

  const totals = plans.reduce(
    (acc, p) => {
      if (p.recipe.nutrition) {
        acc.calories += p.recipe.nutrition.calories;
        acc.protein  += p.recipe.nutrition.protein_g;
        acc.carbs    += p.recipe.nutrition.carbs_g;
        acc.fat      += p.recipe.nutrition.fat_g;
      }
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const adherencePct = goals.calories > 0 ? (totals.calories / goals.calories) * 100 : 0;
  const goalMet = adherencePct >= 80;

  return (
    <View style={dayStyles.card}>
      <View style={dayStyles.dayHeader}>
        <Text style={[dayStyles.dayTitle, index === 0 && dayStyles.todayTitle]}>
          {formatDayHeader(dateStr, index)}
        </Text>
        {goalMet && plans.length > 0 && <Text style={dayStyles.checkmark}>✅</Text>}
      </View>

      {MEAL_TYPES.map((mt) => (
        <MealSlot
          key={mt}
          mealType={mt}
          date={dateStr}
          plan={plansByType[mt]}
          onAdd={() => onAdd(dateStr, mt)}
          onRemove={onRemove}
        />
      ))}

      {plans.length > 0 && (
        <View style={dayStyles.totalsSection}>
          <Text style={dayStyles.totalsTitle}>Daily totals</Text>
          <MacroBar label="Cal"     value={totals.calories} goal={goals.calories} color={colors.calories} />
          <MacroBar label="Protein" value={totals.protein}  goal={goals.protein}  color={colors.protein} />
          <MacroBar label="Carbs"   value={totals.carbs}    goal={goals.carbs}    color={colors.carbs} />
          <MacroBar label="Fat"     value={totals.fat}      goal={goals.fat}      color={colors.fat} />
          <Text style={dayStyles.goalLine}>
            {Math.round(adherencePct)}% of goal {goalMet ? '🟢' : adherencePct >= 50 ? '🔸' : '🔴'}
          </Text>
        </View>
      )}
    </View>
  );
}

const dayStyles = StyleSheet.create({
  card:         { backgroundColor: colors.surfaceElevated, borderRadius: 18, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  dayHeader:    { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dayTitle:     { flex: 1, fontSize: 15, fontWeight: '700', color: colors.textSecondary },
  todayTitle:   { color: colors.primary },
  checkmark:    { fontSize: 16 },
  totalsSection:{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.divider },
  totalsTitle:  { fontSize: 11, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  goalLine:     { fontSize: 12, color: colors.textSecondary, marginTop: 4, textAlign: 'right' },
});

// ─── RecipeSelectModal ────────────────────────────────────────────────────────

// Meal-type suitability: breakfast = quick (≤30 min), lunch = medium (≤60 min), dinner = all
function suitableFor(mealType: MealType, prep: number, cook: number): boolean {
  const total = (prep ?? 0) + (cook ?? 0);
  if (mealType === 'breakfast') return total <= 30;
  if (mealType === 'lunch')     return total <= 60;
  return true; // dinner — anything
}

function RecipeSelectModal({
  date,
  mealType,
  userId,
  onSelect,
  onClose,
}: {
  date: string;
  mealType: MealType;
  userId: string;
  onSelect: (recipeId: string) => void;
  onClose: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['recipes-all'],
    queryFn: async () => {
      const { recipeService } = await import('../services/recipeService');
      return recipeService.getRecipes({ limit: 100 });
    },
  });

  const allRecipes = data?.recipes ?? [];
  const recipes = allRecipes.filter((r) =>
    suitableFor(mealType, r.prep_time_minutes, r.cook_time_minutes)
  );

  return (
    <View style={modalStyles.overlay}>
      <View style={modalStyles.sheet}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>Choose a Recipe</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={modalStyles.close}>✕</Text>
          </TouchableOpacity>
        </View>
        <Text style={modalStyles.sub}>
          {MEAL_CONFIG[mealType].emoji} {MEAL_CONFIG[mealType].label} · {date}
          {'  '}
          <Text style={modalStyles.subCount}>
            {isLoading ? '' : `${recipes.length} recipes`}
          </Text>
        </Text>
        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
        ) : (
          <FlatList
            data={recipes}
            keyExtractor={(r) => r.id}
            contentContainerStyle={{ paddingBottom: 32 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={modalStyles.row} onPress={() => onSelect(item.id)}>
                {getRecipeImage(item.name) ? (
                  <Image source={getRecipeImage(item.name)!} style={modalStyles.thumb} />
                ) : (
                  <View style={[modalStyles.thumb, { backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={{ fontSize: 20 }}>🍽️</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={modalStyles.recipeName}>{item.name}</Text>
                  <Text style={modalStyles.recipeMeta}>{item.cuisine_type} · {item.prep_time_minutes + item.cook_time_minutes}m</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}

const modalStyles = StyleSheet.create({
  overlay:    { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', zIndex: 100 },
  sheet:      { backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', paddingTop: 8 },
  header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  title:      { flex: 1, fontSize: 18, fontWeight: '700', color: colors.text },
  close:      { fontSize: 18, color: colors.textLight },
  sub:        { fontSize: 13, color: colors.textSecondary, paddingHorizontal: 20, marginBottom: 12 },
  subCount:   { color: colors.primary, fontWeight: '600' },
  row:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider },
  thumb:      { width: 56, height: 56, borderRadius: 10 },
  recipeName: { fontSize: 15, fontWeight: '600', color: colors.text },
  recipeMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});

// ─── MealPlannerScreen ────────────────────────────────────────────────────────

export function MealPlannerScreen(): React.JSX.Element {
  const user  = useSelector((s: RootState) => s.auth.user);
  const prefs = useSelector((s: RootState) => s.user.preferences);
  const house = useSelector((s: RootState) => s.house.house);
  const [houseMode, setHouseMode] = useState(false);
  const qc    = useQueryClient();
  const [selectingSlot, setSelectingSlot] = useState<{ date: string; mealType: MealType } | null>(null);

  const weekDates  = getWeekDates();
  const startDate  = weekDates[0]!;

  const goals = {
    calories: prefs?.calories_goal ?? 2000,
    protein:  prefs?.protein_goal  ?? 150,
    carbs:    prefs?.carbs_goal    ?? 250,
    fat:      prefs?.fat_goal      ?? 65,
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['meal-plans', user?.id, startDate],
    queryFn:  () => mealPlanService.getWeekPlan(user!.id, startDate, 7),
    enabled:  !!user?.id,
  });

  useFocusEffect(useCallback(() => { if (user?.id) refetch(); }, [user?.id]));

  const scheduleMutation = useMutation({
    mutationFn: ({ date, mealType, recipeId }: { date: string; mealType: MealType; recipeId: string }) =>
      mealPlanService.schedule({ user_id: user!.id, recipe_id: recipeId, scheduled_date: date, meal_type: mealType }),
    onSuccess: async ({ meal_plan }) => {
      qc.invalidateQueries({ queryKey: ['meal-plans'] });
      await scheduleMealReminders(meal_plan).catch(() => {/* silently ignore if perms denied */});
    },
    onError: () => Alert.alert('Error', 'Could not add recipe to plan. Try again.'),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => mealPlanService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meal-plans'] }),
    onError: () => Alert.alert('Error', 'Could not remove meal. Try again.'),
  });

  const generateListMutation = useMutation({
    mutationFn: (recipeIds: string[]) =>
      shoppingService.generate({
        user_id: user!.id,
        name: `Week of ${startDate}`,
        recipe_ids: recipeIds,
      }),
    onSuccess: () => Alert.alert('✅ Shopping List Created', 'Your weekly shopping list is ready in the Shopping tab!'),
    onError: () => Alert.alert('Error', 'Could not generate shopping list. Try again.'),
  });

  const plans: MealPlan[] = data?.meal_plans ?? [];

  const plansByDate = weekDates.reduce<Record<string, MealPlan[]>>((acc, d) => {
    acc[d] = plans.filter((p) => p.scheduled_date === d);
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📅 {houseMode ? 'House Meal Plan' : 'My Meal Plan'}</Text>
          <Text style={styles.headerSub}>Next 7 days</Text>
        </View>
        {house && (
          <TouchableOpacity
            style={[styles.modeToggle, houseMode && styles.modeToggleActive]}
            onPress={() => setHouseMode((v) => !v)}
          >
            <Text style={[styles.modeToggleText, houseMode && styles.modeToggleTextActive]}>
              {houseMode ? '🏠 House' : '👤 Personal'}
            </Text>
          </TouchableOpacity>
        )}
        {plans.length > 0 && (
          <TouchableOpacity
            style={styles.generateBtn}
            onPress={() => {
              const recipeIds = [...new Set(plans.map((p) => p.recipe_id))];
              generateListMutation.mutate(recipeIds);
            }}
            disabled={generateListMutation.isPending}
          >
            {generateListMutation.isPending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.generateBtnText}>🛒 List</Text>}
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !user ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyTitle}>Sign in to plan meals</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {weekDates.map((d, i) => (
            <DayCard
              key={d}
              dateStr={d}
              index={i}
              plans={plansByDate[d] ?? []}
              goals={goals}
              onAdd={(date, mealType) => setSelectingSlot({ date, mealType })}
              onRemove={(id) => removeMutation.mutate(id)}
            />
          ))}
        </ScrollView>
      )}

      {selectingSlot && user && (
        <RecipeSelectModal
          date={selectingSlot.date}
          mealType={selectingSlot.mealType}
          userId={user.id}
          onClose={() => setSelectingSlot(null)}
          onSelect={(recipeId) => {
            scheduleMutation.mutate({ date: selectingSlot.date, mealType: selectingSlot.mealType, recipeId });
            setSelectingSlot(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}

export default MealPlannerScreen;

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: colors.background },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: colors.text },
  headerSub:   { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  generateBtn: { backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  generateBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  modeToggle: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1.5, borderColor: '#D0D0D0' },
  modeToggleActive: { backgroundColor: '#FFF3E0', borderColor: '#E85D04' },
  modeToggleText: { fontSize: 13, color: '#6B6B6B', fontWeight: '600' },
  modeToggleTextActive: { color: '#E85D04' },
  scroll:      { paddingHorizontal: 16, paddingBottom: 32 },
  centered:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon:   { fontSize: 48, marginBottom: 12 },
  emptyTitle:  { fontSize: 18, fontWeight: '600', color: colors.textSecondary },
});
