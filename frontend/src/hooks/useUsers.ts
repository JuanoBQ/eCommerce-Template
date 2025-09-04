import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

export interface UserAddress {
  id: number
  title: string
  first_name: string
  last_name: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
  is_billing: boolean
  is_shipping: boolean
  full_address: string
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  is_staff: boolean
  is_superuser: boolean
  is_active: boolean
  date_joined: string
  last_login?: string
  phone?: string
  birth_date?: string
  avatar?: string
  is_vendor?: boolean
  is_customer?: boolean
  default_address?: string
  default_city?: string
  default_state?: string
  default_country?: string
  default_postal_code?: string
  email_notifications?: boolean
  sms_notifications?: boolean
  terms_accepted?: boolean
  created_at?: string
  updated_at?: string
  addresses?: UserAddress[]
  default_address_obj?: UserAddress
}

export interface UserStats {
  total_users: number
  active_users: number
  staff_users: number
  regular_users: number
}

export interface CreateUserData {
  email: string
  first_name: string
  last_name: string
  password: string
  is_staff?: boolean
  is_active?: boolean
  phone?: string
  address?: string
  city?: string
  country?: string
  postal_code?: string
  date_of_birth?: string
  gender?: string
}

export interface UpdateUserData {
  email?: string
  first_name?: string
  last_name?: string
  is_staff?: boolean
  is_active?: boolean
  phone?: string
  address?: string
  city?: string
  country?: string
  postal_code?: string
  date_of_birth?: string
  gender?: string
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar usuarios
  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('🔍 Cargando usuarios...')
      
      const response = await apiClient.get('/users/') as { results: User[] }
      console.log('📊 Respuesta completa:', response)
      console.log('📊 Results:', response.results)
      
      const usersData = response.results || []
      setUsers(usersData)
      
      // Calcular estadísticas
      const stats: UserStats = {
        total_users: usersData.length,
        active_users: usersData.filter((user: User) => user.is_active).length,
        staff_users: usersData.filter((user: User) => user.is_staff).length,
        regular_users: usersData.filter((user: User) => !user.is_staff).length
      }
      setUserStats(stats)
      
      console.log('✅ Usuarios cargados:', usersData.length)
    } catch (err: any) {
      console.error('❌ Error al cargar usuarios:', err)
      setError(err.response?.data?.detail || 'Error al cargar usuarios')
      toast.error('Error al cargar usuarios')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Crear usuario
  const createUser = useCallback(async (userData: CreateUserData) => {
    try {
      console.log('➕ Creando usuario:', userData)
      const response = await apiClient.post('/users/', userData) as { data: User }
      console.log('✅ Usuario creado:', response.data)
      
      // Recargar usuarios
      await loadUsers()
      toast.success('Usuario creado exitosamente')
      return response.data
    } catch (err: any) {
      console.error('❌ Error al crear usuario:', err)
      const errorMessage = err.response?.data?.detail || 'Error al crear usuario'
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }, [loadUsers])

  // Actualizar usuario
  const updateUser = useCallback(async (userId: number, userData: UpdateUserData) => {
    try {
      console.log('✏️ Actualizando usuario:', userId, userData)
      const response = await apiClient.patch(`/users/${userId}/`, userData) as { data: User }
      console.log('✅ Usuario actualizado:', response.data)
      
      // Actualizar la lista local
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, ...response.data } : user
        )
      )
      
      toast.success('Usuario actualizado exitosamente')
      return response.data
    } catch (err: any) {
      console.error('❌ Error al actualizar usuario:', err)
      const errorMessage = err.response?.data?.detail || 'Error al actualizar usuario'
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  // Eliminar usuario
  const deleteUser = useCallback(async (userId: number) => {
    try {
      console.log('🗑️ Eliminando usuario:', userId)
      await apiClient.delete(`/users/${userId}/`)
      console.log('✅ Usuario eliminado')
      
      // Actualizar la lista local
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId))
      
      toast.success('Usuario eliminado exitosamente')
    } catch (err: any) {
      console.error('❌ Error al eliminar usuario:', err)
      const errorMessage = err.response?.data?.detail || 'Error al eliminar usuario'
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  // Activar/Desactivar usuario
  const toggleUserStatus = useCallback(async (userId: number, isActive: boolean) => {
    try {
      console.log('🔄 Cambiando estado del usuario:', userId, isActive)
      await updateUser(userId, { is_active: isActive })
      
      const action = isActive ? 'activado' : 'desactivado'
      toast.success(`Usuario ${action} exitosamente`)
    } catch (err: any) {
      console.error('❌ Error al cambiar estado del usuario:', err)
      toast.error('Error al cambiar estado del usuario')
    }
  }, [updateUser])

  // Cambiar rol de usuario
  const toggleUserRole = useCallback(async (userId: number, isStaff: boolean) => {
    try {
      console.log('🔄 Cambiando rol del usuario:', userId, isStaff)
      await updateUser(userId, { is_staff: isStaff })
      
      const role = isStaff ? 'administrador' : 'cliente'
      toast.success(`Usuario convertido a ${role} exitosamente`)
    } catch (err: any) {
      console.error('❌ Error al cambiar rol del usuario:', err)
      toast.error('Error al cambiar rol del usuario')
    }
  }, [updateUser])

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  return {
    users,
    userStats,
    isLoading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    toggleUserRole
  }
}
