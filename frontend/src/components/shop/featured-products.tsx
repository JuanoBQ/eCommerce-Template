"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useProducts } from '@/hooks/useProducts'
import { useWishlist } from '@/hooks/useWishlist'
import { Product } from '@/types'
import { formatPrice } from '@/utils/currency'

const FeaturedProducts = () => {
  const router = useRouter()
  const { products, loadProducts, isLoading } = useProducts()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Filtrar productos destacados
  const featuredProducts = products.filter(product => 
    product.is_featured && product.status === 'published'
  ).slice(0, 6) // Mostrar máximo 6 productos destacados

  const handleViewDetails = (product: Product) => {
    router.push(`/producto/${product.slug}`)
  }

  const handleWishlistToggle = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }



  if (isLoading) {
    return (
      <section className="py-16 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green mx-auto mb-4"></div>
            <p className="text-white">Cargando productos destacados...</p>
          </div>
        </div>
      </section>
    )
  }

  if (featuredProducts.length === 0) {
    return (
      <section className="py-16 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Productos Destacados</h2>
            <p className="text-dark-300">No hay productos destacados disponibles en este momento.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Productos <span className="text-neon-green">Destacados</span>
          </h2>
          <p className="text-dark-300 text-lg max-w-2xl mx-auto">
            Descubre nuestra selección de productos más populares y mejor valorados
          </p>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden hover:border-neon-green/50 transition-all duration-300 group"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              {/* Imagen del producto */}
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={product.images?.[0]?.image || '/images/placeholder-product.jpg'}
                  alt={product.images?.[0]?.alt_text || product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Badge destacado */}
                <div className="absolute top-3 left-3 bg-neon-green text-dark-900 px-2 py-1 rounded-full text-xs font-semibold">
                  Destacado
                </div>

                {/* Botones de acción */}
                <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
                  hoveredProduct === product.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}>
                  <button
                    className="p-2 bg-dark-800/80 backdrop-blur-sm border border-dark-600 rounded-full text-white hover:bg-neon-green hover:text-dark-900 transition-colors"
                    title="Agregar a favoritos"
                    aria-label="Agregar a favoritos"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 bg-dark-800/80 backdrop-blur-sm border border-dark-600 rounded-full text-white hover:bg-neon-green hover:text-dark-900 transition-colors"
                    title="Vista rápida"
                    aria-label="Vista rápida"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Información del producto */}
              <div className="p-6">
                <div className="mb-2">
                  <span className="text-neon-green text-sm font-medium">
                    {product.brand_details?.name || 'Sin marca'}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                <p className="text-dark-300 text-sm mb-4 line-clamp-2">
                  {product.short_description || product.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.average_rating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-dark-400'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-dark-400 text-sm ml-2">
                    ({product.total_reviews || 0})
                  </span>
                </div>

                {/* Precio */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-white">
                      {formatPrice(product.price)}
                    </span>
                    {product.compare_price && product.compare_price > product.price && (
                      <span className="text-dark-400 line-through text-sm">
                        {formatPrice(product.compare_price)}
                      </span>
                    )}
                  </div>
                  
                  {product.inventory_quantity <= product.low_stock_threshold && (
                    <span className="text-orange-400 text-xs">
                      ¡Pocas unidades!
                    </span>
                  )}
                </div>

                {/* Botones */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleWishlistToggle(product)}
                    className={`p-2 rounded-lg transition-colors ${
                      isInWishlist(product.id)
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-dark-700 text-white hover:bg-dark-600'
                    }`}
                    title={isInWishlist(product.id) ? 'Eliminar de lista de deseos' : 'Agregar a lista de deseos'}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleViewDetails(product)}
                    className="flex-1 bg-neon-green text-dark-900 px-4 py-2 rounded-lg font-semibold hover:bg-neon-green/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botón ver más */}
        <div className="text-center mt-12">
          <Link
            href="/tienda"
            className="inline-flex items-center px-8 py-3 bg-neon-green text-dark-900 font-semibold rounded-lg hover:bg-neon-green/90 transition-colors"
          >
            Ver todos los productos
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeaturedProducts