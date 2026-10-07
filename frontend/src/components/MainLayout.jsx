import { useState, useEffect, useCallback } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useAuth } from '../context/AuthContext'

const MainLayout = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  // Logout instan: bersihkan state + storage DULU, baru panggil API di background
  const handleLogout = useCallback(async () => {
    const pending = logout()
    navigate('/login', { replace: true })
    try {
      await pending
    } catch {
      /* diabaikan, storage sudah dibersihkan */
    }
  }, [logout, navigate])

  const contentMargin = sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />

      <div className={`${contentMargin} transition-all duration-300 min-h-screen`}>
        <Topbar onLogout={handleLogout} sidebarCollapsed={sidebarCollapsed} />

        <main className="pt-16 pb-8 px-4 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default MainLayout