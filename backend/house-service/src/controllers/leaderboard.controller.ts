import type { NextFunction, Request, Response } from 'express';
import { pool } from '../config/database';

export async function getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId } = req.params;
  const month = (req.query.month as string) ?? new Date().toISOString().slice(0, 7);

  try {
    const { rows } = await pool.query(
      `SELECT
         hm.user_id,
         u.name,
         COUNT(cs.id) FILTER (WHERE cs.status = 'done' AND to_char(cs.scheduled_date, 'YYYY-MM') = $2) AS cook_count,
         ROUND(AVG(mr.rating)::numeric, 1) AS avg_rating,
         COUNT(mr.id) AS total_ratings
       FROM house_members hm
       JOIN users u ON u.id = hm.user_id
       LEFT JOIN cook_schedule cs ON cs.user_id = hm.user_id AND cs.house_id = hm.house_id
       LEFT JOIN meal_ratings mr ON mr.cook_schedule_id = cs.id
       WHERE hm.house_id = $1
       GROUP BY hm.user_id, u.name
       ORDER BY cook_count DESC, avg_rating DESC NULLS LAST`,
      [houseId, month],
    );

    const ranked = rows.map((r: any, idx: number) => ({
      ...r,
      rank: idx + 1,
      badge: idx === 0 && parseInt(r.cook_count) > 0 ? 'Cook of the Month 🏆' : null,
    }));

    // House cooking streak: consecutive days with a done meal
    const streakResult = await pool.query(
      `SELECT scheduled_date FROM cook_schedule
       WHERE house_id = $1 AND status = 'done'
       ORDER BY scheduled_date DESC`,
      [houseId],
    );

    let streak = 0;
    const today = new Date();
    for (const row of streakResult.rows) {
      const diff = Math.round((today.getTime() - new Date(row.scheduled_date).getTime()) / (1000 * 60 * 60 * 24));
      if (diff === streak) streak++;
      else break;
    }

    res.json({ success: true, data: { month, rankings: ranked, house_streak: streak } });
  } catch (err) { next(err); }
}

export async function getCuisinePassport(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT r.cuisine_type, COUNT(*) AS times_cooked,
              MIN(cs.scheduled_date) AS first_cooked,
              MAX(cs.scheduled_date) AS last_cooked
       FROM cook_schedule cs
       JOIN recipes r ON r.id = cs.recipe_id
       WHERE cs.house_id = $1 AND cs.status = 'done' AND r.cuisine_type IS NOT NULL
       GROUP BY r.cuisine_type
       ORDER BY times_cooked DESC`,
      [houseId],
    );

    const ALL_CUISINES = [
      'Indian', 'Chinese', 'Indo-Chinese', 'Italian', 'Mexican',
      'Thai', 'Japanese', 'Korean', 'French', 'American', 'Mediterranean',
    ];
    const cookedSet = new Set(rows.map((r: any) => r.cuisine_type));
    const unlocked = ALL_CUISINES.filter((c) => cookedSet.has(c));
    const locked = ALL_CUISINES.filter((c) => !cookedSet.has(c));

    res.json({
      success: true,
      data: {
        cuisines_cooked: rows,
        unlocked_count: unlocked.length,
        total_cuisines: ALL_CUISINES.length,
        unlocked,
        locked,
      },
    });
  } catch (err) { next(err); }
}

export async function getWeeklyReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { houseId } = req.params;
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weekStartStr = weekStart.toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  try {
    // Meals cooked this week
    const mealsResult = await pool.query(
      `SELECT cs.*, u.name AS cook_name, r.name AS recipe_name,
              ROUND(AVG(mr.rating)::numeric, 1) AS avg_rating
       FROM cook_schedule cs
       JOIN users u ON u.id = cs.user_id
       LEFT JOIN recipes r ON r.id = cs.recipe_id
       LEFT JOIN meal_ratings mr ON mr.cook_schedule_id = cs.id
       WHERE cs.house_id = $1 AND cs.scheduled_date BETWEEN $2 AND $3 AND cs.status = 'done'
       GROUP BY cs.id, u.name, r.name
       ORDER BY cs.scheduled_date`,
      [houseId, weekStartStr, today],
    );

    // Total spend this week
    const spendResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total_spent
       FROM expenses WHERE house_id = $1 AND created_at >= $2`,
      [houseId, weekStartStr],
    );

    // Waste this week
    const wasteResult = await pool.query(
      `SELECT COALESCE(SUM(estimated_cost), 0) AS total_waste
       FROM waste_logs WHERE house_id = $1 AND logged_at >= $2`,
      [houseId, weekStartStr],
    );

    const memberCount = await pool.query(
      'SELECT COUNT(*) FROM house_members WHERE house_id = $1',
      [houseId],
    );

    const mealsCooked = mealsResult.rows.length;
    const totalSpent = parseFloat(spendResult.rows[0].total_spent);
    const totalWaste = parseFloat(wasteResult.rows[0].total_waste);
    const estimatedDeliveryPerMeal = 300; // ₹300 average per meal for whole house
    const moneySaved = mealsCooked * estimatedDeliveryPerMeal - totalSpent;

    const bestMeal = mealsResult.rows.reduce((best: any, m: any) => {
      if (!best || parseFloat(m.avg_rating ?? '0') > parseFloat(best.avg_rating ?? '0')) return m;
      return best;
    }, null);

    res.json({
      success: true,
      data: {
        week_start: weekStartStr,
        meals_cooked: mealsCooked,
        total_spent: totalSpent,
        total_waste: totalWaste,
        money_saved_vs_delivery: Math.max(0, Math.round(moneySaved)),
        member_count: parseInt(memberCount.rows[0].count, 10),
        best_meal: bestMeal,
        meals: mealsResult.rows,
      },
    });
  } catch (err) { next(err); }
}
