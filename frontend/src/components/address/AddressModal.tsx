"use client"

import { useState, useEffect } from 'react'
import { X, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Select from '@/components/ui/Select'
import { UserAddress } from '@/types'
import { CreateAddressData } from '@/hooks/useAddresses'
import { useColombiaLocations } from '@/hooks/useColombiaLocations'

interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateAddressData) => Promise<void>
  address?: UserAddress | null
  isLoading?: boolean
}

export default function AddressModal({ 
  isOpen, 
  onClose, 
  onSave, 
  address, 
  isLoading = false 
}: AddressModalProps) {
  const [formData, setFormData] = useState<CreateAddressData>({
    title: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Colombia',
    is_default: false,
    is_billing: false,
    is_shipping: true
  })

  // Estados para manejar los selects
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null)
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null)

  // Hook para cargar ubicaciones de Colombia
  const { 
    departments, 
    cities, 
    isLoadingDepartments, 
    isLoadingCities, 
    loadCitiesByDepartment 
  } = useColombiaLocations()

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cargar datos de la dirección si se está editando
  useEffect(() => {
    if (address) {
      setFormData({
        title: address.title,
        address_line_1: address.address_line_1,
        address_line_2: address.address_line_2 || '',
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country,
        is_default: address.is_default,
        is_billing: address.is_billing,
        is_shipping: address.is_shipping
      })
    } else {
      // Reset form for new address
      setFormData({
        title: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Colombia',
        is_default: false,
        is_billing: false,
        is_shipping: true
      })
    }
    setErrors({})
  }, [address, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Manejar cambio de departamento
  const handleDepartmentChange = (value: string | number) => {
    const departmentId = Number(value)
    setSelectedDepartmentId(departmentId)
    setSelectedCityId(null) // Resetear ciudad
    setFormData(prev => ({
      ...prev,
      state: departments.find(d => d.id === departmentId)?.name || '',
      city: '' // Limpiar ciudad
    }))
    
    // Cargar ciudades del departamento seleccionado
    loadCitiesByDepartment(departmentId)
  }

  // Manejar cambio de ciudad
  const handleCityChange = (value: string | number) => {
    const cityId = Number(value)
    setSelectedCityId(cityId)
    setFormData(prev => ({
      ...prev,
      city: cities.find(c => c.id === cityId)?.name || ''
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'El título es requerido'
    if (!formData.address_line_1.trim()) newErrors.address_line_1 = 'La dirección es requerida'
    if (!formData.city.trim()) newErrors.city = 'La ciudad es requerida'
    if (!formData.state.trim()) newErrors.state = 'El estado/provincia es requerido'
    if (!formData.postal_code.trim()) newErrors.postal_code = 'El código postal es requerido'
    if (!formData.country.trim()) newErrors.country = 'El país es requerido'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      // Error handling is done in the parent component
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-md shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
            {address ? 'Editar Dirección' : 'Nueva Dirección'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            disabled={isLoading}
            title="Cerrar modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Título de la dirección *
            </label>
            <div className="relative">
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Casa, Trabajo, etc."
                className={`pl-10 ${errors.title ? 'border-red-500' : ''}`}
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Address Lines */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Dirección línea 1 *
              </label>
              <Input
                type="text"
                name="address_line_1"
                value={formData.address_line_1}
                onChange={handleChange}
                placeholder="Calle, número, piso, puerta"
                className={errors.address_line_1 ? 'border-red-500' : ''}
              />
              {errors.address_line_1 && <p className="text-red-500 text-sm mt-1">{errors.address_line_1}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Información adicional
              </label>
              <Input
                type="text"
                name="address_line_2"
                value={formData.address_line_2}
                onChange={handleChange}
                placeholder="Información adicional (opcional)"
              />
            </div>
          </div>

          {/* State, City, Postal Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Departamento *
              </label>
              <Select
                options={departments.map(dept => ({
                  value: dept.id,
                  label: dept.name
                }))}
                value={selectedDepartmentId || ''}
                onChange={handleDepartmentChange}
                placeholder="Seleccionar departamento"
                loading={isLoadingDepartments}
                error={!!errors.state}
              />
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Ciudad *
              </label>
              <Select
                options={cities.map(city => ({
                  value: city.id,
                  label: city.name
                }))}
                value={selectedCityId || ''}
                onChange={handleCityChange}
                placeholder="Seleccionar ciudad"
                disabled={!selectedDepartmentId}
                loading={isLoadingCities}
                error={!!errors.city}
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Código Postal *
              </label>
              <Input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                placeholder="28001"
                className={errors.postal_code ? 'border-red-500' : ''}
              />
              {errors.postal_code && <p className="text-red-500 text-sm mt-1">{errors.postal_code}</p>}
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              País *
            </label>
            <Select
              options={[
                { value: 'Colombia', label: 'Colombia' },
                { value: 'España', label: 'España' },
                { value: 'México', label: 'México' },
                { value: 'Argentina', label: 'Argentina' },
                { value: 'Chile', label: 'Chile' },
                { value: 'Perú', label: 'Perú' },
                { value: 'Venezuela', label: 'Venezuela' },
                { value: 'Ecuador', label: 'Ecuador' }
              ]}
              value={formData.country}
              onChange={(value) => setFormData(prev => ({ ...prev, country: value as string }))}
              placeholder="Seleccionar país"
              error={!!errors.country}
            />
            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
          </div>

          {/* Address Type Options */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Tipo de Dirección</h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_default"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-500 bg-white border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                />
                <label htmlFor="is_default" className="ml-3 text-sm font-medium text-gray-900">
                  Dirección predeterminada
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_shipping"
                  name="is_shipping"
                  checked={formData.is_shipping}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-500 bg-white border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                />
                <label htmlFor="is_shipping" className="ml-3 text-sm font-medium text-gray-900">
                  Dirección de envío
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_billing"
                  name="is_billing"
                  checked={formData.is_billing}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-500 bg-white border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                />
                <label htmlFor="is_billing" className="ml-3 text-sm font-medium text-gray-900">
                  Dirección de facturación
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="black"
              disabled={isLoading}
              className="flex items-center"
            >
              {isLoading ? (
                <div className="loading-spinner w-4 h-4 mr-2" />
              ) : null}
              {address ? 'Actualizar' : 'Crear'} Dirección
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
