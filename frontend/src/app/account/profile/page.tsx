"use client"

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { User, Mail, Phone, MapPin, Calendar, Save, Camera, Bell, BellOff } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    birth_date: user?.birth_date || '',
    avatar: user?.avatar || '',
    default_address: user?.default_address || '',
    default_city: user?.default_city || '',
    default_state: user?.default_state || '',
    default_country: user?.default_country || '',
    default_postal_code: user?.default_postal_code || '',
    email_notifications: user?.email_notifications ?? true,
    sms_notifications: user?.sms_notifications ?? false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Función para filtrar datos vacíos
  const cleanFormData = (data: any) => {
    const cleaned: any = {}

    Object.keys(data).forEach(key => {
      const value = data[key]

      // Filtrar strings vacías y convertirlas a null para campos opcionales
      if (value === '' || value === undefined) {
        // Para campos opcionales, enviar null
        if (['phone', 'birth_date', 'avatar', 'default_address', 'default_city',
             'default_state', 'default_country', 'default_postal_code'].includes(key)) {
          cleaned[key] = null
        }
        // Para campos booleanos, mantener el valor por defecto
        else if (key === 'email_notifications') {
          cleaned[key] = true
        } else if (key === 'sms_notifications') {
          cleaned[key] = false
        }
      } else {
        cleaned[key] = value
      }
    })

    // Asegurar que first_name y last_name no estén vacíos
    if (!cleaned.first_name || cleaned.first_name.trim() === '') {
      cleaned.first_name = user?.first_name || ''
    }
    if (!cleaned.last_name || cleaned.last_name.trim() === '') {
      cleaned.last_name = user?.last_name || ''
    }

    return cleaned
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Limpiar datos antes de enviar
    const cleanedData = cleanFormData(formData)
    console.log('📤 Datos originales:', formData)
    console.log('🧹 Datos limpiados:', cleanedData)

    try {
      const result = await updateProfile(cleanedData)
      console.log('✅ Perfil actualizado:', result)
      setIsEditing(false)
      toast.success('Perfil actualizado exitosamente')
    } catch (error: any) {
      console.error('❌ Error al actualizar perfil:', error)
      console.error('❌ Detalles del error:', error.response?.data)

      // Función para extraer el primer error de validación
      const getValidationError = (errorData: any): string => {
        if (errorData?.detail) return errorData.detail
        if (errorData?.non_field_errors?.[0]) return errorData.non_field_errors[0]

        // Buscar el primer error de campo
        const fieldErrors = [
          'first_name', 'last_name', 'phone', 'birth_date', 'avatar',
          'default_address', 'default_city', 'default_state', 'default_country', 'default_postal_code'
        ]

        for (const field of fieldErrors) {
          if (errorData?.[field]?.[0]) {
            const fieldNames: Record<string, string> = {
              first_name: 'Nombre',
              last_name: 'Apellidos',
              phone: 'Teléfono',
              birth_date: 'Fecha de nacimiento',
              avatar: 'Avatar',
              default_address: 'Dirección',
              default_city: 'Ciudad',
              default_state: 'Estado/Provincia',
              default_country: 'País',
              default_postal_code: 'Código Postal'
            }
            return `${fieldNames[field]}: ${errorData[field][0]}`
          }
        }

        return 'Error al actualizar el perfil'
      }

      const errorMessage = getValidationError(error.response?.data)
      toast.error(errorMessage)
    }
  }

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
      birth_date: user?.birth_date || '',
      avatar: user?.avatar || '',
      default_address: user?.default_address || '',
      default_city: user?.default_city || '',
      default_state: user?.default_state || '',
      default_country: user?.default_country || '',
      default_postal_code: user?.default_postal_code || '',
      email_notifications: user?.email_notifications ?? true,
      sms_notifications: user?.sms_notifications ?? false,
    })
    setIsEditing(false)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-dark-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-display font-black mb-4">
              <span className="text-white">MI</span>
              <span className="block text-gradient">PERFIL</span>
            </h1>
            <p className="text-xl text-white/70">
              Gestiona tu información personal y preferencias
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-8 border border-dark-700/50 text-center">
                {/* Avatar */}
                <div className="w-24 h-24 bg-gradient-to-r from-neon-green to-neon-blue rounded-full mx-auto mb-6 flex items-center justify-center">
                  <User className="w-12 h-12 text-dark-900" />
                </div>

                {/* User Info */}
                <h3 className="text-xl font-semibold text-white mb-2">
                  {user?.first_name} {user?.last_name}
                </h3>
                <p className="text-white/70 mb-4">{user?.email}</p>

                {/* User Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dark-600">
                  <div>
                    <div className="text-2xl font-bold text-neon-green">0</div>
                    <div className="text-sm text-white/70">Pedidos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-neon-blue">0</div>
                    <div className="text-sm text-white/70">Favoritos</div>
                  </div>
                </div>

                {/* Member Since */}
                <div className="mt-6 pt-4 border-t border-dark-600">
                  <div className="flex items-center justify-center text-white/70 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Miembro desde enero 2024
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-8 border border-dark-700/50">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-display font-bold text-white">
                    Información Personal
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-secondary"
                    >
                      Editar Perfil
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={handleCancel}
                        className="btn-secondary"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="btn-primary flex items-center"
                      >
                        {isLoading ? (
                          <div className="loading-spinner w-4 h-4 mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Guardar
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="form-label">Nombre</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`form-input pl-12 ${!isEditing ? 'bg-dark-700/50 cursor-not-allowed' : ''}`}
                        />
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Apellidos</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`form-input ${!isEditing ? 'bg-dark-700/50 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="form-label">Correo electrónico</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={user?.email}
                        disabled
                        className="form-input pl-12 bg-dark-700/50 cursor-not-allowed"
                      />
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
                    </div>
                    <p className="text-sm text-white/50 mt-1">
                      El email no se puede cambiar desde aquí
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="form-label">Teléfono</label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`form-input pl-12 ${!isEditing ? 'bg-dark-700/50 cursor-not-allowed' : ''}`}
                        placeholder="+34 600 000 000"
                      />
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
                    </div>
                  </div>

                  {/* Birth Date */}
                  <div>
                    <label className="form-label">Fecha de nacimiento</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="birth_date"
                        value={formData.birth_date}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`form-input pl-12 ${!isEditing ? 'bg-dark-700/50 cursor-not-allowed' : ''}`}
                      />
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
                    </div>
                  </div>

                  {/* Address Fields */}
                  <div className="space-y-6 pt-6 border-t border-dark-600">
                    <h3 className="text-lg font-semibold text-white">Dirección Predeterminada</h3>

                    <div>
                      <label className="form-label">Dirección</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="default_address"
                          value={formData.default_address}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`form-input pl-12 ${!isEditing ? 'bg-dark-700/50 cursor-not-allowed' : ''}`}
                          placeholder="Calle Principal 123"
                        />
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="form-label">Ciudad</label>
                        <input
                          type="text"
                          name="default_city"
                          value={formData.default_city}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`form-input ${!isEditing ? 'bg-dark-700/50 cursor-not-allowed' : ''}`}
                          placeholder="Madrid"
                        />
                      </div>

                      <div>
                        <label className="form-label">Estado/Provincia</label>
                        <input
                          type="text"
                          name="default_state"
                          value={formData.default_state}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`form-input ${!isEditing ? 'bg-dark-700/50 cursor-not-allowed' : ''}`}
                          placeholder="Madrid"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="form-label">Código Postal</label>
                        <input
                          type="text"
                          name="default_postal_code"
                          value={formData.default_postal_code}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`form-input ${!isEditing ? 'bg-dark-700/50 cursor-not-allowed' : ''}`}
                          placeholder="28001"
                        />
                      </div>

                      <div>
                        <label className="form-label">País</label>
                        <input
                          type="text"
                          name="default_country"
                          value={formData.default_country}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`form-input ${!isEditing ? 'bg-dark-700/50 cursor-not-allowed' : ''}`}
                          placeholder="España"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div className="space-y-6 pt-6 border-t border-dark-600">
                    <h3 className="text-lg font-semibold text-white">Preferencias de Notificaciones</h3>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="email_notifications"
                          name="email_notifications"
                          checked={formData.email_notifications}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                        />
                        <label htmlFor="email_notifications" className="ml-3 text-sm font-medium text-white">
                          <div className="flex items-center">
                            <Bell className="w-4 h-4 mr-2 text-neon-green" />
                            Recibir notificaciones por email
                          </div>
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="sms_notifications"
                          name="sms_notifications"
                          checked={formData.sms_notifications}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-4 h-4 text-neon-blue bg-dark-700 border-dark-600 rounded focus:ring-neon-blue focus:ring-2"
                        />
                        <label htmlFor="sms_notifications" className="ml-3 text-sm font-medium text-white">
                          <div className="flex items-center">
                            <BellOff className="w-4 h-4 mr-2 text-neon-blue" />
                            Recibir notificaciones por SMS
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
