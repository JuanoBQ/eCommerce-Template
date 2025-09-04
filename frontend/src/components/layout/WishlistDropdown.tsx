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
    <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-hidden">
      <div ref={dropdownRef} className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Lista de Deseos ({items.length})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 transition-colors"
            title="Cerrar lista de deseos"
            aria-label="Cerrar lista de deseos"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="text-center py-6">
            <Heart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Tu lista de deseos está vacía</p>
            <p className="text-xs text-gray-500 mt-1">
              Agrega productos que te gusten
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                {/* Product Image */}
                <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                  {item.product.images && item.product.images.length > 0 ? (
                    <img
                      src={item.product.images[0].image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Sin imagen</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium text-gray-900 truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-primary-500 font-semibold">
                    {formatPrice(item.product.price)}
                  </p>
                  {item.product.compare_price && item.product.compare_price > item.product.price && (
                    <p className="text-xs text-gray-500 line-through">
                      {formatPrice(item.product.compare_price)}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1">
                  <Link
                    href={`/producto/${item.product.slug}`}
                    onClick={onClose}
                    className="p-1 bg-primary-500 text-white rounded-sm hover:bg-primary-600 transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="w-3 h-3" />
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(item.product.id)}
                    className="p-1 bg-red-500 text-white rounded-sm hover:bg-red-600 transition-colors"
                    title="Eliminar de lista de deseos"
                    aria-label="Eliminar de lista de deseos"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <Link
              href="/wishlist"
              onClick={onClose}
              className="block w-full text-center bg-gray-900 text-white py-1.5 rounded-md hover:bg-gray-800 transition-colors text-xs"
            >
              Ver lista completa
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
