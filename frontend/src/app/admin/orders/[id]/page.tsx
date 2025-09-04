"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useOrders, Order } from '@/hooks/useOrders'
import { formatPrice } from '@/utils/currency'
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  AlertCircle,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Calendar,
  User,
  Edit
} from 'lucide-react'

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-6 h-6 text-yellow-500" />
    case 'confirmed':
      return <CheckCircle className="w-6 h-6 text-blue-500" />
    case 'processing':
      return <Package className="w-6 h-6 text-purple-500" />
    case 'shipped':
      return <Truck className="w-6 h-6 text-indigo-500" />
    case 'delivered':
      return <CheckCircle className="w-6 h-6 text-green-500" />
    case 'cancelled':
      return <AlertCircle className="w-6 h-6 text-red-500" />
    case 'refunded':
      return <AlertCircle className="w-6 h-6 text-gray-500" />
    default:
      return <Clock className="w-6 h-6 text-gray-500" />
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

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = parseInt(params.id as string)
  
  const { 
    currentOrder, 
    isLoading, 
    error, 
    loadOrderDetails,
    confirmOrder,
    processOrder,
    shipOrder,
    deliverOrder,
    cancelOrder
  } = useOrders()
  const [order, setOrder] = useState<Order | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (orderId) {
      loadOrderDetails(orderId).then((orderData) => {
        setOrder(orderData as Order)
      })
    }
  }, [orderId, loadOrderDetails])

  const handleStatusUpdate = async (action: string) => {
    if (!order) return
    
    setIsUpdating(true)
    try {
      switch (action) {
        case 'confirm':
          await confirmOrder(order.id)
          break
        case 'process':
          await processOrder(order.id)
          break
        case 'ship':
          await shipOrder(order.id)
          break
        case 'deliver':
          await deliverOrder(order.id)
          break
        case 'cancel':
          await cancelOrder(order.id)
          break
      }
      // Recargar los detalles de la orden
      const updatedOrder = await loadOrderDetails(order.id)
      setOrder(updatedOrder as Order)
    } catch (error) {
      console.error('Error updating order status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getAvailableActions = (status: string) => {
    switch (status) {
      case 'pending':
        return [
          { action: 'confirm', label: 'Confirmar Orden', color: 'bg-blue-600 hover:bg-blue-700' },
          { action: 'cancel', label: 'Cancelar Orden', color: 'bg-red-600 hover:bg-red-700' }
        ]
      case 'confirmed':
        return [
          { action: 'process', label: 'Marcar en Proceso', color: 'bg-purple-600 hover:bg-purple-700' },
          { action: 'cancel', label: 'Cancelar Orden', color: 'bg-red-600 hover:bg-red-700' }
        ]
      case 'processing':
        return [
          { action: 'ship', label: 'Marcar como Enviado', color: 'bg-indigo-600 hover:bg-indigo-700' },
          { action: 'cancel', label: 'Cancelar Orden', color: 'bg-red-600 hover:bg-red-700' }
        ]
      case 'shipped':
        return [
          { action: 'deliver', label: 'Marcar como Entregado', color: 'bg-green-600 hover:bg-green-700' }
        ]
      default:
        return []
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-dark-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green mx-auto"></div>
              <p className="text-white mt-4">Cargando detalles de la orden...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !order) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-dark-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Error al cargar la orden</h2>
              <p className="text-white/70 mb-4">{error || 'Orden no encontrada'}</p>
              <Link
                href="/admin/orders"
                className="btn-primary"
              >
                Volver a Órdenes
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const availableActions = getAvailableActions(order.status)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-dark-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Link
                href="/admin/orders"
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white">
                  Orden #{order.order_number}
                </h1>
                <p className="text-white/70">
                  Realizada el {new Date(order.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              {/* Action Buttons */}
              {availableActions.length > 0 && (
                <div className="flex gap-2">
                  {availableActions.map(({ action, label, color }) => (
                    <button
                      key={action}
                      onClick={() => handleStatusUpdate(action)}
                      disabled={isUpdating}
                      className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${color} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isUpdating ? 'Actualizando...' : label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50">
                <div className="flex items-center gap-4 mb-4">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-white">Estado del Pedido</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {order.status_display}
                    </span>
                  </div>
                </div>
                <p className="text-white/70 text-sm">
                  {order.status === 'pending' && 'La orden está pendiente de confirmación'}
                  {order.status === 'confirmed' && 'La orden ha sido confirmada y está lista para procesar'}
                  {order.status === 'processing' && 'La orden está siendo preparada para envío'}
                  {order.status === 'shipped' && 'La orden ha sido enviada al cliente'}
                  {order.status === 'delivered' && 'La orden ha sido entregada exitosamente'}
                  {order.status === 'cancelled' && 'La orden ha sido cancelada'}
                  {order.status === 'refunded' && 'La orden ha sido reembolsada'}
                </p>
              </div>

              <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50">
                <div className="flex items-center gap-4 mb-4">
                  <CreditCard className="w-6 h-6 text-blue-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Estado del Pago</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status_display}
                    </span>
                  </div>
                </div>
                <p className="text-white/70 text-sm">
                  {order.payment_method && `Método: ${order.payment_method}`}
                  {order.transaction_id && ` • ID: ${order.transaction_id}`}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl border border-dark-700/50 overflow-hidden">
                <div className="p-6 border-b border-dark-700/50">
                  <h2 className="text-xl font-semibold text-white">Productos</h2>
                </div>
                <div className="divide-y divide-dark-700/50">
                  {order.items.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-dark-700 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.images && item.product.images.length > 0 ? (
                            <Image
                              src={item.product.images[0].image}
                              alt={item.product.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-dark-400 text-xs">Sin imagen</span>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {item.product.name}
                          </h3>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-white/70 mb-2">
                            {item.product.brand_details && (
                              <span>Marca: {item.product.brand_details.name}</span>
                            )}
                            {item.product.category_details && (
                              <span>Categoría: {item.product.category_details.name}</span>
                            )}
                            {item.product_sku && (
                              <span>SKU: {item.product_sku}</span>
                            )}
                            {item.variant_info && (
                              <span>Variante: {item.variant_info}</span>
                            )}
                            {item.size && <span>Talla: {item.size}</span>}
                            {item.color && <span>Color: {item.color}</span>}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-white/70">Cantidad: {item.quantity}</span>
                              <span className="text-neon-green font-semibold">
                                {formatPrice(item.total_price)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary & Details */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50">
                <h2 className="text-xl font-semibold text-white mb-4">Resumen del Pedido</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-white/70">
                    <span>Subtotal:</span>
                    <span>{formatPrice(order.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Envío:</span>
                    <span>Gratis</span>
                  </div>
                  <div className="border-t border-dark-700/50 pt-3">
                    <div className="flex justify-between text-lg font-semibold text-white">
                      <span>Total:</span>
                      <span className="text-neon-green">{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50">
                <h2 className="text-xl font-semibold text-white mb-4">Información del Cliente</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-white/70 mt-0.5" />
                    <div>
                      <p className="text-white/70 text-sm">Cliente</p>
                      <p className="text-white">{order.user_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-white/70 mt-0.5" />
                    <div>
                      <p className="text-white/70 text-sm">Email</p>
                      <p className="text-white">{order.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-white/70 mt-0.5" />
                    <div>
                      <p className="text-white/70 text-sm">Teléfono</p>
                      <p className="text-white">{order.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-white/70 mt-0.5" />
                    <div>
                      <p className="text-white/70 text-sm">Dirección de Envío</p>
                      <p className="text-white">{order.shipping_address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              {order.notes && (
                <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50">
                  <h2 className="text-xl font-semibold text-white mb-4">Notas</h2>
                  <p className="text-white/70">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
