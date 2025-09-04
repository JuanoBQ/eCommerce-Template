"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Eye, Star, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useProducts } from '@/hooks/useProducts'
import { useWishlist } from '@/hooks/useWishlist'
import { Product } from '@/types'
import { formatPrice } from '@/utils/currency'
import { ProductCard } from '@/components/ui/ProductCard'
import { Button } from '@/components/ui/button'

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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando productos destacados...</p>
          </div>
        </div>
      </section>
    )
  }

  if (featuredProducts.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Productos Destacados</h2>
            <p className="text-gray-600">No hay productos destacados disponibles en este momento.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Productos <span className="text-primary-500">Destacados</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Descubre nuestra selección de productos más populares y mejor valorados
          </p>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onToggleWishlist={() => handleWishlistToggle(product)}
              isInWishlist={isInWishlist(product.id)}
            />
          ))}
        </div>

        {/* Botón ver más */}
        <div className="text-center mt-16">
          <Link href="/tienda" className="inline-flex items-center gap-2">
            <Button variant="primary" size="lg">
              Ver todos los productos
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeaturedProducts
