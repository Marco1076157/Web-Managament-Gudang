import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Package,
  Boxes,
  Warehouse,
  Store,
  Shield,
  Users,
  UserCog,
  Settings,
  ReceiptText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import UserAvatar from './UserAvatar'

const mainMenu = [
  { path: '/overview', label: 'Overview', icon: LayoutDashboard },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/categories', label: 'Categories', icon: Boxes },
  { path: '/warehouses', label: 'Warehouses', icon: Warehouse },
  { path: '/merchants', label: 'Merchants', icon: Store },
]

const keeperMenu = [
  { path: '/overview', label: 'Overview', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: ReceiptText },
  { path: '/my-merchant', label: 'My Merchant', icon: Store },
]

const accountMenu = [
  { path: '/roles', label: 'Roles', icon: Shield },
]

// Menu grup ACCOUNT SETTINGS khusus Keeper (tanpa Roles / Manage User).
const keeperAccountMenu = [
  { path: '/settings', label: 'Settings', icon: Settings },
]

const manageUserChildren = [
  { path: '/users', label: 'Users List', icon: Users },
  { path: '/users/assign-role', label: 'Assign Role', icon: UserCog },
]

// Label seksi menu (MAIN MENU / ACCOUNT SETTINGS), berubah jadi garis
// saat sidebar mengecil supaya tidak memakan tempat.
const SectionHeading = ({ collapsed, children }) =>
  collapsed ? (
    <hr className="my-3 border-slate-200" />
  ) : (
    <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
      {children}
    </p>
  )

const Sidebar = ({ onLogout, collapsed, onToggleCollapse }) => {
  const { user } = useAuth()
  const location = useLocation()
  const [manageUserOpen, setManageUserOpen] = useState(() =>
    location.pathname.startsWith('/users')
  )

  const userRole =
    user?.role?.name || user?.role || user?.roles?.[0]?.name || user?.roles?.[0] || ''
  const isKeeper = String(userRole).toLowerCase() === 'keeper'
  const items = isKeeper ? keeperMenu : mainMenu

  const isActive = (path) => location.pathname === path

  const linkClass = (active) =>
    `relative flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-xl transition-all duration-200 ${
      active
        ? 'bg-blue-50 text-blue-700 font-semibold'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    } ${collapsed ? 'justify-center' : ''}`

  // Pill/garis vertikal biru di tepi kiri menu aktif
  const ActivePill = () => (
    <span
      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full"
      aria-hidden="true"
    />
  )

  const renderLink = (item, nested = false) => {
    const Icon = item.icon
    const active = isActive(item.path)
    return (
      <NavLink
        key={item.path}
        to={item.path}
        title={collapsed ? item.label : undefined}
        className={linkClass(active)}
        aria-current={active ? 'page' : undefined}
      >
        {active && <ActivePill />}
        <Icon
          className={`w-5 h-5 flex-shrink-0 ${active ? 'text-blue-600' : ''}`}
          aria-hidden="true"
        />
        {!collapsed && <span className="text-sm truncate">{item.label}</span>}
      </NavLink>
    )
  }

  const manageUserActive = manageUserChildren.some((c) => isActive(c.path))

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-white border-r border-slate-200 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } shadow-xl`}
    >
      <div className="flex flex-col h-full">
        {/* Brand */}
        <div
          className={`flex items-center justify-between h-16 px-4 border-b border-slate-200 shrink-0 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg object-contain shrink-0" />
            </div>
            {!collapsed && (
              <span className="font-bold text-lg text-slate-900 truncate">MONDAY</span>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        <nav
          className="flex-1 px-3 py-4 overflow-y-auto"
          role="navigation"
          aria-label="Main navigation"
        >
          {/* MAIN MENU */}
          {isKeeper && <SectionHeading collapsed={collapsed}>Main Menu</SectionHeading>}
          <div className="space-y-1">
            {items.map((item) => renderLink(item))}
          </div>

          {/* ACCOUNT SETTINGS (Manager) */}
          {!isKeeper && (
            <div className="mt-6">
              <SectionHeading collapsed={collapsed}>Account Settings</SectionHeading>

              <div className="space-y-1">
                {accountMenu.map((item) => renderLink(item))}

                {/* Manage User (Accordion) */}
                {collapsed ? (
                  <NavLink
                    to="/users"
                    title="Manage User"
                    className={linkClass(isActive('/users'))}
                  >
                    <Users className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  </NavLink>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => setManageUserOpen((v) => !v)}
                      aria-expanded={manageUserOpen}
                      className={`relative w-full flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-xl transition-all duration-200 ${
                        manageUserActive
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {manageUserActive && <ActivePill />}
                      <Users
                        className={`w-5 h-5 flex-shrink-0 ${
                          manageUserActive ? 'text-blue-600' : ''
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-sm flex-1 text-left">Manage User</span>
                      <ChevronDown
                        className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                          manageUserOpen ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    {manageUserOpen && (
                      <div className="mt-1 space-y-1 pl-6 border-l-2 border-slate-200 ml-5">
                        {manageUserChildren.map((item) => renderLink(item, true))}
                      </div>
                    )}
                  </div>
                )}

                {renderLink({ path: '/settings', label: 'Settings', icon: Settings })}
              </div>
            </div>
          )}

          {/* ACCOUNT SETTINGS (Keeper) */}
          {isKeeper && (
            <div className="mt-6">
              <SectionHeading collapsed={collapsed}>Account Settings</SectionHeading>

              <div className="space-y-1">
                {keeperAccountMenu.map((item) => renderLink(item))}
              </div>
            </div>
          )}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-slate-200 shrink-0">
          {collapsed ? (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center px-3 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" aria-hidden="true" />
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shrink-0 overflow-hidden">
                  <UserAvatar user={user} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 truncate capitalize">
                    {typeof userRole === 'string' ? userRole : 'User'}
                  </p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar