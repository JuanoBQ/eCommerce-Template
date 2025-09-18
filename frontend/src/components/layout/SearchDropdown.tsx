'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X } from 'lucide-react'
import { formatPrice } from '@/utils/currency'

interface SearchResult {
  id: number
  name: string
  slug: string
  price: number
  compare_price?: number
  image?: string
  category: {
    name: string
  }
  brand?: {
    name: string
  }
}

interface SearchDropdownProps {
  isOpen: boolean
  onClose: () => void
  results: SearchResult[]
  isLoading: boolean
  query: string
  onClear: () => void
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  isOpen,
  onClose,
  results,
  isLoading,
  query,
  onClear
}) => {
  if (!isOpen) return null

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      {isLoading ? (
        <div className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin"></div>
            <span className="text-sm">Buscando...</span>
          </div>
        </div>
      ) : results.length > 0 ? (
        <div className="py-2">
          {/* Header */}
          <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              {results.length} resultado{results.length !== 1 ? 's' : ''} para "{query}"
            </span>
            <button
              onClick={onClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Limpiar búsqueda"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {results.map((product) => (
              <Link
                key={product.id}
                href={`/producto/${product.slug}`}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                {/* Product Image */}
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={product.image || '/images/placeholder-product.jpg'}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {product.category.name}
                    </span>
                    {product.brand && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-500">
                          {product.brand.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="flex-shrink-0 text-right">
                  {product.compare_price && product.compare_price > product.price ? (
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatPrice(product.price)}
                      </div>
                      <div className="text-xs text-gray-500 line-through">
                        {formatPrice(product.compare_price)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm font-semibold text-gray-900">
                      {formatPrice(product.price)}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-100">
            <Link
              href={`/tienda?search=${encodeURIComponent(query)}`}
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              <Search className="w-4 h-4" />
              Ver todos los resultados
            </Link>
          </div>
        </div>
      ) : query.length >= 2 ? (
        <div className="p-4 text-center">
          <div className="text-gray-500 mb-2">
            <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No se encontraron productos</p>
            <p className="text-xs text-gray-400 mt-1">
              Intenta con otros términos de búsqueda
            </p>
          </div>
          <button
            onClick={onClear}
            className="text-xs text-primary-600 hover:text-primary-700 transition-colors"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default SearchDropdown
