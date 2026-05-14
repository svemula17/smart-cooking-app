import type { NextFunction, Request, Response } from 'express';
import { pool, withTransaction } from '../config/database';

// Achievement definitions — key, label, description, check logic type
const ACHIEVEMENTS: Record<string, { label: string; description: string; emoji: string }> = {
  first_cook:         { label: 'First Cook',          emoji: '👨‍🍳', description: 'Cooked your first meal for the house' },
  cook_10:            { label: 'Home Chef',            emoji: '🍳', description: 'Cooked 10 meals for the house' },
  cook_50:            { label: 'Master Chef',          emoji: '⭐', description: 'Cooked 50 meals for the house' },
  streak_7:           { label: '7-Day Streak',         emoji: '🔥', description: 'House cooked every day for 7 days' },
  streak_30:          { label: 'Month Warrior',        emoji: '💪', description: 'House cooked every day for 30 days' },
  zero_waste_week:    { label: 'Zero Waste Week',      emoji: '♻️', description: 'No ingredients expired this week' },
  cuisine_explorer_5: { label: 'Cuisine Explorer',     emoji: '🌍', description: 'Cooked 5 different cuisines' },
  perfect_rating:     { label: 'Perfect Meal',         emoji: '🏆', description: 'Meal rated 5 stars by all members' },
  budget_master:      { label: 'Budget Master',        emoji: '💰', description: 'Stayed under grocery budget 3 months in a row' },
  first_japanese:     { label: 'Konnichiwa!',          emoji: '🍱', description: 'Cooked Japanese food for the first time' },
  first_korean:       { label: 'Annyeong!',            emoji: '🥘', description: 'Cooked Korean food for the first time' },
  first_italian:      { label: 'Mamma Mia!',           emoji: '🍝', description: 'Cooked Italian food for the first time' },
  first_mexican:      { label: 'Olé!',                 emoji: '🌮', description: 'Cooked Mexican food for the first time' },
};

export async function getAchievements(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId } = req.params;
  const userId = req.auth!.userId;

  try {
    const userAch = await pool.query(
      'SELECT achievement_key, earned_at FROM user_achievements WHERE user_id = $1 AND house_id = $2',
      [userId, houseId],
    );
    const houseAch = await pool.query(
      'SELECT achievement_key, earned_at FROM house_achievements WHERE house_id = $1',
      [houseId],
    );

    const userEarned = new Set(userAch.rows.map((r: any) => r.achievement_key));
    const houseEarned = new Set(houseAch.rows.map((r: any) => r.achievement_key));

    const userAchievements = Object.entries(ACHIEVEMENTS)
      .filter(([, def]) => !['streak_7', 'streak_30', 'zero_waste_week', 'perfect_rating', 'budget_master'].includes(''))
      .map(([key, def]) => ({
        key,
        ...def,
        earned: userEarned.has(key),
        earned_at: userAch.rows.find((r: any) => r.achievement_key === key)?.earned_at ?? null,
      }));

    const houseAchievements = ['streak_7', 'streak_30', 'zero_waste_week', 'budget_master'].map((key) => ({
      key,
      ...ACHIEVEMENTS[key],
      earned: houseEarned.has(key),
      earned_at: houseAch.rows.find((r: any) => r.achievement_key === key)?.earned_at ?? null,
    }));

    res.json({ success: true, data: { user_achievements: userAchievements, house_achievements: houseAchievements } });
  } catch (err) { next(err); }
}

/** Called after relevant events to check and award achievements. */
export async function checkAndAward(
  pool: any,
  { userId, houseId, event }: { userId: string; houseId: string; event: string },
): Promise<string[]> {
  const awarded: string[] = [];

  async function award(key: string, scope: 'user' | 'house') {
    try {
      if (scope === 'user') {
        await pool.query(
          'INSERT INTO user_achievements (user_id, house_id, achievement_key) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [userId, houseId, key],
        );
      } else {
        await pool.query(
          'INSERT INTO house_achievements (house_id, achievement_key) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [houseId, key],
        );
      }
      awarded.push(key);
    } catch { /* ignore */ }
  }

  if (event === 'meal_done') {
    // Count user's total done cooks in this house
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM cook_schedule WHERE user_id = $1 AND house_id = $2 AND status = 'done'",
      [userId, houseId],
    );
    const cookCount = parseInt(countResult.rows[0].count, 10);
    if (cookCount >= 1)  await award('first_cook', 'user');
    if (cookCount >= 10) await award('cook_10', 'user');
    if (cookCount >= 50) await award('cook_50', 'user');

    // Check house streak
    const streakResult = await pool.query(
      "SELECT scheduled_date FROM cook_schedule WHERE house_id = $1 AND status = 'done' ORDER BY scheduled_date DESC",
      [houseId],
    );
    let streak = 0;
    const today = new Date();
    for (const row of streakResult.rows) {
      const diff = Math.round((today.getTime() - new Date(row.scheduled_date).getTime()) / (1000 * 60 * 60 * 24));
      if (diff === streak) streak++;
      else break;
    }
    if (streak >= 7)  await award('streak_7', 'house');
    if (streak >= 30) await award('streak_30', 'house');
  }

  if (event === 'cuisine_first') {
    // Check cuisine-specific achievements
    const cuisineResult = await pool.query(
      `SELECT r.cuisine_type FROM cook_schedule cs
       JOIN recipes r ON r.id = cs.recipe_id
       WHERE cs.user_id = $1 AND cs.house_id = $2 AND cs.status = 'done' AND r.cuisine_type IS NOT NULL`,
      [userId, houseId],
    );
    const cuisines = new Set(cuisineResult.rows.map((r: any) => r.cuisine_type?.toLowerCase()));
    if (cuisines.has('japanese')) await award('first_japanese', 'user');
    if (cuisines.has('korean'))   await award('first_korean', 'user');
    if (cuisines.has('italian'))  await award('first_italian', 'user');
    if (cuisines.has('mexican'))  await award('first_mexican', 'user');
    if (cuisines.size >= 5)       await award('cuisine_explorer_5', 'user');
  }

  return awarded;
}
