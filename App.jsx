import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import CourseDetail from './pages/CourseDetail'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted text-sm">Loading…</div>
  if (!user) return <Navigate to="/auth" replace />
  return children
}

function Routed() {
  const { user, loading } = useAuth()

  return (
    <Routes>
      <Route
        path="/auth"
        element={loading ? null : user ? <Navigate to="/" replace /> : <Auth />}
      />
      <Route
        path="/"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />
      <Route
        path="/course/:id"
        element={
          <Protected>
            <CourseDetail />
          </Protected>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routed />
      </AuthProvider>
    </BrowserRouter>
  )
}
