import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import ShoppingPage from './pages/ShoppingPage';
import ShoppingDetailPage from './pages/ShoppingDetailPage';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/recipes"
            element={
              <ProtectedRoute>
                <Layout><RecipesPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipes/:id"
            element={
              <ProtectedRoute>
                <Layout><RecipeDetailPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shopping"
            element={
              <ProtectedRoute>
                <Layout><ShoppingPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shopping/:id"
            element={
              <ProtectedRoute>
                <Layout><ShoppingDetailPage /></Layout>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/recipes" replace />} />
          <Route path="*" element={<Navigate to="/recipes" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
