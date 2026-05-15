import { useEffect, useState } from 'react';
import { createHouse, getMyHouse, joinHouse, listMembers, listExpenses, getSchedule, getLeaderboard, getChores, House, HouseMember, Expense, ScheduleEntry } from '../api/house';

type Tab = 'overview' | 'members' | 'expenses' | 'schedule' | 'chores' | 'leaderboard';

export default function HousePage() {
  const [house, setHouse] = useState<House | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');
  const [members, setMembers] = useState<HouseMember[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [chores, setChores] = useState<any[]>([]);
  const [createName, setCreateName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getMyHouse()
      .then((h) => setHouse(h))
      .catch(() => setHouse(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!house) return;
    if (tab === 'members') listMembers(house.id).then(setMembers).catch(() => setMembers([]));
    if (tab === 'expenses') listExpenses(house.id).then(setExpenses).catch(() => setExpenses([]));
    if (tab === 'schedule') getSchedule(house.id).then(setSchedule).catch(() => setSchedule([]));
    if (tab === 'chores') getChores(house.id).then(setChores).catch(() => setChores([]));
    if (tab === 'leaderboard') getLeaderboard(house.id).then(setLeaderboard).catch(() => setLeaderboard([]));
  }, [tab, house]);

  const handleCreate = async () => {
    if (!createName.trim()) return;
    setBusy(true);
    try {
      const h = await createHouse(createName.trim());
      setHouse(h);
    } catch (e: any) {
      alert(e.response?.data?.error?.message ?? 'Failed to create house');
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setBusy(true);
    try {
      const h = await joinHouse(joinCode.trim().toUpperCase());
      setHouse(h);
    } catch (e: any) {
      alert(e.response?.data?.error?.message ?? 'Invalid invite code');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse text-gray-400">Loading house...</div>
      </div>
    );
  }

  if (!house) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🏠</div>
          <h1 className="text-2xl font-bold text-gray-900">Join or Create a House</h1>
          <p className="text-gray-500 mt-2">Coordinate cooking, chores, and expenses with your roommates</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-3">Create a new house</h2>
            <input
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="e.g., 123 Maple Street"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              onClick={handleCreate}
              disabled={busy || !createName.trim()}
              className="w-full bg-green-600 text-white py-2.5 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50"
            >
              Create House
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-3">Join with invite code</h2>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g., ABC123"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm mb-3 uppercase focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              onClick={handleJoin}
              disabled={busy || !joinCode.trim()}
              className="w-full bg-white border border-green-600 text-green-700 py-2.5 rounded-xl font-medium hover:bg-green-50 disabled:opacity-50"
            >
              Join House
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: '🏠' },
    { key: 'members', label: 'Members', icon: '👥' },
    { key: 'schedule', label: 'Cook Schedule', icon: '📅' },
    { key: 'chores', label: 'Chores', icon: '🧹' },
    { key: 'expenses', label: 'Expenses', icon: '💰' },
    { key: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{house.name}</h1>
        <p className="text-gray-500 text-sm mt-1">
          Invite code: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{house.invite_code}</span>
        </p>
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto pb-2 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              tab === t.key ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="mr-1.5">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {tab === 'overview' && (
          <div>
            <h2 className="font-semibold mb-4">Welcome to {house.name}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-2xl mb-1">👥</div>
                <p className="text-sm text-gray-600">Members</p>
                <p className="text-xs text-gray-500 mt-1">View and invite roommates</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-2xl mb-1">📅</div>
                <p className="text-sm text-gray-600">Cook Schedule</p>
                <p className="text-xs text-gray-500 mt-1">Who cooks when</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="text-2xl mb-1">💰</div>
                <p className="text-sm text-gray-600">Expenses</p>
                <p className="text-xs text-gray-500 mt-1">Track shared costs</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'members' && (
          <div>
            <h2 className="font-semibold mb-4">Members ({members.length})</h2>
            {members.length === 0 ? (
              <p className="text-gray-400 text-sm">No members yet. Share your invite code: <span className="font-mono">{house.invite_code}</span></p>
            ) : (
              <div className="space-y-2">
                {members.map((m) => (
                  <div key={m.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                        {m.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{m.name}</p>
                        <p className="text-xs text-gray-500">{m.email}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${m.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'schedule' && (
          <div>
            <h2 className="font-semibold mb-4">Cook Schedule</h2>
            {schedule.length === 0 ? (
              <p className="text-gray-400 text-sm">No schedule generated yet.</p>
            ) : (
              <div className="space-y-2">
                {schedule.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium">{s.meal_date} · {s.meal_type}</p>
                      <p className="text-xs text-gray-500">Cook: {s.cook_name ?? s.cook_user_id}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{s.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'chores' && (
          <div>
            <h2 className="font-semibold mb-4">Chores</h2>
            {chores.length === 0 ? (
              <p className="text-gray-400 text-sm">No chores scheduled yet.</p>
            ) : (
              <div className="space-y-2">
                {chores.map((c, i) => (
                  <div key={c.id ?? i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm">{c.chore_type ?? c.type_name ?? 'Chore'} · {c.assigned_date ?? c.due_date}</p>
                    <span className="text-xs text-gray-500">{c.assigned_to_name ?? c.user_name ?? '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'expenses' && (
          <div>
            <h2 className="font-semibold mb-4">Expenses</h2>
            {expenses.length === 0 ? (
              <p className="text-gray-400 text-sm">No expenses logged yet.</p>
            ) : (
              <div className="space-y-2">
                {expenses.map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium">{e.description}</p>
                      <p className="text-xs text-gray-500">{e.category} · paid by {e.payer_name ?? e.paid_by}</p>
                    </div>
                    <p className="font-semibold text-gray-900">${Number(e.amount).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'leaderboard' && (
          <div>
            <h2 className="font-semibold mb-4">House Leaderboard 🏆</h2>
            {leaderboard.length === 0 ? (
              <p className="text-gray-400 text-sm">No data yet — start cooking and rating!</p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((l, i) => (
                  <div key={l.user_id ?? i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold w-6 text-center">{i + 1}</span>
                      <p className="text-sm font-medium">{l.name ?? l.user_name ?? l.user_id}</p>
                    </div>
                    <span className="text-sm text-gray-600">{l.score ?? l.total_meals ?? 0} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
