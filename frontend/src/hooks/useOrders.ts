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
  const [pagination, setPagination] = useState<{
    count: number
    next: string | null
    previous: string | null
    current_page: number
    total_pages: number
  }>({
    count: 0,
    next: null,
    previous: null,
    current_page: 1,
    total_pages: 1
  })
  const [apiStats, setApiStats] = useState<{
    total_orders: number
    pending_orders: number
    confirmed_orders: number
    processing_orders: number
    shipped_orders: number
    delivered_orders: number
    paid_orders_completed: number
    completed_orders: number
    cancelled_orders: number
    paid_orders: number
    pending_payment: number
    failed_payment: number
    refunded_orders: number
    total_revenue: number
    delivered_revenue: number
    orders_last_6_months: number
  } | null>(null)

  // Cargar estadísticas de órdenes desde la API
  const loadOrderStats = useCallback(async () => {
    try {
      const response = await apiClient.get('/orders/stats/')
      if (response && typeof response === 'object' && response !== null) {
        setApiStats(response as {
          total_orders: number
          pending_orders: number
          confirmed_orders: number
          processing_orders: number
          shipped_orders: number
          delivered_orders: number
          paid_orders_completed: number
          completed_orders: number
          cancelled_orders: number
          paid_orders: number
          pending_payment: number
          failed_payment: number
          refunded_orders: number
          total_revenue: number
          delivered_revenue: number
          orders_last_6_months: number
        })
      }
    } catch (err: any) {
      // Error al cargar estadísticas de órdenes
    }
  }, [])

  // Cargar órdenes con filtros avanzados
  const loadOrders = useCallback(async (params?: any) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Construir parámetros de consulta
      const queryParams: any = {
        page_size: params?.page_size || 20,
        page: params?.page || 1,
        ...params
      }

      // Agregar filtros específicos
      if (params?.search) {
        queryParams.search = params.search
      }
      if (params?.status && params?.status !== 'all') {
        queryParams.status = params.status
      }
      if (params?.payment_status && params?.payment_status !== 'all') {
        queryParams.payment_status = params.payment_status
      }

      console.log('🔍 useOrders - Parámetros de consulta:', queryParams)
      console.log('🔍 useOrders - URL completa:', `/orders/?${new URLSearchParams(queryParams).toString()}`)

      const response = await apiClient.get('/orders/', { params: queryParams })
      
      console.log('🔍 useOrders - Respuesta del servidor:', response)

      if (!response) {
        throw new Error('No se recibieron datos del servidor')
      }

      // Manejar respuesta paginada
      if ((response as any).results) {
        const ordersData = (response as any).results
        setOrders(ordersData)

        // Calcular página actual desde la URL de next/previous
        let currentPage = 1
        if ((response as any).previous) {
          // Si hay previous, estamos en página > 1
          const url = new URL((response as any).previous)
          const prevPage = parseInt(url.searchParams.get('page') || '1')
          currentPage = prevPage + 1
        } else if ((response as any).next && !(response as any).previous) {
          // Primera página
          currentPage = 1
        } else if (!(response as any).next && (response as any).previous) {
          // Última página
          const url = new URL((response as any).previous)
          currentPage = parseInt(url.searchParams.get('page') || '1') + 1
        }

        setPagination({
          count: (response as any).count,
          next: (response as any).next,
          previous: (response as any).previous,
          current_page: currentPage,
          total_pages: Math.ceil((response as any).count / (params?.page_size || 20))
        })

        // Cargar estadísticas de la API si no están disponibles
        if (!apiStats) {
          await loadOrderStats()
        }
      } else {
        // Manejar diferentes formatos de respuesta (sin paginación)
        const ordersData = (response as any).results || response
        if (Array.isArray(ordersData)) {
          setOrders(ordersData)
          setPagination({
            count: ordersData.length,
            next: null,
            previous: null,
            current_page: 1,
            total_pages: 1
          })

          // Cargar estadísticas de la API si no están disponibles
          if (!apiStats) {
            await loadOrderStats()
          }
        } else {
          // Unexpected orders data format
          setOrders([])
        }
      }
    } catch (err: any) {
      // Error loading orders
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
      // Error loading order details
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
      // Error creating order
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
      // Error canceling order
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
      // Error confirming order
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
      // Error processing order
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
      // Error shipping order
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
      // Error delivering order
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
        // No access token found, skipping orders load
        setError('Debes iniciar sesión para ver tus órdenes')
      }
    }
  }, [loadOrders])

  // Navegar a página
  const goToPage = useCallback(async (page: number) => {
    const params = { page, page_size: 20 }
    await loadOrders(params)
    // No hacer scroll top para mantener la posición del usuario
  }, [loadOrders])

  // Ir a página siguiente
  const goToNextPage = useCallback(async () => {
    if (pagination.next) {
      await goToPage(pagination.current_page + 1)
    }
  }, [pagination, goToPage])

  // Ir a página anterior
  const goToPreviousPage = useCallback(async () => {
    if (pagination.previous) {
      await goToPage(pagination.current_page - 1)
    }
  }, [pagination, goToPage])

  return {
    orders,
    currentOrder,
    isLoading,
    error,
    pagination,
    apiStats,
    loadOrders,
    loadOrderStats,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    loadOrderDetails,
    createOrder,
    cancelOrder,
    confirmOrder,
    processOrder,
    shipOrder,
    deliverOrder
  }
}
