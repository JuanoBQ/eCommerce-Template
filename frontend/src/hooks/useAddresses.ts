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
      
      const response = await apiClient.get('/users/simple-addresses/') as { addresses: UserAddress[] }
      
      setAddresses(response.addresses || [])
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Error al cargar direcciones'
      setError(errorMessage)
      
      // Si es un error 401, el usuario no está autenticado
      if (err.response?.status === 401) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
        // Opcional: redirigir al login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login'
        }
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Crear dirección (elimina las existentes primero)
  const createAddress = useCallback(async (data: CreateAddressData): Promise<UserAddress> => {
    try {
      // Eliminar todas las direcciones existentes primero
      if (addresses.length > 0) {
        await Promise.all(addresses.map(addr => 
          apiClient.delete(`/users/simple-addresses/${addr.id}/`)
        ))
      }
      
      const addressData = {
        ...data,
        is_default: true,
        is_billing: true,
        is_shipping: true
      }
      
      const response = await apiClient.post('/users/simple-addresses/', addressData) as { address: UserAddress }
      
      // Actualizar la lista local con solo la nueva dirección
      setAddresses([response.address])
      
      toast.success('Dirección actualizada exitosamente')
      
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
  }, [addresses])

  // Marcar como predeterminada
  const setDefaultAddress = useCallback(async (id: number): Promise<void> => {
    try {
      // Marcando dirección como predeterminada
      
      await apiClient.post(`/users/addresses/${id}/set_default/`)
      
      // Actualizar la lista local
      setAddresses(prev => prev.map(addr => ({
        ...addr,
        is_default: addr.id === id
      })))
      
      toast.success('Dirección predeterminada actualizada')
      // Dirección predeterminada actualizada
    } catch (err: any) {
      // Error al marcar dirección como predeterminada
      const errorMessage = err.response?.data?.detail || 'Error al actualizar la dirección predeterminada'
      
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  // Actualizar dirección (elimina las otras primero)
  const updateAddress = useCallback(async (data: UpdateAddressData): Promise<UserAddress> => {
    try {
      const { id, ...updateData } = data
      
      // Eliminar todas las direcciones excepto la que se está actualizando
      const otherAddresses = addresses.filter(addr => addr.id !== id)
      if (otherAddresses.length > 0) {
        await Promise.all(otherAddresses.map(addr => 
          apiClient.delete(`/users/simple-addresses/${addr.id}/`)
        ))
      }
      
      // Actualizar la dirección existente
      const response = await apiClient.patch(`/users/simple-addresses/${id}/`, {
        ...updateData,
        is_default: true,
        is_billing: true,
        is_shipping: true
      }) as UserAddress
      
      // Actualizar la lista local con solo la dirección actualizada
      setAddresses([response])
      
      toast.success('Dirección actualizada exitosamente')
      
      return response
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.title?.[0] ||
                          err.response?.data?.address_line_1?.[0] ||
                          err.response?.data?.city?.[0] ||
                          err.response?.data?.state?.[0] ||
                          err.response?.data?.postal_code?.[0] ||
                          err.response?.data?.country?.[0] ||
                          'Error al actualizar la dirección'
      
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }, [addresses])

  // Eliminar dirección
  const deleteAddress = useCallback(async (id: number): Promise<void> => {
    try {
      // Eliminando dirección
      
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
              // Actualizando dirección predeterminada en backend
              await setDefaultAddress(firstRemainingAddress.id)
            } catch (err) {
              // No se pudo actualizar la dirección predeterminada automáticamente
            }
          }
        }
      }
      
      toast.success('Dirección eliminada exitosamente')
      // Dirección eliminada
    } catch (err: any) {
      // Error al eliminar dirección
      const errorMessage = err.response?.data?.detail || 'Error al eliminar la dirección'
      
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }, [addresses, setDefaultAddress])

  // Obtener dirección predeterminada
  const getDefaultAddress = useCallback(async (): Promise<UserAddress | null> => {
    try {
      // Obteniendo dirección predeterminada
      
      const response = await apiClient.get('/users/addresses/default/') as UserAddress
      // Dirección predeterminada obtenida
      
      return response
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No hay dirección predeterminada
        return null
      }
      
      // Error al obtener dirección predeterminada
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
