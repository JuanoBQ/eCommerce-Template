import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

export interface AdminSettings {
  // Configuración general
  site_name: string
  site_description: string
  site_url: string
  admin_email: string
  
  // Configuración de email
  email_host: string
  email_port: number
  email_username: string
  email_password: string
  email_use_tls: boolean
  
  // Configuración de seguridad
  session_timeout: number
  max_login_attempts: number
  password_min_length: number
  require_2fa: boolean
  
  // Configuración de productos
  max_products_per_page: number
  enable_reviews: boolean
  enable_wishlist: boolean
  enable_notifications: boolean
  
  // Configuración de órdenes
  order_auto_confirm: boolean
  order_auto_cancel_hours: number
  enable_tracking: boolean
  
  // Configuración de pagos
  payment_gateway: string
  payment_test_mode: boolean
  currency: string
  
  // Configuración de notificaciones
  email_notifications: boolean
  sms_notifications: boolean
  push_notifications: boolean
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface AdminStats {
  users: {
    total: number
    active: number
    staff: number
    customers: number
  }
  products: {
    total: number
    active: number
    with_variants: number
  }
  orders: {
    total: number
    pending: number
    confirmed: number
    shipped: number
    delivered: number
    cancelled: number
  }
  addresses: {
    total: number
    default: number
  }
}

export const useAdminSettings = () => {
  const [settings, setSettings] = useState<AdminSettings | null>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar configuraciones
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.get('/admin/settings/')
      setSettings(response as AdminSettings)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al cargar configuraciones'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error loading admin settings:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Guardar configuraciones
  const saveSettings = useCallback(async (newSettings: Partial<AdminSettings>) => {
    try {
      setIsSaving(true)
      setError(null)
      
      const response = await apiClient.post('/admin/settings/', newSettings)
      setSettings(response.data as AdminSettings)
      toast.success('Configuraciones guardadas exitosamente')
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al guardar configuraciones'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error saving admin settings:', err)
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [])

  // Restablecer configuraciones
  const resetSettings = useCallback(async () => {
    try {
      setIsSaving(true)
      setError(null)
      
      const response = await apiClient.post('/admin/settings/reset/')
      setSettings(response.data as AdminSettings)
      toast.success('Configuraciones restablecidas exitosamente')
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al restablecer configuraciones'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error resetting admin settings:', err)
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [])

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    try {
      const response = await apiClient.get('/admin/stats/')
      setStats(response as AdminStats)
    } catch (err: any) {
      console.error('Error loading admin stats:', err)
    }
  }, [])

  // Cargar configuraciones al montar el componente
  useEffect(() => {
    loadSettings()
    loadStats()
  }, [loadSettings, loadStats])

  return {
    settings,
    stats,
    isLoading,
    isSaving,
    error,
    loadSettings,
    saveSettings,
    resetSettings,
    loadStats
  }
}
