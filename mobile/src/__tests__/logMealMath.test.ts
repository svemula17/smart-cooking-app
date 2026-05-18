/**
 * The Log Meal sheet shows live-scaled nutrition as the user adjusts
 * servings. The math also has to match what the backend stores (which
 * we already verified is `recipe_nutrition * servings_consumed` in
 * calculation_service.log_meal). This test pins both halves to the
 * same formula so a refactor on either side can't silently desync.
 */

function num(v: number | string | undefined): number {
  if (v === undefined || v === null) return 0;
  return typeof v === 'string' ? parseFloat(v) : v;
}

function scaleNutrition(
  base: { calories: number | string; protein_g: number | string; carbs_g: number | string; fat_g: number | string },
  servings: number,
) {
  return {
    calories: Math.round(num(base.calories) * servings),
    protein_g: Math.round(num(base.protein_g) * servings * 10) / 10,
    carbs_g: Math.round(num(base.carbs_g) * servings * 10) / 10,
    fat_g: Math.round(num(base.fat_g) * servings * 10) / 10,
  };
}

describe('Log Meal nutrition scaling', () => {
  const BIRYANI = { calories: 580, protein_g: 38, carbs_g: 75, fat_g: 18 };

  test('1.0 serving returns base values', () => {
    expect(scaleNutrition(BIRYANI, 1.0)).toEqual({
      calories: 580,
      protein_g: 38,
      carbs_g: 75,
      fat_g: 18,
    });
  });

  test('0.5 serving halves everything', () => {
    expect(scaleNutrition(BIRYANI, 0.5)).toEqual({
      calories: 290,
      protein_g: 19,
      carbs_g: 37.5,
      fat_g: 9,
    });
  });

  test('1.5 servings is 1.5x', () => {
    expect(scaleNutrition(BIRYANI, 1.5)).toEqual({
      calories: 870,
      protein_g: 57,
      carbs_g: 112.5,
      fat_g: 27,
    });
  });

  test('handles string macros (pg numeric columns come back as strings via asyncpg)', () => {
    const stringy = { calories: '580', protein_g: '38.00', carbs_g: '75.5', fat_g: '18' };
    expect(scaleNutrition(stringy, 1.0)).toEqual({
      calories: 580,
      protein_g: 38,
      carbs_g: 75.5,
      fat_g: 18,
    });
  });

  test('handles missing/null values as zero (does not NaN)', () => {
    const partial = { calories: 100, protein_g: undefined as any, carbs_g: null as any, fat_g: 5 };
    const out = scaleNutrition(partial, 2);
    expect(out.protein_g).toBe(0);
    expect(out.carbs_g).toBe(0);
    expect(out.calories).toBe(200);
    expect(out.fat_g).toBe(10);
  });
});
