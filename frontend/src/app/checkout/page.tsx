"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useCartGlobal } from '@/hooks/useCartGlobal'
import { useOrders, CreateOrderData } from '@/hooks/useOrders'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/utils/currency'
import { 
  ArrowLeft, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail, 
  User,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Lock
} from 'lucide-react'
import toast from 'react-hot-toast'

interface CheckoutFormData {
  email: string
  phone: string
  shipping_address: string
  billing_address: string
  payment_method: string
  notes?: string
}

const paymentMethods = [
  { id: 'credit_card', name: 'Tarjeta de Crédito', icon: '💳' },
  { id: 'debit_card', name: 'Tarjeta de Débito', icon: '💳' },
  { id: 'paypal', name: 'PayPal', icon: '🅿️' },
  { id: 'bank_transfer', name: 'Transferencia Bancaria', icon: '🏦' },
  { id: 'cash_on_delivery', name: 'Pago Contra Entrega', icon: '💰' }
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCartGlobal()
  const { createOrder, isLoading: isCreatingOrder } = useOrders()
  const { user } = useAuth()
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    phone: '',
    shipping_address: '',
    billing_address: '',
    payment_method: 'credit_card',
    notes: ''
  })
  
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cargar datos del usuario si está autenticado
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        phone: user.phone || '',
        shipping_address: user.shipping_address || '',
        billing_address: user.billing_address || ''
      }))
    }
  }, [user])

  // Redirigir si el carrito está vacío
  useEffect(() => {
    if (items.length === 0) {
      router.push('/carrito')
    }
  }, [items.length, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof CheckoutFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido'
    }

    if (!formData.shipping_address.trim()) {
      newErrors.shipping_address = 'La dirección de envío es requerida'
    }

    if (!formData.billing_address.trim()) {
      newErrors.billing_address = 'La dirección de facturación es requerida'
    }

    if (!formData.payment_method) {
      newErrors.payment_method = 'El método de pago es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario')
      return
    }

    setIsSubmitting(true)
    
    try {

      
      // Preparar datos de la orden
      const orderData: CreateOrderData = {
        email: formData.email,
        phone: formData.phone,
        shipping_address: formData.shipping_address,
        billing_address: formData.billing_address,
        notes: formData.notes || undefined,
        items: items.map(item => ({
          product_id: item.product_details?.id,
          quantity: item.quantity,
          price: item.product_details?.price
        }))
      }
      


      // Crear la orden
      const order = await createOrder(orderData)
      
      // Limpiar el carrito
      clearCart()
      
      // Mostrar mensaje de éxito
      toast.success('¡Orden creada exitosamente!')
      
      // Redirigir a la página de órdenes
      router.push(`/account/orders/${order.id}`)
      
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Error al crear la orden. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Si el carrito está vacío, no mostrar nada
  if (items.length === 0) {
    return null
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-dark-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Link
                href="/carrito"
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">Finalizar Compra</h1>
                <p className="text-white/70">
                  Completa tu información para procesar el pedido
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulario de Checkout */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Información de Contacto */}
                <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50">
                  <div className="flex items-center gap-3 mb-6">
                    <User className="w-6 h-6 text-neon-green" />
                    <h2 className="text-xl font-semibold text-white">Información de Contacto</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="w-5 h-5 text-white/50 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 bg-dark-700 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-neon-green ${
                            errors.email ? 'border-red-500' : 'border-dark-600'
                          }`}
                          placeholder="tu@email.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-white/70 mb-2">
                        Teléfono *
                      </label>
                      <div className="relative">
                        <Phone className="w-5 h-5 text-white/50 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 bg-dark-700 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-neon-green ${
                            errors.phone ? 'border-red-500' : 'border-dark-600'
                          }`}
                          placeholder="+57 300 123 4567"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direcciones */}
                <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-6 h-6 text-neon-green" />
                    <h2 className="text-xl font-semibold text-white">Direcciones</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="shipping_address" className="block text-sm font-medium text-white/70 mb-2">
                        Dirección de Envío *
                      </label>
                      <textarea
                        id="shipping_address"
                        name="shipping_address"
                        value={formData.shipping_address}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full px-4 py-3 bg-dark-700 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-neon-green ${
                          errors.shipping_address ? 'border-red-500' : 'border-dark-600'
                        }`}
                        placeholder="Calle 123 #45-67, Barrio Centro, Bogotá"
                      />
                      {errors.shipping_address && (
                        <p className="text-red-500 text-sm mt-1">{errors.shipping_address}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="billing_address" className="block text-sm font-medium text-white/70 mb-2">
                        Dirección de Facturación *
                      </label>
                      <textarea
                        id="billing_address"
                        name="billing_address"
                        value={formData.billing_address}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full px-4 py-3 bg-dark-700 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-neon-green ${
                          errors.billing_address ? 'border-red-500' : 'border-dark-600'
                        }`}
                        placeholder="Calle 123 #45-67, Barrio Centro, Bogotá"
                      />
                      {errors.billing_address && (
                        <p className="text-red-500 text-sm mt-1">{errors.billing_address}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Método de Pago */}
                <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-6 h-6 text-neon-green" />
                    <h2 className="text-xl font-semibold text-white">Método de Pago</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          formData.payment_method === method.id
                            ? 'border-neon-green bg-neon-green/10'
                            : 'border-dark-600 hover:border-dark-500'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value={method.id}
                          checked={formData.payment_method === method.id}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <span className="text-2xl mr-3">{method.icon}</span>
                        <span className="text-white font-medium">{method.name}</span>
                        {formData.payment_method === method.id && (
                          <CheckCircle className="w-5 h-5 text-neon-green ml-auto" />
                        )}
                      </label>
                    ))}
                  </div>
                  {errors.payment_method && (
                    <p className="text-red-500 text-sm mt-2">{errors.payment_method}</p>
                  )}
                </div>

                {/* Notas Adicionales */}
                <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50">
                  <h2 className="text-xl font-semibold text-white mb-4">Notas Adicionales</h2>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-neon-green"
                    placeholder="Instrucciones especiales para la entrega..."
                  />
                </div>

                {/* Botón de Envío */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || isCreatingOrder}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || isCreatingOrder ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Finalizar Compra
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Resumen del Pedido */}
            <div className="lg:col-span-1">
              <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50 sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <ShoppingCart className="w-6 h-6 text-neon-green" />
                  <h2 className="text-xl font-semibold text-white">Resumen del Pedido</h2>
                </div>

                {/* Items del Carrito */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={`${item.product_details?.id || item.product}-${item.variant_details?.size_details?.name || item.variant_details?.size}-${item.variant_details?.color_details?.name || item.variant_details?.color}`} className="flex gap-3">
                      <div className="w-16 h-16 bg-dark-700 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product_details?.images && item.product_details.images.length > 0 ? (
                          <Image
                            src={item.product_details.images[0].image}
                            alt={item.product_details.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-dark-400 text-xs">Sin imagen</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{item.product_details?.name || 'Producto'}</h3>
                        <div className="text-sm text-white/70">
                          {item.variant_details?.size_details?.name && <span>Talla: {item.variant_details.size_details.name}</span>}
                          {item.variant_details?.size_details?.name && item.variant_details?.color_details?.name && <span> • </span>}
                          {item.variant_details?.color_details?.name && <span>Color: {item.variant_details.color_details.name}</span>}
                        </div>
                        <div className="text-sm text-white/70">
                          Cantidad: {item.quantity}
                        </div>
                        <div className="text-neon-green font-semibold">
                          {formatPrice((item.product_details?.price || 0) * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totales */}
                <div className="border-t border-dark-700/50 pt-4 space-y-3">
                  <div className="flex justify-between text-white/70">
                    <span>Subtotal:</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Envío:</span>
                    <span className="text-neon-green">Gratis</span>
                  </div>
                  <div className="border-t border-dark-700/50 pt-3">
                    <div className="flex justify-between text-lg font-bold text-white">
                      <span>Total:</span>
                      <span className="text-neon-green">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Información de Seguridad */}
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <Lock className="w-4 h-4" />
                    <span>Compra 100% segura</span>
                  </div>
                  <p className="text-white/70 text-xs mt-1">
                    Tus datos están protegidos con encriptación SSL
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
