"use client"

import Link from 'next/link'
import Image from 'next/image'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Heart, Trash2, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/utils/currency'
import { useWishlist } from '@/hooks/useWishlist'

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
      <div className="min-h-screen bg-dark-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-neon-pink to-neon-purple rounded-2xl mb-6">
              <Heart className="w-8 h-8 text-dark-900" />
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black mb-4">
              <span className="text-white">LISTA DE</span>
              <span className="block text-gradient">DESEOS</span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Productos que has guardado para comprar después
            </p>
          </div>

          {wishlistItems.length === 0 ? (
            /* Empty State */
            <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-12 border border-dark-700/50 text-center">
              <Heart className="w-16 h-16 text-white/30 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-white mb-4">
                Tu lista de deseos está vacía
              </h3>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                Agrega productos que te gusten para tenerlos siempre a mano
              </p>
              <Link
                href="/tienda"
                className="btn-primary inline-flex items-center"
              >
                Explorar Productos
              </Link>
            </div>
          ) : (
            <>
              {/* Actions Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                <div className="text-white">
                  <span className="text-lg font-medium">
                    {wishlistItems.length} producto{wishlistItems.length !== 1 ? 's' : ''} en tu lista
                  </span>
                </div>

              </div>

              {/* Wishlist Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlistItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-dark-800/50 backdrop-blur-md rounded-2xl overflow-hidden border border-dark-700/50 card-hover group"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden">
                      {item.product.images && item.product.images.length > 0 ? (
                        <Image
                          src={item.product.images[0].image}
                          alt={item.product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                          <span className="text-dark-400 text-sm">Sin imagen</span>
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Quick Actions */}
                      <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => handleRemoveFromWishlist(item.product.id)}
                          className="p-2 bg-red-600/80 backdrop-blur-sm rounded-full text-white hover:bg-red-600 transition-colors duration-200"
                          title="Eliminar de la lista de deseos"
                          aria-label="Eliminar de la lista de deseos"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/producto/${item.product.slug}`}
                          className="p-2 bg-dark-800/80 backdrop-blur-sm rounded-full text-white hover:text-neon-green transition-colors duration-200"
                          title="Ver detalles del producto"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>

                      {/* Sale Badge */}
                      {item.product.compare_price && item.product.compare_price > item.product.price && (
                        <div className="absolute top-4 left-4 bg-accent-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                          -{Math.round(((item.product.compare_price - item.product.price) / item.product.compare_price) * 100)}%
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <div className="mb-2">
                        <span className="text-sm text-neon-green font-medium">
                          {item.product.brand_details?.name || 'Sin marca'}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-neon-green transition-colors duration-200">
                        <Link href={`/producto/${item.product.slug}`}>
                          {item.product.name}
                        </Link>
                      </h3>

                      <p className="text-sm text-white/70 mb-4">
                        {item.product.category_details?.name || 'Sin categoría'}
                      </p>

                      {/* Price */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-white">
                            {formatPrice(item.product.price)}
                          </span>
                          {item.product.compare_price && item.product.compare_price > item.product.price && (
                            <span className="text-sm text-white/50 line-through">
                              {formatPrice(item.product.compare_price)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stock Status */}
                      <div className="mb-4">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            item.product.inventory_quantity > 10
                              ? 'bg-green-400'
                              : item.product.inventory_quantity > 0
                              ? 'bg-yellow-400'
                              : 'bg-red-400'
                          }`} />
                          <span className="text-sm text-white/70">
                            {item.product.inventory_quantity > 10
                              ? 'En stock'
                              : item.product.inventory_quantity > 0
                              ? `Solo ${item.product.inventory_quantity} disponibles`
                              : 'Agotado'
                            }
                          </span>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <button
                        onClick={() => handleViewDetails(item.product)}
                        className="w-full btn-primary flex items-center justify-center group"
                      >
                        <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                        Ver detalles
                      </button>

                      {/* Date Added */}
                      <div className="mt-4 pt-4 border-t border-dark-600">
                        <p className="text-xs text-white/50">
                          Agregado el {new Date(item.added_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-12 bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50">
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Resumen de Lista de Deseos
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-neon-green">
                          {wishlistItems.length}
                        </div>
                        <div className="text-sm text-white/70">Productos</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-neon-blue">
                          {formatPrice(wishlistItems.reduce((total, item) => total + item.product.price, 0))}
                        </div>
                        <div className="text-sm text-white/70">Valor Total</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-neon-purple">
                          {formatPrice(wishlistItems
                            .filter(item => item.product.compare_price && item.product.compare_price > item.product.price)
                            .reduce((total, item) =>
                              total + (item.product.compare_price - item.product.price), 0
                            ))}
                        </div>
                        <div className="text-sm text-white/70">Ahorro</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-accent-500">
                          {wishlistItems.filter(item => item.product.inventory_quantity === 0).length}
                        </div>
                        <div className="text-sm text-white/70">Agotados</div>
                      </div>
                    </div>
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
