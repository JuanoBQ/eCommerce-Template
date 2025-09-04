"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useOrders, OrderSummary } from '@/hooks/useOrders'
import { formatPrice } from '@/utils/currency'
import { 
  Package, 
  Eye, 
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  User,
  DollarSign
} from 'lucide-react'

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
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case 'cancelled':
      return <AlertCircle className="w-4 h-4 text-red-500" />
    case 'refunded':
      return <AlertCircle className="w-4 h-4 text-gray-500" />
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
      return 'bg-green-100 text-green-800 border-green-200'
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'refunded':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'refunded':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function AdminOrdersPage() {
  const { orders, isLoading, error, loadOrders } = useOrders()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all')

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

  // Estadísticas
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => {
    const amount = order.total_amount || 0
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return sum + numericAmount
  }, 0)
  const pendingOrders = orders.filter(order => order.status === 'pending').length
  const completedOrders = orders.filter(order => order.status === 'delivered').length

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-dark-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green mx-auto"></div>
              <p className="text-white mt-4">Cargando órdenes...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-dark-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Error al cargar las órdenes</h2>
              <p className="text-white/70 mb-4">{error}</p>
              <button
                onClick={loadOrders}
                className="btn-primary"
              >
                Reintentar
              </button>
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
            <h1 className="text-3xl font-bold text-white mb-2">Gestión de Órdenes</h1>
            <p className="text-white/70">
              Administra y sigue el estado de todas las órdenes
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Package className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Total Órdenes</p>
                  <p className="text-2xl font-bold text-white">{totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-white">{formatPrice(totalRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Pendientes</p>
                  <p className="text-2xl font-bold text-white">{pendingOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Completadas</p>
                  <p className="text-2xl font-bold text-white">{completedOrders}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="w-5 h-5 text-white/70 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por número, email o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-neon-green"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="w-5 h-5 text-white/70 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-neon-green appearance-none"
                  title="Filtrar por estado de la orden"
                  aria-label="Filtrar por estado de la orden"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="processing">En Proceso</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                  <option value="refunded">Reembolsado</option>
                </select>
              </div>

              {/* Payment Status Filter */}
              <div className="relative">
                <Filter className="w-5 h-5 text-white/70 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-neon-green appearance-none"
                  title="Filtrar por estado del pago"
                  aria-label="Filtrar por estado del pago"
                >
                  <option value="all">Todos los pagos</option>
                  <option value="pending">Pago Pendiente</option>
                  <option value="paid">Pagado</option>
                  <option value="failed">Fallido</option>
                  <option value="refunded">Reembolsado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          {filteredOrders.length === 0 ? (
            <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-12 border border-dark-700/50 text-center">
              <Package className="w-16 h-16 text-white/30 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-white mb-4">
                No hay órdenes
              </h3>
              <p className="text-white/70">
                {searchTerm || statusFilter !== 'all' || paymentStatusFilter !== 'all'
                  ? 'No se encontraron órdenes con los filtros aplicados'
                  : 'Aún no hay órdenes registradas'
                }
              </p>
            </div>
          ) : (
            <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl border border-dark-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Orden</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Cliente</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Estado</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Pago</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Total</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Fecha</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-700/50">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-dark-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <span className="text-white font-medium">#{order.order_number}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white font-medium">{order.user_name}</p>
                            <p className="text-white/70 text-sm">{order.user_email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {order.status_display}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.payment_status)}`}>
                            {order.payment_status_display}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-neon-green font-semibold">
                            {formatPrice(order.total_amount || 0)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-white/70">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">
                              {new Date(order.created_at).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewOrder(order.id)}
                            className="btn-secondary flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
