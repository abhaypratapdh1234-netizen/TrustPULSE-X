import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoadingScreen from './components/ui/LoadingScreen'
import ProtectedRoute from './components/ui/ProtectedRoute'
import { useAuth } from './context/AuthContext'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const CompanyPage = lazy(() => import('./pages/CompanyPage'))
const ComparePage = lazy(() => import('./pages/ComparePage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const TrendingPage = lazy(() => import('./pages/TrendingPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))

function App() {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/company/:slug" element={<CompanyPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
