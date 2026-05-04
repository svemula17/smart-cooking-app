import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRecipe, rateRecipe, RecipeDetail } from '../api/recipes';
import { generateList } from '../api/shopping';
import { listRecipes, Recipe } from '../api/recipes';

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Hard: 'bg-red-100 text-red-700',
};

function NutritionBar({ label, value, unit, max, color }: { label: string; value: number; unit: string; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-800">{value}{unit}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function AddToShoppingModal({ recipeId, recipeName, onClose }: { recipeId: string; recipeName: string; onClose: () => void }) {
  const [listName, setListName] = useState(`${recipeName} Shopping List`);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    setLoading(true);
    try {
      await generateList(listName, [recipeId]);
      setDone(true);
      setTimeout(() => { onClose(); navigate('/shopping'); }, 1500);
    } catch {
      alert('Failed to create shopping list');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        {done ? (
          <div className="text-center py-4">
            <div className="text-5xl mb-3">✅</div>
            <p className="font-semibold text-gray-800">Shopping list created!</p>
            <p className="text-sm text-gray-500 mt-1">Redirecting to your lists...</p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add to Shopping List</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">List Name</label>
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={loading || !listName.trim()}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60"
              >
                {loading ? 'Creating...' : 'Create List 🛒'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RateModal({ recipeId, onClose, onRated }: { recipeId: string; onClose: () => void; onRated: (avg: number, total: number) => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRate = async () => {
    if (!rating) return;
    setLoading(true);
    try {
      const data = await rateRecipe(recipeId, rating, comment);
      onRated(data.average_rating, data.total_ratings);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setError(msg ?? 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Rate this Recipe</h2>
        <div className="flex gap-2 justify-center mb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setRating(s)}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              className="text-4xl transition-transform hover:scale-110"
            >
              {s <= (hover || rating) ? '⭐' : '☆'}
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave a comment (optional)..."
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none mb-3"
        />
        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button
            onClick={handleRate}
            disabled={loading || !rating}
            className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60"
          >
            {loading ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getRecipe(id)
      .then(setRecipe)
      .catch(() => navigate('/recipes'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-1/3 mb-8" />
        <div className="h-48 bg-gray-100 rounded-2xl mb-6" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-gray-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!recipe) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Recipes
      </button>

      {/* Hero */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{recipe.name}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-white text-gray-700 text-xs font-medium px-3 py-1 rounded-full shadow-sm">{recipe.cuisine_type}</span>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${DIFFICULTY_COLOR[recipe.difficulty]}`}>{recipe.difficulty}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>⏱️ Prep: {recipe.prep_time_minutes}m</span>
              <span>🔥 Cook: {recipe.cook_time_minutes}m</span>
              <span>👥 Serves: {recipe.servings}</span>
              <span>⭐ {recipe.average_rating > 0 ? recipe.average_rating.toFixed(1) : 'No'} ratings ({recipe.total_ratings})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={() => setShowShoppingModal(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          🛒 Add to Shopping List
        </button>
        <button
          onClick={() => setShowRateModal(true)}
          className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          ⭐ Rate Recipe
        </button>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ingredients */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🥕</span> Ingredients
          </h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing) => (
              <li key={ing.id} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full shrink-0" />
                <span className="font-medium">{ing.quantity} {ing.unit}</span>
                <span className="text-gray-500">{ing.ingredient_name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📋</span> Instructions
          </h2>
          <ol className="space-y-3">
            {(Array.isArray(recipe.instructions) ? recipe.instructions : []).map((step) => (
              <li key={step.step_number} className="flex gap-3">
                <span className="w-6 h-6 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  {step.step_number}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{step.instruction}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Nutrition */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📊</span> Nutrition <span className="text-xs font-normal text-gray-400">(per serving)</span>
          </h2>
          {recipe.nutrition ? (
            <div className="space-y-3">
              <div className="text-center bg-green-50 rounded-xl py-3 mb-4">
                <p className="text-3xl font-bold text-green-700">{recipe.nutrition.calories}</p>
                <p className="text-xs text-gray-500">calories</p>
              </div>
              <NutritionBar label="Protein" value={recipe.nutrition.protein_g} unit="g" max={100} color="bg-blue-400" />
              <NutritionBar label="Carbohydrates" value={recipe.nutrition.carbs_g} unit="g" max={200} color="bg-orange-400" />
              <NutritionBar label="Fat" value={recipe.nutrition.fat_g} unit="g" max={80} color="bg-yellow-400" />
              <NutritionBar label="Fiber" value={recipe.nutrition.fiber_g} unit="g" max={40} color="bg-green-400" />
              <div className="pt-2 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Sodium</span>
                  <span className="font-medium">{recipe.nutrition.sodium_mg}mg</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No nutrition data available</p>
          )}
        </div>
      </div>

      {showShoppingModal && (
        <AddToShoppingModal
          recipeId={recipe.id}
          recipeName={recipe.name}
          onClose={() => setShowShoppingModal(false)}
        />
      )}
      {showRateModal && (
        <RateModal
          recipeId={recipe.id}
          onClose={() => setShowRateModal(false)}
          onRated={(avg, total) => setRecipe((r) => r ? { ...r, average_rating: avg, total_ratings: total } : r)}
        />
      )}
    </div>
  );
}
