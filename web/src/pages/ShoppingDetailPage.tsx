import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { checkItem, completeList, getList, ShoppingItem, ShoppingList } from '../api/shopping';

type ListWithItems = ShoppingList & { items: ShoppingItem[] };

function groupByAisle(items: ShoppingItem[]): Map<string, ShoppingItem[]> {
  const map = new Map<string, ShoppingItem[]>();
  for (const item of items) {
    const aisle = item.aisle ?? 'Other';
    if (!map.has(aisle)) map.set(aisle, []);
    map.get(aisle)!.push(item);
  }
  return map;
}

export default function ShoppingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [list, setList] = useState<ListWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getList(id)
      .then(setList)
      .catch(() => navigate('/shopping'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCheck = async (item: ShoppingItem) => {
    if (!list) return;
    const updated = await checkItem(list.id, item.id, !item.is_checked);
    setList((prev) =>
      prev
        ? { ...prev, items: prev.items.map((i) => (i.id === item.id ? { ...i, is_checked: updated.is_checked } : i)) }
        : prev,
    );
  };

  const handleComplete = async () => {
    if (!list) return;
    setCompleting(true);
    try {
      const updated = await completeList(list.id);
      setList((prev) => prev ? { ...prev, status: updated.status, completed_at: updated.completed_at } : prev);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-6 bg-gray-100 rounded w-1/3 mb-6" />
        <div className="h-12 bg-gray-100 rounded-2xl mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!list) return null;

  const grouped = groupByAisle(list.items);
  const checkedCount = list.items.filter((i) => i.is_checked).length;
  const total = list.items.length;
  const progress = total > 0 ? (checkedCount / total) * 100 : 0;
  const allChecked = checkedCount === total && total > 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <button
        onClick={() => navigate('/shopping')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        My Shopping Lists
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{list.name}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{list.recipe_ids.length} recipe{list.recipe_ids.length !== 1 ? 's' : ''} · {total} items</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 ${
            list.status === 'completed' ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'
          }`}>
            {list.status}
          </span>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>{checkedCount} of {total} items checked</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${allChecked ? 'bg-green-500' : 'bg-green-400'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {list.status === 'active' && (
          <button
            onClick={handleComplete}
            disabled={completing}
            className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              allChecked
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-100 text-gray-500 cursor-not-allowed'
            }`}
          >
            {completing ? 'Completing...' : allChecked ? '✅ Mark as Complete' : `Check off all items first (${total - checkedCount} remaining)`}
          </button>
        )}
        {list.status === 'completed' && (
          <div className="mt-4 bg-green-50 rounded-xl py-2.5 text-center text-sm text-green-700 font-medium">
            ✅ Shopping complete!
          </div>
        )}
      </div>

      {/* Items by aisle */}
      {total === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <p>No items in this list</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(grouped.entries()).map(([aisle, items]) => {
            const aisleChecked = items.every((i) => i.is_checked);
            return (
              <div key={aisle} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Aisle header */}
                <div className={`px-4 py-2.5 flex items-center gap-2 ${aisleChecked ? 'bg-gray-50' : 'bg-green-50'}`}>
                  <span className="text-sm font-semibold text-gray-700">{aisle}</span>
                  <span className="text-xs text-gray-400 ml-auto">{items.filter((i) => i.is_checked).length}/{items.length}</span>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-50">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => list.status === 'active' && handleCheck(item)}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        list.status === 'active' ? 'cursor-pointer hover:bg-gray-50' : ''
                      } ${item.is_checked ? 'opacity-60' : ''}`}
                    >
                      {/* Checkbox */}
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        item.is_checked ? 'bg-green-500 border-green-500' : 'border-gray-300'
                      }`}>
                        {item.is_checked && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {/* Name */}
                      <span className={`flex-1 text-sm font-medium ${item.is_checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {item.ingredient_name}
                      </span>

                      {/* Qty */}
                      <span className={`text-sm tabular-nums shrink-0 ${item.is_checked ? 'text-gray-300' : 'text-gray-500'}`}>
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
