import { useEffect, useState } from 'react';
import { createHouse, getMyHouse, joinHouse, listMembers, listExpenses, getSchedule, getLeaderboard, getChores, House, HouseMember, Expense, ScheduleEntry } from '../api/house';
import { DEMO_HOUSE, DEMO_MEMBERS, DEMO_SCHEDULE, DEMO_CHORES, DEMO_EXPENSES, DEMO_LEADERBOARD } from '../data/demo';

type Tab = 'overview' | 'members' | 'expenses' | 'schedule' | 'chores' | 'leaderboard';

export default function HousePage() {
  const [house, setHouse] = useState<House | null>(null);
  const [isDemo, setIsDemo] = useState(false);
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
  const [view, setView] = useState<'gate' | 'house'>('gate');

  useEffect(() => {
    getMyHouse()
      .then((h) => {
        if (h) {
          setHouse(h);
          setIsDemo(false);
          setView('house');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!house) return;
    if (isDemo) {
      if (tab === 'members')     setMembers(DEMO_MEMBERS);
      if (tab === 'expenses')    setExpenses(DEMO_EXPENSES);
      if (tab === 'schedule')    setSchedule(DEMO_SCHEDULE);
      if (tab === 'chores')      setChores(DEMO_CHORES);
      if (tab === 'leaderboard') setLeaderboard(DEMO_LEADERBOARD);
      return;
    }
    if (tab === 'members')     listMembers(house.id).then((d) => setMembers(d.length ? d : DEMO_MEMBERS)).catch(() => setMembers(DEMO_MEMBERS));
    if (tab === 'expenses')    listExpenses(house.id).then((d) => setExpenses(d.length ? d : DEMO_EXPENSES)).catch(() => setExpenses(DEMO_EXPENSES));
    if (tab === 'schedule')    getSchedule(house.id).then((d) => setSchedule(d.length ? d : DEMO_SCHEDULE)).catch(() => setSchedule(DEMO_SCHEDULE));
    if (tab === 'chores')      getChores(house.id).then((d) => setChores(d.length ? d : DEMO_CHORES)).catch(() => setChores(DEMO_CHORES));
    if (tab === 'leaderboard') getLeaderboard(house.id).then((d) => setLeaderboard(d.length ? d : DEMO_LEADERBOARD)).catch(() => setLeaderboard(DEMO_LEADERBOARD));
  }, [tab, house, isDemo]);

  const enterDemo = () => {
    setHouse(DEMO_HOUSE);
    setIsDemo(true);
    setView('house');
  };

  const handleCreate = async () => {
    if (!createName.trim()) return;
    setBusy(true);
    try {
      const h = await createHouse(createName.trim());
      setHouse(h);
      setIsDemo(false);
      setView('house');
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
      setIsDemo(false);
      setView('house');
    } catch (e: any) {
      alert(e.response?.data?.error?.message ?? 'Invalid invite code');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-8"><div className="animate-pulse text-gray-400">Loading house...</div></div>;
  }

  if (!house || view === 'gate') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🏠</div>
          <h1 className="text-2xl font-bold text-gray-900">Join or Create a House</h1>
          <p className="text-gray-500 mt-2">Coordinate cooking, chores, and expenses with your roommates</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-3">Create a new house</h2>
            <input
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="e.g., 123 Maple Street"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button onClick={handleCreate} disabled={busy || !createName.trim()} className="w-full bg-green-600 text-white py-2.5 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50">Create House</button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-3">Join with invite code</h2>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g., ABC123"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm mb-3 uppercase focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button onClick={handleJoin} disabled={busy || !joinCode.trim()} className="w-full bg-white border border-green-600 text-green-700 py-2.5 rounded-xl font-medium hover:bg-green-50 disabled:opacity-50">Join House</button>
          </div>
        </div>

        <button
          onClick={enterDemo}
          className="w-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-800 py-3 rounded-xl text-sm font-medium hover:from-amber-100 hover:to-orange-100"
        >
          👀 Preview with demo data
        </button>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview',    label: 'Overview',      icon: '🏠' },
    { key: 'members',     label: 'Members',       icon: '👥' },
    { key: 'schedule',    label: 'Cook Schedule', icon: '📅' },
    { key: 'chores',      label: 'Chores',        icon: '🧹' },
    { key: 'expenses',    label: 'Expenses',      icon: '💰' },
    { key: 'leaderboard', label: 'Leaderboard',   icon: '🏆' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {house.name}
            {isDemo && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">DEMO</span>}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Invite code: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{house.invite_code}</span>
          </p>
        </div>
        {isDemo && (
          <button onClick={() => { setHouse(null); setIsDemo(false); setView('gate'); }} className="text-sm text-green-700 underline">
            Exit demo
          </button>
        )}
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button onClick={() => setTab('members')} className="bg-green-50 hover:bg-green-100 rounded-xl p-4 text-left transition">
                <div className="text-2xl mb-1">👥</div>
                <p className="text-sm font-medium text-gray-800">Members</p>
                <p className="text-xs text-gray-500 mt-1">{DEMO_MEMBERS.length} roommates</p>
              </button>
              <button onClick={() => setTab('schedule')} className="bg-blue-50 hover:bg-blue-100 rounded-xl p-4 text-left transition">
                <div className="text-2xl mb-1">📅</div>
                <p className="text-sm font-medium text-gray-800">Cook Schedule</p>
                <p className="text-xs text-gray-500 mt-1">Who cooks when</p>
              </button>
              <button onClick={() => setTab('chores')} className="bg-purple-50 hover:bg-purple-100 rounded-xl p-4 text-left transition">
                <div className="text-2xl mb-1">🧹</div>
                <p className="text-sm font-medium text-gray-800">Chores</p>
                <p className="text-xs text-gray-500 mt-1">Rotating duties</p>
              </button>
              <button onClick={() => setTab('expenses')} className="bg-amber-50 hover:bg-amber-100 rounded-xl p-4 text-left transition">
                <div className="text-2xl mb-1">💰</div>
                <p className="text-sm font-medium text-gray-800">Expenses</p>
                <p className="text-xs text-gray-500 mt-1">Track shared costs</p>
              </button>
            </div>
          </div>
        )}

        {tab === 'members' && (
          <div>
            <h2 className="font-semibold mb-4">Members ({members.length})</h2>
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
          </div>
        )}

        {tab === 'schedule' && (
          <div>
            <h2 className="font-semibold mb-4">Cook Schedule</h2>
            <div className="space-y-2">
              {schedule.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium">{s.meal_date} · {s.meal_type}</p>
                    <p className="text-xs text-gray-500">Cook: {s.cook_name ?? s.cook_user_id}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'completed' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'chores' && (
          <div>
            <h2 className="font-semibold mb-4">Chores</h2>
            <div className="space-y-2">
              {chores.map((c, i) => (
                <div key={c.id ?? i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm">{c.chore_type ?? c.type_name ?? 'Chore'} · {c.assigned_date ?? c.due_date}</p>
                  <span className="text-xs text-gray-500">{c.assigned_to_name ?? c.user_name ?? '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'expenses' && (
          <div>
            <h2 className="font-semibold mb-4">Expenses</h2>
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
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
              <span className="text-gray-600">Total this month</span>
              <span className="font-semibold text-gray-900">${expenses.reduce((s, e) => s + Number(e.amount), 0).toFixed(2)}</span>
            </div>
          </div>
        )}

        {tab === 'leaderboard' && (
          <div>
            <h2 className="font-semibold mb-4">House Leaderboard 🏆</h2>
            <div className="space-y-2">
              {leaderboard.map((l, i) => (
                <div key={l.user_id ?? i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold w-8 text-center ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-gray-500'}`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{l.name ?? l.user_name ?? l.user_id}</p>
                      <p className="text-xs text-gray-500">{l.total_meals ?? 0} meals cooked</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-700">{l.score ?? 0} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
