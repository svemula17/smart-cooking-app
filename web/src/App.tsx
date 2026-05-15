import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import ShoppingPage from './pages/ShoppingPage';
import ShoppingDetailPage from './pages/ShoppingDetailPage';
import HousePage from './pages/HousePage';
import NutritionPage from './pages/NutritionPage';
import AIChatPage from './pages/AIChatPage';
import ProfilePage from './pages/ProfilePage';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/recipes"      element={<Protected><RecipesPage /></Protected>} />
          <Route path="/recipes/:id"  element={<Protected><RecipeDetailPage /></Protected>} />

          <Route path="/shopping"     element={<Protected><ShoppingPage /></Protected>} />
          <Route path="/shopping/:id" element={<Protected><ShoppingDetailPage /></Protected>} />

          <Route path="/nutrition"    element={<Protected><NutritionPage /></Protected>} />
          <Route path="/house"        element={<Protected><HousePage /></Protected>} />
          <Route path="/ai"           element={<Protected><AIChatPage /></Protected>} />
          <Route path="/profile"      element={<Protected><ProfilePage /></Protected>} />

          <Route path="/" element={<Navigate to="/recipes" replace />} />
          <Route path="*" element={<Navigate to="/recipes" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
