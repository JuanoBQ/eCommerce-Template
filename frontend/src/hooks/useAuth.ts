import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authApi, usersApi } from '@/lib/api'
import { User } from '@/types'
import toast from 'react-hot-toast'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface LoginCredentials {
  email: string
  password: string
  remember_me?: boolean
}

interface RegisterData {
  email: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
  phone?: string
  terms_accepted: boolean
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  const router = useRouter()

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setAuthState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }))
        return
      }

      // Verify token
      await authApi.verifyToken(token)
      
      // Get user profile
      const userData = await usersApi.getProfile()
      const user = userData as User
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Authentication failed',
      })
    }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const response = await authApi.login(credentials.email, credentials.password) as any

      // Store tokens
      if (response?.access && response?.refresh) {
        localStorage.setItem('access_token', response.access)
        localStorage.setItem('refresh_token', response.refresh)
      } else {
        throw new Error('Invalid login response')
      }
      
      // Get user profile
      const userData = await usersApi.getProfile() as any
      const user = userData as User

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })

      toast.success('¡Bienvenido!')
      router.push('/')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al iniciar sesión'
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      toast.error(errorMessage)
    }
  }, [router])

  const register = useCallback(async (data: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const response = await authApi.register(data) as any

      // Store tokens if registration includes login
      if (response?.access && response?.refresh) {
        localStorage.setItem('access_token', response.access)
        localStorage.setItem('refresh_token', response.refresh)
        
        // Get user profile
        const profileData = await usersApi.getProfile() as any
        const user = profileData as User

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }))
      }

      toast.success('¡Cuenta creada exitosamente!')
      router.push('/auth/verify-email')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al crear la cuenta'
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      toast.error(errorMessage)
    }
  }, [router])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear tokens and state regardless of API call success
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
      toast.success('Sesión cerrada')
      router.push('/auth/login')
    }
  }, [router])

  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const updatedUserData = await usersApi.updateProfile(data) as any
      const updatedUser = updatedUserData as User

      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
        error: null,
      }))
      
      toast.success('Perfil actualizado')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al actualizar el perfil'
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      toast.error(errorMessage)
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    try {
      await authApi.resetPassword(email)
      toast.success('Instrucciones enviadas a tu correo')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al enviar el correo'
      toast.error(errorMessage)
    }
  }, [])

  const changePassword = useCallback(async (data: {
    old_password: string
    new_password: string
    new_password_confirm: string
  }) => {
    try {
      await authApi.changePassword(data)
      toast.success('Contraseña actualizada')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al cambiar la contraseña'
      toast.error(errorMessage)
    }
  }, [])

  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await authApi.refreshToken(refreshToken) as any
      if (response?.access) {
        localStorage.setItem('access_token', response.access)
      } else {
        throw new Error('Invalid refresh response')
      }

      return response.access
    } catch (error) {
      console.error('Token refresh failed:', error)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Session expired',
      })
      router.push('/auth/login')
      throw error
    }
  }, [router])

  return {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    changePassword,
    refreshToken,
    checkAuthStatus,
  }
}

export default useAuth
