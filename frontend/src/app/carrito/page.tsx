"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, CreditCard } from 'lucide-react'
import { useCartGlobal as useCart } from '@/hooks/useCartGlobal'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/utils/currency'
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
    <div className="min-h-screen bg-dark-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            title="Volver"
            aria-label="Volver"
            className="p-2 text-dark-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-neon-green" />
            <h1 className="text-3xl font-bold text-white">
              Carrito de compras
            </h1>
          </div>
        </div>

        {items.length === 0 ? (
          /* Carrito vacío */
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 text-dark-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Tu carrito está vacío
            </h2>
            <p className="text-dark-300 mb-8 max-w-md mx-auto">
              Parece que no has agregado ningún producto a tu carrito. 
              Explora nuestra tienda y encuentra los productos perfectos para ti.
            </p>
            <Link
              href="/tienda"
              className="inline-flex items-center gap-2 px-8 py-4 bg-neon-green text-dark-900 rounded-lg font-semibold text-lg hover:bg-neon-green/90 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de productos */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-dark-800 border border-dark-700 rounded-xl p-6"
                >
                  <div className="flex gap-6">
                    {/* Imagen del producto */}
                    <div className="w-24 h-24 bg-dark-700 rounded-lg overflow-hidden flex-shrink-0">
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
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {item.product_details?.name}
                          </h3>
                          <p className="text-dark-300 text-sm">
                            {item.product_details?.brand_details?.name}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isUpdating === item.id}
                          title="Eliminar producto"
                          aria-label="Eliminar producto"
                          className="p-2 text-dark-400 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Variante */}
                      {item.variant_details && (
                        <div className="mb-3">
                          <p className="text-dark-300 text-sm">
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
                          <span className="text-lg font-semibold text-neon-green">
                            {formatPrice(item.unit_price || item.product_details?.price || 0)}
                          </span>
                          
                          {/* Controles de cantidad */}
                          <div className="flex items-center gap-1 bg-dark-700 border border-dark-600 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={isUpdating === item.id || item.quantity <= 1}
                              title="Disminuir cantidad"
                              aria-label="Disminuir cantidad"
                              className="p-2 text-dark-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            
                            <span className="px-3 py-2 text-white font-medium min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={isUpdating === item.id}
                              title="Aumentar cantidad"
                              aria-label="Aumentar cantidad"
                              className="p-2 text-dark-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-bold text-white">
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
                <button
                  onClick={handleClearCart}
                  className="text-dark-400 hover:text-red-400 transition-colors"
                >
                  Vaciar carrito
                </button>
              </div>
            </div>

            {/* Resumen del pedido */}
            <div className="lg:col-span-1">
              <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Resumen del pedido
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-dark-300">Subtotal ({totalItems} productos)</span>
                    <span className="text-white font-medium">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-dark-300">Envío</span>
                    <span className="text-white font-medium">
                      {shippingCost === 0 ? (
                        <span className="text-neon-green">Gratis</span>
                      ) : (
                        formatPrice(shippingCost)
                      )}
                    </span>
                  </div>

                  {totalPrice < shippingThreshold && (
                    <div className="bg-dark-700 border border-dark-600 rounded-lg p-3">
                      <p className="text-sm text-dark-300">
                        Agrega {formatPrice(shippingThreshold - totalPrice)} más para envío gratuito
                      </p>
                    </div>
                  )}

                  <div className="border-t border-dark-700 pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-white">Total</span>
                      <span className="text-xl font-bold text-neon-green">
                        {formatPrice(finalTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-neon-green text-dark-900 py-4 rounded-lg font-semibold text-lg hover:bg-neon-green/90 transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Proceder al pago
                </button>

                <div className="mt-4 text-center">
                  <Link
                    href="/tienda"
                    className="text-dark-300 hover:text-white transition-colors"
                  >
                    ← Continuar comprando
                  </Link>
                </div>

                {/* Información de seguridad */}
                <div className="mt-6 pt-6 border-t border-dark-700">
                  <div className="space-y-2 text-sm text-dark-300">
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
