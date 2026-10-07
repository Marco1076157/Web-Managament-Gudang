import { useAuth } from '../context/AuthContext'
import { Home, Lock, AlertTriangle } from 'lucide-react'
import Button from '../components/Button'

const Unauthorized = () => {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-red-600" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Access Denied</h1>
        <p className="text-slate-500 mb-6">
          You don't have permission to access this page. Your role (<span className="font-medium capitalize">{user?.role || 'Unknown'}</span>) doesn't have access to this resource.
        </p>
        <div className="space-y-3">
          <Button onClick={() => window.history.back()} variant="secondary">
            <Home className="w-5 h-5 mr-2" aria-hidden="true" />
            Go Back
          </Button>
          <Button onClick={logout} variant="outline">
            <Lock className="w-5 h-5 mr-2" aria-hidden="true" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Unauthorized