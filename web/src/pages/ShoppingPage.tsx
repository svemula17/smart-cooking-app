import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLists, deleteList, ShoppingList } from '../api/shopping';
import { listRecipes, Recipe } from '../api/recipes';
import { generateList } from '../api/shopping';
import { DEMO_SHOPPING_LISTS } from '../data/demo';

function NewListModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [step, setStep] = useState<'name' | 'recipes'>('name');
  const [listName, setListName] = useState('This Week\'s Shop');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => {
    setLoadingRecipes(true);
    listRecipes({ limit: 50 })
      .then((d) => setRecipes(d.recipes))
      .finally(() => setLoadingRecipes(false));
  }, []);

  const filtered = recipes.filter((r) =>
    r.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    r.cuisine_type.toLowerCase().includes(searchQ.toLowerCase()),
  );

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!listName.trim() || selectedIds.size === 0) return;
    setCreating(true);
    try {
      await generateList(listName, Array.from(selectedIds));
      onCreated();
      onClose();
    } catch {
      alert('Failed to create list');
    } finally {
      setCreating(false);
    }
  };

  const CUISINE_EMOJI: Record<string, string> = {
    Indian: '🍛', Chinese: '🥢', Italian: '🍝', Mexican: '🌮',
    Thai: '🍜', Japanese: '🍱', Mediterranean: '🫒', American: '🍔', French: '🥐',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              {step === 'name' ? '🛒 New Shopping List' : '📖 Pick Recipes'}
            </h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">✕</button>
          </div>
          {step === 'recipes' && (
            <div className="mt-3">
              <input
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search recipes..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === 'name' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">List Name</label>
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-2">Next, you'll pick which recipes to shop for.</p>
            </div>
          ) : loadingRecipes ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((r) => (
                <button
                  key={r.id}
                  onClick={() => toggle(r.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    selectedIds.has(r.id)
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <span className="text-2xl">{CUISINE_EMOJI[r.cuisine_type] ?? '🍽️'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.cuisine_type} · {r.prep_time_minutes + r.cook_time_minutes}m</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selectedIds.has(r.id) ? 'bg-green-500 border-green-500' : 'border-gray-300'
                  }`}>
                    {selectedIds.has(r.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100">
          {step === 'name' ? (
            <button
              onClick={() => setStep('recipes')}
              disabled={!listName.trim()}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl disabled:opacity-60 transition-colors"
            >
              Next: Pick Recipes →
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => setStep('name')} className="px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                ← Back
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || selectedIds.size === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl disabled:opacity-60 transition-colors"
              >
                {creating ? 'Creating...' : `Create List (${selectedIds.size} recipe${selectedIds.size !== 1 ? 's' : ''})`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShoppingPage() {
  const navigate = useNavigate();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'' | 'active' | 'completed'>('');
  const [showModal, setShowModal] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const data = await getLists({ status: filter || undefined, limit: 50 });
      if (data.lists && data.lists.length > 0) {
        setLists(data.lists);
        setIsDemo(false);
      } else {
        const demo = filter ? DEMO_SHOPPING_LISTS.filter((l) => l.status === filter) : DEMO_SHOPPING_LISTS;
        setLists(demo);
        setIsDemo(true);
      }
    } catch {
      const demo = filter ? DEMO_SHOPPING_LISTS.filter((l) => l.status === filter) : DEMO_SHOPPING_LISTS;
      setLists(demo);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLists(); }, [filter]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this shopping list?')) return;
    await deleteList(id);
    setLists((prev) => prev.filter((l) => l.id !== id));
  };

  const formatDate = (str: string) =>
    new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Shopping Lists
            {isDemo && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">DEMO</span>}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{lists.length} list{lists.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New List
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === '' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : lists.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🛒</div>
          <p className="text-gray-500 font-medium">No shopping lists yet</p>
          <p className="text-gray-400 text-sm mt-1">Create one from your favourite recipes</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            Create First List
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => (
            <div
              key={list.id}
              onClick={() => navigate(`/shopping/${list.id}`)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                list.status === 'completed' ? 'bg-gray-100' : 'bg-green-50'
              }`}>
                {list.status === 'completed' ? '✅' : '🛒'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{list.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    list.status === 'completed' ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'
                  }`}>
                    {list.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {list.recipe_ids.length} recipe{list.recipe_ids.length !== 1 ? 's' : ''} · Created {formatDate(list.created_at)}
                </p>
              </div>

              <button
                onClick={(e) => handleDelete(list.id, e)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <NewListModal onClose={() => setShowModal(false)} onCreated={fetchLists} />
      )}
    </div>
  );
}
