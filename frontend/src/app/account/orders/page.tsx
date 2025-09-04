"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useOrders, OrderSummary } from '@/hooks/useOrders'
import { formatPrice } from '@/utils/currency'
import { 
  Package, 
  Eye, 
  X, 
  Calendar, 
  CreditCard, 
  Truck,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-5 h-5 text-yellow-500" />
    case 'confirmed':
      return <CheckCircle className="w-5 h-5 text-blue-500" />
    case 'processing':
      return <Package className="w-5 h-5 text-purple-500" />
    case 'shipped':
      return <Truck className="w-5 h-5 text-indigo-500" />
    case 'delivered':
      return <CheckCircle className="w-5 h-5 text-green-500" />
    case 'cancelled':
      return <X className="w-5 h-5 text-red-500" />
    case 'refunded':
      return <AlertCircle className="w-5 h-5 text-gray-500" />
    default:
      return <Clock className="w-5 h-5 text-gray-500" />
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

export default function OrdersPage() {
  const { orders, isLoading, error, loadOrders } = useOrders()
  const router = useRouter()

  const handleViewOrder = (orderId: number) => {
    router.push(`/account/orders/${orderId}`)
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando órdenes...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar las órdenes</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button
                onClick={loadOrders}
                variant="black"
              >
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">MIS ÓRDENES</h1>
                <p className="text-gray-600">
                  Gestiona y sigue el estado de tus pedidos
                </p>
              </div>
              <Link href="/tienda">
                <Button variant="black">
                  Seguir Comprando
                </Button>
              </Link>
            </div>
          </div>

          {orders.length === 0 ? (
            /* Empty State */
            <div className="bg-white border border-gray-200 rounded-md p-12 shadow-sm text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                NO TIENES ÓRDENES AÚN
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Cuando realices tu primera compra, aparecerá aquí para que puedas hacer seguimiento
              </p>
              <Link href="/tienda">
                <Button
                  variant="black"
                  className="inline-flex items-center"
                >
                  <Package className="w-5 h-5 mr-2" />
                  Explorar Productos
                </Button>
              </Link>
            </div>
          ) : (
            /* Orders List */
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(order.status)}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Orden #{order.order_number}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {order.status_display}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.payment_status)}`}>
                            {order.payment_status_display}
                          </span>
                        </div>
                        <Button
                          onClick={() => handleViewOrder(order.id)}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Total</h4>
                        <p className="text-xl font-bold text-gray-900">
                          {formatPrice(order.total_amount)}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Productos</h4>
                        <p className="text-lg font-semibold text-gray-900">
                          {order.items_count} {order.items_count === 1 ? 'producto' : 'productos'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Fecha</h4>
                        <p className="text-lg font-semibold text-gray-900">
                          {new Date(order.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
