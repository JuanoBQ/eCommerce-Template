"use client"

import { useState, useEffect } from 'react'
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCartGlobal as useCart } from '@/hooks/useCartGlobal'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/utils/currency'
import Link from 'next/link'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { 
    items, 
    totalItems, 
    totalPrice, 
    updateCartItem, 
    removeFromCart, 
    clearCart 
  } = useCart()
  const { isAuthenticated } = useAuth()
  const [isUpdating, setIsUpdating] = useState<number | null>(null)

  // Debug: Log cart data in sidebar (commented out for production)
  // console.log('CartSidebar data:', { items: items.length, totalItems, totalPrice })



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

  // Cerrar sidebar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white border-l border-gray-200 z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gray-900" />
              <h2 className="text-lg font-semibold text-gray-900">
                Carrito ({totalItems})
              </h2>
            </div>
            <button
              onClick={onClose}
              title="Cerrar carrito"
              aria-label="Cerrar carrito"
              className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <ShoppingBag className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Tu carrito está vacío
                </h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Agrega algunos productos para comenzar tu compra
                </p>
                <Link
                  href="/tienda"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 transition-colors text-sm"
                >
                  Ir a la tienda
                </Link>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md"
                  >
                    {/* Imagen del producto */}
                    <div className="w-14 h-14 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={item.product_details?.images?.[0]?.image || '/images/placeholder-product.jpg'}
                        alt={item.product_details?.name || 'Producto'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Información del producto */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                        {item.product_details?.name}
                      </h4>
                      
                      {item.variant_details && (
                        <p className="text-xs text-gray-600 mb-2">
                          {item.variant_details.size_details?.name && 
                            `Talla: ${item.variant_details.size_details.name}`}
                          {item.variant_details.color_details?.name && 
                            ` • Color: ${item.variant_details.color_details.name}`}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary-500">
                          {formatPrice(item.unit_price || item.product_details?.price || 0)}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {/* Controles de cantidad */}
                          <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-md">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={isUpdating === item.id || item.quantity <= 1}
                              title="Disminuir cantidad"
                              aria-label="Disminuir cantidad"
                              className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            
                            <span className="px-2 py-1 text-xs text-gray-900 min-w-[1.5rem] text-center">
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={isUpdating === item.id}
                              title="Aumentar cantidad"
                              aria-label="Aumentar cantidad"
                              className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Botón eliminar */}
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isUpdating === item.id}
                            title="Eliminar producto"
                            aria-label="Eliminar producto"
                            className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-1 text-right">
                        <span className="text-xs font-medium text-gray-900">
                          Total: {formatPrice(item.total_price || (item.unit_price || 0) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-3">
              {/* Resumen */}
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-primary-500">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              {/* Botones */}
              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="block w-full bg-gray-900 text-white py-2.5 rounded-md font-medium text-center hover:bg-gray-800 transition-colors text-sm"
                >
                  Proceder al pago
                </Link>
                
                <Link
                  href="/carrito"
                  onClick={onClose}
                  className="block w-full border border-gray-300 text-gray-900 py-2.5 rounded-md font-medium text-center hover:bg-gray-50 transition-colors text-sm"
                >
                  Ver carrito completo
                </Link>
                
                <button
                  onClick={handleClearCart}
                  className="w-full text-gray-500 hover:text-gray-900 py-1 text-xs transition-colors"
                >
                  Vaciar carrito
                </button>
              </div>

              {/* Envío gratuito */}
              {totalPrice < 100000 && (
                <div className="text-center p-2 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-xs text-gray-600">
                    Agrega {formatPrice(100000 - totalPrice)} más para envío gratuito
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
