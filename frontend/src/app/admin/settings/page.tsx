"use client"

import React, { useState } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAdminSettings, AdminSettings } from '@/hooks/useAdminSettings'
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Database, 
  Mail, 
  Shield, 
  Globe,
  Bell,
  Key,
  Users,
  Package,
  BarChart3,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [localSettings, setLocalSettings] = useState<AdminSettings | null>(null)
  const { 
    settings, 
    stats, 
    isLoading, 
    isSaving, 
    error, 
    saveSettings, 
    resetSettings 
  } = useAdminSettings()

  // Sincronizar settings del hook con el estado local
  React.useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  const handleSave = async () => {
    if (!localSettings) return
    
    try {
      await saveSettings(localSettings)
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  const handleReset = async () => {
    try {
      await resetSettings()
    } catch (error) {
      console.error('Error resetting settings:', error)
    }
  }

  const handleInputChange = (field: keyof AdminSettings, value: any) => {
    if (!localSettings) return
    
    setLocalSettings(prev => ({
      ...prev!,
      [field]: value
    }))
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'orders', label: 'Órdenes', icon: BarChart3 },
    { id: 'payments', label: 'Pagos', icon: Key },
    { id: 'notifications', label: 'Notificaciones', icon: Bell }
  ]

  if (isLoading || !localSettings) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-dark-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green mx-auto"></div>
              <p className="text-white mt-4">Cargando configuraciones...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-dark-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Settings className="w-8 h-8 text-neon-green" />
              <div>
                <h1 className="text-3xl font-bold text-white">Configuración del Sistema</h1>
                <p className="text-white/70">Gestiona la configuración general del eCommerce</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                variant="black"
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
              
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Restablecer
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Categorías</h3>
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-neon-green text-dark-900'
                            : 'text-white/70 hover:text-white hover:bg-dark-700/50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Stats Overview */}
              {stats && (
                <div className="mb-6">
                  <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50">
                    <h2 className="text-xl font-semibold text-white mb-4">Estadísticas del Sistema</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-neon-green">{stats.users.total}</div>
                        <div className="text-white/70 text-sm">Usuarios</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{stats.products.total}</div>
                        <div className="text-white/70 text-sm">Productos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">{stats.orders.total}</div>
                        <div className="text-white/70 text-sm">Órdenes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-400">{stats.addresses.total}</div>
                        <div className="text-white/70 text-sm">Direcciones</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50">
                {/* General Settings */}
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-6">Configuración General</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                          Nombre del Sitio
                        </label>
                        <Input
                          value={localSettings.site_name}
                          onChange={(e) => handleInputChange('site_name', e.target.value)}
                          placeholder="Nombre del sitio"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                          URL del Sitio
                        </label>
                        <Input
                          value={localSettings.site_url}
                          onChange={(e) => handleInputChange('site_url', e.target.value)}
                          placeholder="https://ejemplo.com"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Descripción del Sitio
                      </label>
                      <textarea
                        value={localSettings.site_description}
                        onChange={(e) => handleInputChange('site_description', e.target.value)}
                        className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                        rows={3}
                        placeholder="Descripción del sitio web"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Email del Administrador
                      </label>
                      <Input
                        type="email"
                        value={localSettings.admin_email}
                        onChange={(e) => handleInputChange('admin_email', e.target.value)}
                        placeholder="admin@ejemplo.com"
                      />
                    </div>
                  </div>
                )}

                {/* Email Settings */}
                {activeTab === 'email' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-6">Configuración de Email</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                          Servidor SMTP
                        </label>
                        <Input
                          value={localSettings.email_host}
                          onChange={(e) => handleInputChange('email_host', e.target.value)}
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                          Puerto
                        </label>
                        <Input
                          type="number"
                          value={localSettings.email_port}
                          onChange={(e) => handleInputChange('email_port', parseInt(e.target.value))}
                          placeholder="587"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                          Usuario
                        </label>
                        <Input
                          value={localSettings.email_username}
                          onChange={(e) => handleInputChange('email_username', e.target.value)}
                          placeholder="usuario@ejemplo.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                          Contraseña
                        </label>
                        <Input
                          type="password"
                          value={localSettings.email_password}
                          onChange={(e) => handleInputChange('email_password', e.target.value)}
                          placeholder="Contraseña de aplicación"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="email_use_tls"
                        checked={localSettings.email_use_tls}
                        onChange={(e) => handleInputChange('email_use_tls', e.target.checked)}
                        className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                      />
                      <label htmlFor="email_use_tls" className="text-white/70 text-sm">
                        Usar TLS/SSL
                      </label>
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-6">Configuración de Seguridad</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                          Tiempo de Sesión (minutos)
                        </label>
                        <Input
                          type="number"
                          value={localSettings.session_timeout}
                          onChange={(e) => handleInputChange('session_timeout', parseInt(e.target.value))}
                          placeholder="30"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                          Intentos Máximos de Login
                        </label>
                        <Input
                          type="number"
                          value={localSettings.max_login_attempts}
                          onChange={(e) => handleInputChange('max_login_attempts', parseInt(e.target.value))}
                          placeholder="5"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Longitud Mínima de Contraseña
                      </label>
                      <Input
                        type="number"
                        value={localSettings.password_min_length}
                        onChange={(e) => handleInputChange('password_min_length', parseInt(e.target.value))}
                        placeholder="8"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="require_2fa"
                        checked={localSettings.require_2fa}
                        onChange={(e) => handleInputChange('require_2fa', e.target.checked)}
                        className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                      />
                      <label htmlFor="require_2fa" className="text-white/70 text-sm">
                        Requerir Autenticación de Dos Factores
                      </label>
                    </div>
                  </div>
                )}

                {/* Products Settings */}
                {activeTab === 'products' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-6">Configuración de Productos</h2>
                    
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Productos por Página
                      </label>
                      <Input
                        type="number"
                        value={localSettings.max_products_per_page}
                        onChange={(e) => handleInputChange('max_products_per_page', parseInt(e.target.value))}
                        placeholder="20"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="enable_reviews"
                          checked={localSettings.enable_reviews}
                          onChange={(e) => handleInputChange('enable_reviews', e.target.checked)}
                          className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                        />
                        <label htmlFor="enable_reviews" className="text-white/70 text-sm">
                          Habilitar Reseñas de Productos
                        </label>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="enable_wishlist"
                          checked={localSettings.enable_wishlist}
                          onChange={(e) => handleInputChange('enable_wishlist', e.target.checked)}
                          className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                        />
                        <label htmlFor="enable_wishlist" className="text-white/70 text-sm">
                          Habilitar Lista de Deseos
                        </label>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="enable_notifications"
                          checked={localSettings.enable_notifications}
                          onChange={(e) => handleInputChange('enable_notifications', e.target.checked)}
                          className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                        />
                        <label htmlFor="enable_notifications" className="text-white/70 text-sm">
                          Habilitar Notificaciones
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Orders Settings */}
                {activeTab === 'orders' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-6">Configuración de Órdenes</h2>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="order_auto_confirm"
                        checked={localSettings.order_auto_confirm}
                        onChange={(e) => handleInputChange('order_auto_confirm', e.target.checked)}
                        className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                      />
                      <label htmlFor="order_auto_confirm" className="text-white/70 text-sm">
                        Confirmar Órdenes Automáticamente
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Cancelar Órdenes Después de (horas)
                      </label>
                      <Input
                        type="number"
                        value={localSettings.order_auto_cancel_hours}
                        onChange={(e) => handleInputChange('order_auto_cancel_hours', parseInt(e.target.value))}
                        placeholder="24"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="enable_tracking"
                        checked={localSettings.enable_tracking}
                        onChange={(e) => handleInputChange('enable_tracking', e.target.checked)}
                        className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                      />
                      <label htmlFor="enable_tracking" className="text-white/70 text-sm">
                        Habilitar Seguimiento de Órdenes
                      </label>
                    </div>
                  </div>
                )}

                {/* Payments Settings */}
                {activeTab === 'payments' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-6">Configuración de Pagos</h2>
                    
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Pasarela de Pago
                      </label>
                      <select
                        value={localSettings.payment_gateway}
                        onChange={(e) => handleInputChange('payment_gateway', e.target.value)}
                        className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                        title="Seleccionar pasarela de pago"
                      >
                        <option value="wompi">Wompi</option>
                        <option value="mercadopago">MercadoPago</option>
                        <option value="paypal">PayPal</option>
                        <option value="stripe">Stripe</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Moneda
                      </label>
                      <select
                        value={localSettings.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                        title="Seleccionar moneda"
                      >
                        <option value="COP">Peso Colombiano (COP)</option>
                        <option value="USD">Dólar Americano (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="payment_test_mode"
                        checked={localSettings.payment_test_mode}
                        onChange={(e) => handleInputChange('payment_test_mode', e.target.checked)}
                        className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                      />
                      <label htmlFor="payment_test_mode" className="text-white/70 text-sm">
                        Modo de Prueba
                      </label>
                    </div>
                  </div>
                )}

                {/* Notifications Settings */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-6">Configuración de Notificaciones</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="email_notifications"
                          checked={localSettings.email_notifications}
                          onChange={(e) => handleInputChange('email_notifications', e.target.checked)}
                          className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                        />
                        <label htmlFor="email_notifications" className="text-white/70 text-sm">
                          Notificaciones por Email
                        </label>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="sms_notifications"
                          checked={localSettings.sms_notifications}
                          onChange={(e) => handleInputChange('sms_notifications', e.target.checked)}
                          className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                        />
                        <label htmlFor="sms_notifications" className="text-white/70 text-sm">
                          Notificaciones por SMS
                        </label>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="push_notifications"
                          checked={localSettings.push_notifications}
                          onChange={(e) => handleInputChange('push_notifications', e.target.checked)}
                          className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                        />
                        <label htmlFor="push_notifications" className="text-white/70 text-sm">
                          Notificaciones Push
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
