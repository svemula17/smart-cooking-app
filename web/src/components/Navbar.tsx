import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { to: '/recipes',   label: 'Recipes',   icon: '🍳' },
  { to: '/shopping',  label: 'Shopping',  icon: '🛒' },
  { to: '/nutrition', label: 'Nutrition', icon: '📊' },
  { to: '/house',     label: 'House',     icon: '🏠' },
  { to: '/ai',        label: 'AI Chef',   icon: '🤖' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) =>
    location.pathname.startsWith(path)
      ? 'text-green-600 border-b-2 border-green-600'
      : 'text-gray-600 hover:text-green-600 border-b-2 border-transparent';

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/recipes" className="flex items-center gap-2">
            <span className="text-2xl">🍳</span>
            <span className="text-xl font-bold text-green-700">SmartCooking</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {TABS.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className={`text-sm font-medium pb-1 transition-colors flex items-center gap-1 ${isActive(t.to)}`}
              >
                <span>{t.icon}</span>
                {t.label}
              </Link>
            ))}
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-full transition-colors"
            >
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {user?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</span>
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-gray-100 px-4 py-2 flex gap-4 overflow-x-auto">
        {TABS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className={`text-sm font-medium whitespace-nowrap flex items-center gap-1 ${isActive(t.to)}`}
          >
            <span>{t.icon}</span>
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
