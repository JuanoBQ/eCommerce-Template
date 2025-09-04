import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/utils/currency'

interface ProductCardProps {
  product: {
    id: number
    name: string
    slug: string
    price: number
    compare_price?: number
    images?: Array<{ image: string; alt_text?: string }>
    brand_details?: { name: string }
    is_featured?: boolean
    inventory_quantity?: number
    low_stock_threshold?: number
  }
  onToggleWishlist?: (productId: number) => void
  isInWishlist?: boolean
  className?: string
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onToggleWishlist,
  isInWishlist = false,
  className
}) => {
  const discountPercentage = product.compare_price && product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  return (
    <Link href={`/producto/${product.slug}`} className="block group">
      <div className={cn('relative bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer', className)}>
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={product.images?.[0]?.image || '/images/placeholder-product.jpg'}
            alt={product.images?.[0]?.alt_text || product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_featured && (
              <span className="bg-black text-white px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
                Destacado
              </span>
            )}
            {discountPercentage > 0 && (
              <span className="bg-red-500 text-white px-2 py-0.5 text-xs font-bold">
                -{discountPercentage}%
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          {onToggleWishlist && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggleWishlist(product.id)
              }}
              title={isInWishlist ? 'Eliminar de lista de deseos' : 'Agregar a lista de deseos'}
              aria-label={isInWishlist ? 'Eliminar de lista de deseos' : 'Agregar a lista de deseos'}
              className={cn(
                'absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200',
                isInWishlist
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500 shadow-sm'
              )}
            >
              <Heart className={cn('w-3.5 h-3.5', isInWishlist && 'fill-current')} />
            </button>
          )}

          {/* Low Stock Warning */}
          {product.inventory_quantity && product.low_stock_threshold && 
           product.inventory_quantity <= product.low_stock_threshold && (
            <div className="absolute bottom-2 left-2 right-2">
              <span className="bg-orange-500 text-white px-2 py-0.5 text-xs font-medium rounded">
                ¡Pocas unidades!
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Brand */}
          {product.brand_details?.name && (
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">
              {product.brand_details.name}
            </p>
          )}

          {/* Product Name */}
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm leading-tight group-hover:text-primary-500 transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-xs text-gray-500 line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
