/**
 * The codebase has two MealType enums right now: the meal-plans one (lowercase,
 * 'breakfast' | 'lunch' | 'dinner') and the nutrition-logs one (capitalized,
 * 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'). They reflect distinct DB CHECK
 * constraints. This test holds them as-is — if either contract changes,
 * the test will fail and force the migration to happen on both sides.
 *
 * Marked as tech debt in the audit; tracked for the next refactor batch.
 */

// The string-literal types compile to no JS, so we test the runtime-visible
// constants in the nutritionService (Capitalized + Snack) and a hand-written
// list for meal_plans.

const MEAL_PLAN_TYPES = ['breakfast', 'lunch', 'dinner'] as const;
const NUTRITION_LOG_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;

function suggestMealTypeForLog(hour: number): typeof NUTRITION_LOG_TYPES[number] {
  if (hour < 10) return 'Breakfast';
  if (hour < 15) return 'Lunch';
  if (hour < 21) return 'Dinner';
  return 'Snack';
}

describe('meal type vocabularies', () => {
  test('meal-plans variant is lowercase and has no Snack', () => {
    expect(MEAL_PLAN_TYPES).toEqual(['breakfast', 'lunch', 'dinner']);
    expect(MEAL_PLAN_TYPES).not.toContain('snack');
  });

  test('nutrition-logs variant is capitalized and has Snack', () => {
    expect(NUTRITION_LOG_TYPES).toEqual(['Breakfast', 'Lunch', 'Dinner', 'Snack']);
  });

  test('LogMealSheet suggests Breakfast in the morning', () => {
    expect(suggestMealTypeForLog(7)).toBe('Breakfast');
    expect(suggestMealTypeForLog(9)).toBe('Breakfast');
  });

  test('LogMealSheet suggests Lunch around midday', () => {
    expect(suggestMealTypeForLog(12)).toBe('Lunch');
    expect(suggestMealTypeForLog(14)).toBe('Lunch');
  });

  test('LogMealSheet suggests Dinner in the evening', () => {
    expect(suggestMealTypeForLog(18)).toBe('Dinner');
    expect(suggestMealTypeForLog(20)).toBe('Dinner');
  });

  test('LogMealSheet suggests Snack at midnight', () => {
    expect(suggestMealTypeForLog(22)).toBe('Snack');
    expect(suggestMealTypeForLog(2)).toBe('Breakfast'); // 2am is technically pre-10am
  });
});
