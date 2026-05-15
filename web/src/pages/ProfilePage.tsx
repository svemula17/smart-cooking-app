import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user?.name ?? 'User'}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">User ID</p>
            <p className="text-sm font-mono text-gray-800 break-all">{user?.id}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Email</p>
            <p className="text-sm text-gray-800">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <a href="/recipes" className="block bg-green-50 hover:bg-green-100 rounded-xl p-4 transition">
            <div className="text-xl mb-1">🍳</div>
            <p className="text-sm font-medium text-gray-800">Browse Recipes</p>
          </a>
          <a href="/shopping" className="block bg-blue-50 hover:bg-blue-100 rounded-xl p-4 transition">
            <div className="text-xl mb-1">🛒</div>
            <p className="text-sm font-medium text-gray-800">Shopping Lists</p>
          </a>
          <a href="/nutrition" className="block bg-amber-50 hover:bg-amber-100 rounded-xl p-4 transition">
            <div className="text-xl mb-1">📊</div>
            <p className="text-sm font-medium text-gray-800">Nutrition Tracker</p>
          </a>
          <a href="/house" className="block bg-purple-50 hover:bg-purple-100 rounded-xl p-4 transition">
            <div className="text-xl mb-1">🏠</div>
            <p className="text-sm font-medium text-gray-800">My House</p>
          </a>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Account</h3>
        <button
          onClick={logout}
          className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-sm font-medium transition"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
