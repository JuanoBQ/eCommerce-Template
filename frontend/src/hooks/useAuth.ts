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
}

interface RegisterData {
  email: string
  password1: string
  password2: string
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

      console.log('🔍 Verificando autenticación...')
      
      // Get user profile to verify token
      const userData = await usersApi.getProfile() as any
      console.log('✅ Usuario autenticado:', userData)
      const user = userData as User
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      console.error('❌ Auth check failed:', error)
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
      if (response?.access_token && response?.refresh_token) {
        localStorage.setItem('access_token', response.access_token)
        localStorage.setItem('refresh_token', response.refresh_token)
        console.log('🔑 Tokens guardados (access_token/refresh_token):', {
          access: response.access_token.substring(0, 20) + '...',
          refresh: response.refresh_token.substring(0, 20) + '...'
        })
      } else if (response?.access && response?.refresh) {
        localStorage.setItem('access_token', response.access)
        localStorage.setItem('refresh_token', response.refresh)
        console.log('🔑 Tokens guardados (access/refresh):', {
          access: response.access.substring(0, 20) + '...',
          refresh: response.refresh.substring(0, 20) + '...'
        })
      } else {
        console.error('❌ Respuesta de login inválida:', response)
        throw new Error('Invalid login response')
      }

      // Get user profile
      console.log('👤 Obteniendo perfil de usuario...')
      const userData = await usersApi.getProfile() as any
      console.log('✅ Perfil obtenido:', userData)
      const user = userData as User

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })

      return { success: true }
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.detail ||
                          error.response?.data?.non_field_errors?.[0] ||
                          error.response?.data?.email?.[0] ||
                          error.response?.data?.password?.[0] ||
                          'Error al iniciar sesión. Verifica tus credenciales.'

      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      }))

      throw new Error(errorMessage)
    }
  }, [router])

  const register = useCallback(async (data: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      // Transformar los datos para que coincidan con el backend
      const registerData = {
        email: data.email,
        username: data.email, // Usar email como username
        password: data.password1,
        password_confirm: data.password2,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        terms_accepted: data.terms_accepted
      }

      const response = await authApi.register(registerData) as any

      setAuthState(prev => ({ ...prev, isLoading: false }))

      return { success: true, message: 'Cuenta creada exitosamente. Revisa tu correo para verificar tu cuenta.' }
    } catch (error: any) {
      console.error('Register error:', error)

      const errorMessage = error.response?.data?.detail ||
                          error.response?.data?.email?.[0] ||
                          error.response?.data?.password?.[0] ||
                          error.response?.data?.password_confirm?.[0] ||
                          error.response?.data?.first_name?.[0] ||
                          error.response?.data?.last_name?.[0] ||
                          error.response?.data?.phone?.[0] ||
                          error.response?.data?.terms_accepted?.[0] ||
                          error.response?.data?.non_field_errors?.[0] ||
                          'Error al crear la cuenta'

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))

      throw new Error(errorMessage)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      // Try to logout from server first
      await authApi.logout()
    } catch (error) {
      console.error('Server logout error:', error)
      // Continue with client-side logout even if server logout fails
    }

    // Always clear client-side tokens and state
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')

    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })

    toast.success('Sesión cerrada exitosamente')
    router.push('/auth/login')
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
