"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useOrders, Order } from '@/hooks/useOrders'
import { useClaims } from '@/hooks/useClaims'
import { formatPrice } from '@/utils/currency'
import { toast } from 'react-hot-toast'
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
  MessageSquare,
  Send,
  X,
  Download,
  User,
  FileText,
  Hash,
  Receipt
} from 'lucide-react'
import { Button } from '@/components/ui/button'

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

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = parseInt(params.id as string)
  
  const { currentOrder, isLoading, error, loadOrderDetails } = useOrders()
  const { createClaim } = useClaims()
  const [order, setOrder] = useState<Order | null>(null)
  
  // Estados para el formulario de reclamo
  const [showClaimForm, setShowClaimForm] = useState(false)
  const [claimData, setClaimData] = useState({
    claim_type: 'product_issue',
    title: '',
    description: '',
    priority: 'medium'
  })
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false)

  useEffect(() => {
    if (orderId) {
      loadOrderDetails(orderId).then((orderData) => {
        setOrder(orderData as Order)
      })
    }
  }, [orderId, loadOrderDetails])

  // Función para manejar el envío del reclamo
  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!claimData.title.trim() || !claimData.description.trim()) {
      toast.error('Por favor completa todos los campos obligatorios')
      return
    }

    setIsSubmittingClaim(true)
    
    try {
      await createClaim({
        ...claimData,
        order: orderId,
        claim_type: claimData.claim_type as "product_issue" | "shipping_issue" | "payment_issue" | "service_issue"
      })
      
      toast.success('Reclamo enviado correctamente. Te contactaremos pronto.')
      setShowClaimForm(false)
      setClaimData({
        claim_type: 'product_issue',
        title: '',
        description: '',
        priority: 'medium'
      })
    } catch (error) {
      console.error('Error al enviar reclamo:', error)
      toast.error('Error al enviar el reclamo. Inténtalo de nuevo.')
    } finally {
      setIsSubmittingClaim(false)
    }
  }

  // Función para manejar cambios en el formulario
  const handleClaimDataChange = (field: string, value: string) => {
    setClaimData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-600 mt-4 text-lg">Cargando detalles de la orden...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !order) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-20">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Error al cargar la orden</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">{error || 'Orden no encontrada'}</p>
              <Link href="/account/orders">
                <Button variant="black" className="inline-flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Volver a Mis Órdenes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Link
                href="/account/orders"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Volver a mis órdenes</span>
              </Link>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Orden #{order.order_number}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Realizada el {new Date(order.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(order.created_at).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(order.total_amount)}
                    </p>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                  {order.status === 'delivered' && (
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Factura
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                {getStatusIcon(order.status)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Estado del Pedido</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                    {order.status_display}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                {order.status === 'pending' && 'Tu pedido está siendo procesado'}
                {order.status === 'confirmed' && 'Tu pedido ha sido confirmado'}
                {order.status === 'processing' && 'Tu pedido está siendo preparado'}
                {order.status === 'shipped' && 'Tu pedido ha sido enviado'}
                {order.status === 'delivered' && 'Tu pedido ha sido entregado'}
                {order.status === 'cancelled' && 'Tu pedido ha sido cancelado'}
                {order.status === 'refunded' && 'Tu pedido ha sido reembolsado'}
              </p>
              {order.tracking_number && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600">Tracking:</span>
                    <span className="font-medium text-gray-900">{order.tracking_number}</span>
                  </div>
                </div>
              )}
              {order.shipped_at && (
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Enviado:</span> {new Date(order.shipped_at).toLocaleDateString('es-ES')}
                </div>
              )}
              {order.delivered_at && (
                <div className="mt-2 text-sm text-green-600">
                  <span className="font-medium">Entregado:</span> {new Date(order.delivered_at).toLocaleDateString('es-ES')}
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <CreditCard className="w-6 h-6 text-blue-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Estado del Pago</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPaymentStatusColor(order.payment_status)}`}>
                    {order.payment_status_display}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Estado:</span> {order.payment_status_display}
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
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
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        <Link 
                          href={`/producto/${item.product.slug}`}
                          className="hover:text-gray-600 transition-colors"
                        >
                          {item.product.name}
                        </Link>
                      </h3>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
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
                          <span className="text-gray-600">Cantidad: {item.quantity}</span>
                          <span className="text-gray-900 font-semibold">
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

          {/* Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen del Pedido</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  {order.shipping_amount > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Envío:</span>
                      <span>{formatPrice(order.shipping_amount)}</span>
                    </div>
                  )}
                  {order.shipping_amount === 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Envío:</span>
                      <span className="text-green-600">Gratis</span>
                    </div>
                  )}
                  {order.tax_amount > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Impuestos:</span>
                      <span>{formatPrice(order.tax_amount)}</span>
                    </div>
                  )}
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento:</span>
                      <span>-{formatPrice(order.discount_amount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>Total:</span>
                      <span>{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Información del Cliente</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-gray-600 text-sm">Nombre</p>
                      <p className="text-gray-900">{order.first_name} {order.last_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Hash className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-gray-600 text-sm">Documento</p>
                      <p className="text-gray-900">{order.document_id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-gray-600 text-sm">Email</p>
                      <p className="text-gray-900">{order.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-gray-600 text-sm">Teléfono</p>
                      <p className="text-gray-900">{order.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              {order.notes && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Notas</h2>
                  <p className="text-gray-600">{order.notes}</p>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Información de Envío</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-gray-600 text-sm">Dirección de Envío</p>
                      <p className="text-gray-900">{order.shipping_address}</p>
                    </div>
                  </div>
                  
                  {order.billing_address && order.billing_address !== order.shipping_address && (
                    <div className="flex items-start gap-3">
                      <Receipt className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-gray-600 text-sm">Dirección de Facturación</p>
                        <p className="text-gray-900">{order.billing_address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reclamo o Devolución */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Reclamo o Devolución</h2>
                  <Button
                    onClick={() => setShowClaimForm(!showClaimForm)}
                    variant={showClaimForm ? "outline" : "black"}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {showClaimForm ? 'Cancelar' : 'Crear Reclamo'}
                  </Button>
                </div>
                
                {showClaimForm ? (
                  <form onSubmit={handleSubmitClaim} className="space-y-4">
                    <div>
                      <label className="block text-gray-900 font-medium mb-2">Tipo de Reclamo</label>
                      <select
                        value={claimData.claim_type}
                        onChange={(e) => handleClaimDataChange('claim_type', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        aria-label="Tipo de reclamo"
                      >
                        <option value="product_issue">Problema con el Producto</option>
                        <option value="shipping_issue">Problema con el Envío</option>
                        <option value="payment_issue">Problema con el Pago</option>
                        <option value="service_issue">Problema con el Servicio</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-900 font-medium mb-2">Prioridad</label>
                      <select
                        value={claimData.priority}
                        onChange={(e) => handleClaimDataChange('priority', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        aria-label="Prioridad del reclamo"
                      >
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-900 font-medium mb-2">Título del Reclamo *</label>
                      <input
                        type="text"
                        value={claimData.title}
                        onChange={(e) => handleClaimDataChange('title', e.target.value)}
                        placeholder="Describe brevemente el problema"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-900 font-medium mb-2">Descripción Detallada *</label>
                      <textarea
                        value={claimData.description}
                        onChange={(e) => handleClaimDataChange('description', e.target.value)}
                        placeholder="Proporciona todos los detalles del problema, incluyendo cualquier información relevante que pueda ayudar a resolver tu reclamo"
                        rows={4}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmittingClaim}
                        variant="black"
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        {isSubmittingClaim ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Enviar Reclamo
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowClaimForm(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      ¿Tienes algún problema con tu pedido? 
                    </p>
                    <p className="text-gray-500 text-sm">
                      Puedes crear un reclamo o solicitar una devolución haciendo clic en el botón de arriba.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
