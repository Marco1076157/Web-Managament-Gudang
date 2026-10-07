import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../api/authService'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = async () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(parsedUser)
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }

  const login = async (credentials) => {
    const response = await authService.login(credentials)
    const { token: newToken, user: userData } = response.data.data || response.data

    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))

    setToken(newToken)
    setUser(userData)

    return response
  }

  // Logout instan: bersihkan state + localStorage DULU,
  // baru panggil API backend di background (tidak blocking UI)
  const logout = async () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('sidebarCollapsed')

    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const refreshUser = async () => {
    try {
      const response = await authService.getUser()
      const userData = response.data.data || response.data.user || response.data
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error('Refresh user error:', error)
      logout()
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!token,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}