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
      return <CheckCircle className="w-6 h-6 text-primary-600" />
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
      return 'bg-primary-100 text-primary-800 border-primary-200'
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
      return 'bg-primary-100 text-primary-800 border-primary-200'
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
      // Error updating order status
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
          { action: 'deliver', label: 'Marcar como Entregado', color: 'bg-primary-600 hover:bg-primary-700' }
        ]
      default:
        return []
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            {/* Order Icon Skeleton */}
            <div className="mb-8">
              <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-48 mx-auto"></div>
            </div>

            {/* Main Loading Spinner */}
            <div className="relative mb-8">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary-500 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-primary-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Loading Text */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">Cargando orden</h2>
              <p className="text-gray-600">Obteniendo detalles de la orden...</p>
              
              {/* Progress Steps */}
              <div className="flex justify-center space-x-2 mt-6">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>

            {/* Loading Animation */}
            <div className="mt-8">
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !order) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar la orden</h2>
              <p className="text-gray-900/70 mb-4">{error || 'Orden no encontrada'}</p>
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Link
                href="/admin/orders"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  Orden #{order.order_number}
                </h1>
                <p className="text-gray-600">
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
                      className={`px-4 py-2 rounded-lg text-gray-900 font-medium transition-colors ${color} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isUpdating ? 'Actualizando...' : label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50">
                <div className="flex items-center gap-4 mb-4">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Estado del Pedido</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {order.status_display}
                    </span>
                  </div>
                </div>
                <p className="text-gray-900/70 text-sm">
                  {order.status === 'pending' && 'La orden está pendiente de confirmación'}
                  {order.status === 'confirmed' && 'La orden ha sido confirmada y está lista para procesar'}
                  {order.status === 'processing' && 'La orden está siendo preparada para envío'}
                  {order.status === 'shipped' && 'La orden ha sido enviada al cliente'}
                  {order.status === 'delivered' && 'La orden ha sido entregada exitosamente'}
                  {order.status === 'cancelled' && 'La orden ha sido cancelada'}
                  {order.status === 'refunded' && 'La orden ha sido reembolsada'}
                </p>
              </div>

              <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50">
                <div className="flex items-center gap-4 mb-4">
                  <CreditCard className="w-6 h-6 text-blue-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Estado del Pago</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status_display}
                    </span>
                  </div>
                </div>
                <p className="text-gray-900/70 text-sm">
                  {(order as any).payment_method && `Método: ${(order as any).payment_method}`}
                  {(order as any).transaction_id && ` • ID: ${(order as any).transaction_id}`}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items - Full Width */}
          <div className="mb-8">
            <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-gray-200/50 overflow-hidden">
              <div className="p-6 border-b border-gray-200/50">
                <h2 className="text-xl font-semibold text-gray-900">Productos</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                            <span className="text-gray-600 text-xs">Sin imagen</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.product.name}
                        </h3>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-900/70 mb-2">
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
                            <span className="text-gray-900/70">Cantidad: {item.quantity}</span>
                            <span className="text-primary-600 font-semibold">
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

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Order Summary */}
            <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen del Pedido</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-900/70">
                  <span>Subtotal:</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                
                {order.tax_amount > 0 && (
                  <div className="flex justify-between text-gray-900/70">
                    <span>Impuestos:</span>
                    <span>{formatPrice(order.tax_amount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-900/70">
                  <span>Envío:</span>
                  <span>{order.shipping_amount > 0 ? formatPrice(order.shipping_amount) : 'Gratis'}</span>
                </div>
                
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-gray-900/70">
                    <span>Descuento:</span>
                    <span className="text-primary-600">-{formatPrice(order.discount_amount)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200/50 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total:</span>
                    <span className="text-primary-600">{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información del Cliente</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-900/70 mt-0.5" />
                  <div>
                    <p className="text-gray-900/70 text-sm">Cliente</p>
                    <p className="text-gray-900">{order.user_name}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-900/70 mt-0.5" />
                  <div>
                    <p className="text-gray-900/70 text-sm">Email</p>
                    <p className="text-gray-900">{order.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-900/70 mt-0.5" />
                  <div>
                    <p className="text-gray-900/70 text-sm">Teléfono</p>
                    <p className="text-gray-900">{order.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-900/70 mt-0.5" />
                  <div>
                    <p className="text-gray-900/70 text-sm">Documento</p>
                    <p className="text-gray-900">{order.document_id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Dirección de Envío</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-900/70 text-sm">Nombre</p>
                  <p className="text-gray-900">{order.shipping_first_name} {order.shipping_last_name}</p>
                </div>
                
                <div>
                  <p className="text-gray-900/70 text-sm">Dirección</p>
                  <p className="text-gray-900">{order.shipping_address}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-900/70 text-sm">Ciudad</p>
                    <p className="text-gray-900">{order.shipping_city}</p>
                  </div>
                  <div>
                    <p className="text-gray-900/70 text-sm">Estado</p>
                    <p className="text-gray-900">{order.shipping_state}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-900/70 text-sm">País</p>
                    <p className="text-gray-900">{order.shipping_country}</p>
                  </div>
                  <div>
                    <p className="text-gray-900/70 text-sm">Código Postal</p>
                    <p className="text-gray-900">{order.shipping_postal_code}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Address */}
            {(order.billing_address && order.billing_address !== order.shipping_address) && (
              <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Dirección de Facturación</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-900/70 text-sm">Nombre</p>
                    <p className="text-gray-900">{order.billing_first_name} {order.billing_last_name}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-900/70 text-sm">Dirección</p>
                    <p className="text-gray-900">{order.billing_address}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-900/70 text-sm">Ciudad</p>
                      <p className="text-gray-900">{order.billing_city}</p>
                    </div>
                    <div>
                      <p className="text-gray-900/70 text-sm">Estado</p>
                      <p className="text-gray-900">{order.billing_state}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-900/70 text-sm">País</p>
                      <p className="text-gray-900">{order.billing_country}</p>
                    </div>
                    <div>
                      <p className="text-gray-900/70 text-sm">Código Postal</p>
                      <p className="text-gray-900">{order.billing_postal_code}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Tracking */}
            {(order.tracking_number || order.shipped_at || order.delivered_at) && (
              <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Seguimiento</h2>
                <div className="space-y-3">
                  {order.tracking_number && (
                    <div>
                      <p className="text-gray-900/70 text-sm">Número de Seguimiento</p>
                      <p className="text-gray-900 font-mono">{order.tracking_number}</p>
                    </div>
                  )}
                  
                  {order.shipped_at && (
                    <div>
                      <p className="text-gray-900/70 text-sm">Fecha de Envío</p>
                      <p className="text-gray-900">
                        {new Date(order.shipped_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  
                  {order.delivered_at && (
                    <div>
                      <p className="text-gray-900/70 text-sm">Fecha de Entrega</p>
                      <p className="text-gray-900">
                        {new Date(order.delivered_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Notes */}
            {order.notes && (
              <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Notas</h2>
                <p className="text-gray-900/70">{order.notes}</p>
              </div>
            )}

            {/* Order Timestamps */}
            <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información del Sistema</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-900/70 text-sm">Creada</p>
                  <p className="text-gray-900">
                    {new Date(order.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-900/70 text-sm">Última Actualización</p>
                  <p className="text-gray-900">
                    {new Date(order.updated_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-900/70 text-sm">UUID</p>
                  <p className="text-gray-900 font-mono text-xs">{order.uuid}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
