import { createContext, useContext, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../lib/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const isAuthenticated = !!user && !!localStorage.getItem('accessToken')

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials)
    // auth-service returns AuthResponse directly (not wrapped in ApiResponse)
    const payload = data.data ?? data
    localStorage.setItem('accessToken', payload.accessToken)
    localStorage.setItem('user', JSON.stringify(payload))
    setUser(payload)
    navigate('/dashboard')
  }, [navigate])

  const register = useCallback(async (formData) => {
    const { data } = await authApi.register(formData)
    // auth-service returns AuthResponse directly (not wrapped in ApiResponse)
    const payload = data.data ?? data
    localStorage.setItem('accessToken', payload.accessToken)
    localStorage.setItem('user', JSON.stringify(payload))
    setUser(payload)
    navigate('/dashboard')
  }, [navigate])

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    setUser(null)
    toast.success('Logged out successfully')
    navigate('/login')
  }, [navigate])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
