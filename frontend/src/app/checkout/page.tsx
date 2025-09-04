"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useCartGlobal } from '@/hooks/useCartGlobal'
import { useOrders, CreateOrderData } from '@/hooks/useOrders'
import { useAuth } from '@/hooks/useAuth'
import { useAddresses } from '@/hooks/useAddresses'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Select from '@/components/ui/Select'
import toast from 'react-hot-toast'

interface CheckoutFormData {
  first_name: string
  last_name: string
  document_id: string
  email: string
  phone: string
  shipping_address: string
  billing_address_option: 'same' | 'different'
  billing_first_name: string
  billing_last_name: string
  billing_company: string
  billing_address: string
  billing_address_line_2: string
  billing_city: string
  billing_state: string
  billing_postal_code: string
  billing_phone: string
  payment_method: string
  notes?: string
  selected_shipping_address?: number
  selected_billing_address?: number
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
  const { addresses, getDefaultAddress } = useAddresses()
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    first_name: '',
    last_name: '',
    document_id: '',
    email: '',
    phone: '',
    shipping_address: '',
    billing_address_option: 'same',
    billing_first_name: '',
    billing_last_name: '',
    billing_company: '',
    billing_address: '',
    billing_address_line_2: '',
    billing_city: '',
    billing_state: '',
    billing_postal_code: '',
    billing_phone: '',
    payment_method: 'credit_card',
    notes: '',
    selected_shipping_address: undefined,
    selected_billing_address: undefined
  })
  
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calcular costo de envío
  const shippingCost = totalPrice > 150000 ? 0 : 15000
  const finalTotal = totalPrice + shippingCost

  // Cargar datos del usuario si está autenticado
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        shipping_address: user.default_address || '',
        billing_first_name: user.first_name || '',
        billing_last_name: user.last_name || ''
      }))
    }
  }, [user])

  // Cargar dirección predeterminada
  useEffect(() => {
    const loadDefaultAddress = async () => {
      try {
        const defaultAddress = await getDefaultAddress()
        if (defaultAddress) {
          setFormData(prev => ({
            ...prev,
            selected_shipping_address: defaultAddress.id
          }))
        }
      } catch (error) {
        console.log('No hay dirección predeterminada')
      }
    }

    if (addresses.length > 0) {
      loadDefaultAddress()
    }
  }, [addresses, getDefaultAddress])

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

  const handleAddressSelection = (type: 'shipping' | 'billing', addressId: number | undefined) => {
    if (addressId) {
      const selectedAddress = addresses.find(addr => addr.id === addressId)
      if (selectedAddress) {
        setFormData(prev => ({
          ...prev,
          [`selected_${type}_address`]: addressId,
          [`${type}_address`]: selectedAddress.full_address
        }))
        
        // Limpiar error del campo cuando se selecciona una dirección
        if (errors[`${type}_address` as keyof CheckoutFormData]) {
          setErrors(prev => ({
            ...prev,
            [`${type}_address`]: undefined
          }))
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [`selected_${type}_address`]: undefined,
        [`${type}_address`]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {}

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido'
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Los apellidos son requeridos'
    }

    if (!formData.document_id.trim()) {
      newErrors.document_id = 'El documento de identificación es requerido'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido'
    }

    if (!formData.selected_shipping_address && !formData.shipping_address.trim()) {
      newErrors.shipping_address = 'La dirección de envío es requerida'
    }

    // Validar dirección de facturación si es diferente
    if (formData.billing_address_option === 'different') {
      if (!formData.billing_first_name.trim()) {
        newErrors.billing_first_name = 'El nombre de facturación es requerido'
      }
      if (!formData.billing_last_name.trim()) {
        newErrors.billing_last_name = 'Los apellidos de facturación son requeridos'
      }
      if (!formData.selected_billing_address && !formData.billing_address.trim()) {
        newErrors.billing_address = 'La dirección de facturación es requerida'
      }
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
        first_name: formData.first_name,
        last_name: formData.last_name,
        document_id: formData.document_id,
        email: formData.email,
        phone: formData.phone,
        shipping_address: formData.shipping_address,
        billing_address: formData.billing_address_option === 'same' 
          ? formData.shipping_address 
          : formData.billing_address,
        shipping_cost: shippingCost,
        notes: formData.notes || undefined,
        items: items.map(item => ({
          product_id: item.product_details?.id || 0,
          quantity: item.quantity,
          price: item.product_details?.price || 0
        }))
      }
      


      // Crear la orden
      const order = await createOrder(orderData)
      
      // Limpiar el carrito
      clearCart()
      
      // Mostrar mensaje de éxito
      toast.success('¡Orden creada exitosamente!')
      
      // Redirigir a la página de órdenes
      router.push(`/account/orders/${(order as any).id}`)
      
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
      <div className="min-h-screen bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/carrito">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">FINALIZAR COMPRA</h1>
                <p className="text-gray-600">
                  Completa tu información para procesar el pedido
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulario de Checkout */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Información Personal */}
                <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <User className="w-6 h-6 text-gray-900" />
                    <h2 className="text-xl font-semibold text-gray-900">INFORMACIÓN PERSONAL</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Nombre y Apellidos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-900 mb-2">
                          Nombre *
                        </label>
                        <Input
                          type="text"
                          id="first_name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          className={errors.first_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                          placeholder="Tu nombre"
                        />
                        {errors.first_name && (
                          <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-900 mb-2">
                          Apellidos *
                        </label>
                        <Input
                          type="text"
                          id="last_name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          className={errors.last_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                          placeholder="Tus apellidos"
                        />
                        {errors.last_name && (
                          <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                        )}
                      </div>
                    </div>

                    {/* Documento de Identificación */}
                    <div>
                      <label htmlFor="document_id" className="block text-sm font-medium text-gray-900 mb-2">
                        Documento de Identificación *
                      </label>
                      <Input
                        type="text"
                        id="document_id"
                        name="document_id"
                        value={formData.document_id}
                        onChange={handleInputChange}
                        className={errors.document_id ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                        placeholder="Cédula, NIT, etc."
                      />
                      {errors.document_id && (
                        <p className="text-red-500 text-sm mt-1">{errors.document_id}</p>
                      )}
                    </div>

                    {/* Email y Teléfono */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                          Email *
                        </label>
                        <div className="relative">
                          <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          <Input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                            placeholder="tu@email.com"
                          />
                        </div>
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                          Teléfono *
                        </label>
                        <div className="relative">
                          <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          <Input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`pl-10 ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                            placeholder="+57 300 123 4567"
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direcciones */}
                <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-6 h-6 text-gray-900" />
                    <h2 className="text-xl font-semibold text-gray-900">DIRECCIONES</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Dirección de Envío */}
                    <div>
                      <label htmlFor="shipping_address" className="block text-sm font-medium text-gray-900 mb-2">
                        Dirección de Envío *
                      </label>
                      
                      {addresses.length > 0 ? (
                        <div className="space-y-3">
                          <Select
                            options={addresses.filter(addr => addr.is_shipping).map((address) => ({
                              value: address.id,
                              label: `${address.title} - ${address.full_address}`
                            }))}
                            value={formData.selected_shipping_address || ''}
                            onChange={(value) => handleAddressSelection('shipping', value ? Number(value) : undefined)}
                            placeholder="Seleccionar dirección guardada"
                            error={!!errors.shipping_address}
                          />
                          
                          <div className="text-sm text-gray-600">
                            <Link href="/account/profile" className="text-primary-500 hover:text-primary-600">
                              Gestionar direcciones
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <textarea
                            id="shipping_address"
                            name="shipping_address"
                            value={formData.shipping_address}
                            onChange={handleInputChange}
                            rows={3}
                            className={`w-full px-4 py-3 bg-white border rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                              errors.shipping_address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Calle 123 #45-67, Barrio Centro, Bogotá"
                          />
                          <div className="text-sm text-gray-600">
                            <Link href="/account/profile" className="text-primary-500 hover:text-primary-600">
                              Guardar direcciones para futuras compras
                            </Link>
                          </div>
                        </div>
                      )}
                      
                      {errors.shipping_address && (
                        <p className="text-red-500 text-sm mt-1">{errors.shipping_address}</p>
                      )}
                    </div>


                  </div>
                </div>

                {/* Dirección de Facturación */}
                <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-6 h-6 text-gray-900" />
                    <h2 className="text-xl font-semibold text-gray-900">DIRECCIÓN DE FACTURACIÓN</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Opciones de dirección de facturación */}
                    <div className="space-y-4">
                      <label className="flex items-center p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="billing_address_option"
                          value="same"
                          checked={formData.billing_address_option === 'same'}
                          onChange={(e) => setFormData(prev => ({ ...prev, billing_address_option: e.target.value as 'same' | 'different' }))}
                          className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                        />
                        <span className="ml-3 text-gray-900 font-medium">La misma dirección de envío</span>
                      </label>
                      
                      <label className="flex items-center p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="billing_address_option"
                          value="different"
                          checked={formData.billing_address_option === 'different'}
                          onChange={(e) => setFormData(prev => ({ ...prev, billing_address_option: e.target.value as 'same' | 'different' }))}
                          className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                        />
                        <span className="ml-3 text-gray-900 font-medium">Usar una dirección de facturación distinta</span>
                      </label>
                    </div>

                    {/* Campos de dirección de facturación (solo si es diferente) */}
                    {formData.billing_address_option === 'different' && (
                      <div className="space-y-6 pt-6 border-t border-gray-200">
                        {/* Nombre y Apellidos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="billing_first_name" className="block text-sm font-medium text-gray-900 mb-2">
                              Nombre *
                            </label>
                            <Input
                              type="text"
                              id="billing_first_name"
                              name="billing_first_name"
                              value={formData.billing_first_name}
                              onChange={handleInputChange}
                              className={errors.billing_first_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                              placeholder="Nombre"
                            />
                            {errors.billing_first_name && (
                              <p className="text-red-500 text-sm mt-1">{errors.billing_first_name}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="billing_last_name" className="block text-sm font-medium text-gray-900 mb-2">
                              Apellidos *
                            </label>
                            <Input
                              type="text"
                              id="billing_last_name"
                              name="billing_last_name"
                              value={formData.billing_last_name}
                              onChange={handleInputChange}
                              className={errors.billing_last_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                              placeholder="Apellidos"
                            />
                            {errors.billing_last_name && (
                              <p className="text-red-500 text-sm mt-1">{errors.billing_last_name}</p>
                            )}
                          </div>
                        </div>

                        {/* Empresa (opcional) */}
                        <div>
                          <label htmlFor="billing_company" className="block text-sm font-medium text-gray-900 mb-2">
                            Empresa (opcional)
                          </label>
                          <Input
                            type="text"
                            id="billing_company"
                            name="billing_company"
                            value={formData.billing_company}
                            onChange={handleInputChange}
                            placeholder="Empresa (opcional)"
                          />
                        </div>

                        {/* Dirección */}
                        <div>
                          <label htmlFor="billing_address" className="block text-sm font-medium text-gray-900 mb-2">
                            Dirección *
                          </label>
                          
                          {addresses.length > 0 ? (
                            <div className="space-y-3">
                              <Select
                                options={addresses.filter(addr => addr.is_billing).map((address) => ({
                                  value: address.id,
                                  label: `${address.title} - ${address.full_address}`
                                }))}
                                value={formData.selected_billing_address || ''}
                                onChange={(value) => handleAddressSelection('billing', value ? Number(value) : undefined)}
                                placeholder="Seleccionar dirección guardada"
                                error={!!errors.billing_address}
                              />
                              
                              <div className="text-sm text-gray-600">
                                <Link href="/account/profile" className="text-primary-500 hover:text-primary-600">
                                  Gestionar direcciones
                                </Link>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <textarea
                                id="billing_address"
                                name="billing_address"
                                value={formData.billing_address}
                                onChange={handleInputChange}
                                rows={3}
                                className={`w-full px-4 py-3 bg-white border rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                  errors.billing_address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Dirección"
                              />
                              <div className="text-sm text-gray-600">
                                <Link href="/account/profile" className="text-primary-500 hover:text-primary-600">
                                  Guardar direcciones para futuras compras
                                </Link>
                              </div>
                            </div>
                          )}
                          
                          {errors.billing_address && (
                            <p className="text-red-500 text-sm mt-1">{errors.billing_address}</p>
                          )}
                        </div>

                        {/* Casa, apartamento, etc. (opcional) */}
                        <div>
                          <label htmlFor="billing_address_line_2" className="block text-sm font-medium text-gray-900 mb-2">
                            Casa, apartamento, etc. (opcional)
                          </label>
                          <Input
                            type="text"
                            id="billing_address_line_2"
                            name="billing_address_line_2"
                            value={formData.billing_address_line_2}
                            onChange={handleInputChange}
                            placeholder="Casa, apartamento, etc. (opcional)"
                          />
                        </div>

                        {/* Ciudad, Provincia y Código Postal */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label htmlFor="billing_city" className="block text-sm font-medium text-gray-900 mb-2">
                              Ciudad
                            </label>
                            <Input
                              type="text"
                              id="billing_city"
                              name="billing_city"
                              value={formData.billing_city}
                              onChange={handleInputChange}
                              placeholder="Ciudad"
                            />
                          </div>

                          <div>
                            <label htmlFor="billing_state" className="block text-sm font-medium text-gray-900 mb-2">
                              Provincia / Estado
                            </label>
                            <Input
                              type="text"
                              id="billing_state"
                              name="billing_state"
                              value={formData.billing_state}
                              onChange={handleInputChange}
                              placeholder="Provincia / Estado"
                            />
                          </div>

                          <div>
                            <label htmlFor="billing_postal_code" className="block text-sm font-medium text-gray-900 mb-2">
                              Código postal (opcional)
                            </label>
                            <Input
                              type="text"
                              id="billing_postal_code"
                              name="billing_postal_code"
                              value={formData.billing_postal_code}
                              onChange={handleInputChange}
                              placeholder="Código postal (opcional)"
                            />
                          </div>
                        </div>

                        {/* Teléfono (opcional) */}
                        <div>
                          <label htmlFor="billing_phone" className="block text-sm font-medium text-gray-900 mb-2">
                            Teléfono (opcional)
                          </label>
                          <Input
                            type="tel"
                            id="billing_phone"
                            name="billing_phone"
                            value={formData.billing_phone}
                            onChange={handleInputChange}
                            placeholder="Teléfono (opcional)"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Método de Envío */}
                <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-6 h-6 text-gray-900" />
                    <h2 className="text-xl font-semibold text-gray-900">MÉTODO DE ENVÍO</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {shippingCost === 0 
                            ? 'Envío GRATIS (Compra mayor a $150.000)' 
                            : 'Envío Nacional (2 a 5 días hábiles)'
                          }
                        </p>
                      </div>
                      <div className="ml-4">
                        <span className="text-lg font-semibold text-gray-900">
                          {shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Método de Pago */}
                <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-6 h-6 text-gray-900" />
                    <h2 className="text-xl font-semibold text-gray-900">MÉTODO DE PAGO</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`relative flex items-center p-4 border rounded-md cursor-pointer transition-colors ${
                          formData.payment_method === method.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-gray-400'
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
                        <span className="text-gray-900 font-medium">{method.name}</span>
                        {formData.payment_method === method.id && (
                          <CheckCircle className="w-5 h-5 text-primary-500 ml-auto" />
                        )}
                      </label>
                    ))}
                  </div>
                  {errors.payment_method && (
                    <p className="text-red-500 text-sm mt-2">{errors.payment_method}</p>
                  )}
                </div>

                {/* Notas Adicionales */}
                <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">NOTAS ADICIONALES</h2>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Instrucciones especiales para la entrega..."
                  />
                </div>

                {/* Botón de Envío */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="black"
                    size="lg"
                    disabled={isSubmitting || isCreatingOrder}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting || isCreatingOrder ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        FINALIZAR COMPRA
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Resumen del Pedido */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <ShoppingCart className="w-6 h-6 text-gray-900" />
                  <h2 className="text-xl font-semibold text-gray-900">RESUMEN DEL PEDIDO</h2>
                </div>

                {/* Items del Carrito */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={`${item.product_details?.id || item.product}-${item.variant_details?.size_details?.name || item.variant_details?.size}-${item.variant_details?.color_details?.name || item.variant_details?.color}`} className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
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
                            <span className="text-gray-400 text-xs">Sin imagen</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900 font-medium truncate">{item.product_details?.name || 'Producto'}</h3>
                        <div className="text-sm text-gray-600">
                          {item.variant_details?.size_details?.name && <span>Talla: {item.variant_details.size_details.name}</span>}
                          {item.variant_details?.size_details?.name && item.variant_details?.color_details?.name && <span> • </span>}
                          {item.variant_details?.color_details?.name && <span>Color: {item.variant_details.color_details.name}</span>}
                        </div>
                        <div className="text-sm text-gray-600">
                          Cantidad: {item.quantity}
                        </div>
                        <div className="text-gray-900 font-semibold">
                          {formatPrice((item.product_details?.price || 0) * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totales */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Envío:</span>
                    <span className={shippingCost === 0 ? "text-green-600" : "text-gray-900"}>
                      {shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total:</span>
                      <span className="text-gray-900">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Información de Seguridad */}
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <Lock className="w-4 h-4" />
                    <span>Compra 100% segura</span>
                  </div>
                  <p className="text-gray-600 text-xs mt-1">
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
