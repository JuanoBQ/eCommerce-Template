"use client"

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useOrders } from '@/hooks/useOrders'
import { useWishlist } from '@/hooks/useWishlist'
import { useAddresses } from '@/hooks/useAddresses'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AddressModal from '@/components/address/AddressModal'
import { User, Mail, Phone, MapPin, Calendar, Save, Camera, Bell, BellOff, Plus, Edit, Trash2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'
import { UserAddress } from '@/types'
import { CreateAddressData } from '@/hooks/useAddresses'

export default function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuth()
  const { orders } = useOrders()
  const { count: wishlistCount } = useWishlist()
  const { addresses, createAddress, updateAddress, deleteAddress, setDefaultAddress, isLoading: addressesLoading } = useAddresses()
  const [isEditing, setIsEditing] = useState(false)
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null)
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    birth_date: user?.birth_date || '',
    avatar: user?.avatar || '',
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
        if (['phone', 'birth_date', 'avatar'].includes(key)) {
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
          'first_name', 'last_name', 'phone', 'birth_date', 'avatar'
        ]

        for (const field of fieldErrors) {
          if (errorData?.[field]?.[0]) {
            const fieldNames: Record<string, string> = {
              first_name: 'Nombre',
              last_name: 'Apellidos',
              phone: 'Teléfono',
              birth_date: 'Fecha de nacimiento',
              avatar: 'Avatar'
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

      email_notifications: user?.email_notifications ?? true,
      sms_notifications: user?.sms_notifications ?? false,
    })
    setIsEditing(false)
  }

  // Address management functions
  const handleCreateAddress = async (data: CreateAddressData) => {
    await createAddress(data)
  }

  const handleUpdateAddress = async (data: CreateAddressData) => {
    if (editingAddress) {
      await updateAddress({ id: editingAddress.id, ...data })
    }
  }

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddress(address)
    setAddressModalOpen(true)
  }

  const handleDeleteAddress = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
      await deleteAddress(id)
    }
  }

  const handleSetDefaultAddress = async (id: number) => {
    await setDefaultAddress(id)
  }

  const handleCloseAddressModal = () => {
    setAddressModalOpen(false)
    setEditingAddress(null)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-display font-black mb-4">
              <span className="text-gray-900">MI</span>
              <span className="block text-gray-900">PERFIL</span>
            </h1>
            <p className="text-xl text-gray-600">
              Gestiona tu información personal y preferencias
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-md p-8 shadow-sm text-center">
                {/* Avatar */}
                <div className="w-24 h-24 bg-gray-900 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>

                {/* User Info */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {user?.first_name} {user?.last_name}
                </h3>
                <p className="text-gray-600 mb-4">{user?.email}</p>

                {/* User Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{orders?.length || 0}</div>
                    <div className="text-sm text-gray-600">Pedidos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{wishlistCount || 0}</div>
                    <div className="text-sm text-gray-600">Favoritos</div>
                  </div>
                </div>

                {/* Member Since */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center text-gray-600 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Miembro desde {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', { 
                      month: 'long', 
                      year: 'numeric' 
                    }) : 'Fecha no disponible'}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-md p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-display font-bold text-gray-900">
                    INFORMACIÓN PERSONAL
                  </h2>
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                    >
                      Editar Perfil
                    </Button>
                  ) : (
                    <div className="flex space-x-3">
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        variant="black"
                        className="flex items-center"
                      >
                        {isLoading ? (
                          <div className="loading-spinner w-4 h-4 mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Guardar
                      </Button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Nombre</label>
                      <div className="relative">
                        <Input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`pl-12 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        />
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Apellidos</label>
                      <Input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}
                      />
                    </div>
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Correo electrónico</label>
                    <div className="relative">
                      <Input
                        type="email"
                        value={user?.email}
                        disabled
                        className="pl-12 bg-gray-100 cursor-not-allowed"
                      />
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      El email no se puede cambiar desde aquí
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Teléfono</label>
                    <div className="relative">
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`pl-12 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        placeholder="+34 600 000 000"
                      />
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Birth Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Fecha de nacimiento</label>
                    <div className="relative">
                      <Input
                        type="date"
                        name="birth_date"
                        value={formData.birth_date}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`pl-12 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      />
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>



                  {/* Notification Preferences */}
                  <div className="space-y-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Preferencias de Notificaciones</h3>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="email_notifications"
                          name="email_notifications"
                          checked={formData.email_notifications}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-4 h-4 text-primary-500 bg-white border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                        />
                        <label htmlFor="email_notifications" className="ml-3 text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <Bell className="w-4 h-4 mr-2 text-primary-500" />
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
                          className="w-4 h-4 text-primary-500 bg-white border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                        />
                        <label htmlFor="sms_notifications" className="ml-3 text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <BellOff className="w-4 h-4 mr-2 text-primary-500" />
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

          {/* Addresses Section */}
          <div className="mt-12">
            <div className="bg-white border border-gray-200 rounded-md p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
                  Mis Direcciones
                </h2>
                {addresses.length < 2 && (
                  <Button
                    onClick={() => setAddressModalOpen(true)}
                    variant="black"
                    className="flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Dirección
                  </Button>
                )}
              </div>

              {addressesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Cargando direcciones...</p>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes direcciones guardadas</h3>
                  <p className="text-gray-600 mb-6">Agrega una dirección para facilitar tus compras</p>
                  <Button
                    onClick={() => setAddressModalOpen(true)}
                    variant="black"
                    className="flex items-center mx-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Primera Dirección
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border rounded-md p-6 ${
                        address.is_default 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {address.title}
                          </h3>
                          {address.is_default && (
                            <div className="ml-2 flex items-center text-primary-600">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-xs font-medium ml-1">Predeterminada</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {!address.is_default && (
                            <button
                              onClick={() => handleSetDefaultAddress(address.id)}
                              className="p-1 text-gray-400 hover:text-primary-500 transition-colors"
                              title="Marcar como predeterminada"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="p-1 text-gray-400 hover:text-primary-500 transition-colors"
                            title="Editar dirección"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Eliminar dirección"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <p>{address.address_line_1}</p>
                        {address.address_line_2 && (
                          <p>{address.address_line_2}</p>
                        )}
                        <p>
                          {address.city}, {address.state} {address.postal_code}
                        </p>
                        <p>{address.country}</p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {address.is_shipping && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Envío
                          </span>
                        )}
                        {address.is_billing && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Facturación
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <AddressModal
        isOpen={addressModalOpen}
        onClose={handleCloseAddressModal}
        onSave={editingAddress ? handleUpdateAddress : handleCreateAddress}
        address={editingAddress}
        isLoading={addressesLoading}
      />
    </ProtectedRoute>
  )
}
