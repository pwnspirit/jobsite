import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({ requireRole }) {
  const { user, loading, isAuthenticated } = useAuth()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check role requirement if specified
  if (requireRole && user?.role !== requireRole) {
    // Redirect to dashboard if user doesn't have required role
    return <Navigate to="/dashboard" replace />
  }

  // Render the protected route
  return <Outlet />
}

export default ProtectedRoute 