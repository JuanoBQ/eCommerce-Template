"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, CreditCard } from 'lucide-react'
import { useCartGlobal as useCart } from '@/hooks/useCartGlobal'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/utils/currency'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

export default function CartPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { 
    items, 
    totalItems, 
    totalPrice, 
    updateCartItem, 
    removeFromCart, 
    clearCart 
  } = useCart()
  const [isUpdating, setIsUpdating] = useState<number | null>(null)



  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return
    
    setIsUpdating(itemId)
    try {
      await updateCartItem(itemId, newQuantity)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleRemoveItem = async (itemId: number) => {
    setIsUpdating(itemId)
    try {
      await removeFromCart(itemId)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleClearCart = async () => {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      await clearCart()
    }
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para continuar')
      router.push('/auth/login?redirect=/checkout')
      return
    }
    router.push('/checkout')
  }

  const shippingThreshold = 100000
  const shippingCost = totalPrice < shippingThreshold ? 15000 : 0
  const finalTotal = totalPrice + shippingCost



  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            title="Volver"
            aria-label="Volver"
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-gray-900" />
            <h1 className="text-3xl font-bold text-gray-900">
              CARRITO DE COMPRAS
            </h1>
          </div>
        </div>

        {items.length === 0 ? (
          /* Carrito vacío */
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              TU CARRITO ESTÁ VACÍO
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Parece que no has agregado ningún producto a tu carrito. 
              Explora nuestra tienda y encuentra los productos perfectos para ti.
            </p>
            <Link href="/tienda">
              <Button
                variant="black"
                size="lg"
                className="inline-flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                IR A LA TIENDA
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de productos */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-md p-6 shadow-sm"
                >
                  <div className="flex gap-6">
                    {/* Imagen del producto */}
                    <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={item.product_details?.images?.[0]?.image || '/images/placeholder-product.jpg'}
                        alt={item.product_details?.name || 'Producto'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Información del producto */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {item.product_details?.name}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {item.product_details?.brand_details?.name}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isUpdating === item.id}
                          title="Eliminar producto"
                          aria-label="Eliminar producto"
                          className="p-2 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Variante */}
                      {item.variant_details && (
                        <div className="mb-3">
                          <p className="text-gray-600 text-sm">
                            {item.variant_details.size_details?.name && 
                              `Talla: ${item.variant_details.size_details.name}`}
                            {item.variant_details.color_details?.name && 
                              ` • Color: ${item.variant_details.color_details.name}`}
                          </p>
                        </div>
                      )}

                      {/* Precio y cantidad */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-semibold text-gray-900">
                            {formatPrice(item.unit_price || item.product_details?.price || 0)}
                          </span>
                          
                          {/* Controles de cantidad */}
                          <div className="flex items-center gap-1 bg-gray-100 border border-gray-300 rounded-md">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={isUpdating === item.id || item.quantity <= 1}
                              title="Disminuir cantidad"
                              aria-label="Disminuir cantidad"
                              className="p-2 h-8 w-8"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            
                            <span className="px-3 py-2 text-gray-900 font-medium min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={isUpdating === item.id}
                              title="Aumentar cantidad"
                              aria-label="Aumentar cantidad"
                              className="p-2 h-8 w-8"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(item.total_price || (item.unit_price || 0) * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Botón limpiar carrito */}
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  onClick={handleClearCart}
                  className="text-gray-500 hover:text-red-500"
                >
                  Vaciar carrito
                </Button>
              </div>
            </div>

            {/* Resumen del pedido */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm sticky top-24">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  RESUMEN DEL PEDIDO
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({totalItems} productos)</span>
                    <span className="text-gray-900 font-medium">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío</span>
                    <span className="text-gray-900 font-medium">
                      {shippingCost === 0 ? (
                        <span className="text-green-600">Gratis</span>
                      ) : (
                        formatPrice(shippingCost)
                      )}
                    </span>
                  </div>

                  {totalPrice < shippingThreshold && (
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                      <p className="text-sm text-gray-600">
                        Agrega {formatPrice(shippingThreshold - totalPrice)} más para envío gratuito
                      </p>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-gray-900">
                        {formatPrice(finalTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  variant="black"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  PROCEDER AL PAGO
                </Button>

                <div className="mt-4 text-center">
                  <Link
                    href="/tienda"
                    className="text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    ← Continuar comprando
                  </Link>
                </div>

                {/* Información de seguridad */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>🔒 Compra 100% segura</p>
                    <p>🚚 Envío rápido y confiable</p>
                    <p>↩️ Devoluciones fáciles</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
