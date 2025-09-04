import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

export interface OrderItem {
  id: number
  product: {
    id: number
    name: string
    slug: string
    price: number
    compare_price?: number
    images?: Array<{
      id: number
      image: string
      alt_text: string
    }>
    category_details?: {
      id: number
      name: string
    }
    brand_details?: {
      id: number
      name: string
    }
  }
  quantity: number
  price: number
  size?: string
  color?: string
  total_price: number
  product_name: string
  product_sku: string
  variant_info?: string
  created_at: string
}

export interface Order {
  id: number
  order_number: string
  uuid: string
  user: number
  user_email: string
  user_name: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  status_display: string
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
  payment_status_display: string
  first_name: string
  last_name: string
  document_id: string
  email: string
  phone: string
  shipping_address: string
  shipping_first_name: string
  shipping_last_name: string
  shipping_city: string
  shipping_state: string
  shipping_country: string
  shipping_postal_code: string
  billing_address: string
  billing_first_name: string
  billing_last_name: string
  billing_city: string
  billing_state: string
  billing_country: string
  billing_postal_code: string
  subtotal: number
  tax_amount: number
  shipping_amount: number
  discount_amount: number
  total_amount: number
  notes?: string
  tracking_number?: string
  shipped_at?: string
  delivered_at?: string
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface OrderSummary {
  id: number
  order_number: string
  user_email: string
  user_name: string
  total_amount: number
  status: string
  status_display: string
  payment_status: string
  payment_status_display: string
  items_count: number
  created_at: string
  updated_at: string
}

export interface CreateOrderData {
  first_name: string
  last_name: string
  document_id: string
  email: string
  phone: string
  shipping_address: string
  billing_address: string
  shipping_amount: number
  notes?: string
  items: Array<{
    product_id: number
    quantity: number
    price: number
  }>
}

export const useOrders = () => {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar órdenes del usuario
  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.get('/orders/')
      console.log('Orders API response:', response)
      
      if (!response) {
        throw new Error('No se recibieron datos del servidor')
      }
      
      // Manejar diferentes formatos de respuesta
      const ordersData = (response as any).results || response
      if (Array.isArray(ordersData)) {
        setOrders(ordersData)
      } else {
        console.warn('Unexpected orders data format:', ordersData)
        setOrders([])
      }
    } catch (err: any) {
      console.error('Error loading orders:', err)
      const errorMessage = err.response?.data?.detail || err.message || 'Error al cargar las órdenes'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Cargar detalles de una orden específica
  const loadOrderDetails = useCallback(async (orderId: number) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.get(`/orders/${orderId}/`)
      setCurrentOrder(response as Order)
      return response
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Error al cargar los detalles de la orden'
      setError(errorMessage)
      console.error('Error loading order details:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Crear una nueva orden
  const createOrder = useCallback(async (orderData: CreateOrderData) => {
    try {
      setIsLoading(true)
      setError(null)
      

      
      const response = await apiClient.post('/orders/', orderData)
      toast.success('Orden creada exitosamente')
      return response
    } catch (err: any) {

      
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Error al crear la orden'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error creating order:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Cancelar una orden
  const cancelOrder = useCallback(async (orderId: number) => {
    try {
      setIsLoading(true)
      setError(null)
      await apiClient.post(`/orders/${orderId}/cancel/`)
      toast.success('Orden cancelada exitosamente')
      // Recargar órdenes para actualizar el estado
      await loadOrders()
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al cancelar la orden'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error canceling order:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [loadOrders])

  // Confirmar una orden (solo admin)
  const confirmOrder = useCallback(async (orderId: number) => {
    try {
      setIsLoading(true)
      setError(null)
      await apiClient.post(`/orders/${orderId}/confirm/`)
      toast.success('Orden confirmada exitosamente')
      await loadOrders()
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al confirmar la orden'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error confirming order:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [loadOrders])

  // Marcar orden como en proceso (solo admin)
  const processOrder = useCallback(async (orderId: number) => {
    try {
      setIsLoading(true)
      setError(null)
      await apiClient.post(`/orders/${orderId}/process/`)
      toast.success('Orden marcada como en proceso')
      await loadOrders()
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al procesar la orden'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error processing order:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [loadOrders])

  // Marcar orden como enviada (solo admin)
  const shipOrder = useCallback(async (orderId: number) => {
    try {
      setIsLoading(true)
      setError(null)
      await apiClient.post(`/orders/${orderId}/ship/`)
      toast.success('Orden marcada como enviada')
      await loadOrders()
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al enviar la orden'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error shipping order:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [loadOrders])

  // Marcar orden como entregada (solo admin)
  const deliverOrder = useCallback(async (orderId: number) => {
    try {
      setIsLoading(true)
      setError(null)
      await apiClient.post(`/orders/${orderId}/deliver/`)
      toast.success('Orden marcada como entregada')
      await loadOrders()
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al entregar la orden'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error delivering order:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [loadOrders])

  // Cargar órdenes al montar el componente
  useEffect(() => {
    // Solo cargar órdenes si hay un token de acceso
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token) {
        loadOrders()
      } else {
        console.log('No access token found, skipping orders load')
        setError('Debes iniciar sesión para ver tus órdenes')
      }
    }
  }, [loadOrders])

  return {
    orders,
    currentOrder,
    isLoading,
    error,
    loadOrders,
    loadOrderDetails,
    createOrder,
    cancelOrder,
    confirmOrder,
    processOrder,
    shipOrder,
    deliverOrder
  }
}
