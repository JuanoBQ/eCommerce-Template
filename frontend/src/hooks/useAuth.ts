import { useState, useEffect, useCallback, useRef } from 'react'
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

  // Efecto para manejar cambios en localStorage (útil para múltiples pestañas)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        console.log('🔄 Token cambió en otra pestaña, verificando autenticación...')
        checkAuthStatus()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Debug: Log auth state changes (usando useRef para evitar bucles)
  const prevAuthState = useRef<{ user: string | null; isLoading: boolean }>({ user: null, isLoading: true })
  
  useEffect(() => {
    const currentState = { user: authState.user?.first_name || null, isLoading: authState.isLoading }
    const prevState = prevAuthState.current
    
    // Solo loggear si realmente cambió algo
    if (prevState.user !== currentState.user || prevState.isLoading !== currentState.isLoading) {
      console.log('🔄 Auth state changed:', { 
        isAuthenticated: authState.isAuthenticated, 
        user: currentState.user, 
        isLoading: currentState.isLoading,
        hasUser: !!authState.user 
      })
      prevAuthState.current = currentState
    }
  })

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

  // Función para esperar a que el estado se actualice
  const waitForAuthUpdate = useCallback(() => {
    return new Promise<void>((resolve) => {
      const checkState = () => {
        setAuthState(currentState => {
          if (currentState.isAuthenticated && currentState.user && !currentState.isLoading) {
            resolve()
            return currentState
          }

          // Si aún está cargando o no está autenticado, esperar un poco más
          setTimeout(checkState, 50)
          return currentState
        })
      }

      // Iniciar la verificación
      setTimeout(checkState, 50)
    })
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      console.log('🚀 Iniciando proceso de login...')
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      const response = await authApi.login(credentials.email, credentials.password) as any

      // Store tokens
      if (response?.access_token && response?.refresh_token) {
        localStorage.setItem('access_token', response.access_token)
        localStorage.setItem('refresh_token', response.refresh_token)
        console.log('🔑 Tokens guardados (access_token/refresh_token)')
      } else if (response?.access && response?.refresh) {
        localStorage.setItem('access_token', response.access)
        localStorage.setItem('refresh_token', response.refresh)
        console.log('🔑 Tokens guardados (access/refresh)')
      } else {
        console.error('❌ Respuesta de login inválida:', response)
        throw new Error('Invalid login response')
      }

      // Get user profile
      console.log('👤 Obteniendo perfil de usuario...')
      const userData = await usersApi.getProfile() as any
      console.log('✅ Perfil obtenido:', userData)
      const user = userData as User

      // Actualizar estado de autenticación
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })

      console.log('✅ Login completado exitosamente')
      return { success: true }
    } catch (error: any) {
      console.error('❌ Login error:', error)
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
  }, [])

  // Función para forzar actualización del estado después del login
  const forceAuthUpdate = useCallback(async () => {
    console.log('🔄 Forzando actualización del estado de autenticación...')
    await checkAuthStatus()
  }, [checkAuthStatus])

  // Función para refrescar el estado inmediatamente (útil después de login)
  const refreshAuthState = useCallback(async () => {
    console.log('🔄 Refrescando estado de autenticación inmediatamente...')
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        console.log('❌ No hay token, estableciendo estado no autenticado')
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
        return
      }

      // Obtener perfil inmediatamente
      console.log('👤 Obteniendo perfil para refresh...')
      const userData = await usersApi.getProfile() as any
      const user = userData as User

      console.log('✅ Perfil obtenido para refresh:', user?.first_name)

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })

      console.log('✅ Estado refrescado exitosamente - isAuthenticated: true, user:', user?.first_name)
    } catch (error) {
      console.error('❌ Error al refrescar estado:', error)
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Error al refrescar estado',
      })
    }
  }, [])

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
    console.log('🔄 Iniciando actualización de perfil...')
    console.log('📊 Datos a enviar:', data)

    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      const updatedUserData = await usersApi.updateProfile(data) as any
      console.log('📥 Respuesta del backend:', updatedUserData)

      const updatedUser = updatedUserData as User

      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
        error: null,
      }))

      console.log('✅ Estado actualizado correctamente')
      return updatedUserData
    } catch (error: any) {
      console.error('❌ Error en updateProfile:', error)
      console.error('❌ Status code:', error.response?.status)
      console.error('❌ Error data:', error.response?.data)

      const errorMessage = error.response?.data?.detail ||
                          error.response?.data?.non_field_errors?.[0] ||
                          error.response?.data?.first_name?.[0] ||
                          error.response?.data?.last_name?.[0] ||
                          error.response?.data?.phone?.[0] ||
                          error.response?.data?.email?.[0] ||
                          'Error al actualizar el perfil'

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))

      throw error // Re-lanzar el error para que el componente lo maneje
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
    forceAuthUpdate,
    refreshAuthState,
    waitForAuthUpdate,
  }
}

export default useAuth
