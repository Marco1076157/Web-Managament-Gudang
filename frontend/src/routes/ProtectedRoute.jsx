import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const getUserRole = (user) =>
  user?.role?.name ||
  user?.role ||
  user?.roles?.[0]?.name ||
  user?.roles?.[0] ||
  ''

export const homeForRole = (role) => {
  switch (String(role || '').toLowerCase()) {
    case 'keeper':
    case 'warehouse':
      return '/overview'
    case 'manager':
    case 'admin':
    default:
      return '/overview'
  }
}

const FullScreenLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-100">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-500">Memuat...</p>
    </div>
  </div>
)

// Layout guard: selalu render <Outlet/>, bukan children,
// supaya route anak tetap dirender tanpa redirect loop.
export default function ProtectedRoute({ allowedRoles }) {
  const { user, token, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullScreenLoader />
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />

  const userRole = getUserRole(user)

  if (allowedRoles && allowedRoles.length > 0) {
    const allowed = allowedRoles.map((r) => String(r).toLowerCase())
    const hasRole = allowed.includes(String(userRole).toLowerCase())

    if (!hasRole) {
      // Jangan lempar ke /unauthorized: arahkan user ke dashboard miliknya sendiri.
      return <Navigate to={homeForRole(userRole)} replace />
    }
  }

  return <Outlet />
}

// Untuk halaman login: sudah login -> langsung ke dashboard sesuai role.
export function GuestRoute({ children }) {
  const { user, token, loading } = useAuth()

  if (loading) return <FullScreenLoader />
  if (token) return <Navigate to={homeForRole(getUserRole(user))} replace />

  return children
}