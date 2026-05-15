import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDailyNutrition, getLogs, DailyNutrition, NutritionLog } from '../api/nutrition';
import { DEMO_DAILY_NUTRITION, DEMO_NUTRITION_LOGS } from '../data/demo';

function ProgressBar({ value, goal, color }: { value: number; goal: number; color: string }) {
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{Math.round(value)}{goal > 0 && ` / ${goal}`}</span>
        <span className="text-gray-400">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function NutritionPage() {
  const { user } = useAuth();
  const [daily, setDaily] = useState<DailyNutrition | null>(null);
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [day, setDay] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      getDailyNutrition(user.id, day).catch(() => null),
      getLogs(user.id, 20).catch(() => []),
    ]).then(([d, l]) => {
      const hasData = (d && (d.total_calories ?? 0) > 0) || (l && l.length > 0);
      if (hasData) {
        setDaily(d);
        setLogs(l);
        setIsDemo(false);
      } else {
        setDaily(DEMO_DAILY_NUTRITION);
        setLogs(DEMO_NUTRITION_LOGS);
        setIsDemo(true);
      }
    }).finally(() => setLoading(false));
  }, [user?.id, day]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse text-gray-400">Loading nutrition data...</div>
      </div>
    );
  }

  const cal = daily?.total_calories ?? 0;
  const protein = daily?.total_protein ?? 0;
  const carbs = daily?.total_carbs ?? 0;
  const fat = daily?.total_fat ?? 0;
  const goals = daily?.goals ?? { calories: 2000, protein: 130, carbs: 250, fat: 70 };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Nutrition
            {isDemo && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">DEMO</span>}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Daily macros and meal logs</p>
        </div>
        <input
          type="date"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold mb-4">Today's Macros</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Calories</p>
              <ProgressBar value={cal} goal={goals.calories} color="bg-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Protein (g)</p>
              <ProgressBar value={protein} goal={goals.protein} color="bg-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Carbs (g)</p>
              <ProgressBar value={carbs} goal={goals.carbs} color="bg-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Fat (g)</p>
              <ProgressBar value={fat} goal={goals.fat} color="bg-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold mb-4">Summary</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs text-gray-600">Calories</p>
              <p className="text-2xl font-bold text-green-700">{Math.round(cal)}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-gray-600">Protein</p>
              <p className="text-2xl font-bold text-blue-700">{Math.round(protein)}g</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-xs text-gray-600">Carbs</p>
              <p className="text-2xl font-bold text-amber-700">{Math.round(carbs)}g</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-xs text-gray-600">Fat</p>
              <p className="text-2xl font-bold text-purple-700">{Math.round(fat)}g</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold mb-4">Recent Meals</h2>
        {logs.length === 0 ? (
          <p className="text-gray-400 text-sm">No meals logged yet. Cook a recipe to auto-log nutrition!</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => {
              const p = log.protein_g ?? log.protein ?? 0;
              const c = log.carbs_g ?? log.carbs ?? 0;
              const f = log.fat_g ?? log.fat ?? 0;
              return (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium">{log.recipe_name ?? 'Meal'}</p>
                    <p className="text-xs text-gray-500">
                      {log.consumed_at ? new Date(log.consumed_at).toLocaleString() : '—'} · {log.servings} serving(s)
                      {log.auto_logged && <span className="ml-2 text-green-600">• auto</span>}
                    </p>
                  </div>
                  <div className="text-right text-xs text-gray-600">
                    <p className="font-semibold text-gray-900">{Math.round(log.calories)} cal</p>
                    <p>P {Math.round(p)}g · C {Math.round(c)}g · F {Math.round(f)}g</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
