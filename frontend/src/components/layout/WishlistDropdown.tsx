"use client"

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, X, Eye } from 'lucide-react'
import { useWishlist } from '@/hooks/useWishlist'
import { formatPrice } from '@/utils/currency'

interface WishlistDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export default function WishlistDropdown({ isOpen, onClose }: WishlistDropdownProps) {
  const { items, removeFromWishlist } = useWishlist()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
      <div ref={dropdownRef} className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Lista de Deseos ({items.length})
          </h3>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-white transition-colors"
            title="Cerrar lista de deseos"
            aria-label="Cerrar lista de deseos"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">Tu lista de deseos está vacía</p>
            <p className="text-sm text-dark-500 mt-1">
              Agrega productos que te gusten
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-dark-700 rounded-lg">
                {/* Product Image */}
                <div className="w-16 h-16 bg-dark-600 rounded-lg overflow-hidden flex-shrink-0">
                  {item.product.images && item.product.images.length > 0 ? (
                    <img
                      src={item.product.images[0].image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-dark-400 text-xs">Sin imagen</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-sm text-neon-green font-semibold">
                    {formatPrice(item.product.price)}
                  </p>
                  {item.product.compare_price && item.product.compare_price > item.product.price && (
                    <p className="text-xs text-dark-400 line-through">
                      {formatPrice(item.product.compare_price)}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/producto/${item.product.slug}`}
                    onClick={onClose}
                    className="p-2 bg-neon-green text-dark-900 rounded-lg hover:bg-neon-green/90 transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(item.product.id)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    title="Eliminar de lista de deseos"
                    aria-label="Eliminar de lista de deseos"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="mt-4 pt-4 border-t border-dark-700">
            <Link
              href="/wishlist"
              onClick={onClose}
              className="block w-full text-center bg-dark-700 text-white py-2 rounded-lg hover:bg-dark-600 transition-colors"
            >
              Ver lista completa
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
