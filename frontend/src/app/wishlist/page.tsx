"use client"

import Link from 'next/link'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Heart, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/utils/currency'
import { useWishlist } from '@/hooks/useWishlist'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/ui/ProductCard'

export default function WishlistPage() {
  const { items: wishlistItems, removeFromWishlist } = useWishlist()
  const router = useRouter()

  const handleViewDetails = (product: any) => {
    router.push(`/producto/${product.slug}`)
  }

  const handleRemoveFromWishlist = (productId: number) => {
    removeFromWishlist(productId)
  }



  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">LISTA DE DESEOS</h1>
                <p className="text-gray-600">
                  Productos que has guardado para comprar después
                </p>
              </div>
              <Link href="/tienda">
                <Button variant="black">
                  Seguir Comprando
                </Button>
              </Link>
            </div>
          </div>

          {wishlistItems.length === 0 ? (
            /* Empty State */
            <div className="bg-white border border-gray-200 rounded-md p-12 shadow-sm text-center">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                NO TIENES PRODUCTOS EN TU LISTA DE DESEOS
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Agrega productos que te gusten para tenerlos siempre a mano
              </p>
              <Link href="/tienda">
                <Button variant="black">
                  Explorar Productos
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Actions Bar - Estilo Adidas */}
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                <div className="text-gray-900">
                  <span className="text-lg font-medium">
                    {wishlistItems.length} producto{wishlistItems.length !== 1 ? 's' : ''} en tu lista
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Agregar todo al carrito
                  </Button>
                </div>
              </div>

              {/* Wishlist Items Grid - Usando ProductCard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="relative group">
                    {/* ProductCard Component */}
                    <ProductCard
                      product={{
                        id: item.product.id,
                        name: item.product.name,
                        slug: item.product.slug,
                        price: item.product.price,
                        compare_price: item.product.compare_price,
                        images: item.product.images,
                        brand_details: item.product.brand_details,
                        is_featured: item.product.is_featured,
                        inventory_quantity: item.product.inventory_quantity,
                        low_stock_threshold: item.product.low_stock_threshold
                      }}
                      onToggleWishlist={handleRemoveFromWishlist}
                      isInWishlist={true}
                    />
                    
                    {/* Wishlist-specific overlay with date */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-xs text-gray-400 text-center">
                        Agregado el {new Date(item.added_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary - Estilo Adidas */}
              <div className="mt-12 bg-gray-50 border border-gray-200 rounded-md p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Resumen de Lista de Deseos
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {wishlistItems.length}
                        </div>
                        <div className="text-sm text-gray-600">Productos</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary-500">
                          {formatPrice(wishlistItems.reduce((total, item) => total + item.product.price, 0))}
                        </div>
                        <div className="text-sm text-gray-600">Valor Total</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatPrice(wishlistItems
                            .filter(item => item.product.compare_price && item.product.compare_price > item.product.price)
                            .reduce((total, item) =>
                              total + ((item.product.compare_price || 0) - item.product.price), 0
                            ))}
                        </div>
                        <div className="text-sm text-gray-600">Ahorro</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-500">
                          {wishlistItems.filter(item => item.product.inventory_quantity === 0).length}
                        </div>
                        <div className="text-sm text-gray-600">Agotados</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button variant="black" size="lg">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Agregar todo al carrito
                    </Button>
                    <Button variant="outline" size="lg">
                      Compartir lista
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

