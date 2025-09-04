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

export interface CreateAddressData {
  title: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default?: boolean
  is_billing?: boolean
  is_shipping?: boolean
}

export interface UpdateAddressData extends Partial<CreateAddressData> {
  id: number
}

export const useAddresses = () => {
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  

  // Cargar direcciones
  const loadAddresses = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('🔍 Cargando direcciones...')
      
      const response = await apiClient.get('/users/simple-addresses/') as { addresses: UserAddress[] }
      console.log('📊 Respuesta de direcciones:', response)
      console.log('📊 Direcciones encontradas:', response.addresses?.length || 0)
      
      setAddresses(response.addresses || [])
      console.log('✅ Direcciones cargadas en el estado')
    } catch (err: any) {
      console.error('❌ Error al cargar direcciones:', err)
      setError(err.response?.data?.detail || 'Error al cargar direcciones')
      toast.error('Error al cargar direcciones')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Crear dirección
  const createAddress = useCallback(async (data: CreateAddressData): Promise<UserAddress> => {
    try {
      // Si es la primera dirección, marcarla como predeterminada automáticamente
      const isFirstAddress = addresses.length === 0
      const addressData = {
        ...data,
        is_default: isFirstAddress || data.is_default
      }
      
      const response = await apiClient.post('/users/simple-addresses/', addressData) as { address: UserAddress }
      
      // Actualizar la lista local
      setAddresses(prev => {
        const newAddresses = [...prev, response.address]
        
        // Si se marcó como predeterminada, desmarcar las otras
        if (response.address.is_default) {
          return newAddresses.map(addr => ({
            ...addr,
            is_default: addr.id === response.address.id
          }))
        }
        
        return newAddresses
      })
      
      toast.success('Dirección creada exitosamente')
      
      return response.address
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.title?.[0] ||
                          err.response?.data?.address_line_1?.[0] ||
                          err.response?.data?.city?.[0] ||
                          err.response?.data?.state?.[0] ||
                          err.response?.data?.postal_code?.[0] ||
                          err.response?.data?.country?.[0] ||
                          'Error al crear la dirección'
      
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }, [addresses.length])

  // Marcar como predeterminada
  const setDefaultAddress = useCallback(async (id: number): Promise<void> => {
    try {
      console.log('⭐ Marcando dirección como predeterminada:', id)
      
      await apiClient.post(`/users/addresses/${id}/set_default/`)
      
      // Actualizar la lista local
      setAddresses(prev => prev.map(addr => ({
        ...addr,
        is_default: addr.id === id
      })))
      
      toast.success('Dirección predeterminada actualizada')
      console.log('✅ Dirección predeterminada actualizada')
    } catch (err: any) {
      console.error('❌ Error al marcar dirección como predeterminada:', err)
      const errorMessage = err.response?.data?.detail || 'Error al actualizar la dirección predeterminada'
      
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  // Actualizar dirección
  const updateAddress = useCallback(async (data: UpdateAddressData): Promise<UserAddress> => {
    try {
      console.log('📤 Actualizando dirección:', data)
      
      const { id, ...updateData } = data
      const response = await apiClient.patch(`/users/addresses/${id}/`, updateData) as UserAddress
      
      // Actualizar la lista local
      setAddresses(prev => {
        const updatedAddresses = prev.map(addr => addr.id === id ? response : addr)
        
        // Si se marcó como predeterminada, desmarcar las otras
        if (response.is_default) {
          return updatedAddresses.map(addr => ({
            ...addr,
            is_default: addr.id === id
          }))
        }
        
        return updatedAddresses
      })
      
      toast.success('Dirección actualizada exitosamente')
      console.log('✅ Dirección actualizada:', response)
      
      return response
    } catch (err: any) {
      console.error('❌ Error al actualizar dirección:', err)
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.title?.[0] ||
                          err.response?.data?.first_name?.[0] ||
                          err.response?.data?.last_name?.[0] ||
                          err.response?.data?.address_line_1?.[0] ||
                          err.response?.data?.city?.[0] ||
                          err.response?.data?.state?.[0] ||
                          err.response?.data?.postal_code?.[0] ||
                          err.response?.data?.country?.[0] ||
                          'Error al actualizar la dirección'
      
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  // Eliminar dirección
  const deleteAddress = useCallback(async (id: number): Promise<void> => {
    try {
      console.log('🗑️ Eliminando dirección:', id)
      
      // Verificar si la dirección a eliminar es la predeterminada
      const addressToDelete = addresses.find(addr => addr.id === id)
      const isDeletingDefault = addressToDelete?.is_default
      
      await apiClient.delete(`/users/addresses/${id}/`)
      
      // Actualizar la lista local
      setAddresses(prev => {
        const remainingAddresses = prev.filter(addr => addr.id !== id)
        
        // Si se eliminó la dirección predeterminada y quedan direcciones, marcar la primera como predeterminada
        if (isDeletingDefault && remainingAddresses.length > 0) {
          // Marcar la primera dirección restante como predeterminada
          return remainingAddresses.map((addr, index) => ({
            ...addr,
            is_default: index === 0
          }))
        }
        
        return remainingAddresses
      })
      
      // Si se eliminó la dirección predeterminada y quedan direcciones, actualizar en el backend
      if (isDeletingDefault) {
        const remainingAddresses = addresses.filter(addr => addr.id !== id)
        if (remainingAddresses.length > 0) {
          const firstRemainingAddress = remainingAddresses[0]
          if (firstRemainingAddress && firstRemainingAddress.id) {
            try {
              console.log('🔄 Actualizando dirección predeterminada en backend:', firstRemainingAddress.id)
              await setDefaultAddress(firstRemainingAddress.id)
            } catch (err) {
              console.warn('No se pudo actualizar la dirección predeterminada automáticamente:', err)
            }
          }
        }
      }
      
      toast.success('Dirección eliminada exitosamente')
      console.log('✅ Dirección eliminada')
    } catch (err: any) {
      console.error('❌ Error al eliminar dirección:', err)
      const errorMessage = err.response?.data?.detail || 'Error al eliminar la dirección'
      
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }, [addresses, setDefaultAddress])

  // Obtener dirección predeterminada
  const getDefaultAddress = useCallback(async (): Promise<UserAddress | null> => {
    try {
      console.log('🔍 Obteniendo dirección predeterminada...')
      
      const response = await apiClient.get('/users/addresses/default/') as UserAddress
      console.log('✅ Dirección predeterminada obtenida:', response)
      
      return response
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.log('ℹ️ No hay dirección predeterminada')
        return null
      }
      
      console.error('❌ Error al obtener dirección predeterminada:', err)
      throw err
    }
  }, [])

  // Cargar direcciones al montar el componente
  useEffect(() => {
    loadAddresses()
  }, [loadAddresses])

  return {
    addresses,
    isLoading,
    error,
    loadAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress
  }
}
