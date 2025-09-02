"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Heart, ShoppingCart, Trash2, Eye } from 'lucide-react'
import { useCartGlobal as useCart } from '@/hooks/useCartGlobal'
import { formatPrice } from '@/utils/currency'
import { toast } from 'react-hot-toast'
import { Product } from '@/types'

// Mock data - En producción esto vendría de la API
const mockWishlistItems = [
  {
    id: 1,
    product: {
      id: 1,
      name: "Tank Top Essential",
      slug: "tank-top-essential",
      price: 29.99,
      compare_price: 39.99,
      brand: "FitStore",
      category: "Tops",
      image: "/images/products/tank-top-1.jpg",
      rating: 4.8,
      reviews: 124,
      is_featured: true,
      stock_quantity: 33
    },
    added_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    product: {
      id: 2,
      name: "Leggings Power",
      slug: "leggings-power",
      price: 59.99,
      compare_price: 79.99,
      brand: "FitStore",
      category: "Bottoms",
      image: "/images/products/leggings-1.jpg",
      rating: 4.9,
      reviews: 89,
      is_featured: true,
      stock_quantity: 20
    },
    added_at: "2024-01-12T14:20:00Z"
  },
  {
    id: 3,
    product: {
      id: 3,
      name: "Hoodie Training",
      slug: "hoodie-training",
      price: 79.99,
      compare_price: 99.99,
      brand: "FitStore",
      category: "Outerwear",
      image: "/images/products/hoodie-1.jpg",
      rating: 4.7,
      reviews: 156,
      is_featured: true,
      stock_quantity: 15
    },
    added_at: "2024-01-10T09:15:00Z"
  },
  {
    id: 4,
    product: {
      id: 4,
      name: "Sports Bra Elite",
      slug: "sports-bra-elite",
      price: 39.99,
      compare_price: 49.99,
      brand: "FitStore",
      category: "Sports Bras",
      image: "/images/products/sports-bra-1.jpg",
      rating: 4.9,
      reviews: 203,
      is_featured: true,
      stock_quantity: 25
    },
    added_at: "2024-01-08T16:45:00Z"
  }
]

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState(mockWishlistItems)
  const { addToCart } = useCart()

  const convertToProduct = (wishlistProduct: any): Product => {
    return {
      id: wishlistProduct.id,
      name: wishlistProduct.name,
      slug: wishlistProduct.slug,
      description: 'Descripción del producto',
      short_description: 'Descripción corta',
      sku: `SKU-${wishlistProduct.id}`,
      category: 1,
      brand: 1,
      price: wishlistProduct.price * 1000, // Convertir a centavos
      compare_price: (wishlistProduct.compare_price || wishlistProduct.price) * 1000,
      cost_price: wishlistProduct.price * 500,
      track_inventory: true,
      inventory_quantity: wishlistProduct.stock_quantity || 100,
      low_stock_threshold: 10,
      allow_backorder: false,
      status: 'published' as const,
      is_featured: wishlistProduct.is_featured,
      is_digital: false,
      requires_shipping: true,
      weight: 0.5,
      meta_title: wishlistProduct.name,
      meta_description: 'Descripción',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      images: [{
        id: 1,
        product: wishlistProduct.id,
        image: wishlistProduct.image,
        alt_text: wishlistProduct.name,
        sort_order: 1,
        is_primary: true,
        created_at: new Date().toISOString()
      }],
      category_details: {
        id: 1,
        name: wishlistProduct.category,
        slug: wishlistProduct.category.toLowerCase(),
        description: 'Descripción',
        is_active: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      brand_details: {
        id: 1,
        name: wishlistProduct.brand,
        slug: wishlistProduct.brand.toLowerCase(),
        description: 'Descripción',
        is_active: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  }

  const handleAddToCart = async (product: any) => {
    try {
      const fullProduct = convertToProduct(product)
      await addToCart(fullProduct, 1)
      toast.success('Producto agregado al carrito')
    } catch (error) {
      toast.error('Error al agregar al carrito')
    }
  }

  const handleRemoveFromWishlist = (itemId: number) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId))
    toast.success('Producto eliminado de la lista de deseos')
  }

  const handleAddAllToCart = async () => {
    try {
      for (const item of wishlistItems) {
        const fullProduct = convertToProduct(item.product)
        await addToCart(fullProduct, 1)
      }
      toast.success('Todos los productos agregados al carrito')
      // Limpiar wishlist después de agregar todo al carrito
      setWishlistItems([])
    } catch (error) {
      toast.error('Error al agregar productos al carrito')
    }
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
                href="/shop"
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
                <div className="flex space-x-4">
                  <button
                    onClick={handleAddAllToCart}
                    className="btn-secondary flex items-center"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Agregar Todo al Carrito
                  </button>
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
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Quick Actions */}
                      <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          className="p-2 bg-red-600/80 backdrop-blur-sm rounded-full text-white hover:bg-red-600 transition-colors duration-200"
                          title="Eliminar de la lista de deseos"
                          aria-label="Eliminar de la lista de deseos"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="p-2 bg-dark-800/80 backdrop-blur-sm rounded-full text-white hover:text-neon-green transition-colors duration-200"
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
                        <span className="text-sm text-neon-green font-medium">{item.product.brand}</span>
                      </div>

                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-neon-green transition-colors duration-200">
                        <Link href={`/products/${item.product.slug}`}>
                          {item.product.name}
                        </Link>
                      </h3>

                      <p className="text-sm text-white/70 mb-4">
                        {item.product.category}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center mb-4">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < Math.floor(item.product.rating)
                                  ? 'text-yellow-400'
                                  : 'text-gray-400'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-white/70 ml-2">
                          ({item.product.rating})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-white">
                            {formatPrice(item.product.price * 100)}
                          </span>
                          {item.product.compare_price && item.product.compare_price > item.product.price && (
                            <span className="text-sm text-white/50 line-through">
                              {formatPrice(item.product.compare_price * 100)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stock Status */}
                      <div className="mb-4">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            item.product.stock_quantity > 10
                              ? 'bg-green-400'
                              : item.product.stock_quantity > 0
                              ? 'bg-yellow-400'
                              : 'bg-red-400'
                          }`} />
                          <span className="text-sm text-white/70">
                            {item.product.stock_quantity > 10
                              ? 'En stock'
                              : item.product.stock_quantity > 0
                              ? `Solo ${item.product.stock_quantity} disponibles`
                              : 'Agotado'
                            }
                          </span>
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => handleAddToCart(item.product)}
                        disabled={item.product.stock_quantity === 0}
                        className={`w-full btn-primary flex items-center justify-center group ${
                          item.product.stock_quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                        {item.product.stock_quantity === 0 ? 'Agotado' : 'Agregar al Carrito'}
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
                          {formatPrice(wishlistItems.reduce((total, item) => total + item.product.price, 0) * 100)}
                        </div>
                        <div className="text-sm text-white/70">Valor Total</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-neon-purple">
                          {formatPrice(wishlistItems
                            .filter(item => item.product.compare_price)
                            .reduce((total, item) =>
                              total + ((item.product.compare_price || item.product.price) - item.product.price), 0
                            ) * 100)}
                        </div>
                        <div className="text-sm text-white/70">Ahorro</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-accent-500">
                          {wishlistItems.filter(item => item.product.stock_quantity === 0).length}
                        </div>
                        <div className="text-sm text-white/70">Agotados</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleAddAllToCart}
                      className="btn-primary flex items-center"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Comprar Todo
                    </button>
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
