"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useOrders, OrderSummary } from '@/hooks/useOrders'
import { formatPrice } from '@/utils/currency'
import {
  Package,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Calendar,
  User,
  DollarSign
} from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import TableSkeleton from '@/components/ui/TableSkeleton'

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4 text-yellow-500" />
    case 'confirmed':
      return <CheckCircle className="w-4 h-4 text-blue-500" />
    case 'processing':
      return <Package className="w-4 h-4 text-purple-500" />
    case 'shipped':
      return <Package className="w-4 h-4 text-indigo-500" />
    case 'delivered':
      return <CheckCircle className="w-4 h-4 text-primary-600" />
    case 'cancelled':
      return <AlertCircle className="w-4 h-4 text-red-500" />
    default:
      return <Clock className="w-4 h-4 text-gray-500" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'confirmed':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'processing':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'shipped':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200'
    case 'delivered':
      return 'bg-primary-100 text-primary-800 border-primary-200'
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'completed':
      return 'bg-primary-100 text-primary-800 border-primary-200'
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'refunded':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function OrdersPage() {
  const {
    orders,
    isLoading,
    error,
    loadOrders,
    pagination,
    apiStats,
    goToPage
  } = useOrders()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all')

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // Filtrar órdenes
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesPaymentStatus = paymentStatusFilter === 'all' || order.payment_status === paymentStatusFilter

    return matchesSearch && matchesStatus && matchesPaymentStatus
  })

  const handleViewOrder = (orderId: number) => {
    router.push(`/admin/orders/${orderId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-24 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters Skeleton */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table Skeleton */}
        <TableSkeleton rows={10} columns={6} showHeader={true} />
      </div>
    )
  }

  // Estadísticas
  const totalOrders = apiStats?.total_orders || pagination.count
  const totalRevenue = apiStats?.total_revenue || orders.reduce((sum, order) => {
    // Solo sumar órdenes con estado de pago completado
    if (order.payment_status === 'completed') {
      const amount = order.total_amount || 0
      const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
      return sum + numericAmount
    }
    return sum
  }, 0)
  const pendingOrders = apiStats?.pending_orders || orders.filter(order => order.status === 'pending').length
  const paidOrders = apiStats?.paid_orders_completed || orders.filter(order => order.payment_status === 'completed').length
  const completedOrders = apiStats?.completed_orders || orders.filter(order => 
    order.status === 'delivered' && order.payment_status === 'completed'
  ).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar las órdenes</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadOrders}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-600 mt-2">Gestiona y sigue el estado de todas las órdenes</p>
        </div>
      </div>

      {/* Stats Cards - Una sola fila */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Órdenes</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalOrders}</p>
            </div>
            <Package className="w-8 h-8 text-primary-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatPrice(totalRevenue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Estado Pendiente</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{pendingOrders}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pago Completado</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{paidOrders}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completadas</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{completedOrders}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número de orden, email o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              title="Filtrar por estado"
              aria-label="Filtrar pedidos por estado"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmado</option>
              <option value="processing">Procesando</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregado</option>
              <option value="cancelled">Cancelado</option>
            </select>

            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              title="Filtrar por estado de pago"
              aria-label="Filtrar pedidos por estado de pago"
            >
              <option value="all">Todos los pagos</option>
              <option value="pending">Pendiente</option>
              <option value="completed">Completado</option>
              <option value="failed">Fallido</option>
              <option value="refunded">Reembolsado</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(statusFilter !== 'all' || paymentStatusFilter !== 'all') && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setStatusFilter('all')
                  setPaymentStatusFilter('all')
                }}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Paginación Minimalista - Entre filtros y tabla */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => goToPage(pagination.current_page - 1)}
              disabled={pagination.current_page === 1 || isLoading}
              className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>
            <span className="text-xs text-gray-600 px-2">
              {pagination.current_page} de {pagination.total_pages}
            </span>
            <button
              onClick={() => goToPage(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.total_pages || isLoading}
              className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente →
            </button>
          </div>
          <div className="text-xs text-gray-500">
            {pagination.count} pedidos
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pago
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.order_number}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.user_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.user_email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status_display}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status_display}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(order.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleViewOrder(order.id)}
                      className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                      title="Ver pedido"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron pedidos</h3>
            <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}