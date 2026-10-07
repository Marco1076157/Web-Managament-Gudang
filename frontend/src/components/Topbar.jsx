import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Bell, Search, LogOut, ChevronDown } from 'lucide-react'
import UserAvatar from './UserAvatar'

const Topbar = ({ onLogout }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)
  const dropdownRef = useRef(null)

  const userRole =
    user?.role?.name ||
    user?.role ||
    user?.roles?.[0]?.name ||
    user?.roles?.[0] ||
    ''
  const roleLabel =
    typeof userRole === 'string' && userRole
      ? userRole.charAt(0).toUpperCase() + userRole.slice(1)
      : 'User'

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogoutClick = () => {
    setShowProfile(false)
    onLogout ? onLogout() : navigate('/login', { replace: true })
  }

  return (
    <header className="fixed top-0 right-0 z-30 h-16 bg-white border-b border-slate-200 transition-all duration-300 flex items-center justify-between px-4 lg:px-6">
      {/* Kiri: Search */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative w-full max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search..."
            aria-label="Search"
            className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Kanan: Notifikasi + Profile Card */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Profile Card */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowProfile((v) => !v)}
            className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl py-1.5 pl-1.5 pr-3 transition-colors"
            aria-expanded={showProfile}
            aria-haspopup="menu"
          >
            {/* Foto profil kalau ada, kalau tidak (atau gagal dimuat) pakai inisial. */}
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 overflow-hidden">
              <UserAvatar user={user} />
            </div>
            <div className="hidden md:block text-left min-w-0">
              <p className="text-sm font-semibold text-slate-900 leading-tight truncate max-w-[140px]">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-slate-500 leading-tight">{roleLabel}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
          </button>

          {showProfile && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-slate-200 shadow-2xl py-2 z-50"
            >
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.email || 'email@example.com'}
                </p>
                <span className="inline-flex items-center px-2.5 py-0.5 mt-2 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {roleLabel}
                </span>
              </div>
              <div className="p-2">
                <button
                  onClick={handleLogoutClick}
                  role="menuitem"
                  className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Topbar